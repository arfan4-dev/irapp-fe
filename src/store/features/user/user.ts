// src/features/user/userThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/api";
interface LoginData {
  email: string;
  password: string;
}

export const registerUser = createAsyncThunk(
  "user/register",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/user", formData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);
export const loginUser = createAsyncThunk(
  "user/login",
  async (data: LoginData, { rejectWithValue }) => {
    try {
      // Step 1: Login
      const response = await api.post("/login", data, {
        withCredentials: true,
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);
export const fetchUserById = createAsyncThunk(
  "user/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/${id}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return rejectWithValue("Unauthorized");
      }
      return rejectWithValue("Failed to fetch user.");
    }
  }
);

interface UpdateUserArgs {
  id: string;
  data: FormData;
}

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ id, data }: UpdateUserArgs, { rejectWithValue }) => {
    try {
      const response = await api.put(`/update-user/${id}`, data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);
