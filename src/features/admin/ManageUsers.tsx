import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { deleteUser, fetchAllUsers, updateUserRoleAndDepartment } from "@/store/features/user/user";
import Header from "@/common/Header";
import useThemeMode from "@/hooks/useTheme";
import UserSetting from "@/common/UserSetting";
import { useLocation } from "react-router-dom";
import { getUserIdFromLocalStorage } from "@/utils/getUserId";
import UserManageSkeleton from "@/components/skeleton/skeleton";
import { Input } from "@/components/ui/input";
import AddUserModal from "@/components/modal/AddUserModal";
import api from "@/api/api";
import { useDeptCategoryState } from "@/hooks/useDeptCategoryState";
import ActionFeedbackModal from "@/components/modal/ActionFeedbackModal";
import OtpModal from "@/components/modal/OtpModal";


export default function ManageUsers() {
    const dispatch = useDispatch<AppDispatch>();
    const modalRef = useRef<HTMLDivElement>(null);
    const { users, loading } = useSelector((state: RootState) => state?.user || []);
    const [changes, setChanges] = useState<Record<string, { role: string; department: string }>>({});
    const { theme, setTheme } = useThemeMode(); // now you have access to theme and toggle
    const [showSettings, setShowSettings] = useState(false);
    const location = useLocation()
    const { departments } = useSelector((state: RootState) => state?.departments || []);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;
    const user = useSelector((state: RootState) => state?.user?.currentUser?.data);
    const [serviceName] = useState("Manage Users");
    const [otpModal, setOtpModal] = useState<{ open: boolean, otp: string | null }>({ open: false, otp: null });
    const [loaderDelUser, setLoaderDelUser] = useState(false)
    const [searchName, setSearchName] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const [optLoading, setOptLoading] = useState<string | null>(null);
     const [searchDept, setSearchDept] = useState('');
    const { feedbackModal, setFeedbackModal, }=useDeptCategoryState();
    
    const filteredUsers = users?.filter((user: any) => {
        const nameMatch = user.username.toLowerCase().includes(searchName.toLowerCase());
        const emailMatch = user.email.toLowerCase().includes(searchEmail.toLowerCase());
        const deptMatch =
            searchDept === 'all'
                ? true
                : searchDept === 'none'
                    ? !user.department
                    : (user.department || '').toLowerCase().includes(searchDept.toLowerCase());


        return nameMatch && emailMatch && deptMatch;
    });
      

    const sortedFilteredUsers = [...filteredUsers].sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const [addUserModal, setAddUserModal] = useState(false)


    const handleChange = (userId: string, field: 'role' | 'department', value: string) => {
        setChanges(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [field]: value,
            },
        }));
    };



    const handleGenerateOtp = async (userId: string) => {
        setOptLoading(userId);
        try {
            const res = await api.post(`/generate-otp/${userId}`);
            const otp = res.data.otp;
            setOtpModal({ open: true, otp });
        } catch (err) {
            toast.error("Failed to generate OTP");
        } finally {
            setOptLoading(null);
        }
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

    const handleDeleteUser = (userId: string, username: string) => {
        
        setFeedbackModal({
            open: true,
            type: "delete",
            title: "Delete User?",
            message: `Are you sure you want to delete user "${username}"?. This action cannot be undone.`,
            onConfirm: async () => {
                try {
                    setLoaderDelUser(true)
                    await dispatch(deleteUser(`${userId}`));
                    toast.success("User deleted.");
                    dispatch(fetchAllUsers());
                } catch (err) {
                    toast.error("Failed to delete user.");
                } finally {
                    setFeedbackModal(prev => ({ ...prev, open: false }));
                    setLoaderDelUser(false)
                }
            },
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
                    <Button className="cursor-pointer hover:text-black border border-black transition-all duration-300 hover:bg-transparent dark:hover:text-white dark:hover:border-white" onClick={() => setAddUserModal(true)}>Add User</Button>
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
                    <Select value={searchDept} onValueChange={setSearchDept} >
                        <SelectTrigger><SelectValue placeholder="Filter by Department" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="none">No Department</SelectItem>
                            {departments.map(dep => (
                                <SelectItem key={dep._id} value={dep.name}>{dep.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>



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

                                            <div className="flex items-center gap-4">
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
                                                <div>
                                                    <Button size="sm" variant="outline" className="text-xs mt-4.5 p-[17px] cursor-pointer" disabled={optLoading === user._id} onClick={() => handleGenerateOtp(user._id)}>
                                                        {optLoading === user._id ? 'Generating...' : 'Generate OTP'}
                                                    </Button>
                                                </div>

                                            </div>

                                            <Button
                                                size="sm"
                                                onClick={() => handleSave(user._id)}

                                                className={`cursor-pointer mr-2 mt-2 text-white dark:text-zinc-900 hover:text-black border border-black transition-all duration-300 hover:bg-transparent dark:hover:text-white dark:hover:border-white `}
                                            >
                                                {updatingUserId === user._id ? "Updating..." : "Save Changes"}


                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="mt-2 cursor-pointer "
                                                onClick={() => handleDeleteUser(user._id, user.username)}
                                            >
                                                Delete
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

                {filteredUsers.length > 0 && (
                    <div className="text-sm text-center mt-4 text-muted-foreground">
                        Showing users {((currentPage - 1) * usersPerPage) + 1}
                        –
                        {Math.min(currentPage * usersPerPage, filteredUsers.length)} {``}
                        of {filteredUsers.length}
                    </div>
                )}
                {filteredUsers.length > usersPerPage && (
                    <div className="flex justify-center mt-6 gap-4 items-center">
                        <Button
                        className="cursor-pointer hover:opacity-75"
                            variant="outline"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        >
                            Previous
                        </Button>
                       

                        <Button
                            className="cursor-pointer hover:opacity-75"
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

              <ActionFeedbackModal
                            open={feedbackModal.open}
                            onClose={() => setFeedbackModal((prev) => ({ ...prev, open: false }))}
                            type={feedbackModal.type}
                            title={feedbackModal.title}
                            message={feedbackModal.message}
                            onConfirm={feedbackModal.onConfirm}
                            loaderDelete={loaderDelUser}
                        />
            <OtpModal otpModal={otpModal} setOtpModal={setOtpModal}/>

        </div>
    );
}
