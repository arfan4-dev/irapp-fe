// utils/categoryStorage.ts
import { initDB } from "./indexedDB";

export const saveCategoryOffline = async (category:any) => {
  const db = await initDB();
  await db.add("categories", category);
};
 
export const savePendingCategoryUpdate = async (update:any) => {
  const db = await initDB();
  await db.add("pendingCategoryUpdates", update);
};

export const getOfflineCategories = async () => {
  const db = await initDB();
  return await db.getAll("pendingCategoryUpdates"); // store used earlier for offline categories
};


export const savePendingCategoryItem = async (payload: {
  categoryId: string,
   itemName: string,allowMultiple: boolean ;
}) => {
  const db = await initDB();
  await db.add("pendingCategoryItems", payload);
};
export const getPendingCategoryItems = async () => {
  const db = await initDB();
  return db.getAll("pendingCategoryItems");
};