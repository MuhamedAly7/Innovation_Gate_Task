interface FormFieldProps {
    label: string;
    error?: string;
    children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, error, children }) => {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium mb-1">{label}</label>
            {children}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

export default FormField;
