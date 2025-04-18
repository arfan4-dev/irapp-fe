// types/indexedDB.d.ts

export interface OfflineOrder {
  id?: number;
  userId: string;
  person: string;
  type: string;
  items: { name: string; quantity: number }[];
  status: "Pending" | "In Progress" | "Answered";
  timestamp: string;
}
