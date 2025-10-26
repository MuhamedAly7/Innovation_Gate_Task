interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const FormInput: React.FC<FormInputProps> = ({
    label,
    error,
    className,
    ...props
}) => {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
                className={`w-full p-2 border rounded ${
                    error ? "border-red-500" : ""
                } ${className}`}
                {...props}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

export default FormInput;
