import React from 'react';
import type { TaskStatus, SortOrder } from "../../types";

interface TaskFilterProps {
    statusFilter: TaskStatus;
    priorityFilter: string;
    sortOrder: SortOrder;
    onStatusChange: (status: TaskStatus) => void;
    onPriorityChange: (priority: string) => void;
    onSortChange: (sort: SortOrder) => void;
}

const TaskFilter: React.FC<TaskFilterProps> = ({
    statusFilter,
    priorityFilter,
    sortOrder,
    onStatusChange,
    onPriorityChange,
    onSortChange,
}) => {
    return (
        <div className="bg-white p-4 sm:p-6 rounded shadow-md mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Status
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            onStatusChange(e.target.value as TaskStatus)
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
                        onChange={(e) => onPriorityChange(e.target.value)}
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
                            onSortChange(e.target.value as SortOrder)
                        }
                        className="w-full p-2 border rounded"
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default TaskFilter;
