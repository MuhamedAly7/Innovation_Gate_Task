<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;


class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Register a new user
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $this->authService->register($validated);
        return ApiResponse::success('User successfully registered', [], 201);
    }

    /**
     * Login user and get JWT token
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->only('email', 'password');
        $loginResult = $this->authService->login($credentials);

        if ($loginResult['status'] === 'error') {
            return ApiResponse::error($loginResult['message'], $loginResult['code']);
        }

        return ApiResponse::success('User successfully logged in', [
            'token' => $loginResult['token'],
            'user' => $loginResult['user']->only(['id', 'name', 'email'])
        ], 200);
    }

    /**
     * Logout user (invalidate the token)
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->auth_user);
        return ApiResponse::success('User successfully logged out', [], 200);
    }

    /**
     * Get all users (protected route)
     */
    public function getAllUsers(Request $request): JsonResponse
    {
        $users = $this->authService->getAllUsers();
        return ApiResponse::success('Users retrieved successfully', ['users' => $users], 200);
    }
}
