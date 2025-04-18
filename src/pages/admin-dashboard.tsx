import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/common/Header";
import { FaTrashCan } from "react-icons/fa6";
import { useLocation } from "react-router-dom";
import useThemeMode from "@/hooks/useTheme";
import { addItemToCategory, createCategory, deleteCategory, fetchCategories, removeItemFromCategory, updateCategory, updateItemInCategory } from "@/store/features/category/category";
import { getOrdersByUser, updateOrderStatus } from "@/store/features/order/order";
import UserSetting from "@/common/UserSetting";
import { getUserIdFromLocalStorage } from "@/utils/getUserId";
import { toast } from "sonner";
// import {
//   DndContext,
//   closestCenter,
//   useSensor,
//   useSensors,
//   PointerSensor
// } from "@dnd-kit/core";
// import {
//   arrayMove,
//   SortableContext,
//   verticalListSortingStrategy
// } from "@dnd-kit/sortable";
// import { SortableItem } from "@/components/dnd/SortableItem"; // ⬅️ created above


export default function AdminPage() {
  const { theme, setTheme } = useThemeMode(); // now you have access to theme and toggle
  const [showSettings, setShowSettings] = useState(false);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  // const sensors = useSensors(useSensor(PointerSensor));
  const [editingItem, setEditingItem] = useState<{ categoryId: string; name: string } | null>(null);
  const [editedItemName, setEditedItemName] = useState('');
  const [editedAllowMultiple, setEditedAllowMultiple] = useState(false);

  const [serviceName] = useState("IntraServe Admin Panel");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>("grid");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editedLabel, setEditedLabel] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newItems, setNewItems] = useState<Record<string, string>>({});
  const [itemOptions, setItemOptions] = useState<Record<string, boolean>>({});
  const location = useLocation()
  const categories = useSelector((state: RootState) => state.categories.categories);
  const orders = useSelector((state: RootState) => state.orders.orders);
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state?.user?.currentUser?.data);

  const pendingOrders = orders.filter(order => order.status === "Pending");
  const inProgressOrders = orders.filter(order => order.status === "In Progress");
  useEffect(() => {
    dispatch(fetchCategories())
    dispatch(getOrdersByUser())
  }, [dispatch])

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
        serviceName={serviceName}
        setTheme={setTheme}
        setShowSettings={setShowAdminSettings}
        showSettings={showAdminSettings}
      />

      <div className="max-w-5xl mx-auto space-y-6 p-4">

        <div className="flex justify-end">
          <Button
            className="text-black dark:bg-black dark:text-white"
            variant="outline"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            Switch to {viewMode === "grid" ? "List" : "Grid"} View
          </Button>
        </div>


        <Card>
          <CardContent className="p-4 md:p-6">
            <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
            {viewMode === "list" ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-200 dark:bg-gray-700">
                    <th className="p-2">Type & Items</th>
                    <th className="p-2">Requested By</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Time</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map(req => (
                    <tr key={req._id} className="border-b align-top">
                      <td className="p-2">
                        <div className="font-semibold italic">{req.type}</div>
                        <div className="text-sm italic">
                          {req.items.map(item => `${item.quantity} × ${item.name}`).join(", ")}
                        </div>
                      </td>
                      <td className="p-2">{req.person}</td>
                      <td className="p-2">{req.timestamp ? (

                        <>{new Date(req.timestamp as string).toISOString().split("T")[0]}</>


                      ) : (
                        <div><em>No timestamp available</em></div>
                      )}
                      </td>
                      <td className="p-2">{req.timestamp ? (


                        <> {new Date(req.timestamp as string).toTimeString().split(" ")[0]}</>

                      ) : (
                        <div><em>No timestamp available</em></div>
                      )}
                      </td>
                      <td className="p-2">{req.status}</td>
                      <td className="p-2 space-x-2">
                        <Button size="sm" onClick={() => dispatch(updateOrderStatus({ id: req._id, status: "In Progress" }))}>
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => dispatch(updateOrderStatus({ id: req._id, status: "Answered" }))}>
                          Answered
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {
                  pendingOrders.length === 0 ? (<div className="text-gray-500">No requests in pending.</div>) : (pendingOrders.map(req => (
                    <Card key={req._id}>
                      <CardContent className="space-y-2 p-4">
                        {/* <div><strong>Type:</strong> {req.type}</div> */}
                        <div><strong>Items:</strong> {req.items.map(i => `${i.quantity} × ${i.name}`).join(", ")}</div>
                        <div><strong>By:</strong> {req.person}</div>
                        {req.timestamp ? (
                          <>
                            <div><strong>Date:</strong> {new Date(req.timestamp as string).toISOString().split("T")[0]}</div>
                            <div><strong>Time:</strong> {new Date(req.timestamp as string).toTimeString().split(" ")[0]}</div>
                          </>
                        ) : (
                          <div><em>No timestamp available</em></div>
                        )}


                        <div><strong>Status:</strong> {req.status}</div>
                        <div className="space-x-2 pt-2">
                          <Button size="sm" onClick={() => dispatch(updateOrderStatus({ id: req._id, status: "In Progress" }))}>Accept</Button>
                          <Button size="sm" variant="outline" onClick={() => dispatch(updateOrderStatus({ id: req._id, status: "Answered" }))}>Answered</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )))}
              </div>
            )}
          </CardContent>
        </Card>


        <Card>
          <CardContent className="p-4 md:p-6">
            <h2 className="text-xl font-semibold mb-4">In Progress Requests</h2>
            {inProgressOrders.length === 0 ? (
              <div className="text-gray-500">No requests in progress.</div>
            ) : viewMode === "list" ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-200 dark:bg-gray-700">
                    <th className="p-2">Type & Items</th>
                    <th className="p-2">Requested By</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Time</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inProgressOrders.map(req => (
                    <tr key={req._id} className="border-b align-top">
                      <td className="p-2">
                        <div className="font-semibold italic">{req.type}</div>
                        <div className="text-sm italic">
                          {req.items.map(item => `${item.quantity} × ${item.name}`).join(", ")}
                        </div>
                      </td>
                      <td className="p-2">{req.person}</td>
                      <td className="p-2">{req.timestamp ? (

                        <>{new Date(req.timestamp as string).toISOString().split("T")[0]}</>


                      ) : (
                        <div><em>No timestamp available</em></div>
                      )}
                      </td>
                      <td className="p-2">{req.timestamp ? (


                        <> {new Date(req.timestamp as string).toTimeString().split(" ")[0]}</>

                      ) : (
                        <div><em>No timestamp available</em></div>
                      )}
                      </td>
                      <td className="p-2">{req.status}</td>
                      <td className="p-2">
                        <Button size="sm" variant="outline" onClick={() => dispatch(updateOrderStatus({ id: req._id, status: "Answered" }))}>
                          Mark as Answered
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inProgressOrders.map(req => (
                  <Card key={req._id}>
                    <CardContent className="space-y-2 p-4">
                      <div><strong>Type:</strong> {req.type}</div>
                      <div><strong>Items:</strong> {req.items.map(i => `${i.quantity} × ${i.name}`).join(", ")}</div>
                      <div><strong>By:</strong> {req.person}</div>
                      {req.timestamp ? (
                        <>
                          <div><strong>Date:</strong> {new Date(req.timestamp as string).toISOString().split("T")[0]}</div>
                          <div><strong>Time:</strong> {new Date(req.timestamp as string).toTimeString().split(" ")[0]}</div>
                        </>
                      ) : (
                        <div><em>No timestamp available</em></div>
                      )}

                      <div><strong>Status:</strong> {req.status}</div>
                      <div className="pt-2">
                        <Button size="sm" variant="outline" onClick={() => dispatch(updateOrderStatus({ id: req._id, status: "Answered" }))}>Mark as Answered</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>


        <Card>
          <CardContent className="p-4 md:p-6 space-y-6">
            <h2 className="text-xl font-semibold mb-4 ">Manage Categories </h2>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add New Category</h3>
              <Button size="lg" type="submit"  onClick={() => setShowCategoryModal(true)} className="mt-2 cursor-pointer hover:opacity-75 mr-5">
                Add
              </Button>
            </div>


            <div className="flex gap-4 flex-wrap items-start">
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <div key={cat._id} className="rounded-lg  border p-4 basis-[48%]  bg-white dark:bg-zinc-800 shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                      {editingCategoryId === cat._id ? (
                        <input
                          value={editedLabel}
                          onChange={(e) => setEditedLabel(e.target.value)}
                          onBlur={() => {
                            dispatch(updateCategory({ id: cat._id, newLabel: editedLabel }));
                            setEditingCategoryId(null);
                          }}
                          className="text-lg font-semibold border-b w-full dark:bg-zinc-800"
                          autoFocus
                        />
                      ) : (
                        <div className="flex justify-between w-full items-center">
                          <h3
                            className="text-lg font-semibold cursor-pointer"
                            onClick={() => {
                              setEditedLabel(cat.label);
                              setEditingCategoryId(cat._id);
                            }}
                          >
                            {cat.label}
                          </h3>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => dispatch(deleteCategory(cat._id))}
                          >
                            <FaTrashCan />
                          </Button>
                        </div>
                      )}
                    </div>

                    <ul className="space-y-2  ">
                      {cat.items.map(item => {
                        const isEditingItem = editingItem?.categoryId === cat._id && editingItem?.name === item.name;
                        return (
                          <li key={item.name} className="flex flex-col gap-2 text-sm border-b pb-2">
                            {isEditingItem ? (
                              <>
                                <input
                                  value={editedItemName}
                                  onChange={(e) => setEditedItemName(e.target.value)}
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
                                    onClick={() => {
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
                                        });
                                    }}
                                  >
                                    Save
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
                              <div className="flex justify-between items-center">
                                <span>{item.name}</span>
                                <div className="flex">
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
                                </div>
                              </div>
                            )}
                          </li>
                        );
                      })}

                    </ul>

                  

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const itemName = newItems[cat._id]?.trim();
                        if (itemName) {
                          const allowMultiple = itemOptions[cat._id] ?? false;
                          dispatch(addItemToCategory({ categoryId: cat._id, itemName, allowMultiple })).unwrap().then(() => {
                            dispatch(fetchCategories())
                          }).catch(() => { })

                          setNewItems(prev => ({ ...prev, [cat._id]: "" }));
                          setItemOptions(prev => ({ ...prev, [cat._id]: false }));
                        }
                      }}
                      className="flex flex-col gap-2 pt-2"
                    >
                      <input
                        name="itemName"
                        value={newItems[cat._id] || ""}
                        onChange={(e) => setNewItems(prev => ({ ...prev, [cat._id]: e.target.value }))}
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
                        Add
                      </Button>
                    </form>
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


        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="w-full max-w-md bg-white dark:bg-zinc-900 text-black dark:text-white rounded-lg shadow-lg">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Add New Category</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as any;
                    const label = form.catLabel.value.trim();

                    // Disallow special characters except space, dash, underscore
                    const isValid = /^[a-zA-Z0-9 _-]+$/.test(label);

                    if (!label || !isValid) {
                      toast.error("Category name should not contain special characters.");
                      return;
                    }
                    if (categories.some(cat => cat.label === label)) {
                      toast.error("Category already exists.");
                      return;
                    }
                    dispatch(createCategory({ label }));
                    setShowCategoryModal(false);
                  }}

                  className="space-y-4"
                >
                  <input
                    name="catLabel"
                    placeholder="Category Name"
                    className="w-full px-3 py-2 border rounded text-sm dark:bg-zinc-800"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCategoryModal(false)} type="button">Cancel</Button>
                    <Button type="submit" className="cursor-pointer">Add</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {showAdminSettings && (
          <UserSetting user={user} modalRef={modalRef} setShowSettings={setShowAdminSettings} userName={user?.username} setUserName={""} />
        )}

      </div>
    </div>
  );
}
