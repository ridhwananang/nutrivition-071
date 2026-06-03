<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ScanResource;
use App\Repositories\ScanRepositoryInterface;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ScanController extends Controller
{
    protected ScanRepositoryInterface $scanRepository;

    public function __construct(ScanRepositoryInterface $scanRepository)
    {
        $this->scanRepository = $scanRepository;
    }

    public function store(Request $request)
    {
        $request->validate([
            'image'       => 'required|image|max:5120',
            'meal_type'   => 'nullable|in:breakfast,lunch,dinner,snack',
            'serving_qty' => 'nullable|numeric|min:0.1',
        ]);

        $detectedItems = $this->analisisAI($request->file('image'));

        if (empty($detectedItems) || isset($detectedItems[0]['error'])) {
            return response()->json([
                'status'  => 'error',
                'message' => $detectedItems[0]['error'] ?? 'Gagal menganalisis gambar makanan dengan AI',
            ], 422);
        }

        $file = $request->file('image');
        $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('storage/scans'), $fileName);
        $path = 'scans/' . $fileName;

        $createdResults = [];
        $savedNutritionItems = [];
        $servingQty = $request->serving_qty ?? 1;

        foreach ($detectedItems as $item) {
            $nutrition = $this->scanRepository->findNutritionByKey($item['key']);

            if ($nutrition) {
                $totalCalories = $nutrition->calories * $servingQty;

                $aiAdvice = $this->generateNutritionAdvice(
                    $nutrition->brand,
                    $nutrition->item,
                    $totalCalories,
                    floatval($nutrition->protein) * $servingQty,
                    floatval($nutrition->carbs) * $servingQty,
                    floatval($nutrition->fat) * $servingQty
                );

                $result = $this->scanRepository->storeScan([
                    'user_id'        => $request->user()->id,
                    'nutrition_id'   => $nutrition->id,
                    'scan_image'     => $path,
                    'analisis_ai'    => $aiAdvice,
                    'confidence'     => $item['confidence'],
                    'serving_qty'    => $servingQty,
                    'total_calories' => $totalCalories,
                    'meal_type'      => $request->meal_type,
                    'consumed_at'    => now()->toDateString(),
                ]);

                $createdResults[] = $result;
                $savedNutritionItems[] = $nutrition;
            }
        }

        if (empty($createdResults)) {
            $firstLabel = $detectedItems[0]['key'] ?? 'unknown';

            return response()->json([
                'status'  => 'error',
                'message' => 'Makanan terdeteksi (' . $firstLabel . ') namun tidak ditemukan di database gizi.',
            ], 404);
        }

        $itemNames = collect($savedNutritionItems)->map(function ($nut) {
            return $nut->item;
        })->implode(', ');

        $totalCalories = 0;
        $totalFat = 0;
        $totalCarbs = 0;
        $totalProtein = 0;

        foreach ($savedNutritionItems as $nut) {
            $totalCalories += floatval($nut->calories) * floatval($servingQty);
            $totalFat += floatval($nut->fat) * floatval($servingQty);
            $totalCarbs += floatval($nut->carbs) * floatval($servingQty);
            $totalProtein += floatval($nut->protein) * floatval($servingQty);
        }

        $primaryResult = $createdResults[0];
        $primaryResult->total_calories = $totalCalories;
        $primaryNutrition = clone $savedNutritionItems[0];
        $primaryNutrition->item = $itemNames;
        $primaryNutrition->calories = $totalCalories;
        $primaryNutrition->fat = $totalFat;
        $primaryNutrition->carbs = $totalCarbs;
        $primaryNutrition->protein = $totalProtein;
        $resource = new ScanResource($primaryResult);
        $responseData = $resource->toArray($request);

        $responseData['nutrition'] = [
            'id'           => $primaryNutrition->id,
            'brand'        => $primaryNutrition->brand,
            'item'         => $itemNames,
            'key'          => $primaryNutrition->key,
            'serving_size' => $primaryNutrition->serving_size,
            'calories'     => (float) $totalCalories,
            'fat'          => (float) $totalFat,
            'carbs'        => (float) $totalCarbs,
            'protein'      => (float) $totalProtein,
        ];

        return response()->json([
            'status' => 'success',
            'data'   => $responseData,
        ], 201);
    }

    public function show(Request $request, int $id)
    {
        $result = $this->scanRepository->findScan($id, $request->user()->id);

        if (!$result) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data scan tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => new ScanResource($result),
        ]);
    }

    public function reset(Request $request, int $id)
    {
        $deleted = $this->scanRepository->deleteScan($id, $request->user()->id);

        if (!$deleted) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data scan tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Scan berhasil direset, silakan scan ulang',
        ]);
    }

    private function beautifyLabel(string $rawLabel): string
    {
        $parts = explode('-', $rawLabel);
        $brand = $parts[0] ?? '';
        $item = $parts[1] ?? '';

        $brandMap = [
            'mcd' => "McDonald's",
            'kfc' => 'KFC',
            'bk'  => 'Burger King',
        ];

        $cleanBrand = $brandMap[strtolower($brand)] ?? strtoupper($brand);
        $cleanItem = ucwords(str_replace('-', ' ', $item));

        return "Terdeteksi: {$cleanBrand} - {$cleanItem}";
    }

    private function analisisAI(\Illuminate\Http\UploadedFile $image): array
    {
        $filePath = $image->getPathname();
        $fileName = $image->getClientOriginalName();

        try {
            $response = Http::timeout(90)
                ->attach('file', file_get_contents($filePath), $fileName)
                ->post('https://galihkjaya-nutrivision-api.hf.space/predict');

            if ($response->successful()) {
                return $this->parseResponse($response->json());
            }

            if ($response->status() === 503 || $response->status() === 504) {
                return [
                    ['error' => 'Server AI sedang dinyalakan ulang (Cold Start). Silakan tunggu 1-2 menit lalu coba unggah kembali.'],
                ];
            }

            return [
                ['error' => 'Gagal menghubungi server AI cloud (Status: ' . $response->status() . ')'],
            ];

        } catch (ConnectionException $e) {
            return [
                ['error' => 'Server AI sedang bersiap (Cold Start). Silakan tunggu 1-2 menit lalu coba unggah kembali.'],
            ];
        } catch (\Exception $e) {
            return [
                ['error' => 'Error koneksi AI: ' . $e->getMessage() . '. Pastikan Space hf.co aktif.'],
            ];
        }
    }

    private function parseResponse(array $result): array
    {
        $items = $result['items'] ?? [];

        if (empty($items)) {
            return [
                ['error' => 'Makanan tidak dikenali dalam foto'],
            ];
        }

        usort($items, function ($a, $b) {
            $scoreA = $a['score'] ?? 0;
            $scoreB = $b['score'] ?? 0;
            if ($scoreA == $scoreB) {
                return 0;
            }

            return ($scoreA < $scoreB) ? 1 : -1;
        });

        $parsed = [];
        foreach ($items as $item) {
            $parsed[] = [
                'key'        => $item['label'],
                'analisis'   => $this->beautifyLabel($item['label']),
                'confidence' => (float) ($item['score'] ?? 0.0),
            ];
        }

        return $parsed;
    }

    private function generateNutritionAdvice(string $brand, string $item, float $calories, float $protein, float $carbs, float $fat): string
    {
        $groqApiKey = env('GROQ_API_KEY');
        if (empty($groqApiKey)) {
            return $this->getDefaultAdvice($brand, $item, $calories, $protein, $carbs, $fat);
        }

        $prompt = "Kamu adalah asisten gizi cerdas NutriVision. Berikan 1 atau 2 kalimat saran gizi yang sehat, spesifik, dan padat untuk pengguna setelah mereka makan hidangan berikut:
Nama Makanan: " . strtoupper($brand) . " - " . ucwords(str_replace('-', ' ', $item)) . "
Detail Nutrisi: {$calories} kkal, Protein: {$protein}g, Karbohidrat: {$carbs}g, Lemak: {$fat}g.

ATURAN OUTPUT:
1. JAWAB LANGSUNG dengan saran gizi dalam 1-2 kalimat saja.
2. JANGAN sertakan basa-basi perkenalan seperti 'Berikut adalah...', 'Tentu, ini...', 'Saran gizi:', atau pengantar serupa.
3. JANGAN gunakan bullet points (-) atau tanda bintang (*).
4. JANGAN sertakan tulisan 'Analisis singkat:' atau meta data lainnya di bagian akhir.
5. Gunakan Bahasa Indonesia yang ramah, santun, dan natural.";

        try {
            $response = Http::timeout(6)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $groqApiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => 'llama-3.1-8b-instant',
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'max_tokens' => 120,
                    'temperature' => 0.6,
                ]);

            if ($response->successful()) {
                $advice = trim($response->json('choices.0.message.content'));
                
                // Regex cleaning to strip any conversational fluff
                $advice = preg_replace('/^(Berikut adalah|Tentu saja,|Tentu,|Ini adalah|Saran gizi|Saran|Tips gizi|Tips|Rekomendasi)\s*.*:\s*/i', '', $advice);
                $advice = preg_replace('/^\s*[-*•]\s*/', '', $advice); // remove bullet points at start
                $advice = preg_replace('/\s*[-*•]\s+/', ' ', $advice); // convert inline bullets to space
                $advice = preg_replace('/Analisis singkat.*$/i', '', $advice); // remove trailing metadata
                $advice = trim($advice);
                
                if (!empty($advice)) {
                    return $advice;
                }
            }
        } catch (\Exception $e) {
            // Fallback on error
        }

        return $this->getDefaultAdvice($brand, $item, $calories, $protein, $carbs, $fat);
    }

    private function getDefaultAdvice(string $brand, string $item, float $calories, float $protein, float $carbs, float $fat): string
    {
        $cleanBrand = strtoupper($brand);
        $cleanItem = ucwords(str_replace('-', ' ', $item));
        
        $base = "Menu {$cleanBrand} {$cleanItem} mengandung {$calories} kkal (P: {$protein}g, K: {$carbs}g, L: {$fat}g).";

        if ($protein < 12) {
            return $base . " Kandungan proteinnya cukup rendah, sebaiknya imbangi dengan asupan tinggi protein seperti telur atau dada ayam pada makan berikutnya.";
        }
        
        if ($fat > 20) {
            return $base . " Kandungan lemaknya cukup tinggi, pastikan untuk membatasi makanan berminyak di sisa hari ini dan perbanyak minum air putih.";
        }

        return $base . " Porsi gizi cukup standar, pertahankan keseimbangan dengan porsi serat dari sayuran dan buah segar.";
    }
}
