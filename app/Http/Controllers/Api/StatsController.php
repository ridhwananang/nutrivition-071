<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\ScanRepositoryInterface;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StatsController extends Controller
{
    protected ScanRepositoryInterface $scanRepository;

    public function __construct(ScanRepositoryInterface $scanRepository)
    {
        $this->scanRepository = $scanRepository;
    }

    // GET /api/stats/weekly
    public function weekly(Request $request)
    {
        $user = $request->user();
        $days = collect();

        $startDate = Carbon::today()->subDays(6)->toDateString();
        $endDate = Carbon::today()->toDateString();

        // Ambil data rangkuman harian dari repositori
        $summaries = $this->scanRepository->getStatsRange($user->id, $startDate, $endDate);

        // Generate 7 hari terakhir
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i)->toDateString();
            $daySummary = $summaries->get($date);

            $days->push([
                'date'           => $date,
                'day'            => Carbon::parse($date)->locale('id')->isoFormat('ddd'),
                'total_calories' => (float)($daySummary->total_calories ?? 0),
                'total_protein'  => (float)($daySummary->total_protein ?? 0),
                'total_carbs'    => (float)($daySummary->total_carbs ?? 0),
                'total_fat'      => (float)($daySummary->total_fat ?? 0),
                'scan_count'     => (int)($daySummary->scan_count ?? 0),
                '_links'         => [
                    'self' => [
                        'href'   => url('/api/daily-summary?date=' . $date),
                        'method' => 'GET',
                    ],
                ]
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $days,
        ]);
    }

    // GET /api/stats/monthly
    public function monthly(Request $request)
    {
        $user = $request->user();
        $days = collect();

        $startDate = Carbon::today()->subDays(29)->toDateString();
        $endDate = Carbon::today()->toDateString();

        // Ambil data rangkuman harian dari repositori
        $summaries = $this->scanRepository->getStatsRange($user->id, $startDate, $endDate);

        // Generate 30 hari terakhir
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i)->toDateString();
            $daySummary = $summaries->get($date);

            $days->push([
                'date'           => $date,
                'day'            => Carbon::parse($date)->locale('id')->isoFormat('D MMM'),
                'total_calories' => (float)($daySummary->total_calories ?? 0),
                'total_protein'  => (float)($daySummary->total_protein ?? 0),
                'total_carbs'    => (float)($daySummary->total_carbs ?? 0),
                'total_fat'      => (float)($daySummary->total_fat ?? 0),
                'scan_count'     => (int)($daySummary->scan_count ?? 0),
                '_links'         => [
                    'self' => [
                        'href'   => url('/api/daily-summary?date=' . $date),
                        'method' => 'GET',
                    ],
                ]
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $days,
        ]);
    }
}