// src/store/features/order/orderThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/api";


interface UpdateStatusPayload {
  id?: string;
  status: "Pending" | "In Progress" | "Answered";
}
export const createOrder = createAsyncThunk(
  "order/create",
  async (orderData: any, { rejectWithValue }) => {
    try {
      console.log("orderData:", orderData);
      
      const response = await api.post("/order", orderData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Order creation failed"
      );
    }
  }
);

export const getOrdersByUser = createAsyncThunk(
  "order/fetchByUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/order/all`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  } 
);


export const updateOrderStatus = createAsyncThunk(
  "orders/updateStatus",
  async ({ id, status }: UpdateStatusPayload, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/order/${id}`,
        { status },
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update order status"
      );
    }
  }
);