import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/api";
import type { ApiResponse } from "../types";
import AuthLayout from "../auth/components/AuthLayout";
import Button from "../common/components/Button";
import FormInput from "../common/components/FormInput";

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
        <AuthLayout title="Register" error={error}>
            <form onSubmit={handleSubmit}>
                <FormInput
                    label="Name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={fieldErrors.name?.[0]}
                    required
                />
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
                <FormInput
                    label="Confirm Password"
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    error={fieldErrors.password_confirmation?.[0]}
                    required
                />
                <Button
                    type="submit"
                    isLoading={mutation.isPending}
                    className="w-full"
                >
                    Register
                </Button>
            </form>
            <p className="mt-4 text-center">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-500 hover:underline">
                    Login
                </Link>
            </p>
        </AuthLayout>
    );
};

export default RegisterPage;
