import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import Header from '@/common/Header';
import useThemeMode from '@/hooks/useTheme';

export default function OrderPage() {
  const [filter, setFilter] = useState<'Answered' | 'In Progress' | 'Pending'>('Pending');
  const { theme, setTheme } = useThemeMode();
  const [showSettings, setShowSettings] = useState(false);
  const [serviceName] = useState('All Orders');

  const orders = useSelector((state: RootState) => state.orders.orders);
  const userName = 'John Smith'; // Replace with dynamic user if needed

  const filteredOrders = orders.filter((order) => {
    const isMine = order.person === userName;
    if (filter === 'Pending') return isMine && order.status === 'Pending';
    if (filter === 'In Progress') return isMine && order.status === 'In Progress';
    if (filter === 'Answered') return isMine && order.status === 'Answered';
    return false;
  });

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <Header
        theme={theme}
        serviceName={serviceName}
        setTheme={setTheme}
        setShowSettings={setShowSettings}
        showSettings={showSettings}
        location=""
      />

      <div className="h-[calc(100vh-61px)] bg-white dark:bg-gray-900 text-black dark:text-white p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="bg-white dark:bg-zinc-800 text-black dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm rounded">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">My Orders</h2>
                <Select value={filter} onValueChange={(val) => setFilter(val as any)}>
                  <SelectTrigger className="w-48 bg-white dark:bg-zinc-700 text-black dark:text-white border border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Filter Orders" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-800 text-black dark:text-white">
                    <SelectItem value="Pending">Pending Orders</SelectItem>
                    <SelectItem value="In Progress">In Progress Orders</SelectItem>
                    <SelectItem value="Answered">Answered Orders</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ✅ Scrollable area with dark mode support */}
              <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-3">
                {filteredOrders.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center italic">No orders found.</p>
                ) : (
                  filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-300 dark:border-gray-600 rounded p-3 text-sm bg-gray-50 dark:bg-zinc-900 text-black dark:text-white"
                    >
                      <div><strong>Status:</strong> {order.status}</div>
                      <div><strong>Items:</strong> {order.items.map((i) => `${i.quantity} × ${i.name}`).join(', ')}</div>
                      <div><strong>Time:</strong> {order.timestamp}</div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
