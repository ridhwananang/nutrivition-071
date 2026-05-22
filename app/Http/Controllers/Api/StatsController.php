<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailySummary;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StatsController extends Controller
{
    // GET /api/stats/weekly
    public function weekly(Request $request)
    {
        $user = $request->user();
        $days = collect();

        // Generate 7 hari terakhir
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i)->toDateString();

            $summary = DailySummary::where('user_id', $user->id)
                ->where('date', $date)
                ->first();

            $days->push([
                'date'           => $date,
                'day'            => Carbon::parse($date)->locale('id')->isoFormat('ddd'),
                'total_calories' => $summary->total_calories ?? 0,
                'total_protein'  => $summary->total_protein ?? 0,
                'total_carbs'    => $summary->total_carbs ?? 0,
                'total_fat'      => $summary->total_fat ?? 0,
                'scan_count'     => $summary->scan_count ?? 0,
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

        // Generate 30 hari terakhir
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i)->toDateString();

            $summary = DailySummary::where('user_id', $user->id)
                ->where('date', $date)
                ->first();

            $days->push([
                'date'           => $date,
                'day'            => Carbon::parse($date)->locale('id')->isoFormat('D MMM'),
                'total_calories' => $summary->total_calories ?? 0,
                'total_protein'  => $summary->total_protein ?? 0,
                'total_carbs'    => $summary->total_carbs ?? 0,
                'total_fat'      => $summary->total_fat ?? 0,
                'scan_count'     => $summary->scan_count ?? 0,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $days,
        ]);
    }
}