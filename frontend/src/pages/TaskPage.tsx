import { useState } from "react";
import { isBefore, isToday, parseISO } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getTasks,
    updateTask,
    assignTask,
    toggleTaskCompletion,
    deleteTask,
    getUsers,
    logout,
} from "../services/api";
import type { Task, User } from "../types";
import { Navigate, useNavigate } from "react-router-dom";
import EditTaskModal from "../components/tasks/EditTaskModal";
import AssignTaskModal from "../components/tasks/AssignTaskModal";
import DeleteConfirmationModal from "../components/tasks/DeleteConfirmationModal";
import TaskFilter from "../components/tasks/TaskFilter";
import TaskCard from "../components/tasks/TaskCard";
import TaskHeader from "../components/tasks/TaskHeader";

type TaskStatus = "all" | "done" | "missed" | "today" | "upcoming";
type SortOrder = "asc" | "desc";

const TasksPage: React.FC = () => {
    const [, setError] = useState<string>("");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTaskForAssign, setSelectedTaskForAssign] =
        useState<Task | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<TaskStatus>("all");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: tasksData, error: tasksError } = useQuery<{
        data: { tasks: Task[] };
    }>({
        queryKey: ["tasks"],
        queryFn: getTasks,
        // Only fetch if we have a token
        enabled: !!localStorage.getItem("token"),
        // Retry failed requests
        retry: 1,
    });
    const { data: usersData } = useQuery<{ data: { users: User[] } }>({
        queryKey: ["users"],
        queryFn: getUsers,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            updateTask(id, data),
        onSuccess: (data) => {
            if (data.status === "success") {
                queryClient.invalidateQueries({ queryKey: ["tasks"] });
            } else {
                setError(data.message);
            }
        },
    });

    const assignMutation = useMutation({
        mutationFn: ({ id, email }: { id: number; email: string }) =>
            assignTask(id, email),
        onSuccess: (data) => {
            if (data.status === "success") {
                queryClient.invalidateQueries({ queryKey: ["tasks"] });
            }
        },
    });

    const toggleMutation = useMutation({
        mutationFn: toggleTaskCompletion,
        onSuccess: (data) => {
            if (data.status === "success") {
                queryClient.invalidateQueries({ queryKey: ["tasks"] });
            } else {
                setError(data.message);
            }
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTask,
        onSuccess: (data) => {
            if (data.status === "success") {
                queryClient.invalidateQueries({ queryKey: ["tasks"] });
            } else {
                setError(data.message);
            }
        },
    });

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const handleEdit = (task: Task) => {
        setSelectedTask(task);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (
        id: number,
        data: { title: string; priority: string }
    ) => {
        updateMutation.mutate({ id, data });
    };

    const handleAssign = (task: Task) => {
        setSelectedTaskForAssign(task);
        setIsAssignModalOpen(true);
    };

    const handleAssignSubmit = (id: number, email: string) => {
        assignMutation.mutate({ id, email });
    };

    const handleDelete = (task: Task) => {
        setTaskToDelete(task);
    };

    const handleDeleteConfirm = () => {
        if (taskToDelete) {
            deleteMutation.mutate(taskToDelete.id);
            setTaskToDelete(null);
        }
    };

    // Get the authenticated user from localStorage
    const authenticatedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
    ) as User;

    const getTaskStatus = (task: Task): TaskStatus => {
        if (task.is_completed) return "done";
        if (!task.due_date) return "upcoming";

        const dueDate = parseISO(task.due_date);
        if (isBefore(dueDate, new Date()) && !isToday(dueDate)) return "missed";
        if (isToday(dueDate)) return "today";
        return "upcoming";
    };

    const filteredAndSortedTasks = tasksData?.data.tasks
        .filter((task) => task.assignee_id === authenticatedUser.id) // Only assigned tasks
        .filter((task) => {
            if (statusFilter === "all") return true;
            return getTaskStatus(task) === statusFilter;
        })
        .filter((task) => {
            if (priorityFilter === "all") return true;
            return task.priority === priorityFilter;
        })
        .sort((a, b) => {
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            const dateA = parseISO(a.due_date);
            const dateB = parseISO(b.due_date);
            return sortOrder === "asc"
                ? dateA.getTime() - dateB.getTime()
                : dateB.getTime() - dateA.getTime();
        });

    const canModifyTask = (task: Task) => {
        return (
            task.assignee_id === authenticatedUser.id ||
            task.creator_id === authenticatedUser.id
        );
    };

    if (tasksError) {
        // return (
        //     <div className="text-red-500">
        //         Error loading tasks: {tasksError.message}
        //     </div>

        // );
        localStorage.removeItem("token");
        <Navigate to={"/login"} />;
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <TaskHeader
                userName={authenticatedUser.name}
                onCreateTask={() => navigate("/tasks/create")}
                onLogout={handleLogout}
            />

            <TaskFilter
                statusFilter={statusFilter}
                priorityFilter={priorityFilter}
                sortOrder={sortOrder}
                onStatusChange={setStatusFilter}
                onPriorityChange={setPriorityFilter}
                onSortChange={setSortOrder}
            />

            <div className="bg-white p-4 sm:p-6 rounded shadow-md">
                {filteredAndSortedTasks?.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        status={getTaskStatus(task)}
                        authenticatedUser={authenticatedUser}
                        onAssign={handleAssign}
                        onToggle={(id) => toggleMutation.mutate(id)}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        canModifyTask={canModifyTask}
                    />
                ))}
                {filteredAndSortedTasks?.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                        No tasks found matching your filters.
                    </p>
                )}
            </div>

            {/* Edit Modal */}
            {selectedTask && (
                <EditTaskModal
                    task={selectedTask}
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedTask(null);
                    }}
                    onSubmit={handleEditSubmit}
                />
            )}

            {/* Assign Modal */}
            {selectedTaskForAssign && (
                <AssignTaskModal
                    task={selectedTaskForAssign}
                    users={usersData?.data.users}
                    isOpen={isAssignModalOpen}
                    onClose={() => {
                        setIsAssignModalOpen(false);
                        setSelectedTaskForAssign(null);
                    }}
                    onSubmit={handleAssignSubmit}
                />
            )}

            {/* Delete Confirmation Modal */}
            {taskToDelete && (
                <DeleteConfirmationModal
                    isOpen={!!taskToDelete}
                    onClose={() => setTaskToDelete(null)}
                    onConfirm={handleDeleteConfirm}
                    taskTitle={taskToDelete.title}
                />
            )}
        </div>
    );
};

export default TasksPage;
