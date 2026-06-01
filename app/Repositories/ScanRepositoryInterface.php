<?php

namespace App\Repositories;

use Illuminate\Support\Collection;

interface ScanRepositoryInterface
{
    /**
     * Cari nutrition reference berdasarkan unique key.
     */
    public function findNutritionByKey(string $key): ?object;

    /**
     * Ambil semua data gizi (untuk master list).
     */
    public function getAllNutrition(): Collection;

    /**
     * Cari nutrition gizi berdasarkan ID.
     */
    public function findNutritionById(int $id): ?object;

    /**
     * Cari nutrition gizi berdasarkan pencarian keyword (brand/item).
     */
    public function searchNutrition(string $keyword): Collection;

    /**
     * Simpan data hasil scan pindaian makanan baru.
     */
    public function storeScan(array $data): object;

    /**
     * Cari satu record scan hasil pindaian berdasarkan ID & User ID.
     */
    public function findScan(int $id, int $userId): ?object;

    /**
     * Hapus record scan berdasarkan ID & User ID.
     */
    public function deleteScan(int $id, int $userId): bool;

    /**
     * Ambil semua riwayat scan milik user tertentu secara kronologis terbalik (terbaru dahulu).
     */
    public function getHistory(int $userId): Collection;

    /**
     * Ambil summary asupan harian berkelompok (daily summary).
     */
    public function getDailySummary(int $userId): Collection;

    /**
     * Ambil dashboard data summary hari ini.
     */
    public function getDashboardSummary(int $userId, string $todayDate): object;

    /**
     * Ambil histori scan terbaru hari ini dengan limit tertentu.
     */
    public function getDashboardRecentScans(int $userId, string $todayDate, int $limit = 5): Collection;

    /**
     * Ambil statistik asupan harian antara dua tanggal (start & end).
     */
    public function getStatsRange(int $userId, string $startDate, string $endDate): Collection;
}
