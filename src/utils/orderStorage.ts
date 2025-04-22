// utils/orderStorage.ts

import { initDB } from "./indexedDB";
import { OfflineOrder } from "@/types/indexedDB";

export const saveOrderOffline = async (order: OfflineOrder) => {
  const db = await initDB();
  await db.put("orders", order);
};

export const getOfflineOrders = async (): Promise<OfflineOrder[]> => {
  const db = await initDB();
  return await db.getAll("orders");
};

export const deleteOfflineOrders = async (id: any) => {
  const db = await initDB();
  await db.delete("orders", id);
};

export const getPendingStatusUpdates = async () => {
  const db = await initDB();
  return await db.getAll("pendingStatusUpdates"); // store used earlier for offline categories
};

export const saveStatusUpdateOffline = async (
  orderId: string,
  status: string
) => {
  const db = await initDB();

  // Always check if store exists
  if (!db.objectStoreNames.contains("pendingStatusUpdates")) {
    console.error("pendingStatusUpdates store not found in IndexedDB");
    return;
  }

  const tx = db.transaction("pendingStatusUpdates", "readwrite");
  const store = tx.objectStore("pendingStatusUpdates");

  await store.put({ id: orderId, status });
  await tx.done;
};
