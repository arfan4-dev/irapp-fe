// src/store/slices/orderSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  createOrder,
  fetchOrdersForStaff,
  getOrdersByUser,
  updateOrderStatus,
} from "@/store/features/order/order";

interface OrderItem {
  name: string;
  quantity: number;
}

interface Order {
  _id?: string;
  userId: string;
  person: string;
  department: string;
  location:string;
  type: string;
  status: "Pending" | "In Progress" | "Answered";
  items: OrderItem[];
  timestamp?: string;
}

interface OrderState {
  orders: Order[];
  stafforders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  stafforders: [],
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrder: (state, action) => {
      state.orders = action.payload;
    },
  },
  extraReducers: (builder) => {
    // 🔄 Create Order
    builder.addCase(createOrder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      createOrder.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.orders.push(action.payload?.data); // Assuming response.data contains the created order
      }
    );
    builder.addCase(
      createOrder.rejected,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      }
    );

    // 📥 Get Orders By User
    builder.addCase(getOrdersByUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      getOrdersByUser.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.orders = action.payload?.data || [];
      }
    );
    builder.addCase(
      getOrdersByUser.rejected,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      }
    );
 
    // 🔁 Update Order Status
    builder.addCase(updateOrderStatus.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      updateOrderStatus.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        const updatedOrder = action.payload?.data;
        const index = state.orders.findIndex((o) => o._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
      }
    );
    builder
      .addCase(
        updateOrderStatus.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
      .addCase(fetchOrdersForStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersForStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrdersForStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setOrder } = orderSlice.actions; // Exporting the action to set orders

export default orderSlice.reducer;
