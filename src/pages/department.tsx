import { useEffect, useState } from "react";
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
} from "@/components/ui/table"

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Header from "@/common/Header";
import { useLocation } from "react-router-dom";
import useThemeMode from "@/hooks/useTheme";
import ActionFeedbackModal from "@/components/modal/ActionFeedbackModal";

export default function DepartmentManagementPage({ }: any) {
    const dispatch = useDispatch<AppDispatch>();
    const { theme, setTheme } = useThemeMode(); // now you have access to theme and toggle
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
    const [newDept, setNewDept] = useState("");
    const [search, setSearch] = useState("");
    const [editDept, setEditDept] = useState<{ id: string; name: string } | null>(null);
    const { config } = useSelector((state: RootState) => state.siteConfig);
    const location = useLocation()
    const [showAdminSettings, setShowAdminSettings] = useState(false);
    useEffect(() => {
        dispatch(fetchDepartments());
    }, [dispatch]);

    const handleCreate = () => {
        const trimmed = newDept.trim().toLowerCase();

        if (!trimmed) return toast.error("Department name is required.");

        const alreadyExists = departments.some(
            (d) => d.name.toLowerCase() === trimmed
        );

        if (alreadyExists) {
            return toast.error("This department already exists.");
        }

        dispatch(createDepartment({ name: newDept.trim() }))
            .unwrap()
            .then(() => {
                setNewDept("");
                toast.success("Department created successfully");
            });
    };


    const handleUpdate = () => {
        if (!editDept?.name.trim()) return toast.error("Updated name required.");
        dispatch(updateDepartment({ id: editDept.id, name: editDept.name.trim() }))
            .unwrap()
            .then(() => {
                setEditDept(null);
                toast.success("Department updated successfully");
            });
    };



    const filtered = departments.filter((d: any) =>
        d.name.toLowerCase().includes(search.toLowerCase())
    );
    return (
        <div>
            <Header
                location={location.pathname}
                theme={theme}
                serviceName={config.brandName || serviceName}
                setTheme={setTheme}
                setShowSettings={setShowAdminSettings}
                showSettings={showAdminSettings}
            />
            <div className="max-w-4xl mx-auto py-8 px-4">
                <h2 className="text-2xl font-bold mb-6">Department Management</h2>

                <div className="flex gap-4 mb-6">
                    <Input
                        placeholder="Search department"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Input
                        placeholder="New department"
                        value={newDept}
                        onChange={(e) => setNewDept(e.target.value)}
                    />
                    <Button onClick={handleCreate} disabled={loading}>Add</Button>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((dept) => (
                            <TableRow key={dept._id}>
                                <TableCell>
                                    {editDept?.id === dept._id ? (
                                        <Input
                                            value={editDept.name}
                                            onChange={(e) =>
                                                setEditDept((prev) => ({ ...prev!, name: e.target.value }))
                                            }
                                        />
                                    ) : (
                                        dept.name
                                    )}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    {editDept?.id === dept._id ? (
                                        <>
                                            <Button size="sm" onClick={handleUpdate} disabled={loading}>
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setEditDept(null)}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button size="sm" className="cursor-pointer hover:opacity-90" onClick={() => setEditDept({ id: dept._id, name: dept.name })}>
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="cursor-pointer hover:bg-red-700"
                                                onClick={() => {
                                                    setFeedbackModal({
                                                        open: true,
                                                        type: "delete",
                                                        title: "Delete Department?",
                                                        message: `Are you sure you want to delete "${dept.name}"? This action cannot be undone.`,
                                                        onConfirm: () => {
                                                            dispatch(deleteDepartment(dept._id))
                                                                .unwrap()
                                                                .then(() => {
                                                                    setFeedbackModal({
                                                                        open: true,
                                                                        type: "delete",
                                                                        title: "Department Deleted",
                                                                        message: `Department "${dept.name}" has been successfully removed.`,
                                                                    });
                                                                })
                                                                .catch(() => {
                                                                    toast.error("Failed to delete department.");
                                                                });
                                                        },
                                                    });
                                                }}
                                            >
                                                Delete
                                            </Button>


                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <ActionFeedbackModal
                open={feedbackModal.open}
                onClose={() => setFeedbackModal({ ...feedbackModal, open: false })}
                type={feedbackModal.type}
                title={feedbackModal.title}
                message={feedbackModal.message}
                onConfirm={feedbackModal.onConfirm}
            />


        </div>

    );
}
