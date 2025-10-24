<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success(string $message, array $data, int $status): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ], $status);
    }

    public static function error(string $message, int $status = 400, array $errors = []): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
            'data' => $errors
        ], $status);
    }
}
