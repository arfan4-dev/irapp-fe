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

const departments = ['Kitchen', 'Reception', 'Cleaning Staff', 'Security'];

export default function ManageUsers() {
    const dispatch = useDispatch<AppDispatch>();
    const users = useSelector((state: RootState) => state?.user?.users ||[]);
    const [changes, setChanges] = useState<Record<string, { role: string; department: string }>>({});
    const { theme, setTheme } = useThemeMode(); // now you have access to theme and toggle
    const [showSettings, setShowSettings] = useState(false);
    const location = useLocation()
    const [showAdminSettings, setShowAdminSettings] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
    const user = useSelector((state: RootState) => state?.user?.currentUser?.data);
    const [serviceName] = useState("Manage Users");

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
    console.log("users:", users);

    return (
        <div className="">
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

                {users?.map((user: any) => (
                    <Card key={user._id}>
                        <CardContent className="p-4 space-y-3">
                            <p className="font-semibold">{user.username} <span className="text-sm text-muted-foreground">({user.email})</span></p>

                            <div className="flex gap-4">
                                <div className="flex flex-col gap-1">
                                    <Label>Role</Label>
                                    <Select
                                        value={changes[user._id]?.role || user.role}
                                        onValueChange={(val) => handleChange(user._id, 'role', val)}
                                    >
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <Label>Department</Label>
                                    <Select
                                        value={changes[user._id]?.department || user.department || "none"}
                                        onValueChange={(val) => handleChange(user._id, 'department', val === "none" ? "" : val)}
                                    >
                                        <SelectTrigger className="w-56">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Department</SelectItem>
                                            {departments.map(dep => (
                                                <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>


                                </div>
                            </div>

                            <Button size="sm" className="mt-2" onClick={() => handleSave(user._id)}>
                                Save Changes
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
          


             {showAdminSettings && (
                      <UserSetting user={user} modalRef={modalRef} setShowSettings={setShowAdminSettings} userName={user?.username} setUserName={""} />
                    )}
        </div>
    );
}
