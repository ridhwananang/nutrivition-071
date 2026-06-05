<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ScanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'user_id'        => $this->user_id,
            'nutrition_id'   => $this->nutrition_id,
            'scan_image'     => $this->scan_image,
            'scan_image_url' => $this->scan_image ? Storage::disk(config('filesystems.default') === 'local' ? 'public' : config('filesystems.default'))->url($this->scan_image) : null,
            'analisis_ai'    => $this->analisis_ai,
            'confidence'     => (float) $this->confidence,
            'serving_qty'    => (float) $this->serving_qty,
            'total_calories' => (float) $this->total_calories,
            'meal_type'      => $this->meal_type,
            'consumed_at'    => $this->consumed_at,
            'created_at'     => $this->created_at,
            'updated_at'     => $this->updated_at,
            'nutrition'      => $this->nutrition ? [
                'id'           => $this->nutrition->id,
                'brand'        => $this->nutrition->brand,
                'item'         => $this->nutrition->item,
                'key'          => $this->nutrition->key,
                'serving_size' => $this->nutrition->serving_size,
                'calories'     => (float) $this->nutrition->calories,
                'fat'          => (float) $this->nutrition->fat,
                'carbs'        => (float) $this->nutrition->carbs,
                'protein'      => (float) $this->nutrition->protein,
            ] : null,
            '_links' => [
                'self' => [
                    'href'   => url('/api/scan/' . $this->id),
                    'method' => 'GET',
                ],
                'delete' => [
                    'href'   => url('/api/scan/' . $this->id),
                    'method' => 'DELETE',
                ],
                'history' => [
                    'href'   => url('/api/history'),
                    'method' => 'GET',
                ],
            ]
        ];
    }
}
