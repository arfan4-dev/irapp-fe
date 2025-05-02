import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/api";

// CREATE
export const createDepartment = createAsyncThunk(
  "departments/create",
  async (payload: { name: string }, { rejectWithValue }) => {
    try {
      const res = await api.post("/departments/create", payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Error creating department"
      );
    }
  }
);

// READ
export const fetchDepartments = createAsyncThunk(
  "departments/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/departments/all");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Error fetching departments"
      );
    }
  }
);

// UPDATE
export const updateDepartment = createAsyncThunk(
  "departments/update",
  async ({ id, name }: { id: string; name: string }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/departments/${id}`, { name });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Error updating department"
      );
    }
  }
);

// DELETE
export const deleteDepartment = createAsyncThunk(
  "departments/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/departments/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Error deleting department"
      );
    }
  }
);
