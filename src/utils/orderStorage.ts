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

export const deleteOfflineOrder = async (id: number) => {
  const db = await initDB();
  await db.delete("orders", id);
};
