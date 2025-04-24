// src/hooks/useOrderSync.ts
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { createOrder, updateOrderStatus } from "@/store/features/order/order";
import { toast } from "sonner";
import { deleteOfflineOrders, getOfflineOrders } from "./orderStorage";
import { initDB } from "./indexedDB";

export const useOrderSync = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const syncOfflineOrders = async () => {
      try {
        const offlineOrders = await getOfflineOrders();
        if (offlineOrders.length === 0) return;
        console.log("Offline orders found:", offlineOrders);
        for (const order of offlineOrders) {
            try {
                 const { id, ...cleanOrder } = order;
                
              await dispatch(createOrder(cleanOrder)).unwrap();
              await deleteOfflineOrders(order.id);
              toast.success(
                `Offline order for ${order.person || "user"} synced.`
              );
            } catch (err) {
              console.error("Failed to sync order:", err);
            }
        }
      } catch (error) {
        console.error("Sync Error:", error);
      }
    };

    // Listen when user comes online
    window.addEventListener("online", syncOfflineOrders);

    // Optional: Run once at mount
    if (navigator.onLine) syncOfflineOrders();

    return () => {
      window.removeEventListener("online", syncOfflineOrders);
    };
  }, [dispatch]);
};

export const updateOrderStatusSync=()=>{
    const dispatch = useDispatch<AppDispatch>();
console.log("updateOrderStatusSync.....");
  useEffect(() => {
    const handlePendingStatusUpdatesSync = async () => {
      const db = await initDB();
      const updates = await db.getAll("pendingStatusUpdates");
      if (updates.length === 0) return;
      console.log("Pending status updates found:", updates);
      for (const update of updates) {
        try {
                await dispatch(
                  updateOrderStatus({ id: update.id, status: update.status })
                );
          toast.success(` Synced status for order ${update.id}`);
          await db.delete("pendingStatusUpdates", update.id);
          console.log(`✅ Synced status for order ${update.id}`);
        } catch (err) {
          console.error(
            `❌ Failed to sync status for order ${update.id}`,
            err
          );
        }
      }
    };

    window.addEventListener("online", handlePendingStatusUpdatesSync);

    // Optional: Run once at mount
    if (navigator.onLine) handlePendingStatusUpdatesSync();

    return () =>
      window.removeEventListener("online", handlePendingStatusUpdatesSync);
  }, [dispatch]);
}