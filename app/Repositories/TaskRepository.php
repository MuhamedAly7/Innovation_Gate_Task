<?php

namespace App\Repositories;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class TaskRepository
{
    public function create(array $data): Task
    {
        return Task::create($data);
    }

    public function findById(int $id, int $userId): ?Task
    {
        return Task::where('id', $id)->where('assignee_id', $userId)->first();
    }

    public function getUserTasks(int $userId, ?string $priority = null): Collection
    {
        $query = Task::where('assignee_id', $userId)->orderBy('due_date', 'asc');
        if ($priority) {
            $query->where('priority', $priority);
        }
        return $query->get();
    }

    public function update(Task $task, array $data): Task
    {
        $task->update($data);
        return $task;
    }

    public function delete(Task $task): void
    {
        $task->delete();
    }

    public function assign(Task $task, User $assignee): Task
    {
        $task->assignee_id = $assignee->id;
        $task->save();
        return $task;
    }

    public function toggleComplete(Task $task): Task
    {
        $task->is_completed = !$task->is_completed;
        $task->save();
        return $task;
    }

    public function findUserByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }
}
