import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import {
  updateOrderStatus
} from "@/store/slices/orderSlice";
import {
  addCategory,
  addItemToCategory,
  removeItemFromCategory,
  updateCategory,
  removeCategory
} from "@/store/slices/categorySlice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/common/Header";
import { FaTrashCan } from "react-icons/fa6";
import { useLocation } from "react-router-dom";
import useThemeMode from "@/hooks/useTheme";

export default function AdminPage() {
    const { theme, setTheme } = useThemeMode(); // now you have access to theme and toggle
  const [showSettings, setShowSettings] = useState(false);
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
  const dispatch = useDispatch();

  const pendingOrders = orders.filter(order => order.status === "Pending");
  const inProgressOrders = orders.filter(order => order.status === "In Progress");

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}>
      <Header
        location={location.pathname}
        theme={theme}
        serviceName={serviceName}
        setTheme={setTheme}
        setShowSettings={setShowSettings}
        showSettings={showSettings}
      />

      <div className="max-w-5xl mx-auto space-y-6 p-4">
        {/* Toggle View Button */}
        <div className="flex justify-end">
          <Button
            className="text-black dark:bg-black dark:text-white"
            variant="outline"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            Switch to {viewMode === "grid" ? "List" : "Grid"} View
          </Button>
        </div>

        {/* Pending Requests */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
            {viewMode === "list" ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-200 dark:bg-gray-700">
                    <th className="p-2">Type & Items</th>
                    <th className="p-2">Requested By</th>
                    <th className="p-2">Timestamp</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map(req => (
                    <tr key={req.id} className="border-b align-top">
                      <td className="p-2">
                        <div className="font-semibold italic">{req.type}</div>
                        <div className="text-sm italic">
                          {req.items.map(item => `${item.quantity} × ${item.name}`).join(", ")}
                        </div>
                      </td>
                      <td className="p-2">{req.person}</td>
                      <td className="p-2">{req.timestamp}</td>
                      <td className="p-2">{req.status}</td>
                      <td className="p-2 space-x-2">
                        <Button size="sm" onClick={() => dispatch(updateOrderStatus({ id: req.id, status: "In Progress" }))}>
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => dispatch(updateOrderStatus({ id: req.id, status: "Answered" }))}>
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
                    pendingOrders.length === 0 ? (<div className="text-gray-500">No requests in pending.</div>): (pendingOrders.map(req => (
                  <Card key={req.id}>
                    <CardContent className="space-y-2 p-4">
                      <div><strong>Type:</strong> {req.type}</div>
                      <div><strong>Items:</strong> {req.items.map(i => `${i.quantity} × ${i.name}`).join(", ")}</div>
                      <div><strong>By:</strong> {req.person}</div>
                      <div><strong>Time:</strong> {req.timestamp}</div>
                      <div><strong>Status:</strong> {req.status}</div>
                      <div className="space-x-2 pt-2">
                        <Button size="sm" onClick={() => dispatch(updateOrderStatus({ id: req.id, status: "In Progress" }))}>Accept</Button>
                        <Button size="sm" variant="outline" onClick={() => dispatch(updateOrderStatus({ id: req.id, status: "Answered" }))}>Answered</Button>
                      </div>
                    </CardContent>
                  </Card>
                )))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* In Progress Requests */}
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
                    <th className="p-2">Timestamp</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inProgressOrders.map(req => (
                    <tr key={req.id} className="border-b align-top">
                      <td className="p-2">
                        <div className="font-semibold italic">{req.type}</div>
                        <div className="text-sm italic">
                          {req.items.map(item => `${item.quantity} × ${item.name}`).join(", ")}
                        </div>
                      </td>
                      <td className="p-2">{req.person}</td>
                      <td className="p-2">{req.timestamp}</td>
                      <td className="p-2">{req.status}</td>
                      <td className="p-2">
                        <Button size="sm" variant="outline" onClick={() => dispatch(updateOrderStatus({ id: req.id, status: "Answered" }))}>
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
                  <Card key={req.id}>
                    <CardContent className="space-y-2 p-4">
                      <div><strong>Type:</strong> {req.type}</div>
                      <div><strong>Items:</strong> {req.items.map(i => `${i.quantity} × ${i.name}`).join(", ")}</div>
                      <div><strong>By:</strong> {req.person}</div>
                      <div><strong>Time:</strong> {req.timestamp}</div>
                      <div><strong>Status:</strong> {req.status}</div>
                      <div className="pt-2">
                        <Button size="sm" variant="outline" onClick={() => dispatch(updateOrderStatus({ id: req.id, status: "Answered" }))}>Mark as Answered</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Manage Categories */}
        <Card>
          <CardContent className="p-4 md:p-6 space-y-6">
            <h2 className="text-xl font-semibold mb-4">Manage Categories</h2>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add New Category</h3>
              <Button size="lg" type="submit" onClick={() => setShowCategoryModal(true)} className="mt-2 cursor-pointer">
                Add
              </Button>
            </div>


            <div className="grid gap-6 sm:grid-cols-2">
              {categories.map((cat) => (
                <div key={cat.id} className="rounded-lg border p-4 bg-white dark:bg-zinc-800 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    {editingCategoryId === cat.id ? (
                      <input
                        value={editedLabel}
                        onChange={(e) => setEditedLabel(e.target.value)}
                        onBlur={() => {
                          dispatch(updateCategory({ id: cat.id, newLabel: editedLabel }));
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
                            setEditingCategoryId(cat.id);
                          }}
                        >
                          {cat.label}
                        </h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => dispatch(removeCategory(cat.id))}
                        >
                          <FaTrashCan />
                        </Button>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {cat.items.map(item => (
                      <li key={item.name} className="flex justify-between text-sm border-b pb-1">
                        <span>{item.name}</span>
                        <Button size="sm" variant="ghost" onClick={() => dispatch(removeItemFromCategory({ categoryId: cat.id, itemName: item.name }))}>Remove</Button>
                      </li>
                    ))}
                  </ul>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const itemName = newItems[cat.id]?.trim();
                      if (itemName) {
                        const allowMultiple = itemOptions[cat.id] ?? false;
                        dispatch(addItemToCategory({ categoryId: cat.id, itemName, allowMultiple }));
                        setNewItems(prev => ({ ...prev, [cat.id]: "" }));
                        setItemOptions(prev => ({ ...prev, [cat.id]: false }));
                      }
                    }}
                    className="flex flex-col gap-2 pt-2"
                  >
                    <input
                      name="itemName"
                      value={newItems[cat.id] || ""}
                      onChange={(e) => setNewItems(prev => ({ ...prev, [cat.id]: e.target.value }))}
                      placeholder="New item"
                      className="px-3 py-1.5 border rounded text-sm dark:bg-zinc-900"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={itemOptions[cat.id] || false}
                        onChange={(e) => setItemOptions(prev => ({ ...prev, [cat.id]: e.target.checked }))}
                      />
                      Allow Quantity Selection (+ / -)
                    </label>
                    <Button size="sm" type="submit" disabled={!newItems[cat.id]?.trim()}>
                      Add
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Modal */}
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
                    if (!label) return;
                    const id = label.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                    dispatch(addCategory({ id, label }));
                    form.reset();
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
                    <Button type="submit">Add</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
