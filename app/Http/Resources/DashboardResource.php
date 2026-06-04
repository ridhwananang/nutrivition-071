<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = $this->resource;

        return [
            'date'         => $data['date'],
            'calorie_goal' => (float) $data['calorie_goal'],
            'calorie_left' => (float) $data['calorie_left'],
            'summary'      => [
                'total_calories' => (float) $data['summary']->total_calories,
                'total_protein'  => (float) $data['summary']->total_protein,
                'total_carbs'    => (float) $data['summary']->total_carbs,
                'total_fat'      => (float) $data['summary']->total_fat,
                'total_fiber'    => (float) ($data['summary']->total_fiber ?? 0.0),
                'scan_count'     => (int) $data['summary']->scan_count,
            ],
            'recent_scans' => ScanResource::collection($data['recent_scans']),
            'daily_advice' => $data['daily_advice'] ?? '',
            'macros'       => [
                'protein' => [
                    'value' => (float) $data['macros']['protein']['value'],
                    'goal'  => (float) $data['macros']['protein']['goal'],
                    'unit'  => $data['macros']['protein']['unit'],
                ],
                'carbs' => [
                    'value' => (float) $data['macros']['carbs']['value'],
                    'goal'  => (float) $data['macros']['carbs']['goal'],
                    'unit'  => $data['macros']['carbs']['unit'],
                ],
                'fat' => [
                    'value' => (float) $data['macros']['fat']['value'],
                    'goal'  => (float) $data['macros']['fat']['goal'],
                    'unit'  => $data['macros']['fat']['unit'],
                ],
            ],
            '_links' => [
                'self' => [
                    'href'   => url('/api/dashboard'),
                    'method' => 'GET',
                ],
                'scan' => [
                    'href'   => url('/api/scan'),
                    'method' => 'POST',
                ],
                'history' => [
                    'href'   => url('/api/history'),
                    'method' => 'GET',
                ],
                'stats_weekly' => [
                    'href'   => url('/api/stats/weekly'),
                    'method' => 'GET',
                ],
                'stats_monthly' => [
                    'href'   => url('/api/stats/monthly'),
                    'method' => 'GET',
                ],
                'profile' => [
                    'href'   => url('/api/profile'),
                    'method' => 'GET',
                ],
            ]
        ];
    }
}
