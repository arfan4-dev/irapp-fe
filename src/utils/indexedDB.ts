import { openDB } from "idb";

export const initDB = async () => {
  return openDB("AppDB", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("orders")) {
        db.createObjectStore("orders", { keyPath: "id", autoIncrement: true });
      }
    },
  });
};

export const saveOrderOffline = async (orderData: any) => {
  const db = await initDB();
  await db.add("orders", orderData);
};

export const getOfflineOrders = async () => {
  const db = await initDB();
  return db.getAll("orders");
};

export const clearOfflineOrders = async () => {
  const db = await initDB();
  await db.clear("orders");
};
