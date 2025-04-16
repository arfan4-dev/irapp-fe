
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/common/Header";
import { addOrder } from "@/store/slices/orderSlice";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import useThemeMode from '@/hooks/useTheme';
import { getUserIdFromLocalStorage } from '@/utils/getUserId';
import UserSetting from '@/common/UserSetting';

export default function UserPage() {
  const [selectedRequest, setSelectedRequest] = useState('');
  const [notes, setNotes] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [userName, setUserName] = useState('John Smith');
  const [submitted, setSubmitted] = useState(false);
  const { theme, setTheme } = useThemeMode(); // now you have access to theme and toggle
  const [serviceName] = useState("IntraServe Desk");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<{ [key: string]: { name: string; quantity: number } }>({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const dispatch = useDispatch();
  const categories = useSelector((state: RootState) => state.categories.categories);
  const user = useSelector((state: RootState) => state?.user?.currentUser?.data);

  const submitRequest = () => {
    setShowConfirmModal(true);
  };

  const confirmSendOrder = () => {
    const orderItems = Object.entries(cart).map(([name, { quantity }]) => ({ name, quantity }));
    dispatch(addOrder({
      type: selectedRequest,
      person: userName,
      items: orderItems,
      status: 'Pending',
    }));

    setSubmitted(true);
    setShowConfirmModal(false);
    setShowSuccessPopup(true); // ✅ show success message

    setTimeout(() => {
      setSubmitted(false);
      setSelectedRequest('');
      setItemQuantities({});
      setCart({});
      setNotes('');
    }, 100);
    setTimeout(() => setShowSuccessPopup(false), 3000);

  };

  const handleQuantityChange = (item: string, quantity: number) => {
    setItemQuantities(prev => ({ ...prev, [item]: quantity }));
  };

  const handleAddToCart = (item: string, quantity: number) => {
    if (quantity > 0) {
      setCart(prev => ({ ...prev, [item]: { name: item, quantity } }));
    }
  };

  const modalRef = useRef<HTMLDivElement>(null);

  // Close on outside click
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
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <Header
        theme={theme}
        setTheme={setTheme}
        serviceName={serviceName}
        setShowSettings={setShowSettings}
        showSettings={showSettings}
        location=''
      />

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 space-y-4">
            {categories.map((type) => (
              <Button
                key={type.id}
                variant={selectedRequest === type.id ? "default" : "outline"}
                className={`w-full border hover:cursor-pointer ${selectedRequest !== type.id
                  ? theme === 'dark'
                    ? 'border-white text-white hover:bg-white hover:text-black'
                    : 'border-black text-black hover:bg-black hover:text-white'
                  : ''}`}
                onClick={() => setSelectedRequest(type.id)}
              >
                {type.label}
              </Button>
            ))}
          </div>

          <div className="flex-1 space-y-4">
            {!selectedRequest && (
              <Card className="text-center p-6 text-gray-500 dark:text-gray-400">
                <CardContent>
                  <h2 className="text-2xl font-semibold mb-2">Welcome to IntraServe Desk</h2>
                  <p className="text-sm">Please select a category to begin your request.</p>
                </CardContent>
              </Card>
            )}

            {selectedRequest && (
              <Card>
                <CardContent className="space-y-4 p-4 md:px-6 md:py-2">
                  <h2 className="text-xl font-semibold">Submit a Request</h2>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Select Items & Quantity</h3>
                    <div className="space-y-2">
                      {categories.find(r => r.id === selectedRequest)?.items.map(item => {
                        const quantity = itemQuantities[item.name] || 1;
                        return (
                          <Card key={item.name} className="p-[13px] flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="text-lg font-medium w-[15%]">{item.name}</div>
                            {item.allowMultiple ? (
                              <div className="flex items-center gap-3">
                                <Button variant="outline" onClick={() => handleQuantityChange(item.name, Math.max(1, quantity - 1))}>–</Button>
                                <span className="min-w-[24px] text-center">{quantity}</span>
                                <Button variant="outline" onClick={() => handleQuantityChange(item.name, quantity + 1)}>+</Button>
                              </div>
                            ) : (
                              <div className="italic text-sm text-gray-500">One per request</div>
                            )}
                            <Button onClick={() => {
                              submitRequest();
                              handleAddToCart(item.name, item.allowMultiple ? quantity : 1);
                            }}>Order</Button>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  <Textarea
                    placeholder="Optional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />

                  {Object.keys(cart).length > 0 && (
                    <>
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Your Cart</h3>
                        <div className="space-y-2">
                          {Object.entries(cart).map(([key, { name, quantity }]) => (
                            <div key={key} className="flex justify-between">
                              <span>{name}</span>
                              <span>{quantity} x</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {submitted && <div className="text-green-500">Request submitted!</div>}
                </CardContent>
              </Card>
            )}


          </div>
        </div>
      </div>
      
      {showSettings && (
        <UserSetting user={user} modalRef={modalRef} setShowSettings={setShowSettings} userName={user?.username} setUserName={setUserName} />
      )}

      {/* ✅ Single confirmation modal retained */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md bg-white text-black dark:bg-zinc-900 dark:text-white rounded-xl shadow-lg">
            <CardContent className=" space-y-6">
              <h2 className="text-xl font-semibold">Confirm Your Order</h2>
              <p>Would you like to send the order now or add more items?</p>
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Add More Items</Button>
                <Button className="bg-black text-white dark:bg-white dark:text-black" onClick={confirmSendOrder}>Send Order</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-[400px] h-[170px] text-black dark:text-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 animate-fade-in">
            {/* Tick animation */}
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600 animate-ping-once" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold">Order Placed Successfully!</p>
          </div>
        </div>
      )}


    </div>
  );
}