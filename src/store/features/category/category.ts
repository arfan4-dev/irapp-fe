// store/features/category/categoryThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/api";

import { AxiosError } from "axios";
interface RemoveItemPayload {
  categoryId: string;
  itemName: string;
}

interface AddItemPayload {
  categoryId: string;
  itemName: string;
  allowMultiple: boolean;
}

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await api.get("/categories/all");
      return res?.data?.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data?.message || "Fetch failed");
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/create",
  async ({ label, dept }: { label: string; dept:string }, { rejectWithValue }) => {
    try {
      const res = await api.post("/categories", { label, department: dept });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Creation failed");
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async (payload: { id: string; newLabel: string }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/categories/${payload.id}`, payload);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Deletion failed");
    }
  }
);

export const addItemToCategory = createAsyncThunk(
  "category/addItem",
  async (
    { categoryId, itemName, allowMultiple }: AddItemPayload,
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post(`/categories/${categoryId}/items`, {
        itemName,
        allowMultiple,
      });
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add item"
      );
    }
  }
);

export const updateItemInCategory = createAsyncThunk(
  "category/updateItem",
  async (
    { categoryId, oldItemName, newItem }: any,
    { rejectWithValue }
  ) => {
    try {
      const res = await api.put(`/categories/${categoryId}/items`, {
        oldItemName,
        newItem,
      });
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update item"
      );
    }
  }
);

export const removeItemFromCategory = createAsyncThunk(
  "category/removeItem",
  async ({ categoryId, itemName }: RemoveItemPayload, { rejectWithValue }) => {
    try {
const res = await api.delete(`/categories/${categoryId}/items`, {
  data: { itemName },
});
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove item"
      );
    }
  }
);
