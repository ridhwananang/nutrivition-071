<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    // GET /api/profile
    public function show(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data'   => $request->user(),
        ]);
    }

    // PUT /api/profile
    public function update(Request $request)
    {
        $request->validate([
            'name'  => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $request->user()->id,
        ]);

        $user = $request->user();
        $user->update($request->only(['name', 'email']));

        return response()->json([
            'status'  => 'success',
            'message' => 'Profil berhasil diupdate',
            'data'    => $user,
        ]);
    }

    // GET /api/user/diet-mode
    public function getDietMode(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data'   => [
                'diet_mode' => $request->user()->diet_mode ?? 'normal',
                'available' => ['normal', 'keto', 'vegan', 'vegetarian', 'low-carb', 'high-protein'],
            ],
        ]);
    }

    // POST /api/user/diet-mode
    public function setDietMode(Request $request)
    {
        $request->validate([
            'diet_mode' => 'required|in:normal,keto,vegan,vegetarian,low-carb,high-protein',
        ]);

        $request->user()->update(['diet_mode' => $request->diet_mode]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Mode diet berhasil diubah',
            'data'    => ['diet_mode' => $request->diet_mode],
        ]);
    }
}