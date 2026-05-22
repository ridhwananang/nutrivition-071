<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Result extends Model
{
    protected $table = 'result';

    protected $fillable = [
        'user_id', 'nutrition_id', 'scan_image',
        'analisis_ai', 'confidence', 'serving_qty',
        'total_calories', 'meal_type', 'consumed_at',
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function nutrition()
    {
        return $this->belongsTo(\App\Models\Nutrition::class);
    }
}
