import type { AxiosInstance } from "axios";
import type { ApiResponse, Task, User } from "../types";
import axios from "axios";

const api: AxiosInstance = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers!["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

export const register = async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}): Promise<ApiResponse<null>> => {
    const response = await api.post("/register", data);
    return response.data;
};

export const login = async (data: {
    email: string;
    password: string;
}): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await api.post("/login", data);
    if (response.data.status === "success") {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
};

export const logout = async (): Promise<ApiResponse<null>> => {
    const response = await api.post("/logout");
    localStorage.removeItem("token");
    return response.data;
};

export const getUsers = async (): Promise<ApiResponse<{ users: User[] }>> => {
    const response = await api.get("/users");
    return response.data;
};

export const getTasks = async (): Promise<ApiResponse<{ tasks: Task[] }>> => {
    const response = await api.get("/tasks");
    return response.data;
};

export const createTask = async (data: {
    title: string;
    description?: string;
    due_date?: string;
    assignee_email?: string;
    priority: "low" | "medium" | "high";
}): Promise<ApiResponse<{ task: Task }>> => {
    const response = await api.post("/tasks", data);
    return response.data;
};

export const updateTask = async (
    id: number,
    data: Partial<{
        title: string;
        description: string;
        due_date: string;
        priority: "low" | "medium" | "high";
    }>
): Promise<ApiResponse<{ task: Task }>> => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
};

export const assignTask = async (
    id: number,
    assignee_email: string
): Promise<ApiResponse<{ task: Task }>> => {
    const response = await api.post(`/tasks/${id}/assign`, {
        assignee_email: assignee_email,
    });
    return response.data;
};

export const toggleTaskCompletion = async (
    id: number
): Promise<ApiResponse<{ task: Task }>> => {
    const response = await api.patch(`/tasks/${id}/complete`);
    return response.data;
};

export const deleteTask = async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
};
