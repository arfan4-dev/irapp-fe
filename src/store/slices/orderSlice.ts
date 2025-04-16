import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

export type OrderItem = {
  name: string;
  quantity: number;
};

export type Order = {
  id: string;
  type: string;
  person: string;
  items: OrderItem[];
  timestamp: string;
  status: "Pending" | "In Progress" | "Answered";
    answeredAt?: string; // ← time when answered

};

interface OrderState {
  orders: Order[];
}

const initialState: OrderState = {
  orders: [],
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    addOrder: (
      state,
      action: PayloadAction<Omit<Order, "id" | "timestamp">>
    ) => {
      state.orders.push({
        id: uuidv4(),
        timestamp: new Date().toLocaleTimeString(),
        ...action.payload,
      });
    },
    updateOrderStatus: (
      state,
      action: PayloadAction<{ id: string;status: "Pending" | "In Progress" | "Answered" }>
    ) => {
      const order = state.orders.find((o) => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;

        if (action.payload.status === "Answered") {
          order.timestamp = new Date().toLocaleTimeString(); // ✅ Timestamp update here
        }
      }
    },
  },
});

export const { addOrder, updateOrderStatus } = orderSlice.actions;
export default orderSlice.reducer;
