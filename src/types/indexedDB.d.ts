
export interface OfflineOrder {
  id?: number;
  userId: string;
  person: string;
  type: string;
  department:string;
  location:string;
  items: { name: string; quantity: number }[];
  status: "Pending" | "In Progress" | "Answered";
}
