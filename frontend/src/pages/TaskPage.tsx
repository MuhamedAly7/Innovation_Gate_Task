import { useState } from "react";
import { format, isBefore, isToday, parseISO } from "date-fns";
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
import { useNavigate } from "react-router-dom";
import EditTaskModal from "../components/tasks/EditTaskModal";
import AssignTaskModal from "../components/tasks/AssignTaskModal";
import DeleteConfirmationModal from "../components/tasks/DeleteConfirmationModal";

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

    const {
        data: tasksData,
        error: tasksError,
    } = useQuery<{ data: { tasks: Task[] } }>({
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
        return (
            <div className="text-red-500">
                Error loading tasks: {tasksError.message}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold">My Tasks</h1>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => navigate("/tasks/create")}
                        className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 text-sm sm:text-base"
                    >
                        Create Task
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm sm:text-base"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 sm:p-6 rounded shadow-md mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value as TaskStatus)
                            }
                            className="w-full p-2 border rounded"
                        >
                            <option value="all">All Status</option>
                            <option value="done">Done</option>
                            <option value="missed">Missed/Late</option>
                            <option value="today">Due Today</option>
                            <option value="upcoming">Upcoming</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Priority
                        </label>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="all">All Priorities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Sort by Due Date
                        </label>
                        <select
                            value={sortOrder}
                            onChange={(e) =>
                                setSortOrder(e.target.value as SortOrder)
                            }
                            className="w-full p-2 border rounded"
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tasks List */}
            <div className="bg-white p-4 sm:p-6 rounded shadow-md">
                {filteredAndSortedTasks?.map((task) => (
                    <div
                        key={task.id}
                        className="border-b p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold">{task.title}</h3>
                                <span
                                    className={`px-2 py-0.5 text-xs rounded-full ${
                                        getTaskStatus(task) === "done"
                                            ? "bg-green-100 text-green-800"
                                            : getTaskStatus(task) === "missed"
                                            ? "bg-red-100 text-red-800"
                                            : getTaskStatus(task) === "today"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-blue-100 text-blue-800"
                                    }`}
                                >
                                    {getTaskStatus(task)
                                        .charAt(0)
                                        .toUpperCase() +
                                        getTaskStatus(task).slice(1)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">
                                Priority: {task.priority}
                            </p>
                            <p className="text-sm text-gray-600">
                                Due:{" "}
                                {task.due_date
                                    ? format(
                                          parseISO(task.due_date),
                                          "MMM dd, yyyy"
                                      )
                                    : "No date set"}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {/* Show Assign button only if user is creator */}
                            {task.creator_id === authenticatedUser.id && (
                                <button
                                    onClick={() => handleAssign(task)}
                                    className="bg-purple-500 text-white px-2 py-1 rounded text-sm hover:bg-purple-600"
                                >
                                    Assign
                                </button>
                            )}

                            {/* Show other buttons if user can modify */}
                            {canModifyTask(task) && (
                                <>
                                    <button
                                        onClick={() =>
                                            toggleMutation.mutate(task.id)
                                        }
                                        className={`px-2 py-1 rounded text-sm ${
                                            task.is_completed
                                                ? "bg-yellow-500 hover:bg-yellow-600"
                                                : "bg-green-500 hover:bg-green-600"
                                        } text-white`}
                                    >
                                        {task.is_completed
                                            ? "Mark Pending"
                                            : "Mark Complete"}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(task)}
                                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(task)}
                                        className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
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
