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
import { MoreVertical, PencilLine, EllipsisVertical } from "lucide-react";
import UserSetting from "@/common/UserSetting";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, SquarePen } from 'lucide-react'; 
import { Switch } from "@/components/ui/switch";
import { addItemToCategory, createCategory, deleteCategory, fetchCategories, removeItemFromCategory, updateCategory, updateItemInCategory } from "@/store/features/category/category";
import { getOfflineCategories, getPendingCategoryItems, savePendingCategoryItem, savePendingCategoryUpdate } from "@/utils/categoryStorage";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import useCategorySortOrder from "@/hooks/useCategorySortOrder";
import { setCategories } from "@/store/slices/categorySlice";
import { getUserIdFromLocalStorage } from "@/utils/getUserId";
import { useSyncPendingCategoryItems, useSyncPendingCategoryUpdates } from "@/utils/categorySync";
import { useDeptCategoryState } from "@/hooks/useDeptCategoryState";

export default function DepartmentManagementPage() {
    useSyncPendingCategoryUpdates()
    useSyncPendingCategoryItems()
    const dispatch = useDispatch<AppDispatch>();
    const { categories, loading } = useSelector((state: RootState) => state?.categories);
    const { departments, loading: loader } = useSelector((state: RootState) => state.departments);
    const user = useSelector((state: RootState) => state?.user?.currentUser?.data);
    const { categorySortOrder, setCategorySortOrder } = useCategorySortOrder();
    const { config } = useSelector((state: RootState) => state.siteConfig);
    const { theme, setTheme } = useThemeMode();
    const [editLoading, setEditLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [serviceName] = useState("IntraServe Admin Panel");
    const location = useLocation();
    const modalRef = useRef<HTMLDivElement>(null);
    const isOnline = useOfflineStatus();
    const {
        feedbackModal, setFeedbackModal,
        editingCategoryId, setEditingCategoryId,
        editedLabel, setEditedLabel,
        editedDepartment, setEditedDepartment,
        setEditedEnabled,
        editingItem, setEditingItem,
        editItemsLoader, setEditItemsLoader,
        editedAllowMultiple, setEditedAllowMultiple,
        offlineCategoryItems, setOfflineCategoryItems,
        addItemLoader, setAddItemLoader,
        newItems, setNewItems,
        itemOptions, setItemOptions,
        selectedDept, setSelectedDept,
        editedItemName, setEditedItemName,
        newDeptModalOpen, setNewDeptModalOpen,
        newDeptInput, setNewDeptInput,
        search,
        setSearch,
        editDept,
        setEditDept,
        showCategoryModal,
        setShowCategoryModal,
        showSettings, setShowSettings
    } = useDeptCategoryState();



    const handleCreate = (e:any) => {
        e.preventDefault()
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
    const filteredCategories = selectedDept
        ? categories.filter((cat) => cat.department === selectedDept)
        : categories;


    useEffect(() => {
        const loadOfflineItems = async () => {
            const pendingItems = await getPendingCategoryItems();
            const map: Record<string, { name: string; allowMultiple: boolean }[]> = {};
            pendingItems.forEach(item => {
                if (!map[item.categoryId]) map[item.categoryId] = [];
                map[item.categoryId].push({
                    name: item.itemName,
                    allowMultiple: item.allowMultiple,
                });
            });

            setOfflineCategoryItems(map);
        };

        loadOfflineItems();

        if (isOnline) {
            dispatch(fetchCategories())
                .unwrap()
                .then(() => {
                    // toast.success("Categories synced successfully.");
                })
        }
    }, [isOnline, showCategoryModal]); // ✅

    useEffect(() => {
        const loadCategories = async () => {
            if (isOnline) {
                dispatch(fetchCategories()).unwrap()
                dispatch(fetchDepartments()).unwrap()
            } else {
                const offlineCats = await getOfflineCategories();
                dispatch(setCategories([...categories, ...offlineCats])); // ✅ use actual action
                toast.info("Showing offline categories.");
            }

        };

        loadCategories();
    }, [dispatch, isOnline, showCategoryModal]);

    useEffect(() => {
        if (editDept && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editDept]);

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
                location={location.pathname}
                theme={theme}
                serviceName={config.brandName || serviceName}
                setTheme={setTheme}
                setShowSettings={setShowSettings}
                showSettings={showSettings}
            />

            <div className="max-w-7xl mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[18px] lg:text-2xl font-bold">Department Management</h2>
                    <Dialog open={newDeptModalOpen} onOpenChange={setNewDeptModalOpen}>
                        <DialogTrigger asChild>
                            <Button className='cursor-pointer hover:opacity-75'>+ Add Department</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Department</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreate}>
                                <Input
                                    placeholder="Enter department name"
                                    value={newDeptInput}
                                    onChange={(e) => setNewDeptInput(e.target.value)}
                                />
                                <Button className="mt-4 w-full cursor-pointer" type='submit' disabled={loader}>
                                    {loader ? 'Saving...' : 'Create'}
                                </Button>
                            </form>
                           
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Mobile: Department Dropdown */}
                <div className="block md:hidden mb-4">
                    <Button
                        variant={selectedDept === null ? "default" : "outline"}
                        onClick={() => setSelectedDept(null)}
                        className="w-full mb-2"
                    >
                        Show All Categories
                    </Button>

                    <Label className="text-sm mb-1">Filter by Department</Label>
                    <Select
                        value={selectedDept || ""}
                        onValueChange={(val) => {
                            setSelectedDept(val === "ALL" ? null : val);
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map((dep) => (
                                <SelectItem key={dep._id} value={dep.name}>
                                    {dep.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col md:flex-row-reverse gap-6 w-full h-auto md:h-[calc(100vh-200px)]">
                    <div className="w-full">
                        {user.role === 'admin' && <Card>
                            <CardContent className="px-4 md:px-6 space-y-6 w-full h-full max-h-[calc(100vh-250px)] overflow-y-auto">
                                <h2 className="sm:text-xl font-semibold mb-4">
                                    Manage Categories
                                    {selectedDept && (
                                        <span className="ml-2 text-sm font-medium text-muted-foreground">
                                            for <span className="text-primary">{selectedDept}</span>
                                        </span>
                                    )}
                                </h2>

                            
                                <div className="flex flex-col md:flex-row md:items-center  justify-between ">
                                    <h3 className="text-[14px] sm:text-lg font-semibold">Add New Category</h3>
                                    <div className="flex gap-3 self-end">
                                        <Button
                                            size="lg"
                                            type="submit"
                                            onClick={() => setShowCategoryModal(true)}
                                            className="mt-2 text-[12px] md:text-[16px] cursor-pointer hover:opacity-75"
                                        >
                                            Add
                                        </Button>
                                        <Button
                                            size="lg"
                                            type="button"
                                            onClick={() => setCategorySortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                                            className="mt-2 text-[12px] md:text-[16px] cursor-pointer hover:opacity-75 sm:mr-[10px] lg:mr-[22px]"
                                        >
                                            Sort {categorySortOrder === 'asc' ? 'Descending' : 'Ascending'}
                                        </Button>
                                    </div>
                                </div>



                                <div className="flex gap-4 flex-wrap items-start">
                                    {filteredCategories && filteredCategories.length > 0 ? (
                                        [...filteredCategories] // create a shallow copy first
                                            .sort((a, b) => {
                                                const nameA = a.label.toLowerCase();
                                                const nameB = b.label.toLowerCase();
                                                if (categorySortOrder === 'asc') {
                                                    return nameA.localeCompare(nameB);
                                                } else {
                                                    return nameB.localeCompare(nameA);
                                                }
                                            })?.map((cat) => (
                                                <div key={cat._id} className={`rounded-lg border p-4 basis-[100%] md:basis-[48%] bg-white dark:bg-zinc-800 shadow-sm space-y-3 transition-opacity duration-200 ${cat.enabled ? "" : ""
                                                    }`}>
                                                    <div className="flex justify-between items-center">
                                                        {editingCategoryId === cat._id ? (
                                                            <div className="flex flex-col gap-2 w-full">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <PencilLine className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                                    <p className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
                                                                        Edit Category
                                                                    </p>
                                                                </div>

                                                                                            {/* <Input
                                                            value={editedLabel}
                                                            onChange={(e) => setEditedLabel(e.target.value)}
                                                            className="text-lg font-semibold border border-gray-300 dark:bg-zinc-900"
                                                            placeholder="Edit Category Label"
                                                            /> */}
                                                                <Input
                                                                    value={editedLabel}
                                                                    onChange={(e) => setEditedLabel(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            dispatch(updateCategory({
                                                                                id: cat._id,
                                                                                newLabel: editedLabel,
                                                                                newDepartment: editedDepartment,
                                                                            }))
                                                                                .unwrap()
                                                                                .then(() => {
                                                                                    setEditingCategoryId(null);
                                                                                    setFeedbackModal({
                                                                                        open: true,
                                                                                        type: "update",
                                                                                        title: "Category Updated",
                                                                                        message: `The category "${editedLabel}" was updated successfully.`,
                                                                                    });
                                                                                });
                                                                        }
                                                                    }}
                                                                    className="text-lg font-semibold border border-gray-300 dark:bg-zinc-900"
                                                                    placeholder="Edit Category Label"
                                                                />

                                                                <Select
                                                                    value={editedDepartment}
                                                                    onValueChange={(val) => setEditedDepartment(val)}
                                                                >
                                                                    <SelectTrigger className="border">
                                                                        <SelectValue placeholder="Select Department" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="cursor-pointer">
                                                                        {departments.map((dep) => (
                                                                            <SelectItem className="cursor-pointer" key={dep._id} value={dep.name}>
                                                                                {dep.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>

                                                                <div className="flex gap-2 justify-end">
                                                                    <Button
                                                                        size="sm"
                                                                        disabled={loading}
                                                                        onClick={() => {
                                                                            // dispatch(updateCategory({
                                                                            //   id: cat._id,
                                                                            //   newLabel: editedLabel,
                                                                            //   newDepartment: editedDepartment,
                                                                            // })).unwrap().then(() => {
                                                                            //   setEditingCategoryId(null);
                                                                            // });
                                                                            dispatch(updateCategory({ id: cat._id, newLabel: editedLabel, newDepartment: editedDepartment, }))
                                                                                .unwrap()
                                                                                .then(() => {
                                                                                    setEditingCategoryId(null);
                                                                                    setFeedbackModal({
                                                                                        open: true,
                                                                                        type: "update",
                                                                                        title: "Category Updated",
                                                                                        message: `The category "${editedLabel}" was updated successfully.`,
                                                                                    });
                                                                                });
                                                                        }}

                                                                    >
                                                                        {loading ? "Saving..." : "Save"}
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => setEditingCategoryId(null)}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                        ) : (
                                                            <div className="flex justify-between w-full items-center">

                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <h3
                                                                        className="text-lg font-semibold cursor-pointer"
                                                                    // onClick={() => {
                                                                    //   setEditedLabel(cat.label);
                                                                    //   setEditingCategoryId(cat._id);
                                                                    // }}
                                                                    >
                                                                        {cat.label}
                                                                    </h3>
                                                                    <Switch
                                                                        checked={cat.enabled}
                                                                        onCheckedChange={(checked) => {
                                                                            setEditedEnabled(checked)
                                                                            dispatch(updateCategory({
                                                                                id: cat._id,
                                                                                newLabel: cat.label,
                                                                                newDepartment: cat.department,
                                                                                enabled: checked,
                                                                            }));

                                                                        }}
                                                                    />
                                                                    <span className="text-xs text-muted-foreground">{true ? "Enabled" : "Disabled"}</span>
                                                                </div>
                                                                <div>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="text-blue-600 hover:text-blue-800"
                                                                        onClick={() => {
                                                                            setEditedLabel(cat.label);
                                                                            setEditedDepartment(cat.department); // <-- set current department
                                                                            setEditingCategoryId(cat._id);
                                                                        }}
                                                                    >
                                                                            <SquarePen />

                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="text-red-600 hover:text-red-800"
                                                                        // onClick={() => dispatch(deleteCategory(cat._id))}
                                                                        onClick={() =>
                                                                            setFeedbackModal({
                                                                                open: true,
                                                                                type: "delete",
                                                                                title: "Delete Category?",
                                                                                message: "Are you sure you want to delete this category? This action cannot be undone.",
                                                                                onConfirm: () => {
                                                                                    dispatch(deleteCategory(cat._id)).then(() => {
                                                                                        setFeedbackModal({
                                                                                            open: true,
                                                                                            type: "delete",
                                                                                            title: "Deleted Successfully",
                                                                                            message: `Category "${cat.label}" has been deleted.`,
                                                                                        });
                                                                                    });
                                                                                },
                                                                            })
                                                                        }

                                                                    >
                                                                            <Trash2 />
                                                                    </Button>
                                                                </div>


                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className={`${!cat.enabled ? "opacity-40 blur-[1px] pointer-events-none select-none" : ""}`}>
                                                        <ul className="space-y-2  ">
                                                            {cat?.items?.map(item => {
                                                                const isEditingItem = editingItem?.categoryId === cat._id && editingItem?.name === item.name;
                                                                return (
                                                                    <li key={item.name} className="flex flex-col gap-2 text-sm border-b pb-2">
                                                                        {isEditingItem ? (
                                                                            <>
                                                                                {/* <input
                                          value={editedItemName}
                                          onChange={(e) => setEditedItemName(e.target.value)}
                                          className="px-2 py-1 border rounded dark:bg-zinc-900"
                                        /> */}
                                                                                <input
                                                                                    value={editedItemName}
                                                                                    onChange={(e) => setEditedItemName(e.target.value)}
                                                                                    onKeyDown={(e) => {
                                                                                        if (e.key === 'Enter') {
                                                                                            e.preventDefault();
                                                                                            setEditItemsLoader(true);
                                                                                            dispatch(updateItemInCategory({
                                                                                                categoryId: cat._id,
                                                                                                oldItemName: item.name,
                                                                                                newItem: {
                                                                                                    name: editedItemName.trim(),
                                                                                                    allowMultiple: editedAllowMultiple,
                                                                                                }
                                                                                            }))
                                                                                                .unwrap()
                                                                                                .then(() => {
                                                                                                    dispatch(fetchCategories());
                                                                                                    setEditingItem(null);
                                                                                                    setEditItemsLoader(false);
                                                                                                });
                                                                                        }
                                                                                    }}
                                                                                    className="px-2 py-1 border rounded dark:bg-zinc-900"
                                                                                />

                                                                                <label className="flex items-center gap-2 text-xs">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={editedAllowMultiple}
                                                                                        onChange={(e) => setEditedAllowMultiple(e.target.checked)}
                                                                                    />
                                                                                    Allow Quantity Selection
                                                                                </label>
                                                                                <div className="flex gap-2 mt-1">
                                                                                    <Button
                                                                                        size="sm"
                                                                                        className="cursor-pointer hover:opacity-75"
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            setEditItemsLoader(true)
                                                                                            dispatch(updateItemInCategory({
                                                                                                categoryId: cat._id,
                                                                                                oldItemName: item.name,
                                                                                                newItem: {
                                                                                                    name: editedItemName.trim(),
                                                                                                    allowMultiple: editedAllowMultiple,
                                                                                                }
                                                                                            }))
                                                                                                .unwrap()
                                                                                                .then(() => {
                                                                                                    dispatch(fetchCategories());
                                                                                                    setEditingItem(null);
                                                                                                    setEditItemsLoader(false)
                                                                                                });
                                                                                        }}
                                                                                    >
                                                                                        {editItemsLoader ? 'Updating' : 'Update'}
                                                                                    </Button>
                                                                                    <Button
                                                                                        size="sm"

                                                                                        variant="outline"
                                                                                        className="cursor-pointer hover:opacity-90"
                                                                                        onClick={() => setEditingItem(null)}
                                                                                    >
                                                                                        Cancel
                                                                                    </Button>
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <div className="">
                                                                                {/* <span>{item.name}</span> */}
                                                                                {/* <div className="flex">
                                      <Button
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                        variant="ghost"
                                        onClick={() => {
                                          setEditingItem({ categoryId: cat._id, name: item.name });
                                          setEditedItemName(item.name);
                                          setEditedAllowMultiple(item.allowMultiple);
                                        }}
                                      >
                                        Update
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-600 hover:text-red-800 cursor-pointer"
                                        onClick={() => {
                                          dispatch(removeItemFromCategory({ categoryId: cat._id, itemName: item.name }))
                                            .unwrap()
                                            .then(() => dispatch(fetchCategories()))
                                        }}
                                      >
                                        Remove
                                      </Button>
                                    </div> */}
                                                                                <div className="flex justify-between items-center">
                                                                                    <span>{item.name}</span>
                                                                                    <DropdownMenu>
                                                                                        <DropdownMenuTrigger asChild>
                                                                                            <Button
                                                                                                size="icon"
                                                                                                variant="ghost"
                                                                                                className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
                                                                                            >
                                                                                                    <EllipsisVertical size={18} />

                                                                                            </Button>
                                                                                        </DropdownMenuTrigger>
                                                                                        <DropdownMenuContent align="end" className="w-32">
                                                                                            <DropdownMenuItem
                                                                                                onClick={() => {
                                                                                                    setEditingItem({ categoryId: cat._id, name: item.name });
                                                                                                    setEditedItemName(item.name);
                                                                                                    setEditedAllowMultiple(item.allowMultiple);
                                                                                                }}
                                                                                            >
                                                                                                Update
                                                                                            </DropdownMenuItem>
                                                                                            <DropdownMenuItem
                                                                                                onClick={() =>
                                                                                                    setFeedbackModal({
                                                                                                        open: true,
                                                                                                        type: "delete",
                                                                                                        title: "Delete Category Item?",
                                                                                                        message: "Are you sure you want to delete this item? This action cannot be undone.",
                                                                                                        onConfirm: () => {
                                                                                                            setFeedbackModal(prev => ({ ...prev, open: false })); // close modal first

                                                                                                            dispatch(removeItemFromCategory({ categoryId: cat._id, itemName: item.name }))
                                                                                                                .unwrap()
                                                                                                                .then(() => {
                                                                                                                    dispatch(fetchCategories());

                                                                                                                    setFeedbackModal({
                                                                                                                        open: true,
                                                                                                                        type: "delete",
                                                                                                                        title: "Deleted Successfully",
                                                                                                                        message: `Item "${item.name}" has been deleted.`,
                                                                                                                    });
                                                                                                                })
                                                                                                                .catch(() => {
                                                                                                                    setFeedbackModal({
                                                                                                                        open: true,
                                                                                                                        type: "delete",
                                                                                                                        title: "Failed",
                                                                                                                        message: "Something went wrong while deleting the item.",
                                                                                                                    });
                                                                                                                });
                                                                                                        },
                                                                                                    })
                                                                                                }

                                                                                                // onClick={() => {
                                                                                                //   dispatch(removeItemFromCategory({ categoryId: cat._id, itemName: item.name }))
                                                                                                //     .unwrap()
                                                                                                //     .then(() =>{ 
                                                                                                //       dispatch(fetchCategories())});
                                                                                                // }}
                                                                                                className="text-red-600 focus:text-red-600"
                                                                                            >
                                                                                                Remove
                                                                                            </DropdownMenuItem>
                                                                                        </DropdownMenuContent>
                                                                                    </DropdownMenu>
                                                                                </div>



                                                                            </div>
                                                                        )}
                                                                    </li>
                                                                );
                                                            })}
                                                            {!isOnline &&
                                                                offlineCategoryItems?.[cat._id]
                                                                    ?.filter(offlineItem =>
                                                                        !cat.items.some(dbItem =>
                                                                            dbItem.name.trim().toLowerCase() === offlineItem.name.trim().toLowerCase()
                                                                        )
                                                                    )
                                                                    ?.map((item, index) => (
                                                                        <li
                                                                            key={`offline-${item.name}-${index}`}
                                                                            className="flex justify-between text-sm border-b pb-1 italic opacity-70"
                                                                        >
                                                                            <div>
                                                                                {item.name}
                                                                                <span className="ml-1 text-xs text-yellow-600">(Offline)</span>
                                                                            </div>
                                                                            <div className="text-xs">
                                                                                Quantity: {item.allowMultiple ? "Yes" : "No"}
                                                                            </div>
                                                                        </li>
                                                                    ))}

                                                        </ul>



                                                        <form
                                                            onSubmit={(e) => {
                                                                e.preventDefault();
                                                                const itemName = newItems[cat._id]?.trim();
                                                                if (itemName) {
                                                                    const allowMultiple = itemOptions[cat._id] ?? false;
                                                                    if (isOnline) {
                                                                        setAddItemLoader(prev => ({ ...prev, [cat._id]: true }));
                                                                        dispatch(addItemToCategory({ categoryId: cat._id, itemName, allowMultiple }))
                                                                            .unwrap()
                                                                            .then(() => {
                                                                                dispatch(fetchCategories()); setAddItemLoader(prev => ({ ...prev, [cat._id]: false }));


                                                                            }).catch(error => { setAddItemLoader(prev => ({ ...prev, [cat._id]: false }));; console.log(error) })
                                                                    } else {
                                                                        const alreadyExistsInState =
                                                                            cat.items.some(item => item.name === itemName) || // from MongoDB
                                                                            (offlineCategoryItems[cat._id]?.some(item => item.name === itemName) ?? false); // from offline state

                                                                        if (alreadyExistsInState) {
                                                                            toast.error("Item already exists in this category.");
                                                                            return;
                                                                        }

                                                                        savePendingCategoryItem({ categoryId: cat._id, itemName, allowMultiple })
                                                                            .then(() => {
                                                                                setOfflineCategoryItems(prev => {
                                                                                    const updated = { ...prev };

                                                                                    // Prevent duplicates
                                                                                    const alreadyExists = updated[cat._id]?.some(
                                                                                        item => item.name.trim().toLowerCase() === itemName.trim().toLowerCase()
                                                                                    );

                                                                                    if (alreadyExists) return updated;

                                                                                    if (!updated[cat._id]) updated[cat._id] = [];
                                                                                    updated[cat._id].push({ name: itemName, allowMultiple });

                                                                                    return updated;
                                                                                });

                                                                                toast.success("Saved offline. Will sync later.");
                                                                            });
                                                                    }


                                                                    // dispatch(addItemToCategory({ categoryId: cat._id, itemName, allowMultiple })).unwrap().then(() => {
                                                                    //   dispatch(fetchCategories())
                                                                    // }).catch(() => { })

                                                                    setNewItems(prev => ({ ...prev, [cat._id]: "" }));
                                                                    setItemOptions(prev => ({ ...prev, [cat._id]: false }));
                                                                }
                                                            }}
                                                            className="flex flex-col gap-2 pt-2"
                                                        >
                                                         

                                                            <input
                                                                name="itemName"
                                                                value={newItems[cat._id] || ""}
                                                                onChange={(e) => {
                                                                    const inputValue = e.target.value;
                                                                    const isValid = /^[a-zA-Z ]*$/.test(inputValue); // only letters and spaces allowed

                                                                    if (!isValid) {
                                                                        toast.error("Only alphabets and spaces are allowed.");
                                                                    }

                                                                    // Filter invalid characters before setting state
                                                                    const filtered = inputValue.replace(/[^a-zA-Z ]/g, "");
                                                                    setNewItems((prev) => ({ ...prev, [cat._id]: filtered }));
                                                                }}
                                                                placeholder="New item"
                                                                className="px-3 py-1.5 border rounded text-sm dark:bg-zinc-900"
                                                            />

                                                            <label className="flex items-center gap-2 text-sm">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={itemOptions[cat._id] || false}
                                                                    onChange={(e) => setItemOptions(prev => ({ ...prev, [cat._id]: e.target.checked }))}
                                                                />
                                                                Allow Quantity Selection (+ / -)
                                                            </label>
                                                            <Button size="sm" type="submit" className="cursor-pointer hover:opacity-75" disabled={!newItems[cat._id]?.trim()}>
                                                                {addItemLoader[cat._id] ? "Saving..." : "Add"}
                                                            </Button>
                                                        </form>
                                                    </div>

                                                </div>
                                            ))
                                    ) : (
                                        <p className="text-gray-500 italic text-sm col-span-2 text-center">
                                            No categories available. Please create a new category to get started.
                                        </p>
                                    )}
                                </div>

                            </CardContent>
                        </Card>
                        }

                        {showCategoryModal && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                                <Card className="w-full max-w-md bg-white dark:bg-zinc-900 text-black dark:text-white rounded-lg shadow-lg">
                                    <CardContent className="px-6 space-y-4">
                                        <h3 className="text-lg font-semibold">Add New Category</h3>
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                const form = e.target as any;
                                                const label = form.catLabel.value.trim();
                                                const dept = form.department.value.trim();
                                                // Disallow special characters except space, dash, underscore
                                                const isValid = /^[a-zA-Z0-9 _-]+$/.test(label);

                                                if (!label || !isValid) {
                                                    toast.error("Category name should not contain special characters.");
                                                    return;
                                                }

                                                if (!dept) {
                                                    toast.error("Department is required.");
                                                    return;
                                                }
                                                if (categories.some(cat => cat.label === label)) {
                                                    toast.error("Category already exists.");
                                                    return;
                                                }

                                                const newCategory = { label, dept };

                                                if (isOnline) {
                                                    dispatch(createCategory(newCategory))
                                                        .unwrap()
                                                        .then(() => {
                                                            toast.success("Category created!");
                                                            setShowCategoryModal(false);
                                                        })
                                                        .catch(() => {
                                                            toast.error("Failed to create category.");
                                                        });
                                                } else {
                                                    savePendingCategoryUpdate(newCategory)
                                                        .then(() => {
                                                            toast.success("Category saved offline. Will sync when online.");
                                                            setShowCategoryModal(false);
                                                        })
                                                        .catch(() => toast.error("Failed to save offline."));
                                                }
                                            }}


                                            className="space-y-4"
                                        >
                                            <Label className="mb-2.5">Cateogry Name</Label>
                                            <Input
                                                name="catLabel"
                                                placeholder="Category Name"
                                                className="w-full px-3 py-2 border rounded text-sm dark:bg-zinc-800"
                                                required
                                            />
                                            <div className="grid">
                                                <Label className="mb-2.5">Department</Label>
                                                <Select
                                                    name="department"
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select department" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {departments.map((dep) => (
                                                            <SelectItem key={dep._id} value={dep.name}>
                                                                {dep.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" onClick={() => setShowCategoryModal(false)} type="button">Cancel</Button>
                                                <Button type="submit" className="cursor-pointer hover:opacity-75">{loading ? "Saving..." : "Add"}</Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>

                    <div className="hidden md:flex w-[300px] flex-col">
                        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-800 rounded-lg border overflow-auto">
                            <Input
                                placeholder="Search department"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="m-4 w-[200px] placeholder:text-[12px]"
                            />

                            <p className="text-sm text-muted-foreground mb-2 px-4">
                                Showing {filtered.length} of {departments.length} departments
                            </p>
                            <div className="flex-1 px-4 overflow-y-auto">
                                <Table className="">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow
                                            onClick={() => setSelectedDept(null)}
                                            className={`cursor-pointer transition-all duration-150 ${selectedDept === null
                                                ? "bg-blue-100 dark:bg-zinc-700 font-semibold"
                                                : "hover:bg-gray-100 dark:hover:bg-zinc-800"
                                                }`}
                                        >
                                            <TableCell colSpan={2}>
                                                <span className="hover:underline">All Categories</span>
                                            </TableCell>
                                        </TableRow>
                                        {filtered.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center italic text-gray-500">
                                                    {search ? "No matching departments found." : "No departments created yet."}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filtered.map((dept) => (
                                                <TableRow
                                                    key={dept._id}
                                                    onClick={() => setSelectedDept(dept.name)}
                                                    className={`cursor-pointer transition-all duration-150 
                                                 ${selectedDept === dept.name ? "bg-blue-100 dark:bg-zinc-700 font-semibold" : "hover:bg-gray-100 dark:hover:bg-zinc-800"}`}
                                                >

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
                                                            <span className="hover:underline ">{dept.name}</span>
                                                        )}
                                                    </TableCell>


                                                    <TableCell className="text-right">
                                                        {editDept?.id === dept._id ? (
                                                            <div className="space-x-2">
                                                                <Button className="cursor-pointer" size="sm" onClick={handleUpdate} disabled={editLoading || loader}>
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

                        </div>
                    </div>



                </div>

            </div>



            <ActionFeedbackModal
                open={feedbackModal.open}
                onClose={() => setFeedbackModal((prev) => ({ ...prev, open: false }))}
                type={feedbackModal.type}
                title={feedbackModal.title}
                message={feedbackModal.message}
                onConfirm={feedbackModal.onConfirm}
            />
            {showSettings && (
                <UserSetting user={user} modalRef={modalRef} setShowSettings={setShowSettings} userName={user?.username} setUserName={''} />
            )}
        </div>
    );
}
