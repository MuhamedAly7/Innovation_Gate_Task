interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "success";
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    isLoading,
    className,
    ...props
}) => {
    const baseStyles =
        "px-4 py-2 rounded transition-colors text-white disabled:opacity-50";
    const variantStyles = {
        primary: "bg-blue-500 hover:bg-blue-600",
        secondary: "bg-gray-500 hover:bg-gray-600",
        danger: "bg-red-500 hover:bg-red-600",
        success: "bg-green-500 hover:bg-green-600",
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? "Loading..." : children}
        </button>
    );
};

export default Button;
