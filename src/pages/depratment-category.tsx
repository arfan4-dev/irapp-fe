// ✅ Enhanced Department Management Page with UX Improvements
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
    createDepartment,

    fetchDepartments,
    updateDepartment,
} from "@/store/features/department/department";
import {
    Button,
} from "@/components/ui/button";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Header from "@/common/Header";
import { useLocation } from "react-router-dom";
import useThemeMode from "@/hooks/useTheme";
import UserSetting from "@/common/UserSetting";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {  createCategory, fetchCategories} from "@/store/features/category/category";
import { getOfflineCategories, getPendingCategoryItems, savePendingCategoryUpdate } from "@/utils/categoryStorage";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { setCategories } from "@/store/slices/categorySlice";
import { getUserIdFromLocalStorage } from "@/utils/getUserId";
import { useSyncPendingCategoryItems, useSyncPendingCategoryUpdates } from "@/utils/categorySync";
import { useDeptCategoryState } from "@/hooks/useDeptCategoryState";
import { useSyncPendingDepartments } from "@/utils/departmentSync";
import { getPendingDepartments, savePendingDepartment } from "@/utils/departmentStorage";
import { addDepartment } from "@/store/slices/departmentSlice";
import Departments from "@/components/dept-category/Departments";
import Category from "@/components/dept-category/Category";
import useCategorySortOrder from "@/hooks/useCategorySortOrder";
import CategoryDepartmentMapping from "@/components/dept-category/cat-dept-mapping";

export default function DepartmentManagementPage() {
    useSyncPendingCategoryUpdates();
    useSyncPendingCategoryItems();
    useSyncPendingDepartments();
    const dispatch = useDispatch<AppDispatch>();
    const { categories, loading } = useSelector((state: RootState) => state?.categories);
    const { departments, loading: loader } = useSelector((state: RootState) => state.departments);
    const user = useSelector((state: RootState) => state?.user?.currentUser?.data);
    const { config } = useSelector((state: RootState) => state.siteConfig);
    const { theme, setTheme } = useThemeMode();
    const [editLoading, setEditLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [serviceName] = useState("IntraServe Admin Panel");
    const location = useLocation();
    const modalRef = useRef<HTMLDivElement>(null);
    const isOnline = useOfflineStatus();
    const [activeTab, setActiveTab] = useState<'Departments' | 'Category' | 'mapping'>('Departments');
    const { categorySortOrder, setCategorySortOrder } = useCategorySortOrder();

    const {
        feedbackModal, setFeedbackModal,
        editingCategoryId, setEditingCategoryId,
        editedLabel, setEditedLabel,
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
        showSettings, setShowSettings,
        categorySearch, setCategorySearch,
        
    } = useDeptCategoryState();
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false); // Track department being deleted


    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newDeptInput.trim();

        if (!trimmed) return toast.error("Department name is required.");

        const regex = /^[a-zA-Z0-9 /]+$/;
        if (!regex.test(trimmed)) return toast.error("Only letters, spaces, and '/' allowed.");

        if (departments.some(d => d.name.toLowerCase() === trimmed.toLowerCase()))
            return toast.error("This department already exists.");

        if (isOnline) {
            try {
                await dispatch(createDepartment({ name: trimmed })).unwrap();
                setNewDeptInput("");
                setNewDeptModalOpen(false);
                toast.success("Department created successfully");
            } catch (error) {
                console.error(error);
                toast.error("Failed to create department online.");
            }
        } else {
            try {
                const tempKey = await savePendingDepartment({ action: 'create', name: trimmed });
                toast.success("Saved offline. Will sync when online.");
                setNewDeptInput("");
                setNewDeptModalOpen(false);

                // optional: fetch and show pending for debugging
                const pendings = await getPendingDepartments();
                console.log("Pending departments (offline):", pendings);

                // optional: show in UI immediately
                dispatch(addDepartment({
                    _id: `offline-${tempKey}`,
                    name: trimmed,
                    offline: true,
                }));
            } catch (error) {
                console.error("Failed to save department offline:", error);
                toast.error("Failed to save offline.");
            }
        }
    };

    const handleUpdate = () => {
        if (!editDept?.id || !editDept.name.trim()) return toast.error("Updated name required.");
        const trimmed = editDept.name.trim();
        const regex = /^[a-zA-Z0-9 /]+$/;
    
        if (!regex.test(trimmed)) return toast.error("Only letters, spaces, and '/' allowed.");

        setEditLoading(true);
        if (isOnline) {
            dispatch(updateDepartment({ id: editDept.id, name: trimmed }))
                .unwrap()
                .then(() => {
                    toast.success("Department updated successfully");
                    dispatch(fetchDepartments());
                    setEditDept(null);
                })
                .catch(() => toast.error("Update failed."))
                .finally(() => setEditLoading(false));
        } else {
            savePendingDepartment({ action: 'update', id: editDept.id, name: trimmed })
                .then(() => {
                    toast.success("Saved offline. Will sync when online.");
                    setEditDept(null);
                })
                .finally(() => setEditLoading(false));
        }
    };
    const filtered = departments
        .filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));



    const filteredCategories = selectedDept
        ? categories.filter((cat) => cat.department === selectedDept)
        : categories;


    const finalFilteredCategories = filteredCategories.filter(cat =>
        cat.label.toLowerCase().includes(categorySearch.toLowerCase())
    );

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

            // setOfflineCategoryItems(map);
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

    useEffect(() => {
        // If selectedDept is no longer in departments, reset it
        if (selectedDept && !departments.some((d) => d.name === selectedDept)) {
            setSelectedDept(null);
        }
    }, [departments, selectedDept]);
    useEffect(() => {
        if (selectedDept === null) {
            dispatch(fetchCategories()).unwrap(); // Refresh categories when no department is selected
        }
    }, [selectedDept, dispatch]);

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

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Tabs */}
                <div className="flex  md:gap-48 justify-between md:justify-center border-b mb-4">
                    {['Departments', 'Category', 'mapping'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4  cursor-pointer py-2 border-b-2 transition-all duration-200 ease-in-out
              ${activeTab === tab ? 'border-black font-semibold text-black dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-300'}`}
                        >
                            {tab === 'Departments' ? 'Departments' : tab === 'Category' ? 'Category' : 'Mapping'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div>
                    {activeTab === 'Departments' && (
                        <div className="">
                            <Departments
                                handleCreate={handleCreate}  newDeptInput={newDeptInput} setNewDeptInput={setNewDeptInput} newDeptModalOpen={newDeptModalOpen} setNewDeptModalOpen={setNewDeptModalOpen} search={search} setSearch={setSearch} filtered={filtered} departments={departments} setSelectedDept={setSelectedDept} selectedDept={selectedDept} editDept={editDept} inputRef={inputRef} setEditDept={setEditDept} handleUpdate={handleUpdate} editLoading={editLoading} loader={loader} deleteLoading={deleteLoading} setDeleteLoading={setDeleteLoading}
                            />
                        </div>
                    )}

                    {activeTab === 'Category' && (
                        <div>
                            {/* Cat tab content goes here */}
                            <Category categories={categories} categoryLoading={loading} feedbackModal={feedbackModal} selectedDept={selectedDept} setSelectedDept={setSelectedDept} categorySearch={categorySearch} setCategorySearch={setCategorySearch} setShowCategoryModal={setShowCategoryModal} setCategorySortOrder={setCategorySortOrder} categorySortOrder={categorySortOrder} finalFilteredCategories={finalFilteredCategories} editingCategoryId={editingCategoryId} editedLabel={editedLabel} setEditedLabel={setEditedLabel} setEditingCategoryId={setEditingCategoryId} setFeedbackModal={setFeedbackModal} loading={loading} isOnline={isOnline} offlineCategoryItems={offlineCategoryItems} newItems={newItems} itemOptions={itemOptions} setAddItemLoader={setAddItemLoader}  setOfflineCategoryItems={setOfflineCategoryItems} setNewItems={setNewItems} setItemOptions={setItemOptions}
                                setEditedEnabled={setEditedEnabled} editingItem={editingItem} setEditingItem={setEditingItem} editedItemName={editedItemName} setEditedItemName={setEditedItemName} setEditItemsLoader={setEditItemsLoader} editedAllowMultiple={editedAllowMultiple} setEditedAllowMultiple={setEditedAllowMultiple} editItemsLoader={editItemsLoader} addItemLoader={addItemLoader}/>
                        </div>
                    )}

                    {activeTab === 'mapping' && (
                        <div>
                            {/* Mapping tab content goes here */}
                            <CategoryDepartmentMapping categories={categories} departments={departments} />
                        </div>
                    )}
                </div>
            </div>


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
                                    // const dept = form.department.value.trim();
                                    // Disallow special characters except space, dash, underscore
                                    const isValid = /^[a-zA-Z0-9 _\/-]+$/.test(label); // allows only letters, spaces, underscores, slashes, and dashes


                                    if (!label || !isValid) {
                                        toast.error("Category name should not contain special characters");
                                        return;
                                    }

                                    // if (!dept) {
                                    //     toast.error("Department is required.");
                                    //     return;
                                    // }
                                    if (categories.some(cat => cat.label === label)) {
                                        toast.error("Category already exists.");
                                        return;
                                    }

                                    const newCategory = { label };

                                    if (isOnline) {
                                        dispatch(createCategory(newCategory))
                                            .unwrap()
                                            .then(() => {
                                                toast.success("Category created.");
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
                                {/* <div className="grid">
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
                                </div> */}
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setShowCategoryModal(false)} type="button">Cancel</Button>
                                    <Button type="submit" className="cursor-pointer hover:opacity-75">{loading ? "Saving..." : "Add"}</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
           
            {showSettings && (
                <UserSetting user={user} modalRef={modalRef} setShowSettings={setShowSettings} userName={user?.username} setUserName={''} />
            )}
        </div>
    );
}
