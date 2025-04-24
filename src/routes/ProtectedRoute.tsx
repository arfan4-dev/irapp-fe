import { useEffect, useState, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const user = useSelector((state: RootState) => state?.user?.currentUser?.data);
    const location = useLocation();
    // console.log("ProtectedRoute.....", user.id);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // await api.get("/refresh-token", { withCredentials: true });
                if (user.id) {
                    setIsAuthenticated(true);
                }
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

    // ✅ If user is NOT authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // ✅ Redirect '/' based on role
    if (isAuthenticated && location.pathname === "/") {
        if (user?.role === "admin") return <Navigate to="/admin-panel" replace />;
        if (user?.role === "user") return <Navigate to="/service-request" replace />;
    }

    // ❌ Prevent admin from accessing user dashboard
    if (user?.role === "admin" && (location.pathname.startsWith("/service-request") || location.pathname.startsWith("/order-status"))) {
        return <Navigate to="/admin-panel" replace />;
    }

    // ❌ Prevent user from accessing admin dashboard or answered order
    if (
        user?.role === "user" &&
        (location.pathname.startsWith("/admin-panel") || location.pathname.startsWith("/answered-order") || location.pathname.startsWith("/manage-users"))
    ) {
        return <Navigate to="/service-request" replace />;
    }


    // ✅ Authenticated and authorized
    return <>{children}</>;
};

export default ProtectedRoute;
