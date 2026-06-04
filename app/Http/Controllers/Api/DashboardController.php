<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DashboardResource;
use App\Repositories\ScanRepositoryInterface;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class DashboardController extends Controller
{
    protected ScanRepositoryInterface $scanRepository;

    public function __construct(ScanRepositoryInterface $scanRepository)
    {
        $this->scanRepository = $scanRepository;
    }

    // GET /api/dashboard
    public function index(Request $request)
    {
        $user  = $request->user();
        $today = now()->toDateString();

        // Ambil data rangkuman harian dari repositori
        $summary = $this->scanRepository->getDashboardSummary($user->id, $today);

        // Ambil scan terakhir hari ini (tidak dibatasi / limit besar)
        $recentScans = $this->scanRepository->getDashboardRecentScans($user->id, $today, 100);

        // Target kalori default 2000
        $calorieGoal = 2000;
        $calorieLeft = $calorieGoal - ($summary->total_calories ?? 0);

        // Ambil daily advice menggunakan Cache untuk menghindari rate-limit API
        $cacheKey = "user_{$user->id}_advice_{$today}";
        $dailyAdvice = Cache::remember($cacheKey, now()->addHours(2), function () use ($user, $today, $summary, $recentScans) {
            return $this->generateDailyNutritionAdvice($user, $today, $summary, $recentScans);
        });

        $payload = [
            'date'         => $today,
            'calorie_goal' => $calorieGoal,
            'calorie_left' => max(0, $calorieLeft),
            'summary'      => $summary,
            'recent_scans' => $recentScans,
            'daily_advice' => $dailyAdvice,
            'macros'       => [
                'protein' => [
                    'value' => $summary->total_protein ?? 0,
                    'goal'  => 50,
                    'unit'  => 'g',
                ],
                'carbs' => [
                    'value' => $summary->total_carbs ?? 0,
                    'goal'  => 300,
                    'unit'  => 'g',
                ],
                'fat' => [
                    'value' => $summary->total_fat ?? 0,
                    'goal'  => 65,
                    'unit'  => 'g',
                ],
            ],
        ];

        return response()->json([
            'status' => 'success',
            'data'   => new DashboardResource($payload),
        ]);
    }

    private function generateDailyNutritionAdvice($user, string $todayDate, $summary, $recentScans): string
    {
        $scanCount = count($recentScans);
        if ($scanCount === 0) {
            return "Halo, " . explode(' ', $user->name)[0] . "! Belum ada makanan yang dipindai hari ini. Silakan pindai foto hidangan fast-food Anda agar AI dapat memberikan analisis gizi harian.";
        }

        // Kumpulkan daftar nama menu makanan hari ini
        $menuItems = collect($recentScans)->map(function ($scan) {
            $brand = strtoupper($scan->nutrition->brand ?? '');
            $item = ucwords(str_replace('-', ' ', $scan->nutrition->item ?? ''));
            return "{$brand} {$item} ({$scan->serving_qty} porsi)";
        })->implode(', ');

        $totalCalories = $summary->total_calories ?? 0;
        $totalProtein = $summary->total_protein ?? 0;
        $totalCarbs = $summary->total_carbs ?? 0;
        $totalFat = $summary->total_fat ?? 0;

        $groqApiKey = env('GROQ_API_KEY');
        if (empty($groqApiKey)) {
            return $this->getDefaultDailyAdvice($totalCalories, $totalProtein, $totalCarbs, $totalFat);
        }

        $prompt = "Kamu adalah asisten gizi cerdas NutriVision. Berikan 2 kalimat saran gizi yang sehat, ramah, konstruktif, dan padat untuk pengguna berdasarkan akumulasi seluruh makanan cepat saji (fast food) yang dikonsumsi hari ini:
Daftar Hidangan Hari Ini: {$menuItems}
Total Zat Gizi Hari Ini: {$totalCalories} kkal, Protein: {$totalProtein}g, Karbohidrat: {$totalCarbs}g, Lemak: {$totalFat}g.

ATURAN OUTPUT:
1. JAWAB LANGSUNG dengan saran gizi harian dalam 1-2 kalimat saja.
2. JANGAN sertakan basa-basi perkenalan seperti 'Berikut adalah...', 'Tentu, ini...', 'Saran gizi:', atau pengantar serupa.
3. JANGAN gunakan bullet points (-) atau tanda bintang (*).
4. Gunakan Bahasa Indonesia yang ramah, santun, dan natural.";

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
                // Bersihkan respon dari kata pembuka
                $advice = preg_replace('/^(Berikut adalah|Tentu saja,|Tentu,|Ini adalah|Saran gizi|Saran|Tips gizi|Tips|Rekomendasi)\s*.*:\s*/i', '', $advice);
                $advice = preg_replace('/^\s*[-*•]\s*/', '', $advice);
                $advice = preg_replace('/\s*[-*•]\s+/', ' ', $advice);
                $advice = preg_replace('/Analisis singkat.*$/i', '', $advice);
                $advice = trim($advice);

                if (!empty($advice)) {
                    return $advice;
                }
            }
        } catch (\Exception $e) {
            // Fallback ke default
        }

        return $this->getDefaultDailyAdvice($totalCalories, $totalProtein, $totalCarbs, $totalFat);
    }

    private function getDefaultDailyAdvice(float $calories, float $protein, float $carbs, float $fat): string
    {
        $base = "Total asupan Anda hari ini mencapai {$calories} kkal (P: {$protein}g, K: {$carbs}g, L: {$fat}g).";

        if ($calories > 2200) {
            return $base . " Asupan kalori Anda hari ini cukup tinggi dari makanan cepat saji, disarankan untuk mengurasi asupan di sisa hari ini dan perbanyak jalan kaki atau minum air putih.";
        }

        if ($protein < 40) {
            return $base . " Kandungan protein Anda hari ini cenderung rendah. Coba tambahkan sumber tinggi protein seperti putih telur atau dada ayam pada menu berikutnya.";
        }

        return $base . " Pola gizi Anda hari ini masih dalam batas wajar. Tetap seimbangkan dengan asupan sayur, buah, dan air putih yang cukup.";
    }
}