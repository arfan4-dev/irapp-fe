import { openDB } from "idb";

export const initDB = async () => {
  return openDB("AppDB", 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("orders")) {
        db.createObjectStore("orders", { keyPath: "id", autoIncrement: true });
      }

      if (!db.objectStoreNames.contains("pendingStatusUpdates")) {
        db.createObjectStore("pendingStatusUpdates", { keyPath: "id" }); // id = orderId
      }
    },
  });
};
