// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import { useQuery } from "@tanstack/react-query";
import "./App.css";
import { getUsers } from "./services/api";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { JSX } from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TaskPage from "./pages/TaskPage";
import CreateTaskPage from "./pages/CreateTaskPage";
import NotFoundPage from "./pages/NotFoundPage";

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" />;
};

const AuthRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const token = localStorage.getItem("token");
    return !token ? children : <Navigate to="/tasks" />;
};

function App() {
    useQuery({
        queryKey: ["users"],
        queryFn: getUsers,
        enabled: !!localStorage.getItem("token"),
    });

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={
                        <AuthRoute>
                            <LoginPage />
                        </AuthRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <AuthRoute>
                            <RegisterPage />
                        </AuthRoute>
                    }
                />
                <Route
                    path="/tasks"
                    element={
                        <ProtectedRoute>
                            <TaskPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/tasks/create"
                    element={
                        <ProtectedRoute>
                            <CreateTaskPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/" element={<Navigate to="/tasks" />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
