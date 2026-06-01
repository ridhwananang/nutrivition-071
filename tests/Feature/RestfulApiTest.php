<?php

use App\Models\User;
use App\Repositories\EloquentScanRepository;
use App\Repositories\FileScanRepository;
use App\Repositories\ScanRepositoryInterface;
use Illuminate\Support\Facades\Storage;

test('dashboard returns restful hateoas links', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->getJson('/api/dashboard');

    $response->assertOk()
        ->assertJsonStructure([
            'status',
            'data' => [
                'date',
                'calorie_goal',
                'calorie_left',
                'summary',
                'recent_scans',
                'macros',
                '_links' => [
                    'self',
                    'scan',
                    'history',
                    'stats_weekly',
                    'stats_monthly',
                    'profile'
                ]
            ]
        ]);
});

test('profile returns restful hateoas links', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->getJson('/api/profile');

    $response->assertOk()
        ->assertJsonStructure([
            'status',
            'data' => [
                'id',
                'name',
                'email',
                '_links' => [
                    'self',
                    'update',
                    'dashboard'
                ]
            ]
        ]);
});

test('file scan repository stores and retrieves data without database', function () {
    Storage::fake('local');
    
    // Bind to FileScanRepository secara dinamis
    config(['services.storage_driver' => 'file']);
    $repository = app(ScanRepositoryInterface::class);
    
    expect($repository)->toBeInstanceOf(FileScanRepository::class);

    $userId = 999;

    // Simpan data scan tiruan
    $scan = $repository->storeScan([
        'user_id'        => $userId,
        'nutrition_id'   => 1, // ID tiruan
        'scan_image'     => 'scans/dummy.png',
        'analisis_ai'    => 'Chicken Nuggets',
        'confidence'     => 0.95,
        'serving_qty'    => 2,
        'total_calories' => 520,
        'meal_type'      => 'lunch',
        'consumed_at'    => '2026-06-02',
    ]);

    expect($scan->id)->not->toBeNull();
    expect($scan->total_calories)->toEqual(520);

    // Pastikan berkas JSON berhasil dibuat di storage lokal
    Storage::assertExists("scans/user_{$userId}.json");

    // Ambil riwayat histori
    $history = $repository->getHistory($userId);
    expect($history)->toHaveCount(1);
    expect($history->first()->analisis_ai)->toEqual('Chicken Nuggets');

    // Ambil rangkuman gizi dasbor
    $summary = $repository->getDashboardSummary($userId, '2026-06-02');
    expect($summary->total_calories)->toEqual(1540);
    expect($summary->scan_count)->toEqual(1);

    // Hapus scan
    $deleted = $repository->deleteScan($scan->id, $userId);
    expect($deleted)->toBeTrue();

    // Pastikan data berhasil terhapus dari file JSON
    $historyAfter = $repository->getHistory($userId);
    expect($historyAfter)->toHaveCount(0);
});
