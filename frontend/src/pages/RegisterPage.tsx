import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { register } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import type { ApiResponse } from "../types";

const RegisterPage: React.FC = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>(
        {}
    );
    const navigate = useNavigate();

    const mutation = useMutation<
        ApiResponse<null>,
        any,
        {
            name: string;
            email: string;
            password: string;
            password_confirmation: string;
        }
    >({
        mutationFn: register,
        onSuccess: (data) => {
            if (data.status === "success") {
                navigate("/login");
            }
        },
        onError: (error: any) => {
            // Handle axios error response
            if (error.response?.data) {
                const responseData = error.response.data;
                setError(responseData.message || "Registration failed");
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
        setFieldErrors({});
        mutation.mutate({
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6">
            <div className="bg-white p-6 sm:p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">
                    Register
                </h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full p-2 border rounded ${
                                fieldErrors.name ? "border-red-500" : ""
                            }`}
                            required
                        />
                        {fieldErrors.name && (
                            <p className="text-red-500 text-sm mt-1">
                                {fieldErrors.name[0]}
                            </p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full p-2 border rounded ${
                                fieldErrors.email ? "border-red-500" : ""
                            }`}
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
                            className={`w-full p-2 border rounded ${
                                fieldErrors.password ? "border-red-500" : ""
                            }`}
                            required
                        />
                        {fieldErrors.password && (
                            <p className="text-red-500 text-sm mt-1">
                                {fieldErrors.password[0]}
                            </p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) =>
                                setPasswordConfirmation(e.target.value)
                            }
                            className={`w-full p-2 border rounded ${
                                fieldErrors.password_confirmation
                                    ? "border-red-500"
                                    : ""
                            }`}
                            required
                        />
                        {fieldErrors.password_confirmation && (
                            <p className="text-red-500 text-sm mt-1">
                                {fieldErrors.password_confirmation[0]}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? "Registering..." : "Register"}
                    </button>
                </form>
                <p className="mt-4 text-center">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-500 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
