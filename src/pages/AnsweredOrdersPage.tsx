import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/common/Header";
import useThemeMode from "@/hooks/useTheme";

export default function AnsweredOrdersPage() {
    const { theme, setTheme } = useThemeMode(); // now you have access to theme and toggle
    const [showSettings, setShowSettings] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [serviceName] = useState("Answered Requests");

    const orders = useSelector((state: RootState) =>
        (state.orders as RootState['orders']).orders.filter(order => order.status === 'Answered')
    );

    return (
        <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}>
            <Header
                theme={theme}
                setTheme={setTheme}
                serviceName={serviceName}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
            />

            <div className="max-w-5xl mx-auto space-y-6 p-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Answered Requests</h2>
                    <Button
                        className="text-black dark:bg-black dark:text-white"
                        variant="outline"
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    >
                        Switch to {viewMode === 'grid' ? 'List' : 'Grid'} View
                    </Button>
                </div>

                {orders.length === 0 ? (
                    <p className="text-center text-gray-500">No answered requests available.</p>
                ) : viewMode === 'list' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-200 dark:bg-gray-700">
                                    <th className="p-2">Type & Items</th>
                                    <th className="p-2">Requested By</th>
                                    <th className="p-2">Timestamp</th>
                                    <th className="p-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} className="border-b align-top">
                                        <td className="p-2">
                                            <div className="font-semibold italic inline-block mr-2">{order.type}</div>
                                            <span className="text-sm italic">{order.items.map(item => `${item.quantity} × ${item.name}`).join(', ')}</span>
                                        </td>
                                        <td className="p-2">{order.person}</td>
                                        <td className="p-2">{order.timestamp}</td>
                                        <td className="p-2">{order.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {orders.map((order) => (
                            <Card key={order.id} className="border">
                                <CardContent className="p-4 space-y-2">
                                    <div><strong>Type:</strong> {order.type}</div>
                                    <div>
                                        <strong>Items:</strong> {order.items.map(item => `${item.quantity} × ${item.name}`).join(', ')}
                                    </div>
                                    <div><strong>By:</strong> {order.person}</div>
                                    <div><strong>Time:</strong> {order.timestamp}</div>
                                    <div><strong>Status:</strong> {order.status}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
