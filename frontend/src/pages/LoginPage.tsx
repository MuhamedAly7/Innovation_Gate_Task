import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import type { ApiResponse, User } from "../types";
import { useQueryClient } from "@tanstack/react-query";
import AuthLayout from "../auth/components/AuthLayout";
import Button from "../common/components/Button";
import FormInput from "../common/components/FormInput";

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
        <AuthLayout title="Login" error={error}>
            <form onSubmit={handleSubmit}>
                <FormInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={fieldErrors.email?.[0]}
                    required
                />
                <FormInput
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={fieldErrors.password?.[0]}
                    required
                />
                <Button
                    type="submit"
                    isLoading={mutation.isPending}
                    className="w-full"
                >
                    Login
                </Button>
            </form>
            <p className="mt-4 text-center">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-500 hover:underline">
                    Register
                </Link>
            </p>
        </AuthLayout>
    );
};

export default LoginPage;
