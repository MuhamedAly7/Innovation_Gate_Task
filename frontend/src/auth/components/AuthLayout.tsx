interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    error?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, error }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6">
            <div className="bg-white p-6 sm:p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">
                    {title}
                </h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
