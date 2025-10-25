import { useState } from "react";
import type { Task, User } from "../../types";

interface AssignTaskModalProps {
    task: Task;
    users?: User[];
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (id: number, email: string) => void;
}

const AssignTaskModal: React.FC<AssignTaskModalProps> = ({
    task,
    users,
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [assigneeEmail, setAssigneeEmail] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(task.id, assigneeEmail);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Assign Task</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                            Assignee
                        </label>
                        <select
                            value={assigneeEmail}
                            onChange={(e) => setAssigneeEmail(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        >
                            <option value="">Select Assignee</option>
                            {users?.map((user) => (
                                <option key={user.id} value={user.email}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Assign
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignTaskModal;
