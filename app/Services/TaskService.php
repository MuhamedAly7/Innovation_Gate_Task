<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use App\Repositories\TaskRepository;

class TaskService
{
    protected TaskRepository $taskRepository;

    public function __construct(TaskRepository $taskRepository)
    {
        $this->taskRepository = $taskRepository;
    }

    public function createTask(array $data, User $creator): array
    {
        $assignee = $this->taskRepository->findUserByEmail($data['assignee_email']);
        if(!$assignee){
            return ['status' => 'error', 'message' => 'Assignee not found', 'code' => 404];
        }

        $taskData = [
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'due_date' => $data['due_date'],
            'priority' => $data['priority'] ?? 'medium',
            'creator_id' => $creator->id,
            'assignee_id' => $assignee->id
        ];

        $task = $this->taskRepository->create($taskData);
        return ['status' => 'success', 'task' => $task];
    }

    public function getUserTasks(User $user, ?string $priority): array
    {
        $tasks = $this->taskRepository->getUserTasks($user->id, $priority);
        return ['status' => 'success', 'tasks' => $tasks];
    }

    public function getTask(int $id, User$user): array
    {
        $task = $this->taskRepository->findById($id, $user->id);
        if(!$task){
            return ['status' => 'error', 'message' => 'Task not found or unauthorized', 'code' => 403];
        }
        return ['status' => 'success', 'task' => $task];
    }

    public function updateTask(int $id, array $data, User $user): array
    {
        $task = $this->taskRepository->findById($id, $user->id);
        if(!$task){
            return ['status' => 'error', 'message' => 'Task not found or unauthorized', 'code' => 403];
        }
        $task = $this->taskRepository->update($task, array_filter([
            'title' => $data['title'] ?? $task->title,
            'description' => $data['description'] ?? $task->description,
            'due_date' => $data['due_date'] ?? $task->due_date,
            'priority' => $data['priority'] ?? $task->priority,
        ]));

        return ['status' => 'success', 'task' => $task];
    }

    public function deleteTask(int $id, User $user): array
    {
        $task = Task::where('id', $id)
                    ->where(function ($query) use ($user) {
                        $query->where('assignee_id', $user->id)->orWhere('creator_id', $user->id);
                    })->first();
        if(!$task){
            return ['status' => 'error', 'message' => 'Task not found or unauthorized', 'code' => 403];
        }
        $this->taskRepository->delete($task);
        return ['status' => 'success', 'message' => 'Task deleted successfully', 'code' => 201];
    }

    public function assignTask(int $id, string $assigneeEmail, User $creator): array
    {
        $task = Task::where('id', $id)->where('creator_id', $creator->id)->first();
        if(!$task){
            return ['status' => 'error', 'message' => 'Task not found or unauthorized', 'code' => 403];
        }

        $assignee = $this->taskRepository->findUserByEmail($assigneeEmail);
        if(!$assignee){
            return ['status' => 'error', 'message' => 'Assignee not found', 'code' => 404];
        }

        $task = $this->taskRepository->assign($task, $assignee);
        return ['status' => 'success', 'task' => $task];
    }

    public function toggleTaskCompletion(int $id, User $user): array
    {
        $task = $this->taskRepository->findById($id, $user->id);
        if(!$task){
            return ['status' => 'error', 'message' => 'Task not found or unauthorized', 'code' => 404];
        }
        $task = $this->taskRepository->toggleComplete($task);
        return ['status' => 'success', 'task' => $task];
    }
}
