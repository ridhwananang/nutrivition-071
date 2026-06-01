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

                $result = $this->scanRepository->storeScan([
                    'user_id'        => $request->user()->id,
                    'nutrition_id'   => $nutrition->id,
                    'scan_image'     => $path,
                    'analisis_ai'    => $item['analisis'],
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
}
