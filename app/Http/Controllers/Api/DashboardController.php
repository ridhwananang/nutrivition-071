<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Result;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    // GET /api/dashboard
    public function index(Request $request)
    {
        $user  = $request->user();
        $today = now()->toDateString();

        // Summary hari ini secara dinamis dari tabel result join nutrition
        $summaryData = Result::join('nutrition', 'result.nutrition_id', '=', 'nutrition.id')
            ->where('result.user_id', $user->id)
            ->whereDate('result.consumed_at', $today)
            ->selectRaw('
                SUM(nutrition.calories * result.serving_qty) as total_calories,
                SUM(nutrition.protein * result.serving_qty) as total_protein,
                SUM(nutrition.carbs * result.serving_qty) as total_carbs,
                SUM(nutrition.fat * result.serving_qty) as total_fat,
                COUNT(result.id) as scan_count
            ')
            ->first();

        $summary = (object)[
            'total_calories' => (float)($summaryData->total_calories ?? 0),
            'total_protein'  => (float)($summaryData->total_protein ?? 0),
            'total_carbs'    => (float)($summaryData->total_carbs ?? 0),
            'total_fat'      => (float)($summaryData->total_fat ?? 0),
            'total_fiber'    => 0,
            'scan_count'     => (int)($summaryData->scan_count ?? 0),
        ];

        // Scan terakhir hari ini
        $recentScans = Result::with('nutrition')
            ->where('user_id', $user->id)
            ->whereDate('consumed_at', $today)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Target kalori default 2000
        $calorieGoal = 2000;
        $calorieLeft = $calorieGoal - ($summary->total_calories ?? 0);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'date'          => $today,
                'calorie_goal'  => $calorieGoal,
                'calorie_left'  => max(0, $calorieLeft),
                'summary'       => $summary ?? [
                    'total_calories' => 0,
                    'total_protein'  => 0,
                    'total_carbs'    => 0,
                    'total_fat'      => 0,
                    'total_fiber'    => 0,
                    'scan_count'     => 0,
                ],
                'recent_scans'  => $recentScans,
                'macros' => [
                    'protein' => [
                        'value'   => $summary->total_protein ?? 0,
                        'goal'    => 50,
                        'unit'    => 'g',
                    ],
                    'carbs' => [
                        'value'   => $summary->total_carbs ?? 0,
                        'goal'    => 300,
                        'unit'    => 'g',
                    ],
                    'fat' => [
                        'value'   => $summary->total_fat ?? 0,
                        'goal'    => 65,
                        'unit'    => 'g',
                    ],
                ],
            ],
        ]);
    }
}