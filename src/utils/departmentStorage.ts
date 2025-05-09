// utils/departmentStorage.ts
import { initDB } from "./indexedDB";

export interface PendingDepartment {
  tempId?: number;
  id?: string; // existing department _id, for updates/deletes
  name: string;
  action: "create" | "update" | "delete";
}

export async function savePendingDepartment(
  dep: Omit<PendingDepartment, "tempId">
) {
  const db = await initDB();
  return db.add("pendingDepartments", dep);
}

export async function getPendingDepartments(): Promise<PendingDepartment[]> {
  const db = await initDB();
  return db.getAll("pendingDepartments");
}

export async function clearPendingDepartments() {
  const db = await initDB();
  const tx = db.transaction("pendingDepartments", "readwrite");
  await tx.store.clear();
  await tx.done;
}
