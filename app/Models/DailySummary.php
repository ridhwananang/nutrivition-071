<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailySummary extends Model
{
    protected $table = 'daily_summary';

    protected $fillable = [
        'user_id', 'date', 'total_calories',
        'total_protein', 'total_carbs', 'total_fat',
        'total_fiber', 'total_sugar', 'total_sodium',
        'scan_count',
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
