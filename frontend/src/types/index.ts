export interface ApiResponse<T> {
    status: "success" | "error";
    message: string;
    data: T;
    errors?: Record<string, string[]>;
    code?: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Task {
    id: number;
    title: string;
    description: string | null;
    due_date: string | null;
    priority: "low" | "medium" | "high";
    is_completed: boolean;
    creator_id: number;
    assignee_id: number;
    created_at: string;
    updated_at: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}
