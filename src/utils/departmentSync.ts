// utils/departmentSync.ts
import { useEffect } from "react";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useDispatch } from "react-redux";
import {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  fetchDepartments,
} from "@/store/features/department/department";
import {
  
  getPendingDepartments,
  clearPendingDepartments,
  PendingDepartment,
} from "./departmentStorage";
import { AppDispatch } from "@/store";

export function useSyncPendingDepartments() {
  const isOnline = useOfflineStatus();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!isOnline) return;

    (async () => {
      const pendings: PendingDepartment[] = await getPendingDepartments();
      console.log("pendings:", pendings);
      for (const p of pendings) {
        try {
          if (p.action === "create") {
            await dispatch(createDepartment({ name: p.name })).unwrap();
          } else if (p.action === "update" && p.id) {
            await dispatch(
              updateDepartment({ id: p.id, name: p.name })
            ).unwrap();
          } else if (p.action === "delete" && p.id) {
            await dispatch(deleteDepartment(p.id)).unwrap();
          }
        } catch (e) {
          console.error("Failed to sync department", p, e);
        }
      }
      await clearPendingDepartments();
      // finally, refresh the list
      dispatch(fetchDepartments());
    })();
  }, [isOnline, dispatch]);
}
