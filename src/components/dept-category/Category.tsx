import { Button } from '../ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from '../ui/input';
import { EllipsisVertical, PencilLine } from 'lucide-react';
import { addItemToCategory, deleteCategory, fetchCategories, removeItemFromCategory, updateCategory, updateItemInCategory } from '@/store/features/category/category';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { savePendingCategoryItem } from '@/utils/categoryStorage';
import { Switch } from '../ui/switch';
import ActionFeedbackModal from '../modal/ActionFeedbackModal';
import { useState } from 'react';
import CategoryCardSkeleton from '../skeleton/CategoryCardSkeleton';
const Category = ({ categoryLoading, feedbackModal, selectedDept, setSelectedDept, categorySearch, setCategorySearch, setShowCategoryModal, setCategorySortOrder, categorySortOrder, finalFilteredCategories, editingCategoryId, editedLabel, setEditedLabel, setEditingCategoryId, setFeedbackModal, loading, isOnline, offlineCategoryItems, newItems, itemOptions, setAddItemLoader, setOfflineCategoryItems, setNewItems, setItemOptions
    , setEditedEnabled, editingItem, setEditingItem, editedItemName, setEditedItemName, setEditItemsLoader, editedAllowMultiple, setEditedAllowMultiple, editItemsLoader, addItemLoader
}: any) => {
    const [catItemLoader, setCatItemLoader] = useState(false)
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state?.user?.currentUser?.data);
    const [activeCategoryForAddItem, setActiveCategoryForAddItem] = useState<string | null>(null);
    return (
        <div>
            <div className="flex flex-col md:flex-row-reverse gap-6 w-full h-auto md:h-[calc(100vh-200px)] ">
                <div className="w-full">
                    {user.role === 'admin' && <Card>
                        <CardContent className="px-4 md:px-6 space-y-6 w-full h-full max-h-[calc(100vh-250px)] mb-3">


                            <div className="flex items-center justify-between gap-2">
                                <h2 className="sm:text-xl font-semibold mb-4">
                                    Manage Categories
                                    {selectedDept && (
                                        <span className="ml-2 text-sm font-medium text-muted-foreground">
                                            for <span className="text-primary">{selectedDept}</span>
                                        </span>
                                    )}
                                </h2>
                                <div className="flex items-center gap-2 sm:mr-[10px] lg:mr-[22px]">
                                    <Input
                                        type="text"
                                        value={categorySearch}
                                        onChange={(e) => setCategorySearch(e.target.value)}
                                        placeholder="Search "
                                        className="max-w-xs "
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setCategorySearch("");
                                            setSelectedDept(null);
                                        }}
                                        className="text-sm cursor-pointer"
                                    >
                                        Reset Filter
                                    </Button>
                                </div>

                            </div>
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
                                        onClick={() => setCategorySortOrder((prev: any) => (prev === 'asc' ? 'desc' : 'asc'))}
                                        className="mt-2 text-[12px] md:text-[16px] cursor-pointer hover:opacity-75 sm:mr-[10px] lg:mr-[22px]"
                                    >
                                        Sort {categorySortOrder === 'asc' ? 'Descending' : 'Ascending'}
                                    </Button>
                                </div>
                            </div>



                            <div className="flex gap-4 flex-wrap items-start">
                                {
                                    categoryLoading ? <CategoryCardSkeleton /> :

                                        finalFilteredCategories && finalFilteredCategories.length > 0 ? (
                                            [...finalFilteredCategories] // create a shallow copy first
                                                .sort((a, b) => {
                                                    const nameA = a.label.toLowerCase();
                                                    const nameB = b.label.toLowerCase();
                                                    if (categorySortOrder === 'asc') {
                                                        return nameA.localeCompare(nameB);
                                                    } else {
                                                        return nameB.localeCompare(nameA);
                                                    }
                                                })?.map((cat) => (
                                                    <div key={cat._id} className={`hover:shadow-md hover:scale-[1.01] transition-all duration-200 ease-in-out
                                                            rounded-lg border p-4 basis-[100%] md:basis-[48%] bg-white dark:bg-zinc-800 shadow-sm space-y-3 ${cat.enabled ? "" : ""
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


                                                                    <Input
                                                                        value={editedLabel}
                                                                        onChange={(e) => setEditedLabel(e.target.value)}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                e.preventDefault();
                                                                                dispatch(updateCategory({
                                                                                    id: cat._id,
                                                                                    newLabel: editedLabel,
                                                                                    // newDepartment: editedDepartment,
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

                                                                    <div className="flex gap-2 justify-end">
                                                                        <Button
                                                                            className="cursor-pointer"
                                                                            size="sm"
                                                                            disabled={loading}
                                                                            onClick={() => {
                                                                                const trimmedLabel = editedLabel.trim();
                                                                                const regex = /^[a-zA-Z0-9 /]+$/;


                                                                                if (!trimmedLabel) {
                                                                                    toast.error("Category name is required.");
                                                                                    return;
                                                                                }

                                                                                if (!regex.test(trimmedLabel)) {
                                                                                    toast.error("Category name should only contain letters, Numbers.");
                                                                                    return;
                                                                                }
                                                                                dispatch(updateCategory({ id: cat._id, newLabel: trimmedLabel }))
                                                                                    .unwrap()
                                                                                    .then(() => {
                                                                                        setEditingCategoryId(null);
                                                                                        setFeedbackModal({
                                                                                            open: true,
                                                                                            type: "update",
                                                                                            title: "Category Updated",
                                                                                            message: `The category "${trimmedLabel}" was updated successfully.`,
                                                                                        });
                                                                                    });
                                                                            }}

                                                                        >
                                                                            {loading ? "Saving..." : "Save"}
                                                                        </Button>
                                                                        <Button
                                                                            className="cursor-pointer"
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
                                                                        >
                                                                            {cat.label}
                                                                        </h3>
                                                                        <Switch
                                                                            checked={cat.enabled}
                                                                            onCheckedChange={(checked: any) => {
                                                                                setEditedEnabled(checked)
                                                                                dispatch(updateCategory({
                                                                                    id: cat._id,
                                                                                    newLabel: cat.label,
                                                                                    // newDepartment: cat.department,
                                                                                    enabled: checked,
                                                                                }));

                                                                            }}
                                                                            className="cursor-pointer"
                                                                        />
                                                                        <span className="text-xs text-muted-foreground">{cat.enabled ? "Enabled" : "Disabled"}</span>
                                                                    </div>

                                                                    <div>
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
                                                                                        setEditedLabel(cat.label);
                                                                                        // setEditedDepartment(cat.department); // <-- set current department
                                                                                        setEditingCategoryId(cat._id);
                                                                                    }}
                                                                                >
                                                                                    Update
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem
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

                                                                                    className="text-red-600 focus:text-red-600"
                                                                                >
                                                                                    {'Remove'}
                                                                                </DropdownMenuItem>
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    </div>

                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className='flex justify-end gap-2 mt-2'>
                                                            <Button
                                                                size="sm"

                                                                className="text-white hover:opacity-85 cursor-pointer dark:text-black"
                                                                onClick={() => {
                                                                    setActiveCategoryForAddItem((prev) =>
                                                                        prev === cat._id ? null : cat._id
                                                                    );
                                                                }}
                                                            >
                                                                {activeCategoryForAddItem === cat._id ? "Cancel" : "Add Item"}

                                                            </Button>
                                                        </div>
                                                        <div className={`${!cat.enabled ? " opacity-40 blur-[1px] pointer-events-none select-none" : ""}`}>
                                                            <ul className="space-y-2  ">
                                                                {cat?.items?.map((item: any) => {
                                                                    const isEditingItem = editingItem?.categoryId === cat._id && editingItem?.name === item.name;
                                                                    return (
                                                                        <li key={item.name} className="flex flex-col gap-2 text-sm border-b pb-2">
                                                                            {isEditingItem ? (
                                                                                <>

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
                                                                                                const isValid = /^[a-zA-Z0-9 ]*$/.test(editedItemName);
                                                                                                if (!isValid) {
                                                                                                    toast.error("Only alphabets, Numbers and spaces are allowed.");
                                                                                                    return;
                                                                                                }
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
                                                                                                    // onClick={() =>
                                                                                                    //     setFeedbackModal({
                                                                                                    //         open: true,
                                                                                                    //         type: "delete",
                                                                                                    //         title: "Delete Category Item?",
                                                                                                    //         message: "Are you sure you want to delete this item? This action cannot be undone.",
                                                                                                    //         onConfirm: () => {
                                                                                                    //             setFeedbackModal((prev:any) => ({ ...prev, open: false })); // close modal first

                                                                                                    //             dispatch(removeItemFromCategory({ categoryId: cat._id, itemName: item.name }))
                                                                                                    //                 .unwrap()
                                                                                                    //                 .then(() => {
                                                                                                    //                     dispatch(fetchCategories());

                                                                                                    //                     setFeedbackModal({
                                                                                                    //                         open: true,
                                                                                                    //                         type: "delete",
                                                                                                    //                         title: "Deleted Successfully",
                                                                                                    //                         message: `Item "${item.name}" has been deleted.`,
                                                                                                    //                     });
                                                                                                    //                 })
                                                                                                    //                 .catch(() => {
                                                                                                    //                     setFeedbackModal({
                                                                                                    //                         open: true,
                                                                                                    //                         type: "delete",
                                                                                                    //                         title: "Failed",
                                                                                                    //                         message: "Something went wrong while deleting the item.",
                                                                                                    //                     });
                                                                                                    //                 });
                                                                                                    //         },
                                                                                                    //     })
                                                                                                    // }
                                                                                                    onClick={() => {

                                                                                                        setCatItemLoader(true)
                                                                                                        dispatch(removeItemFromCategory({ categoryId: cat._id, itemName: item.name }))
                                                                                                            .unwrap()
                                                                                                            .then(() => {

                                                                                                                dispatch(fetchCategories());
                                                                                                                toast.success(`Item "${item.name}" has been deleted.`);

                                                                                                            })
                                                                                                            .catch(() => {
                                                                                                                toast.error("Something went wrong while deleting the item.");
                                                                                                            })
                                                                                                            .finally(() => {
                                                                                                                setCatItemLoader(false)
                                                                                                            })

                                                                                                    }
                                                                                                    }
                                                                                                    className="text-red-600 focus:text-red-600"
                                                                                                >
                                                                                                    {catItemLoader ? 'Removing...' : 'Remove'}
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
                                                                        ?.filter((offlineItem: any) =>
                                                                            !cat.items.some((dbItem: any) =>
                                                                                dbItem.name.trim().toLowerCase() === offlineItem.name.trim().toLowerCase()
                                                                            )
                                                                        )
                                                                        ?.map((item: any, index: any) => (
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


                                                            {
                                                                activeCategoryForAddItem === cat._id && <form
                                                                    onSubmit={(e) => {
                                                                        e.preventDefault();
                                                                        const itemName = newItems[cat._id]?.trim();

                                                                        if (itemName) {
                                                                            const allowMultiple = itemOptions[cat._id] ?? false;
                                                                            if (isOnline) {
                                                                                setAddItemLoader((prev: any) => ({ ...prev, [cat._id]: true }));
                                                                                dispatch(addItemToCategory({ categoryId: cat._id, itemName, allowMultiple }))
                                                                                    .unwrap()
                                                                                    .then(() => {
                                                                                        setActiveCategoryForAddItem(null);
                                                                                        dispatch(fetchCategories()); setAddItemLoader((prev: any) => ({ ...prev, [cat._id]: false }));


                                                                                    }).catch((error: any) => { setAddItemLoader((prev: any) => ({ ...prev, [cat._id]: false }));; console.log(error) })
                                                                            } else {
                                                                                const alreadyExistsInState =
                                                                                    cat.items.some((item: any) => item.name === itemName) || // from MongoDB
                                                                                    (offlineCategoryItems[cat._id]?.some((item: any) => item.name === itemName) ?? false); // from offline state

                                                                                if (alreadyExistsInState) {
                                                                                    toast.error("Item already exists in this category.");
                                                                                    return;
                                                                                }

                                                                                savePendingCategoryItem({ categoryId: cat._id, itemName, allowMultiple })
                                                                                    .then(() => {
                                                                                        setOfflineCategoryItems((prev: any) => {
                                                                                            const updated = { ...prev };

                                                                                            // Prevent duplicates
                                                                                            const alreadyExists = updated[cat._id]?.some(
                                                                                                (item: any) => item.name.trim().toLowerCase() === itemName.trim().toLowerCase()
                                                                                            );

                                                                                            if (alreadyExists) return updated;

                                                                                            if (!updated[cat._id]) updated[cat._id] = [];
                                                                                            updated[cat._id].push({ name: itemName, allowMultiple });

                                                                                            return updated;
                                                                                        });

                                                                                        toast.success("Saved offline. Will sync later.");
                                                                                    });
                                                                            }

                                                                            setNewItems((prev: any) => ({ ...prev, [cat._id]: "" }));
                                                                            setItemOptions((prev: any) => ({ ...prev, [cat._id]: false }));
                                                                        }
                                                                    }}
                                                                    className="flex flex-col gap-2 pt-2"
                                                                >


                                                                    <input
                                                                        name="itemName"
                                                                        value={newItems[cat._id] || ""}
                                                                        onChange={(e) => {
                                                                            const inputValue = e.target.value;
                                                                            const isValid = /^[a-zA-Z0-9 ]*$/.test(inputValue); // ✅ allows letters, numbers, spaces

                                                                            if (!isValid) {
                                                                                toast.error("Only alphabets, numbers, and spaces are allowed.");
                                                                            }

                                                                            // ✅ Filter invalid characters before setting state
                                                                            const filtered = inputValue.replace(/[^a-zA-Z0-9 ]/g, "");
                                                                            setNewItems((prev: any) => ({ ...prev, [cat._id]: filtered }));
                                                                        }}
                                                                        placeholder="New item"
                                                                        className="px-3 py-1.5 border rounded text-sm dark:bg-zinc-900"
                                                                    />


                                                                    <label className="flex items-center gap-2 text-sm">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={itemOptions[cat._id] || false}
                                                                            onChange={(e) => setItemOptions((prev: any) => ({ ...prev, [cat._id]: e.target.checked }))}
                                                                        />
                                                                        Allow Quantity Selection (+ / -)
                                                                    </label>
                                                                    <Button size="sm" type="submit" className="cursor-pointer hover:opacity-75" disabled={!newItems[cat._id]?.trim()}>
                                                                        {addItemLoader[cat._id] ? "Saving..." : "Add"}
                                                                    </Button>
                                                                </form>
                                                            }
                                                            <div className='flex justify-end gap-2 mt-2'>
                                                                {/* <Button
                                                            size="sm"

                                                            className="text-white w-full hover:opacity-85 cursor-pointer "
                                                            onClick={() => {
                                                                setActiveCategoryForAddItem((prev) =>
                                                                    prev === cat._id ? null : cat._id
                                                                );
                                                            }}
                                                        >
                                                            {activeCategoryForAddItem === cat._id ? "Cancel" : "Add Item"}

                                                        </Button> */}
                                                            </div>
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


                </div>




            </div>
            <ActionFeedbackModal
                open={feedbackModal.open}
                onClose={() => setFeedbackModal((prev: any) => ({ ...prev, open: false }))}
                type={feedbackModal.type}
                title={feedbackModal.title}
                message={feedbackModal.message}
                onConfirm={feedbackModal.onConfirm}
            />
        </div>
    )
}

export default Category