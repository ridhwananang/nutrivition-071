<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Result;
use App\Models\DailySummary;
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
        $summaries = DailySummary::where('user_id', $request->user()->id)
            ->orderBy('date', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $summaries,
        ]);
    }
}