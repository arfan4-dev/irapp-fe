import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { fetchAllUsers, updateUserRoleAndDepartment } from "@/store/features/user/user";
import Header from "@/common/Header";
import useThemeMode from "@/hooks/useTheme";
import UserSetting from "@/common/UserSetting";
import { useLocation } from "react-router-dom";
import { getUserIdFromLocalStorage } from "@/utils/getUserId";
import UserManageSkeleton from "@/components/skeleton/skeleton";

const departments = [
    "Reception",
    "Kitchen",
    "Housekeeping",
    "Maintenance",
    "Security",
    "IT Support",
    "Accounts / Finance",
    "HR (Human Resources)",
    "Front Desk",
    "Customer Service",
    "Logistics",
    "Cleaning Crew",
    "Operations",
    "Managerial Staff",
    "Laundry"
];

export default function ManageUsers() {
    const dispatch = useDispatch<AppDispatch>();
    const modalRef = useRef<HTMLDivElement>(null);
    const {users,loading} = useSelector((state: RootState) => state?.user || []);
    const [changes, setChanges] = useState<Record<string, { role: string; department: string }>>({});
    const { theme, setTheme } = useThemeMode(); // now you have access to theme and toggle
    const [showSettings, setShowSettings] = useState(false);
    const location = useLocation()
    const user = useSelector((state: RootState) => state?.user?.currentUser?.data);
    const [serviceName] = useState("Manage Users");

    console.log(loading)
    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    const handleChange = (userId: string, field: 'role' | 'department', value: string) => {
        setChanges(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [field]: value,
            },
        }));
    };

    const handleSave = (userId: string) => {
        const change = changes[userId];
        if (!change) return;

        dispatch(updateUserRoleAndDepartment({ userId, ...change }))
            .unwrap()
            .then(() => {
                toast.success("User updated!");
                dispatch(fetchAllUsers());
            })
            .catch(() => toast.error("Failed to update user."));
    };

    useEffect(() => {
        getUserIdFromLocalStorage()
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                setShowSettings(false)
            }
        };
        if (showSettings) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showSettings, setShowSettings]);



    return (
        <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}>
            <Header
                theme={theme}
                setTheme={setTheme}
                serviceName={serviceName}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                location={location.pathname}
            />
            <div className="max-w-4xl mx-auto p-4 space-y-4">
                <h2 className="text-2xl font-semibold mb-6">Manage Users</h2>
                
                {
                    loading ? (
                        <UserManageSkeleton />
                    ) : users && users.length > 0 ? (
                        users.map((user: any) => (
                            <Card key={user._id}>
                                <CardContent className="p-4 space-y-3">
                                    <p className="font-semibold">
                                        {user.username}{" "}
                                        <span className="text-sm text-muted-foreground">
                                            ({user.email})
                                        </span>
                                    </p>

                                    <div className="flex gap-4">
                                        <div className="flex flex-col gap-1">
                                            <Label>Role</Label>
                                            <Select
                                                value={changes[user._id]?.role || user.role}
                                                onValueChange={(val) => handleChange(user._id, "role", val)}
                                            >
                                                <SelectTrigger className="w-40">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent >
                                                    <SelectItem value="user">User</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <Label>Department</Label>
                                            <Select
                                                value={changes[user._id]?.department || user.department || "none"}
                                                onValueChange={(val) =>
                                                    handleChange(user._id, "department", val === "none" ? "" : val)
                                                }
                                            >
                                                <SelectTrigger className="w-44 md:w-56">
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">No Department</SelectItem>
                                                    {departments.map((dep) => (
                                                        <SelectItem key={dep} value={dep}>
                                                            {dep}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        onClick={() => handleSave(user._id)}
                                        className="cursor-pointer hover:opacity-75 mt-2 text-white"
                                    >
                                        Save Changes
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400 italic mt-6">
                            No users found to display.
                        </div>
                    )
}

                
            </div>



            {showSettings && (
                <UserSetting user={user} modalRef={modalRef} setShowSettings={setShowSettings} userName={user?.username} setUserName={""} />
            )}
        </div>
    );
}
