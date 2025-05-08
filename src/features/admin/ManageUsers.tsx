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
import { Input } from "@/components/ui/input";
import AddUserModal from "@/components/modal/AddUserModal";


export default function ManageUsers() {
    const dispatch = useDispatch<AppDispatch>();
    const modalRef = useRef<HTMLDivElement>(null);
    const {users,loading} = useSelector((state: RootState) => state?.user || []);
    const [changes, setChanges] = useState<Record<string, { role: string; department: string }>>({});
    const { theme, setTheme } = useThemeMode(); // now you have access to theme and toggle
    const [showSettings, setShowSettings] = useState(false);
    const location = useLocation()
      const { departments } = useSelector((state: RootState) => state?.departments || []);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;
    const user = useSelector((state: RootState) => state?.user?.currentUser?.data);
    const [serviceName] = useState("Manage Users");
    const [searchName, setSearchName] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

    console.log("user:", user)
    const filteredUsers = users?.filter((user: any) => {
        const nameMatch = user.username.toLowerCase().includes(searchName.toLowerCase());
        const emailMatch = user.email.toLowerCase().includes(searchEmail.toLowerCase());
        return nameMatch && emailMatch;
    });
 
    const sortedFilteredUsers = [...filteredUsers].sort((a:any, b:any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

const [addUserModal,setAddUserModal]=useState(false)


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

        setUpdatingUserId(userId); // 🔥 start loader for this user

        dispatch(updateUserRoleAndDepartment({ userId, ...change }))
            .unwrap()
            .then(() => {
                toast.success("User updated.");
            })
            .catch(() => {
                toast.error("Failed to update user.");
            })
            .finally(() => {
                setUpdatingUserId(null); // ✅ reset after done
            });
    };



    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);


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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchName, searchEmail]);

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
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold mb-6">Manage Users</h2>
                    <Button className="cursor-pointer hover:opacity-75" onClick={() => setAddUserModal(true)}>Add User</Button>
                </div>
              
                <div className="flex flex-wrap gap-4 mb-4">
                    <Input
                        type="text"
                        placeholder="Search by Name"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-48"
                    />
                    <Input
                        type="text"
                        placeholder="Search by Email"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        className=" w-48"
                    />
                     

                    {/* ✅ Clear Filter Button */}
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearchName('');
                            setSearchEmail('');
                        }}
                        className="w-32"
                    >
                        Clear Filters
                    </Button>
                </div>

                {
                    loading ? (
                        <UserManageSkeleton />
                    ) : users && users.length > 0 ? (
                        filteredUsers.length > 0 ? (
                                sortedFilteredUsers
                                    .slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage)
                                    .map((user: any) => (

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
                                                    <SelectContent>
                                                        <SelectItem value="user">User</SelectItem>
                                                        <SelectItem value="staff">Staff</SelectItem>
                                                        {/* <SelectItem value="admin">Admin</SelectItem> */}
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
                                                            <SelectItem key={dep._id} value={dep.name}>
                                                                {dep.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            onClick={() => handleSave(user._id)}
                                            
                                            className={`cursor-pointer hover:opacity-75 mt-2 text-white dark:text-zinc-900`}
                                        >
                                                    {updatingUserId === user._id ? "Updating..." : "Save Changes"}


                                        </Button>
                                    </CardContent>
                                    
                                </Card>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 dark:text-gray-400 italic mt-6">
                                No users found matching the current filters.
                            </div>
                        )
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400 italic mt-6">
                            No users found to display.
                        </div>
                    )
                }

                {filteredUsers.length > usersPerPage && (
                    <div className="flex justify-center mt-6 gap-4 items-center">
                        <Button
                            variant="outline"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        >
                            Previous
                        </Button>
                        <span className="text-sm">
                            Page {currentPage} of {Math.ceil(filteredUsers.length / usersPerPage)}
                        </span>
                        <Button
                            variant="outline"
                            disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage)}
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.min(prev + 1, Math.ceil(filteredUsers.length / usersPerPage))
                                )
                            }
                        >
                            Next
                        </Button>
                    </div>
                )}

                
            </div>



            {showSettings && (
                <UserSetting user={user} modalRef={modalRef} setShowSettings={setShowSettings} userName={user?.username} setUserName={""} />
            )}

            {addUserModal && <AddUserModal
                open={addUserModal}
                onClose={() => setAddUserModal(false)}
                
            />}

        </div>
    );
}
