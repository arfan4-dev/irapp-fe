import { useSelector } from "react-redux";
import { RootState } from "@/store";

const AdminRoute = ({ children }: { children:any}) => {
    const user = useSelector((state: RootState) => state.user.currentUser?.data);

    if (!user || user.role !== "admin") {
        return <div className="text-center text-red-600 font-semibold mt-10">Access Denied: Admins Only</div>;
    }

    return children;
};

export default AdminRoute;
