<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Result;
use Illuminate\Http\Request;

class HistoryController extends Controller
{
    // GET /api/history
    public function index(Request $request)
    {
        $history = Result::with('nutrition')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $history,
        ]);
    }

    // GET /api/history/{id}
    public function show(Request $request, $id)
    {
        $result = Result::with('nutrition')
            ->where('user_id', $request->user()->id)
            ->find($id);

        if (!$result) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $result,
        ]);
    }

    // DELETE /api/history/{id}
    public function destroy(Request $request, $id)
    {
        $result = Result::where('user_id', $request->user()->id)->find($id);

        if (!$result) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data tidak ditemukan',
            ], 404);
        }

        $result->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Riwayat berhasil dihapus',
        ]);
    }

    // GET /api/daily-summary
    public function dailySummary(Request $request)
    {
        $summaries = Result::join('nutrition', 'result.nutrition_id', '=', 'nutrition.id')
            ->where('result.user_id', $request->user()->id)
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

        return response()->json([
            'status' => 'success',
            'data'   => $summaries,
        ]);
    }
}