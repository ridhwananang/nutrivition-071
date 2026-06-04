<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\HistoryResource;
use App\Repositories\ScanRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class HistoryController extends Controller
{
    protected ScanRepositoryInterface $scanRepository;

    public function __construct(ScanRepositoryInterface $scanRepository)
    {
        $this->scanRepository = $scanRepository;
    }

    // GET /api/history
    public function index(Request $request)
    {
        $history = $this->scanRepository->getHistory($request->user()->id);

        return response()->json([
            'status' => 'success',
            'data'   => HistoryResource::collection($history),
        ]);
    }

    // GET /api/history/{id}
    public function show(Request $request, $id)
    {
        $result = $this->scanRepository->findScan($id, $request->user()->id);

        if (!$result) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => new HistoryResource($result),
        ]);
    }

    // DELETE /api/history/{id}
    public function destroy(Request $request, $id)
    {
        $deleted = $this->scanRepository->deleteScan($id, $request->user()->id);

        if (!$deleted) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data tidak ditemukan',
            ], 404);
        }

        Cache::forget("user_" . $request->user()->id . "_advice_" . now()->toDateString());

        return response()->json([
            'status'  => 'success',
            'message' => 'Riwayat berhasil dihapus',
        ]);
    }

    // GET /api/daily-summary
    public function dailySummary(Request $request)
    {
        $summaries = $this->scanRepository->getDailySummary($request->user()->id);

        // Bungkus data array dengan HATEOAS links
        $formattedData = $summaries->map(function ($item) {
            return [
                'date'           => $item->date,
                'total_calories' => (float) $item->total_calories,
                'total_protein'  => (float) $item->total_protein,
                'total_carbs'    => (float) $item->total_carbs,
                'total_fat'      => (float) $item->total_fat,
                'scan_count'     => (int) $item->scan_count,
                '_links'         => [
                    'self' => [
                        'href'   => url('/api/daily-summary?date=' . $item->date),
                        'method' => 'GET',
                    ],
                    'dashboard' => [
                        'href'   => url('/api/dashboard'),
                        'method' => 'GET',
                    ],
                ]
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $formattedData,
        ]);
    }
}