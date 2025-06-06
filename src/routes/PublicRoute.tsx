import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "@/store";


const PublicRoute = ({ children }:any) => {
    const user = useSelector((state: RootState) => state.user?.currentUser?.data);

    if (user?.role === "admin") return <Navigate to="/admin-panel" replace />;
    if (user?.role === "staff") return <Navigate to="/staff-panel" replace />;
    if (user?.role === "user") return <Navigate to="/service-request" replace />;

    return children;
};

export default PublicRoute;
