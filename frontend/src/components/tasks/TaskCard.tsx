import { format, parseISO } from "date-fns";
import type { Task, TaskStatus, User } from "../../types";

interface TaskCardProps {
    task: Task;
    status: TaskStatus;
    authenticatedUser: User;
    onAssign: (task: Task) => void;
    onToggle: (id: number) => void;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
    canModifyTask: (task: Task) => boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
    task,
    status,
    authenticatedUser,
    onAssign,
    onToggle,
    onEdit,
    onDelete,
    canModifyTask,
}) => {
    const statusColors: Record<TaskStatus, string> = {
        done: "bg-green-100 text-green-800",
        missed: "bg-red-100 text-red-800",
        today: "bg-yellow-100 text-yellow-800",
        upcoming: "bg-blue-100 text-blue-800",
        all: "", // Default case, though it shouldn't be used
    };

    const statusDisplay: Record<TaskStatus, string> = {
        done: "Completed",
        missed: "Late",
        today: "Due Today",
        upcoming: "Upcoming",
        all: "All",
    };

    return (
        <div className="border-b p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold">{task.title}</h3>
                    {status !== "all" && (
                        <span
                            className={`px-2 py-0.5 text-xs rounded-full ${statusColors[status]}`}
                        >
                            {statusDisplay[status]}
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap gap-4">
                    <p className="text-sm text-gray-600">
                        Priority:{" "}
                        <span className="font-medium">{task.priority}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                        Due:{" "}
                        <span className="font-medium">
                            {task.due_date
                                ? format(
                                      parseISO(task.due_date),
                                      "MMM dd, yyyy"
                                  )
                                : "No date set"}
                        </span>
                    </p>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                {task.creator_id === authenticatedUser.id && (
                    <button
                        onClick={() => onAssign(task)}
                        className="bg-purple-500 text-white px-3 py-1.5 rounded text-sm hover:bg-purple-600 transition-colors"
                    >
                        Assign
                    </button>
                )}
                {canModifyTask(task) && (
                    <>
                        <button
                            onClick={() => onToggle(task.id)}
                            className={`px-3 py-1.5 rounded text-sm transition-colors ${
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
                            onClick={() => onEdit(task)}
                            className="bg-blue-500 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(task)}
                            className="bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600 transition-colors"
                        >
                            Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default TaskCard;
