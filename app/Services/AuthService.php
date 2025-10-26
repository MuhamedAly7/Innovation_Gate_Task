<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthService
{
    protected $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function register(array $data): void
    {
        $this->userRepository->create($data);
    }

    public function login(array $credentials): array
    {
        try {
            if (!$token = Auth::attempt($credentials)) {
                return ['status' => 'error', 'message' => 'Invalid Credentials', 'code' => 401];
            }
            $user = $this->userRepository->getAuthUser();
        } catch (JWTException $e) {
            return ['status' => 'error', 'message' => 'Could not create token', 'code' => 401];
        }

        return [
            'status' => 'success',
            'token' => $token,
            'user' => $user
        ];
    }

    public function logout(User $user): void
    {
        $this->userRepository->clearCurrentToken($user);
        Auth::logout();
    }

    public function getAllUsers()
    {
        return $this->userRepository->getAllUsers();
    }
}
