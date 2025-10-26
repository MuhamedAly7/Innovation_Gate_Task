import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import type { ApiResponse, User } from "../types";
import { useQueryClient } from "@tanstack/react-query";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>(
        {}
    );
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ApiResponse<{ token: string; user: User }>,
        Error,
        { email: string; password: string }
    >({
        mutationFn: login,
        onSuccess: (data) => {
            if (data.status === "success") {
                // Invalidate queries to refetch data after login
                queryClient.invalidateQueries({ queryKey: ["tasks"] });
                queryClient.invalidateQueries({ queryKey: ["users"] });
                navigate("/tasks");
            } else {
                setError(data.message);
            }
        },
        onError: (error: any) => {
            // Handle axios error response
            if (error.response?.data) {
                const responseData = error.response.data;
                setError(responseData.message || "Login failed");
                if (responseData.data) {
                    setFieldErrors(responseData.data);
                }
            } else {
                setError("An error occurred");
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        mutation.mutate({ email, password });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6">
            <div className="bg-white p-6 sm:p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">
                    Login
                </h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                        {fieldErrors.email && (
                            <p className="text-red-500 text-sm mt-1">
                                {fieldErrors.email[0]}
                            </p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                        {fieldErrors.password && (
                            <p className="text-red-500 text-sm mt-1">
                                {fieldErrors.password[0]}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? "Logging in..." : "Login"}
                    </button>
                </form>
                <p className="mt-4 text-center">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-blue-500 hover:underline"
                    >
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
