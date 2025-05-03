// ✅ Enhanced Department Management Page with UX Improvements
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
    createDepartment,
    deleteDepartment,
    fetchDepartments,
    updateDepartment,
} from "@/store/features/department/department";
import {
    Button,
} from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Header from "@/common/Header";
import { useLocation } from "react-router-dom";
import useThemeMode from "@/hooks/useTheme";
import ActionFeedbackModal from "@/components/modal/ActionFeedbackModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import UserSetting from "@/common/UserSetting";

export default function DepartmentManagementPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { theme, setTheme } = useThemeMode();
    const [editLoading, setEditLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);


    const [serviceName] = useState("IntraServe Admin Panel");
    const [feedbackModal, setFeedbackModal] = useState<{
        open: boolean;
        type: "delete" | "add" | "update";
        title: string;
        message: string;
        onConfirm?: () => void;
    }>({
        open: false,
        type: "delete",
        title: "",
        message: "",
    });

    const { departments, loading } = useSelector((state: RootState) => state.departments);
    const { config } = useSelector((state: RootState) => state.siteConfig);
    const location = useLocation();
    const [showAdminSettings, setShowAdminSettings] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const user = useSelector((state: RootState) => state?.user?.currentUser?.data);
    const [search, setSearch] = useState("");
    const [editDept, setEditDept] = useState<{ id: string; name: string } | null>(null);

    const [newDeptModalOpen, setNewDeptModalOpen] = useState(false);
    const [newDeptInput, setNewDeptInput] = useState("");

    useEffect(() => {
        dispatch(fetchDepartments());
    }, [dispatch]);

    const handleCreate = () => {
        const trimmed = newDeptInput.trim();
        const regex = /^[a-zA-Z /]+$/;
        if (!regex.test(trimmed)) return toast.error("Only letters, spaces, and '/' allowed.");

        if (!trimmed) return toast.error("Department name is required.");

        const alreadyExists = departments.some((d) => d.name.toLowerCase() === trimmed.toLowerCase());
        if (alreadyExists) return toast.error("This department already exists.");

        dispatch(createDepartment({ name: trimmed }))
            .unwrap()
            .then(() => {
                setNewDeptInput("");
                setNewDeptModalOpen(false);
                toast.success("Department created successfully");
            });
    };

    const handleUpdate = () => {
        if (!editDept?.name.trim()) return toast.error("Updated name required.");
        const regex = /^[a-zA-Z /]+$/;
        if (!regex.test(editDept.name.trim())) return toast.error("Only letters, spaces, and '/' allowed.");


        setEditLoading(true);
        dispatch(updateDepartment({ id: editDept.id, name: editDept.name.trim() }))
            .unwrap()
            .then(() => {
                setEditDept(null);
                toast.success("Department updated successfully");
            })
            .catch(() => {
                toast.error("Update failed");
            })
            .finally(() => {
                setEditLoading(false);
            });
    };


    const filtered = departments
        .filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    useEffect(() => {
        if (editDept && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editDept]);

    console.log(showSettings)
    return (
        <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}>
            <Header
                location={location.pathname}
                theme={theme}
                serviceName={config.brandName || serviceName}
                setTheme={setTheme}
                setShowSettings={setShowAdminSettings}
                showSettings={showAdminSettings}
            />

            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Department Management</h2>
                    <Dialog open={newDeptModalOpen} onOpenChange={setNewDeptModalOpen}>
                        <DialogTrigger asChild>
                            <Button className='cursor-pointer hover:opacity-75'>+ Add Department</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Department</DialogTitle>
                            </DialogHeader>
                            <Input
                                placeholder="Enter department name"
                                value={newDeptInput}
                                onChange={(e) => setNewDeptInput(e.target.value)}
                            />
                            <Button className="mt-4 w-full cursor-pointer" onClick={handleCreate} disabled={loading}>
                                {loading ? 'Saving...' : 'Create'}
                            </Button>
                        </DialogContent>
                    </Dialog>
                </div>

                <Input
                    placeholder="Search department"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mb-4"
                />

                <p className="text-sm text-muted-foreground mb-2">
                    Showing {filtered.length} of {departments.length} departments
                </p>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center italic text-gray-500">
                                    {search ? "No matching departments found." : "No departments created yet."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((dept) => (
                                <TableRow key={dept._id} className={editDept?.id === dept._id ? "bg-yellow-50 dark:bg-zinc-800/40" : ""}>
                                    <TableCell>
                                        {editDept?.id === dept._id ? (
                                            <div className="flex items-center">
                                                <Input
                                                    ref={inputRef}
                                                    className="h-9"
                                                    value={editDept.name}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (/^[a-zA-Z /]*$/.test(value)) {
                                                            setEditDept((prev) => ({ ...prev!, name: value }));
                                                        }
                                                    }}
                                                />

                                            </div>
                                        ) : (
                                            dept.name
                                        )}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        {editDept?.id === dept._id ? (
                                            <div className="space-x-2">
                                                <Button className="cursor-pointer" size="sm" onClick={handleUpdate} disabled={editLoading || loading}>
                                                    {editLoading ? "Saving..." : "Save"}
                                                </Button>
                                                <Button size="sm" className="cursor-pointer" variant="outline" onClick={() => setEditDept(null)}>Cancel</Button>
                                            </div>
                                        ) : (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="cursor-pointer"><MoreVertical /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setEditDept({ id: dept._id, name: dept.name })}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setFeedbackModal({
                                                            open: true,
                                                            type: "delete",
                                                            title: "Delete Department?",
                                                            message: `Are you sure you want to delete \"${dept.name}\"? This action cannot be undone.`,
                                                            onConfirm: () => {
                                                                dispatch(deleteDepartment(dept._id))
                                                                    .unwrap()
                                                                    .then(() => {
                                                                        setFeedbackModal({
                                                                            open: true,
                                                                            type: "delete",
                                                                            title: "Department Deleted",
                                                                            message: `Department \"${dept.name}\" has been successfully removed.`,
                                                                        });
                                                                    })
                                                                    .catch(() => toast.error("Failed to delete department."));
                                                            },
                                                        })}
                                                        className="text-red-600"
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {showSettings && (
                <UserSetting user={user} modalRef={modalRef} setShowSettings={setShowSettings} userName={user?.username} setUserName={''} />
            )}

            
            <ActionFeedbackModal
                open={feedbackModal.open}
                onClose={() => setFeedbackModal((prev) => ({ ...prev, open: false }))}
                type={feedbackModal.type}
                title={feedbackModal.title}
                message={feedbackModal.message}
                onConfirm={feedbackModal.onConfirm}
            />
        </div>
    );
}
