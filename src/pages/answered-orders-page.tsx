import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/common/Header";
import useThemeMode from "@/hooks/useTheme";
import { useLocation } from "react-router-dom";
import UserSetting from "@/common/UserSetting";
import { getUserIdFromLocalStorage } from "@/utils/getUserId";
import useViewMode from "@/hooks/useViewMode";
import useUsername from "@/hooks/useUsername";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isSameDate } from "@/utils/isSameDate";
export default function AnsweredOrdersPage() {
    const { theme, setTheme } = useThemeMode();
    const [showSettings, setShowSettings] = useState(false);
    const { viewMode, toggleViewMode } = useViewMode();
    const [serviceName] = useState("Answered Requests");
    const location = useLocation();
    const modalRef = useRef<HTMLDivElement>(null);
    const user = useSelector((state: RootState) => state?.user?.currentUser?.data);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const allOrders = useSelector((state: RootState) =>
        (state.orders as RootState['orders']).orders.filter(order => order.status === 'Answered')
    );
    const { userIdToUsername } = useUsername(allOrders); // Assuming this is a custom hook to fetch usernames

    // Filters
    const [searchItem, setSearchItem] = useState("");
    const [searchPerson, setSearchPerson] = useState("");
    const [_, setSearchDate] = useState("");
    // Sort
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Default Descending
    const filteredOrders = allOrders
        .filter(order => {
            const itemMatch = order.items.some(item =>
                item.name.toLowerCase().includes(searchItem.toLowerCase())
            );

            const personMatch = searchPerson
                ? (userIdToUsername[order.userId]?.toLowerCase().includes(searchPerson.toLowerCase()) ?? false)
                : true;

            const dateMatch = selectedDate
                ? isSameDate(new Date(order.timestamp!), selectedDate)
                : true;


            return itemMatch && personMatch && dateMatch;
        })
        .sort((a, b) => {
            if (!a.timestamp || !b.timestamp) return 0;
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

    const totalPages = Math.ceil(filteredOrders.length / pageSize);
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    useEffect(() => {
        getUserIdFromLocalStorage();
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                setShowSettings(false);
            }
        };
        if (showSettings) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showSettings]);
    useEffect(() => {
        setCurrentPage(1);
    }, [searchItem, searchPerson, selectedDate]);

    return (
        <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"} `}>
            <Header
                theme={theme}
                setTheme={setTheme}
                serviceName={serviceName}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                location={location.pathname}
            />

            <div className="max-w-6xl mx-auto space-y-6 p-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <h2 className="text-2xl font-semibold">Answered Requests</h2>
                    <div className="flex flex-wrap gap-4">
                        <Button
                            className="text-black dark:bg-black dark:text-white"
                            variant="outline"
                            onClick={toggleViewMode}
                        >
                            Switch to {viewMode === 'grid' ? 'List' : 'Grid'} View
                        </Button>

                        <Button
                            className="text-black dark:bg-black dark:text-white"
                            variant="outline"
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        >
                            Sort: {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                {<div className="flex flex-wrap gap-4 mt-4">
                    <Input
                        placeholder="Search by Item Name"
                        value={searchItem}
                        onChange={(e) => setSearchItem(e.target.value)}
                        className="w-48"
                    />
                    <Input
                        placeholder="Search by Requested By"
                        value={searchPerson}
                        onChange={(e) => setSearchPerson(e.target.value)}
                        className="w-48"
                    />
                    {/* <Input
                        type="date"
                     
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="w-36 "
                    /> */}
                    <div className="datepicker-wrapper">
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => {
                                setSelectedDate(date);
                                if (date) {
                                    const formatted = date.toISOString().split("T")[0]; // yyyy-mm-dd
                                    setSearchDate(formatted);
                                } else {
                                    setSearchDate("");
                                }
                            }}
                            placeholderText="DD/MM/YYYY"
                            className="custom-datepicker-input"
                            dateFormat="dd/MM/yyyy"
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearchItem('');
                            setSearchPerson('');
                            setSearchDate('');
                            setSelectedDate(null); // Reset date picker
                            setSortOrder('desc'); // (optional) Sort reset bhi chahte ho to ye line
                        }}
                        className="w-48 cursor-pointer text-black dark:bg-black dark:text-white"
                    >
                        Clear Filters
                    </Button>
                </div>}

                {user?.role === 'admin' && <div>  {paginatedOrders.length === 0 ? (
                    <p className="text-center text-gray-500">No answered requests found.</p>
                ) : viewMode === 'list' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left mt-4">
                            <thead>
                                <tr className="bg-gray-200 dark:bg-gray-700">
                                    <th className="p-2"> Items</th>
                                    <th className="p-2">Requested By</th>
                                    <th className="p-2">Department</th>
                                    <th className="p-2">Location</th>
                                    <th className="p-2">Date</th>
                                    <th className="p-2">Time</th>
                                    <th className="p-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedOrders.map((order) => (
                                    <tr key={order._id} className="border-b align-top">
                                        <td className="p-2">
                                            {/* <div className="font-semibold italic">{order.type}</div> */}
                                            <div className="text-sm italic">{order.items.map(item => `${item.quantity} × ${item.name}`).join(', ')}</div>
                                        </td>
                                        <td className="p-2">{userIdToUsername[order.userId] || "Loading..."}</td>
                                        <td className="p-2">{order.department}</td>
                                        <td className="p-2">{order.location}</td>
                                        <td className="p-2">{order.timestamp ? new Date(order.timestamp).toISOString().split("T")[0] : "No date"}</td>
                                        <td className="p-2">{order.timestamp ? new Date(order.timestamp).toTimeString().split(" ")[0] : "No time"}</td>
                                        <td className="p-2">{order.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {paginatedOrders.map((order) => (
                            <Card key={order._id}>
                                <CardContent className="px-4 space-y-2">
                                    {/* <div><strong>Type:</strong> {order.type}</div> */}
                                    <div><strong>Items:</strong> {order.items.map(item => `${item.quantity} × ${item.name}`).join(', ')}</div>
                                    <div><strong>By:</strong> {userIdToUsername[order.userId] || "Loading..."}</div>
                                    <div><strong>Department:</strong> {order.department}</div>
                                    <div><strong>Location:</strong> {order.location}</div>
                                    {order.timestamp && (
                                        <>
                                            <div><strong>Date:</strong> {new Date(order.timestamp).toISOString().split("T")[0]}</div>
                                            <div><strong>Time:</strong> {new Date(order.timestamp).toTimeString().split(" ")[0]}</div>
                                        </>
                                    )}
                                    <div><strong>Status:</strong> {order.status}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}</div>}


                {user?.role === 'staff' && <div>
                    {
                        // ✅ Filter orders by department
                        user?.department
                            ? paginatedOrders.filter(order => order.department === user?.department).length === 0
                                ? (
                                    <p className="text-center text-gray-500">No answered requests found.</p>
                                ) : viewMode === 'list' ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left mt-4">
                                            <thead>
                                                <tr className="bg-gray-200 dark:bg-gray-700">
                                                    <th className="p-2"> Items</th>
                                                    <th className="p-2">Requested By</th>
                                                    <th className="p-2">Department</th>
                                                    <th className="p-2">Date</th>
                                                    <th className="p-2">Time</th>
                                                    <th className="p-2">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedOrders
                                                    .filter(order => order.department === user?.department)
                                                    .map((order) => (
                                                        <tr key={order._id} className="border-b align-top">
                                                            <td className="p-2">
                                                                {/* <div className="font-semibold italic">{order.type}</div> */}
                                                                <div className="text-sm italic">
                                                                    {order.items.map(item => `${item.quantity} × ${item.name}`).join(', ')}
                                                                </div>
                                                            </td>
                                                            <td className="p-2">{userIdToUsername[order.userId] || "Loading..."}</td>
                                                            <td className="p-2">{order.department}</td>
                                                            <td className="p-2">
                                                                {order.timestamp ? new Date(order.timestamp).toISOString().split("T")[0] : "No date"}
                                                            </td>
                                                            <td className="p-2">
                                                                {order.timestamp ? new Date(order.timestamp).toTimeString().split(" ")[0] : "No time"}
                                                            </td>
                                                            <td className="p-2">{order.status}</td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        {paginatedOrders
                                            .filter(order => order.department === user.department)
                                            .map((order) => (
                                                <Card key={order._id}>
                                                    <CardContent className="px-4 space-y-2">
                                                        {/* <div><strong>Type:</strong> {order.type}</div> */}
                                                        <div><strong>Items:</strong> {order.items.map(item => `${item.quantity} × ${item.name}`).join(', ')}</div>
                                                        <div><strong>By:</strong> {userIdToUsername[order.userId] || "Loading..."}</div>
                                                        {order.timestamp && (
                                                            <>
                                                                <div><strong>Date:</strong> {new Date(order.timestamp).toISOString().split("T")[0]}</div>
                                                                <div><strong>Time:</strong> {new Date(order.timestamp).toTimeString().split(" ")[0]}</div>
                                                            </>
                                                        )}
                                                        <div><strong>Department:</strong> {order.department}</div>
                                                        <div><strong>Status:</strong> {order.status}</div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                    </div>
                                )
                            : (
                                <p className="text-center text-gray-500">No department assigned to this user.</p>
                            )
                    }
                </div>
                }
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pb-2">
                    <Button className="cursor-pointer hover:opacity-85 disabled:cursor-not-allowed" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                        Previous
                    </Button>
                    <span className="text-sm">Page {currentPage} of {totalPages}</span>
                    <Button className="cursor-pointer hover:opacity-85 disabled:cursor-not-allowed" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                        Next
                    </Button>
                </div>
            )}
            {showSettings && (
                <UserSetting user={user} modalRef={modalRef} setShowSettings={setShowSettings} userName={user?.username} setUserName={""} />
            )}
        </div>
    );
}
