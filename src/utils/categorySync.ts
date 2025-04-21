import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { initDB } from "@/utils/indexedDB";
import { createCategory } from "@/store/features/category/category";
import { toast } from "sonner";
import api from "@/api/api";

export const useSyncPendingCategoryUpdates = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const syncOfflineCategory = async () => {
      const db = await initDB();
      const updates = await db.getAll("pendingCategoryUpdates");
console.log("useSyncPendingCategoryUpdates.......");

      if (updates.length === 0) return;

      for (const category of updates) {
        try {
          await dispatch(createCategory(category)).unwrap();
          await db.delete("pendingCategoryUpdates", category.id);
          toast.success(`✅ Synced category "${category.label}".`);
        } catch (err) {
          console.error("❌ Failed to sync category:", err);
        }
      }
    };

    window.addEventListener("online", syncOfflineCategory);

    if (navigator.onLine) syncOfflineCategory();

    return () => {
      window.removeEventListener("online", syncOfflineCategory);
    };
  }, [dispatch]);
};

export const useSyncPendingCategoryItems = () => {
  useEffect(() => {
    const syncOfflineItems = async () => {
      const db = await initDB();
      const pending = await db.getAll("pendingCategoryItems");
console.log('useSyncPendingCategoryItems.......');
      for (const entry of pending) {
        console.log("entry:", entry);
        try {
          await api.post(`/categories/${entry.categoryId}/items`, entry);
          await db.delete("pendingCategoryItems", entry.id);
          toast.success(`✔️ Synced item "${entry.itemName}"`);
        } catch (err) {
          console.error("❌ Sync failed:", err);
        }
      }
    };

    window.addEventListener("online", syncOfflineItems);
    if (navigator.onLine) syncOfflineItems();
    return () => window.removeEventListener("online", syncOfflineItems);
  }, []);
};