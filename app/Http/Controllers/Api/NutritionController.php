<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Nutrition;
use Illuminate\Http\Request;

class NutritionController extends Controller
{
    // GET /api/nutrition
    public function index()
    {
        $nutrition = Nutrition::all();

        return response()->json([
            'status' => 'success',
            'total'  => $nutrition->count(),
            'data'   => $nutrition,
        ]);
    }

    // GET /api/nutrition/search?q=burger
    public function search(Request $request)
    {
        $q = $request->query('q');

        if (!$q) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Parameter pencarian tidak boleh kosong',
            ], 422);
        }

        $results = Nutrition::where('item', 'like', "%{$q}%")
            ->orWhere('brand', 'like', "%{$q}%")
            ->get();

        return response()->json([
            'status' => 'success',
            'total'  => $results->count(),
            'data'   => $results,
        ]);
    }

    // GET /api/nutrition/{key}
    public function show($key)
    {
        $nutrition = Nutrition::where('key', $key)->first();

        if (!$nutrition) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Makanan tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $nutrition,
        ]);
    }

    public function store(Request $request) {}
    public function update(Request $request, string $id) {}
    public function destroy(string $id) {}
}