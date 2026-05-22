<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ScanController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HistoryController;
use App\Http\Controllers\Api\NutritionController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::get('/nutrition', [NutritionController::class, 'index']);
Route::get('/nutrition/{key}', [NutritionController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/scan', [ScanController::class, 'store']);
    Route::get('/history', [HistoryController::class, 'index']);
    Route::get('/history/{id}', [HistoryController::class, 'show']);
    Route::delete('/history/{id}', [HistoryController::class, 'destroy']);
    Route::get('/daily-summary', [HistoryController::class, 'dailySummary']);
});
