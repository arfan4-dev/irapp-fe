// store/features/category/categoryThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/api";

import { AxiosError } from "axios";
import { toast } from "sonner";
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
  async ({ label }: { label: string }, { rejectWithValue }) => {
    try {
      const res = await api.post("/categories", { label });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Creation failed");
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async (
    payload: {
      id: string;
      newLabel: string;
      // newDepartment: string;
      enabled?: boolean;
    },
    { rejectWithValue }
  ) => {
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
  async ({ categoryId, oldItemName, newItem }: any, { rejectWithValue }) => {
    try {
      const res = await api.put(`/categories/${categoryId}/items`, {
        oldItemName,
        newItem,
      });
      toast.success("Category Item Updated.");
      return res.data.data;
    } catch (error: any) {
      toast.error("Category Item Updation Failed.");

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

export const updateCategoryDepartments = createAsyncThunk(
  "category/updateDepartments",
  async (
    { categoryId, departments }: { categoryId: string; departments: string[] },
    thunkAPI
  ) => {
    try {
      const response = await api.put(`/categories/${categoryId}/departments`, {
        departments,
      });
      return response.data.category;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update departments"
      );
    }
  }
);
