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

    public function invalidateToken(string $token)
    {
        $user = auth()->user();

        // Invalidate old token if exists
        if (!empty($user->current_token)) {
            try {
                JWTAuth::setToken($user->current_token)->invalidate();
            } catch (Exception $e) {
                // ignore invalid/expired tokens
            }
        }

        $user->current_token = $token;
        $user->save();

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
