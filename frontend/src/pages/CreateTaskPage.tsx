import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, getUsers } from "../services/api";
import type { User } from "../types";
import { useNavigate } from "react-router-dom";
import FormField from "../common/components/FormField";
import FormInput from "../common/components/FormInput";

const CreateTaskPage: React.FC = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high">(
        "medium"
    );
    const [assigneeEmail, setAssigneeEmail] = useState("");
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>(
        {}
    );
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: usersData } = useQuery<{ data: { users: User[] } }>({
        queryKey: ["users"],
        queryFn: getUsers,
    });

    const createMutation = useMutation({
        mutationFn: createTask,
        onSuccess: (data) => {
            if (data.status === "success") {
                queryClient.invalidateQueries({ queryKey: ["tasks"] });
                navigate("/tasks");
            }
        },
        onError: (error: any) => {
            // Handle axios error response
            if (error.response?.data) {
                const responseData = error.response.data;
                setError(responseData.message || "Task creation failed");
                if (responseData.data) {
                    setFieldErrors(responseData.data);
                }
            } else {
                setError("An error occurred");
            }
        },
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setFieldErrors({});
        createMutation.mutate({
            title,
            description,
            due_date: dueDate,
            assignee_email: assigneeEmail,
            priority,
        });
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold">
                    Create New Task
                </h1>
                <button
                    onClick={() => navigate("/tasks")}
                    className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 text-sm sm:text-base"
                >
                    Back to Tasks
                </button>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded shadow-md mb-6">
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            error={fieldErrors.title?.[0]}
                            required
                        />
                        <FormInput
                            label="Due Date"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            error={fieldErrors.due_date?.[0]}
                        />
                    </div>

                    <FormField
                        label="Description"
                        error={fieldErrors.description?.[0]}
                    >
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`w-full p-2 border rounded ${
                                fieldErrors.description ? "border-red-500" : ""
                            }`}
                        />
                    </FormField>

                    <FormField
                        label="Priority"
                        error={fieldErrors.priority?.[0]}
                    >
                        <select
                            value={priority}
                            onChange={(e) =>
                                setPriority(
                                    e.target.value as "low" | "medium" | "high"
                                )
                            }
                            className={`w-full p-2 border rounded ${
                                fieldErrors.priority ? "border-red-500" : ""
                            }`}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </FormField>

                    <FormField
                        label="Assignee"
                        error={fieldErrors.assignee_email?.[0]}
                    >
                        <select
                            value={assigneeEmail}
                            onChange={(e) => setAssigneeEmail(e.target.value)}
                            className={`w-full p-2 border rounded ${
                                fieldErrors.assignee_email
                                    ? "border-red-500"
                                    : ""
                            }`}
                            required
                        >
                            <option value="">Select Assignee</option>
                            {usersData?.data.users.map((user) => (
                                <option key={user.id} value={user.email}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                    </FormField>

                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending
                            ? "Creating..."
                            : "Create Task"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskPage;
