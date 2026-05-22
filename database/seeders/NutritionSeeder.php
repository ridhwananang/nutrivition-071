<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NutritionSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/nutrition.csv');
        $file = fopen($path, 'r');

        fgetcsv($file, 0, ';');

        while (($row = fgetcsv($file, 0, ';')) !== false) {
            if (empty($row[0])) continue;

            DB::table('nutrition')->insertOrIgnore([
                'brand'        => trim($row[0]),
                'item'         => trim($row[1]),
                'key'          => trim($row[2]),
                'serving_size' => trim($row[3]),
                'calories'     => (float) str_replace('kkal', '', trim($row[4])),
                'fat'          => (float) str_replace('g', '', trim($row[5])),
                'carbs'        => (float) str_replace('g', '', trim($row[6])),
                'protein'      => (float) str_replace('g', '', trim($row[7])),
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);
        }

        fclose($file);
        $this->command->info('Data nutrition berhasil diimport!');
    }
}