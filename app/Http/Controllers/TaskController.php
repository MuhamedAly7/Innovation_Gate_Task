<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Http\Requests\TaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    protected TaskService $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    public function index(Request $request)
    {
        $priority = $request->query('priority');
        $result = $this->taskService->getUserTasks($request->auth_user, $priority);
        if($request['status' === 'error']) {
            return ApiResponse::error($request['message'], $result['code']);
        }
        return ApiResponse::success('Task rerieved successfully.', ['tasks' => $result['tasks']], 200);
    }

    public function store(TaskRequest $request): JsonResponse
    {
        $result = $this->taskService->createTask($request->validated(), $request->auth_user);
        if($result['status'] === 'error') {
            return ApiResponse::error($result['message'], $result['code']);
        }
        return ApiResponse::success('Task created successfully.', ['task' => $result['task']], 201);
    }

    public function show(int $id, Request $request): JsonResponse
    {
        $result = $this->taskService->getTask($id, $request->auth_user);
        if($result['status'] === 'error') {
            return ApiResponse::error($result['message'], $result['code']);
        }
        return ApiResponse::success('Task retrieved successfully.', ['task' => $result['task']], 200);
    }

    public function update(int $id, UpdateTaskRequest $request): JsonResponse
    {
        $result = $this->taskService->updateTask($id, $request->validated(), $request->auth_user);
        if($result['status'] === 'error') {
            return ApiResponse::error($result['message'], $result['code']);
        }
        return ApiResponse::success('Task updated successfully.', ['task' => $result['task']], 200);
    }

    public function destroy(int $id, Request $request): JsonResponse
    {
        $result = $this->taskService->deleteTask($id, $request->auth_user);
        if($result['status'] === 'error') {
            return ApiResponse::error($result['message'], $result['code']);
        }
        return ApiResponse::success($result['message'], [], $result['code']);
    }

    public function assign(int $id, Request $request): JsonResponse
    {
        $request->validate(['assignee_email' => 'required|email|exists:users,email']);
        $request = $this->taskService->assignTask($id, $request->assignee_email, $request->auth_user);
        if($request['status'] === 'error') {
            return ApiResponse::error($request['message'], $request['code']);
        }
        return ApiResponse::success('Task assigned successfully.', ['task' => $request['task']], 200);
    }

    public function toggleComplete(int $id, Request $request): JsonResponse
    {
        $request = $this->taskService->toggleTaskCompletion($id, $request->auth_user);
        if($request['status'] === 'error') {
            return ApiResponse::error($request['message'], $request['code']);
        }
        return ApiResponse::success('Task completion toggled', ['task' => $request['task']], 200);
    }
}
