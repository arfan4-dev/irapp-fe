import { useEffect, useState, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import api from "@/api/api";
import { Loader2 } from "lucide-react"; // or any spinner icon you prefer

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.get("/refresh-token", { withCredentials: true }); // or your auth check endpoint
                setIsAuthenticated(true);
            } catch (error) {
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
                <div className="flex flex-col items-center text-center text-gray-600 dark:text-gray-300">
                    <Loader2 className="animate-spin w-8 h-8 mb-2" />
                    <p>Checking authentication...</p>
                </div>
            </div>
        );
    }

    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
