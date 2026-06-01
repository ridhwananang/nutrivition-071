<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProfileResource;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    // GET /api/profile
    public function show(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data'   => new ProfileResource($request->user()),
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
            'data'    => new ProfileResource($user),
        ]);
    }
}