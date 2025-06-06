import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/common/Header";
import { useLocation } from "react-router-dom";
import useThemeMode from "@/hooks/useTheme";
import { fetchOrdersForStaff, getOrdersByUser, updateOrderStatus } from "@/store/features/order/order";
import UserSetting from "@/common/UserSetting";
import { getUserIdFromLocalStorage } from "@/utils/getUserId";
import { toast } from "sonner";
import { getOfflineOrders, saveStatusUpdateOffline } from "@/utils/orderStorage";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { updateOrderStatusSync } from "@/utils/orderSync";
import { setOrder } from "@/store/slices/orderSlice";
import useViewMode from "@/hooks/useViewMode";
import { Input } from "@/components/ui/input";
// import useUsername from "@/hooks/useUsername";
import ActionFeedbackModal from "@/components/modal/ActionFeedbackModal";
import { fetchDepartments } from "@/store/features/department/department";
import { isSameDate } from "@/utils/isSameDate";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
export default function AdminPage() {
  const { theme, setTheme } = useThemeMode(); // now you have access to theme and toggle
  const user = useSelector((state: RootState) => state?.user?.currentUser?.data);
  updateOrderStatusSync()
  const [showSettings, setShowSettings] = useState(false);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [serviceName] = useState(user?.role === "admin" ? "Admin Panel" : "Staff Panel");
  const { viewMode, toggleViewMode } = useViewMode();
  const location = useLocation()
  const allOrders = useSelector((state: RootState) => state?.orders?.orders);
  const [pendingPage, setPendingPage] = useState(1);
  const [progressPage, setProgressPage] = useState(1);
  const ORDERS_PER_PAGE = 6;

  const [feedbackModal, setFeedbackModal] = useState<{
    open: boolean;
    type?: any;
    title?: string;
    message?: string;
    onConfirm?: () => void;
  }>({
    open: false,
    type: "add",
  });
  const dispatch = useDispatch<AppDispatch>();
  const isOnline = useOfflineStatus();
  const [pendingFilters, setPendingFilters] = useState({
    item: "",
    person: "",
    date: null as Date | null,
  });
  const [progressFilters, setProgressFilters] = useState({ item: "", person: "", date: null as Date | null, });
  const [sortOrderAsc, setSortOrderAsc] = useState(true);


  const orders = useMemo(() => {
    if (!user) return [];

    if (user.role === "admin") {
      return allOrders; // admin sees all
    }
    if (user.role === "staff") {
      // return allOrders; // admin sees all
      return allOrders; // staff sees only department-specific orders
    }

    return []; // default fallback
  }, [allOrders, user]);
  // const { userIdToUsername } = useUsername(orders)
  const pendingOrders = orders.filter(order => order.status === "Pending");
  const inProgressOrders = orders.filter(order => order.status === "In Progress");
  // const { config } = useSelector((state: RootState) => state.siteConfig);


  const applyFiltersAndSort = (
    orders: typeof pendingOrders,
    filters: { item: string; person: string; date: Date | null }
  ) => {
    const filtered = orders.filter(order => {
      const matchItem = filters.item
        ? order.items.some(i => i.name.toLowerCase().includes(filters.item.toLowerCase()))
        : true;

      const matchPerson = filters.person
        ? (order.person?.toLowerCase().includes(filters.person.toLowerCase()) ?? false)
        : true;

      const matchDate = filters.date
        ? isSameDate(new Date(order.timestamp as string), filters.date)
        : true;

      return matchItem && matchPerson && matchDate;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp as string).getTime();
      const dateB = new Date(b.timestamp as string).getTime();
      return sortOrderAsc ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  };


  interface pendingFilters {
    item: string;
    person: string;
    date: Date | null;
  }
  const filteredPendingOrders = applyFiltersAndSort(pendingOrders, pendingFilters);
  const filteredInProgressOrders = applyFiltersAndSort(inProgressOrders, progressFilters);

  const paginatedPendingOrders = filteredPendingOrders.slice((pendingPage - 1) * ORDERS_PER_PAGE, pendingPage * ORDERS_PER_PAGE);
  const paginatedInProgressOrders = filteredInProgressOrders.slice((progressPage - 1) * ORDERS_PER_PAGE, progressPage * ORDERS_PER_PAGE);


  const handleStatusUpdate = async (orderId: string, status: string) => {
    if (isOnline) {
      // await dispatch(updateOrderStatus({ id: orderId, status }));
      await dispatch(updateOrderStatus({ id: orderId, status }))
        .unwrap()
        .then(() => {
          setFeedbackModal({
            open: true,
            type: 'add',
            title: status === "In Progress" ? "Order Accepted" : "Order Completed",
            message:
              status === "In Progress"
                ? "The order has been accepted and is now being processed."
                : "The order has been marked as completed successfully.",
          });
        });
    } else {
      await saveStatusUpdateOffline(orderId, status);

      // ✅ 2. Immediately reflect in Redux state (optimistic update)
      dispatch(setOrder(
        orders.map(order =>
          order._id === orderId ? { ...order, status } : order
        )
      ));

      toast.success("Status change saved offline and will sync once online.");
    }
  };

  // offline orders
  useEffect(() => {
    const loadOrders = async () => {
      if (isOnline) {
        dispatch(getOrdersByUser());
        dispatch(fetchDepartments());

      } else {
        const offlineOrderStatus = await getOfflineOrders();
        dispatch(setOrder([...orders, ...offlineOrderStatus])); // ✅ use actual action
        toast.info("Showing offline categories.");
      }

    };

    loadOrders()
  }, [dispatch, isOnline]);


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
    setPendingPage(1);
  }, [pendingFilters.item, pendingFilters.person, pendingFilters.date]);

  // Reset progressPage to 1 when filters change
  useEffect(() => {
    setProgressPage(1);
  }, [progressFilters.item, progressFilters.person, progressFilters.date]);

  useEffect(() => {
    if (user?.role === "staff" && user.department) {
      dispatch(fetchOrdersForStaff(user.department));
    }
  }, [dispatch, user]);
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

      <div className="max-w-7xl mx-auto space-y-6 p-4">
        <div className="flex gap-5 justify-end">
          <Button
            className="text-black dark:bg-black dark:text-white"
            variant="outline"
            onClick={toggleViewMode}
          >
            Switch to {viewMode === "grid" ? "List" : "Grid"} View
          </Button>
          <div className="flex justify-end mb-4">
            <Button
              className="text-black dark:bg-black dark:text-white"
              variant="outline"
              onClick={() => setSortOrderAsc(prev => !prev)}
            >
              Sort {sortOrderAsc ? "Ascending" : " Descending"}
            </Button>
          </div>

        </div>
        <div >


          <Card className="overflow-x-auto ">
            <div className={` ${viewMode === "grid" ? "sm:flex gap-5" : "space-y-5"} `}>


              <div className="w-full">
                <CardContent className="px-4 md:px-6 ">

                  <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
                  {<div className="flex flex-wrap gap-2 mb-4">
                    <Input
                      type="text"
                      placeholder="Search by Item Name"
                      className="w-48 placeholder:text-[12px] placeholder:md:text-[14px]"
                      value={pendingFilters.item}
                      onChange={(e) => setPendingFilters(prev => ({ ...prev, item: e.target.value }))}
                    />
                    <Input
                      type="text"
                      placeholder="Search by Requested By"
                      className="w-48 placeholder:text-[12px] placeholder:md:text-[14px]"
                      value={pendingFilters.person}
                      onChange={(e) => setPendingFilters(prev => ({ ...prev, person: e.target.value }))}
                    />
                    <DatePicker
                      selected={pendingFilters.date}
                      onChange={(date: Date | null) => setPendingFilters(prev => ({ ...prev, date }))}
                      placeholderText="DD/MM/YYYY"
                      dateFormat="dd/MM/yyyy"
                      className="w-40 md:w-[145px] text-sm px-2 py-[7px] cursor-pointer border rounded dark:bg-zinc-900"
                    />

                    <Button
                      className="cursor-pointer text-[14px] md:text-[16px]"

                      variant="outline"
                      onClick={() => setPendingFilters({ item: "", person: "", date: null })}
                    >
                      Clear Filters
                    </Button>
                  </div>}

                  {viewMode === "list" ? (
                    <table className="w-full text-left ">
                      <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700">
                          <th className="p-2">Items</th>
                          <th className="p-2">Requested By</th>
                          {/* <th className="p-2">Department</th> */}
                          <th className="p-2">Location</th>

                          <th className="p-2">Date</th>
                          <th className="p-2">Time</th>
                          <th className="p-2">Status</th>
                          {user.role === 'staff' ? <th className="p-2">Actions</th> : <th></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedPendingOrders.map(req => (
                          <tr key={req._id} className="border-b align-top">
                            <td className="p-2">
                              {/* <div className="font-semibold italic">{req.type}</div> */}
                              <div className="text-sm italic">
                                {req.items.map(item => `${item.quantity} × ${item.name}`).join(", ")}
                              </div>
                            </td>
                            <td className="p-2"> {req.person || "Loading..."}</td>
                            {/* <td className="p-2">{req.department}</td> */}
                            <td className="p-2">{req.location}</td>
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

                              {user.role === 'staff' && <Button
                                className="cursor-pointer hover:opacity-75"
                                size="sm"
                                onClick={() => handleStatusUpdate(req._id!, "In Progress")}
                              >
                                Accept
                              </Button>}

                              {/* <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(req._id!, "Answered")}
                        >
                          Answered
                        </Button> */}

                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                      {
                        paginatedPendingOrders.length === 0 ? (<div className="text-gray-500">No requests in pending.</div>) : (paginatedPendingOrders.map(req => (
                          <Card key={req._id}>
                            <CardContent className={`space-y-2  ${user.role === 'staff' ? "p-4" : "px-4"}`}>
                              {/* <div><strong>Type:</strong> {req.type}</div> */}
                              <div><strong>Items:</strong> {req.items.map(i => `${i.quantity} × ${i.name}`).join(", ")}</div>
                              <div><strong>By:</strong> {req.person || "Loading..."}</div>
                              {/* <div><strong>Department:</strong> {req.department}</div> */}
                              <div><strong>Location:</strong> {req.location}</div>
                              {req.timestamp ? (
                                <>
                                  <div><strong>Date:</strong> {new Date(req.timestamp as string).toISOString().split("T")[0]}</div>
                                  <div><strong>Time:</strong> {new Date(req.timestamp as string).toTimeString().split(" ")[0]}</div>
                                </>
                              ) : (
                                <div><em>No timestamp available</em></div>
                              )}


                              <div><strong>Status:</strong> {req.status}</div>
                              {user.role === 'staff' && <div className="space-x-2 pt-2">
                                {/* <Button size="sm" onClick={() => dispatch(updateOrderStatus({ id: req._id, status: "In Progress" }))}>Accept</Button>
                          <Button size="sm" variant="outline" onClick={() => dispatch(updateOrderStatus({ id: req._id, status: "Answered" }))}>Answered</Button> */}
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(req._id!, "In Progress")}
                                  className="cursor-pointer hover:opacity-75"
                                >
                                  Accept
                                </Button></div>}

                              {/* <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(req._id!, "Answered")}
                          >
                            Answered
                          </Button> */}

                            </CardContent>
                          </Card>
                        )))}
                    </div>
                  )}
                  {<div className="flex justify-end gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                      disabled={pendingPage === 1}
                      onClick={() => setPendingPage(prev => Math.max(prev - 1, 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                      disabled={pendingPage * ORDERS_PER_PAGE >= filteredPendingOrders.length}
                      onClick={() => setPendingPage(prev => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>}
                </CardContent>


              </div>
              <div className={`border border-l mx-2 sm:mx-0  ${viewMode !== "grid" && "mx-5"} `} />
              <div className="w-full">
                <CardContent className="px-4 md:px-6 ">
                  <h2 className="text-xl font-semibold mb-4">In Progress Requests</h2>
                  {<div className="flex flex-wrap gap-2 mb-4">
                    <Input
                      type="text"
                      placeholder="Search by Item Name"
                      className="w-48 placeholder:text-[12px] placeholder:md:text-[14px]"
                      value={progressFilters.item}
                      onChange={(e) => setProgressFilters(prev => ({ ...prev, item: e.target.value }))}
                    />
                    <Input
                      type="text"
                      placeholder="Search by Requested By"
                      className="w-48 placeholder:text-[12px] placeholder:md:text-[14px]"
                      value={progressFilters.person}
                      onChange={(e) => setProgressFilters(prev => ({ ...prev, person: e.target.value }))}
                    />
                    {/* <Input
                      type="date"
                      className="w-40 md:w-[145px] "
                      value={progressFilters.date}
                      onChange={(e) => setProgressFilters(prev => ({ ...prev, date: e.target.value }))}
                    /> */}
                    <DatePicker
                      selected={progressFilters.date}
                      onChange={(date: Date | null) => setProgressFilters(prev => ({ ...prev, date }))}
                      placeholderText="DD/MM/YYYY"
                      dateFormat="dd/MM/yyyy"
                      className="w-40 md:w-[145px] text-sm px-2 py-[7px] cursor-pointer border rounded dark:bg-zinc-900"
                    />

                    <Button
                      className="cursor-pointer text-[14px] md:text-[16px]"
                      variant="outline"
                      onClick={() => setProgressFilters({ item: "", person: "", date: null })}
                    >
                      Clear Filters
                    </Button>
                  </div>}
                  {paginatedInProgressOrders.length === 0 ? (
                    <div className="text-gray-500">No requests in progress.</div>
                  ) : viewMode === "list" ? (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700">
                          <th className="p-2">Items</th>
                          <th className="p-2">Requested By</th>
                          {/* <th className="p-2">Department</th> */}
                          <th className="p-2">Location</th>
                          <th className="p-2">Date</th>
                          <th className="p-2">Time</th>
                          <th className="p-2">Status</th>
                          {user.role === 'staff' ? <th className="p-2">Actions</th> : <th></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedInProgressOrders.map(req => (
                          <tr key={req._id} className="border-b align-top">
                            <td className="p-2">
                              {/* <div className="font-semibold italic">{req.type}</div> */}
                              <div className="text-sm italic">
                                {req.items.map(item => `${item.quantity} × ${item.name}`).join(", ")}
                              </div>

                            </td>
                            {/* <td> <div className="p-2">{req.department}</div></td> */}
                            <td> <div className="p-2">{req.location}</div></td>
                            <td className="p-2">{req.person || "Loading..."}</td>
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
                              {/* <Button size="sm" variant="outline" onClick={() => dispatch(updateOrderStatus({ id: req._id, status: "Answered" }))}>
                          Mark as Answered
                        </Button> */}
                              {user.role === 'staff' && <Button className="cursor-pointer hover:opacity-75" size="sm" variant="outline" onClick={() => handleStatusUpdate(req._id!, "Answered")}
                              >
                                Mark as Answered
                              </Button>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full ">
                      {paginatedInProgressOrders.map(req => (
                        <div >
                          <Card key={req._id}>
                            <CardContent className={`space-y-2 min-w-full  ${user.role === 'staff' ? "p-4" : "px-4"}`}>
                              {/* <div><strong>Type:</strong> {req.type}</div> */}
                              <div><strong>Items:</strong> {req.items.map(i => `${i.quantity} × ${i.name}`).join(", ")}</div>
                              <div><strong>By:</strong> {req.person || "Loading..."}</div>
                              {/* <div><strong>Department:</strong> {req.department}</div> */}
                              <div><strong>Location:</strong> {req.location}</div>
                              {req.timestamp ? (
                                <>
                                  <div><strong>Date:</strong> {new Date(req.timestamp as string).toISOString().split("T")[0]}</div>
                                  <div><strong>Time:</strong> {new Date(req.timestamp as string).toTimeString().split(" ")[0]}</div>
                                </>
                              ) : (
                                <div><em>No timestamp available</em></div>
                              )}

                              <div><strong>Status:</strong> {req.status}</div>
                              {user.role === 'staff' && <div className="pt-2">
                                <Button className="cursor-pointer hover:opacity-75" size="sm" variant="outline" onClick={() => handleStatusUpdate(req._id!, "Answered")}>Mark as Answered</Button>
                              </div>}
                            </CardContent>
                          </Card></div>
                      ))}


                    </div>
                  )}

                  {<div className="flex justify-end gap-2  mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                      disabled={progressPage === 1}
                      onClick={() => setProgressPage(prev => Math.max(prev - 1, 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                      disabled={progressPage * ORDERS_PER_PAGE >= filteredInProgressOrders.length}
                      onClick={() => setProgressPage(prev => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>}
                </CardContent>

              </div>
            </div>
          </Card>


        </div>



        {showAdminSettings && (
          <UserSetting user={user} modalRef={modalRef} setShowSettings={setShowAdminSettings} userName={user?.username} setUserName={""} />
        )}
        <ActionFeedbackModal
          open={feedbackModal.open}
          type={feedbackModal.type}
          title={feedbackModal.title}
          message={feedbackModal.message}
          onConfirm={feedbackModal.onConfirm}
          onClose={() => setFeedbackModal({ ...feedbackModal, open: false })}
          loaderDelete={false}
        />


      </div>
    </div>
  );
}
