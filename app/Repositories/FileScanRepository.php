<?php

namespace App\Repositories;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class FileScanRepository implements ScanRepositoryInterface
{
    private ?Collection $cachedNutrition = null;

    /**
     * Memuat referensi gizi secara langsung dari berkas CSV seeders (Tanpa Database!).
     */
    private function loadNutritionFromCsv(): Collection
    {
        if ($this->cachedNutrition !== null) {
            return $this->cachedNutrition;
        }

        $path = database_path('seeders/nutrition.csv');
        $collection = collect();

        if (!file_exists($path)) {
            $this->cachedNutrition = $collection;
            return $collection;
        }

        $file = fopen($path, 'r');
        fgetcsv($file, 0, ';'); // Lewati header

        $idCounter = 1;
        while (($row = fgetcsv($file, 0, ';')) !== false) {
            if (empty($row[0])) continue;

            $collection->push((object)[
                'id'           => $idCounter++,
                'brand'        => trim($row[0]),
                'item'         => trim($row[1]),
                'key'          => trim($row[2]),
                'serving_size' => trim($row[3]),
                'calories'     => (float) str_replace('kkal', '', trim($row[4])),
                'fat'          => (float) str_replace('g', '', trim($row[5])),
                'carbs'        => (float) str_replace('g', '', trim($row[6])),
                'protein'      => (float) str_replace('g', '', trim($row[7])),
            ]);
        }
        fclose($file);

        $this->cachedNutrition = $collection;
        return $collection;
    }

    public function findNutritionByKey(string $key): ?object
    {
        return $this->loadNutritionFromCsv()->firstWhere('key', $key);
    }

    public function getAllNutrition(): Collection
    {
        return $this->loadNutritionFromCsv();
    }

    public function findNutritionById(int $id): ?object
    {
        return $this->loadNutritionFromCsv()->firstWhere('id', $id);
    }

    public function searchNutrition(string $keyword): Collection
    {
        $keyword = strtolower($keyword);
        return $this->loadNutritionFromCsv()->filter(function ($item) use ($keyword) {
            return str_contains(strtolower($item->item), $keyword) || 
                   str_contains(strtolower($item->brand), $keyword);
        })->values();
    }

    /**
     * Memuat seluruh riwayat hasil scan pengguna dari file JSON.
     */
    private function loadUserScans(int $userId): Collection
    {
        $fileName = "scans/user_{$userId}.json";
        if (!Storage::exists($fileName)) {
            return collect();
        }

        $data = json_decode(Storage::get($fileName), true);
        if (!is_array($data)) {
            return collect();
        }

        $nutritionList = $this->loadNutritionFromCsv();

        return collect($data)->map(function ($item) use ($nutritionList) {
            $scan = (object) $item;
            // Tempelkan relasi gizi (nutrition) secara dinamis agar sesuai model Eloquent
            $scan->nutrition = $nutritionList->firstWhere('id', $scan->nutrition_id);
            return $scan;
        });
    }

    /**
     * Menyimpan kumpulan data scan pengguna kembali ke file JSON.
     */
    private function saveUserScans(int $userId, Collection $scans): void
    {
        $fileName = "scans/user_{$userId}.json";
        
        // Buat folder jika belum ada
        if (!Storage::exists('scans')) {
            Storage::makeDirectory('scans');
        }

        // Simpan data murni (tanpa relasi objek nutrition gizi yang ditempelkan)
        $cleanData = $scans->map(function ($scan) {
            $array = (array) $scan;
            unset($array['nutrition']); // Bersihkan relasi tempelan sebelum di-serialize ke JSON
            return $array;
        })->toArray();

        Storage::put($fileName, json_encode($cleanData, JSON_PRETTY_PRINT));
    }

    public function storeScan(array $data): object
    {
        $userId = $data['user_id'];
        $scans = $this->loadUserScans($userId);

        $newScan = (object) array_merge($data, [
            'id'         => time() . rand(100, 999), // unique ID numerik format string
            'created_at' => now()->toIso8601String(),
            'updated_at' => now()->toIso8601String(),
        ]);

        $scans->push($newScan);
        $this->saveUserScans($userId, $scans);

        // Tempelkan relasi gizi sebelum dikembalikan ke controller
        $newScan->nutrition = $this->findNutritionById($newScan->nutrition_id);
        return $newScan;
    }

    public function findScan(int $id, int $userId): ?object
    {
        return $this->loadUserScans($userId)->firstWhere('id', $id);
    }

    public function deleteScan(int $id, int $userId): bool
    {
        $scans = $this->loadUserScans($userId);
        $scanIndex = $scans->search(fn($item) => $item->id == $id);

        if ($scanIndex === false) {
            return false;
        }

        $scan = $scans[$scanIndex];

        // Hapus berkas fisik foto scan jika ada
        if (!empty($scan->scan_image)) {
            $physicalPath = public_path('storage/' . $scan->scan_image);
            if (file_exists($physicalPath)) {
                @unlink($physicalPath);
            }
            if (Storage::disk('public')->exists($scan->scan_image)) {
                Storage::disk('public')->delete($scan->scan_image);
            }
        }

        $scans->forget($scanIndex);
        $this->saveUserScans($userId, $scans->values());

        return true;
    }

    public function getHistory(int $userId): Collection
    {
        return $this->loadUserScans($userId)->sortByDesc('created_at')->values();
    }

    public function getDailySummary(int $userId): Collection
    {
        $scans = $this->loadUserScans($userId);
        
        return $scans->groupBy('consumed_at')
            ->map(function ($dayScans, $date) {
                $totalCalories = 0.0;
                $totalProtein = 0.0;
                $totalCarbs = 0.0;
                $totalFat = 0.0;

                foreach ($dayScans as $scan) {
                    if ($scan->nutrition) {
                        $qty = (float) $scan->serving_qty;
                        $totalCalories += ((float) $scan->nutrition->calories) * $qty;
                        $totalProtein += ((float) $scan->nutrition->protein) * $qty;
                        $totalCarbs += ((float) $scan->nutrition->carbs) * $qty;
                        $totalFat += ((float) $scan->nutrition->fat) * $qty;
                    }
                }

                return (object)[
                    'date'           => $date,
                    'total_calories' => $totalCalories,
                    'total_protein'  => $totalProtein,
                    'total_carbs'    => $totalCarbs,
                    'total_fat'      => $totalFat,
                    'scan_count'     => $dayScans->count(),
                ];
            })
            ->sortByDesc('date')
            ->values();
    }

    public function getDashboardSummary(int $userId, string $todayDate): object
    {
        $scansToday = $this->loadUserScans($userId)->filter(function ($scan) use ($todayDate) {
            return $scan->consumed_at === $todayDate;
        });

        $totalCalories = 0.0;
        $totalProtein = 0.0;
        $totalCarbs = 0.0;
        $totalFat = 0.0;

        foreach ($scansToday as $scan) {
            if ($scan->nutrition) {
                $qty = (float) $scan->serving_qty;
                $totalCalories += ((float) $scan->nutrition->calories) * $qty;
                $totalProtein += ((float) $scan->nutrition->protein) * $qty;
                $totalCarbs += ((float) $scan->nutrition->carbs) * $qty;
                $totalFat += ((float) $scan->nutrition->fat) * $qty;
            }
        }

        return (object)[
            'total_calories' => $totalCalories,
            'total_protein'  => $totalProtein,
            'total_carbs'    => $totalCarbs,
            'total_fat'      => $totalFat,
            'total_fiber'    => 0.0,
            'scan_count'     => $scansToday->count(),
        ];
    }

    public function getDashboardRecentScans(int $userId, string $todayDate, int $limit = 5): Collection
    {
        return $this->loadUserScans($userId)
            ->filter(fn($scan) => $scan->consumed_at === $todayDate)
            ->sortByDesc('created_at')
            ->take($limit)
            ->values();
    }

    public function getStatsRange(int $userId, string $startDate, string $endDate): Collection
    {
        $scansRange = $this->loadUserScans($userId)->filter(function ($scan) use ($startDate, $endDate) {
            return $scan->consumed_at >= $startDate && $scan->consumed_at <= $endDate;
        });

        return $scansRange->groupBy('consumed_at')
            ->map(function ($dayScans, $date) {
                $totalCalories = 0.0;
                $totalProtein = 0.0;
                $totalCarbs = 0.0;
                $totalFat = 0.0;

                foreach ($dayScans as $scan) {
                    if ($scan->nutrition) {
                        $qty = (float) $scan->serving_qty;
                        $totalCalories += ((float) $scan->nutrition->calories) * $qty;
                        $totalProtein += ((float) $scan->nutrition->protein) * $qty;
                        $totalCarbs += ((float) $scan->nutrition->carbs) * $qty;
                        $totalFat += ((float) $scan->nutrition->fat) * $qty;
                    }
                }

                return (object)[
                    'date'           => $date,
                    'total_calories' => $totalCalories,
                    'total_protein'  => $totalProtein,
                    'total_carbs'    => $totalCarbs,
                    'total_fat'      => $totalFat,
                    'scan_count'     => $dayScans->count(),
                ];
            });
    }
}
