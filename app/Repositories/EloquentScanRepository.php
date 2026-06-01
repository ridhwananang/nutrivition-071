<?php

namespace App\Repositories;

use App\Models\Nutrition;
use App\Models\Result;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class EloquentScanRepository implements ScanRepositoryInterface
{
    public function findNutritionByKey(string $key): ?object
    {
        return Nutrition::where('key', $key)->first();
    }

    public function getAllNutrition(): Collection
    {
        return Nutrition::all();
    }

    public function findNutritionById(int $id): ?object
    {
        return Nutrition::find($id);
    }

    public function searchNutrition(string $keyword): Collection
    {
        return Nutrition::where('item', 'like', "%{$keyword}%")
            ->orWhere('brand', 'like', "%{$keyword}%")
            ->get();
    }

    public function storeScan(array $data): object
    {
        return Result::create($data);
    }

    public function findScan(int $id, int $userId): ?object
    {
        return Result::with('nutrition')
            ->where('user_id', $userId)
            ->find($id);
    }

    public function deleteScan(int $id, int $userId): bool
    {
        $result = Result::where('user_id', $userId)->find($id);

        if (!$result) {
            return false;
        }

        // Hapus berkas fisik scan jika ada
        if ($result->scan_image) {
            $physicalPath = public_path('storage/' . $result->scan_image);
            if (file_exists($physicalPath)) {
                @unlink($physicalPath);
            }
            if (Storage::disk('public')->exists($result->scan_image)) {
                Storage::disk('public')->delete($result->scan_image);
            }
        }

        return (bool) $result->delete();
    }

    public function getHistory(int $userId): Collection
    {
        return Result::with('nutrition')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getDailySummary(int $userId): Collection
    {
        return Result::join('nutrition', 'result.nutrition_id', '=', 'nutrition.id')
            ->where('result.user_id', $userId)
            ->selectRaw('
                result.consumed_at as date,
                SUM(nutrition.calories * result.serving_qty) as total_calories,
                SUM(nutrition.protein * result.serving_qty) as total_protein,
                SUM(nutrition.carbs * result.serving_qty) as total_carbs,
                SUM(nutrition.fat * result.serving_qty) as total_fat,
                COUNT(result.id) as scan_count
            ')
            ->groupBy('result.consumed_at')
            ->orderBy('result.consumed_at', 'desc')
            ->get();
    }

    public function getDashboardSummary(int $userId, string $todayDate): object
    {
        $summaryData = Result::join('nutrition', 'result.nutrition_id', '=', 'nutrition.id')
            ->where('result.user_id', $userId)
            ->whereDate('result.consumed_at', $todayDate)
            ->selectRaw('
                SUM(nutrition.calories * result.serving_qty) as total_calories,
                SUM(nutrition.protein * result.serving_qty) as total_protein,
                SUM(nutrition.carbs * result.serving_qty) as total_carbs,
                SUM(nutrition.fat * result.serving_qty) as total_fat,
                COUNT(result.id) as scan_count
            ')
            ->first();

        return (object)[
            'total_calories' => (float) ($summaryData->total_calories ?? 0),
            'total_protein'  => (float) ($summaryData->total_protein ?? 0),
            'total_carbs'    => (float) ($summaryData->total_carbs ?? 0),
            'total_fat'      => (float) ($summaryData->total_fat ?? 0),
            'total_fiber'    => 0.0,
            'scan_count'     => (int) ($summaryData->scan_count ?? 0),
        ];
    }

    public function getDashboardRecentScans(int $userId, string $todayDate, int $limit = 5): Collection
    {
        return Result::with('nutrition')
            ->where('user_id', $userId)
            ->whereDate('consumed_at', $todayDate)
            ->orderBy('created_at', 'desc')
            ->take($limit)
            ->get();
    }

    public function getStatsRange(int $userId, string $startDate, string $endDate): Collection
    {
        return Result::join('nutrition', 'result.nutrition_id', '=', 'nutrition.id')
            ->where('result.user_id', $userId)
            ->whereBetween('result.consumed_at', [$startDate, $endDate])
            ->selectRaw('
                result.consumed_at as date,
                SUM(nutrition.calories * result.serving_qty) as total_calories,
                SUM(nutrition.protein * result.serving_qty) as total_protein,
                SUM(nutrition.carbs * result.serving_qty) as total_carbs,
                SUM(nutrition.fat * result.serving_qty) as total_fat,
                COUNT(result.id) as scan_count
            ')
            ->groupBy('result.consumed_at')
            ->get()
            ->keyBy('date');
    }
}
