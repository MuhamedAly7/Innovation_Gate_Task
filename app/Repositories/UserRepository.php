<?php

namespace App\Repositories;

use Exception;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class UserRepository
{
    public function create(array $data): void
    {
        $user = new User();
        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->password = Hash::make($data['password']);
        $user->save();
    }

    public function getAuthUser()
    {
        $user = auth()->user();
        return $user;
    }

    public function clearCurrentToken(User $user)
    {
        $user->current_token = null;
        $user->save();
    }

    public function getAllUsers()
    {
        return User::select('name', 'email')->get();
    }
}
