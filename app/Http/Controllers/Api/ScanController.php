<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Nutrition;
use App\Models\Result;
use App\Models\DailySummary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ScanController extends Controller
{
    // POST /api/scan
    public function store(Request $request)
    {
        $request->validate([
            'image'     => 'required|image|max:5120',
            'meal_type' => 'nullable|in:breakfast,lunch,dinner,snack',
            'serving_qty' => 'nullable|numeric|min:0.1',
        ]);

        // 1. Simpan foto
        $path = $request->file('image')->store('scans', 'public');

        // 2. Analisis AI — cocokkan dengan database nutrition
        $analisisResult = $this->analisisAI($request->file('image'));

        // 3. Cari nutrition di database
        $nutrition = Nutrition::where('key', $analisisResult['key'])->first();

        if (!$nutrition) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Makanan tidak dikenali dalam database',
            ], 404);
        }

        // 4. Hitung total kalori
        $servingQty   = $request->serving_qty ?? 1;
        $totalCalories = $nutrition->calories * $servingQty;

        // 5. Simpan hasil scan
        $result = Result::create([
            'user_id'        => $request->user()->id,
            'nutrition_id'   => $nutrition->id,
            'scan_image'     => $path,
            'analisis_ai'    => $analisisResult['analisis'],
            'confidence'     => $analisisResult['confidence'],
            'serving_qty'    => $servingQty,
            'total_calories' => $totalCalories,
            'meal_type'      => $request->meal_type,
            'consumed_at'    => now()->toDateString(),
        ]);

        // 6. Update daily summary
        $this->updateDailySummary($request->user()->id, $nutrition, $servingQty);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'result'    => $result,
                'nutrition' => $nutrition,
            ],
        ], 201);
    }

    private function analisisAI($image): array
    {
        // Placeholder — nanti diganti dengan AI sesungguhnya
        // Contoh: Google Vision API, OpenAI Vision, dll
        return [
            'key'        => 'bk-beefburger',
            'analisis'   => 'Terdeteksi: Burger King Beef Burger',
            'confidence' => 0.92,
        ];
    }

    private function updateDailySummary($userId, Nutrition $nutrition, $qty): void
    {
        $today = now()->toDateString();

        $summary = DailySummary::firstOrCreate(
            ['user_id' => $userId, 'date' => $today],
            [
                'total_calories' => 0,
                'total_protein'  => 0,
                'total_carbs'    => 0,
                'total_fat'      => 0,
                'total_fiber'    => 0,
                'total_sugar'    => 0,
                'total_sodium'   => 0,
                'scan_count'     => 0,
            ]
        );

        $summary->increment('total_calories', $nutrition->calories * $qty);
        $summary->increment('total_protein',  $nutrition->protein * $qty);
        $summary->increment('total_carbs',    $nutrition->carbs * $qty);
        $summary->increment('total_fat',      $nutrition->fat * $qty);
        $summary->increment('scan_count',     1);
    }
}