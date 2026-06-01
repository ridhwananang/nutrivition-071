<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'    => $this->id,
            'name'  => $this->name,
            'email' => $this->email,
            '_links' => [
                'self' => [
                    'href'   => url('/api/profile'),
                    'method' => 'GET',
                ],
                'update' => [
                    'href'   => url('/api/profile'),
                    'method' => 'PUT',
                ],
                'dashboard' => [
                    'href'   => url('/api/dashboard'),
                    'method' => 'GET',
                ],
            ]
        ];
    }
}
