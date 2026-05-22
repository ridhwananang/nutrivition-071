<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Nutrition;
use Illuminate\Http\Request;

class NutritionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $nutrition = Nutrition::all();

        return response()->json([
            'status'  => 'success',
            'data'    => $nutrition,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
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

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
