interface TaskHeaderProps {
    userName: string;
    onCreateTask: () => void;
    onLogout: () => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({
    userName,
    onCreateTask,
    onLogout,
}) => {
    return (
        <>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-blue-800">
                    Welcome back,{" "}
                    <span className="font-semibold">{userName}</span>! Here are
                    your tasks.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold">My Tasks</h1>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={onCreateTask}
                        className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 text-sm sm:text-base"
                    >
                        Create Task
                    </button>
                    <button
                        onClick={onLogout}
                        className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm sm:text-base"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default TaskHeader;
