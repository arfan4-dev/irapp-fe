import { openDB } from "idb";

export const initDB = async () => {
  return openDB("AppDB", 4, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("orders")) {
        db.createObjectStore("orders", { keyPath: "id", autoIncrement: true });
      }

      if (!db.objectStoreNames.contains("pendingStatusUpdates")) {
        db.createObjectStore("pendingStatusUpdates", { keyPath: "id" }); // id = orderId
      }
      if (!db.objectStoreNames.contains("categories")) {
        db.createObjectStore("categories", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains("pendingCategoryUpdates")) {
        db.createObjectStore("pendingCategoryUpdates", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
      // utils/indexedDB.ts
      if (!db.objectStoreNames.contains("pendingCategoryItems")) {
        db.createObjectStore("pendingCategoryItems", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    },
  });
};
