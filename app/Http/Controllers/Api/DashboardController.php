<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DashboardResource;
use App\Repositories\ScanRepositoryInterface;
use Illuminate\Http\Request;

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

        $payload = [
            'date'         => $today,
            'calorie_goal' => $calorieGoal,
            'calorie_left' => max(0, $calorieLeft),
            'summary'      => $summary,
            'recent_scans' => $recentScans,
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
}