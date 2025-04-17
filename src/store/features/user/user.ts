// src/features/user/userThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/api";
interface LoginData {
  email: string;
  password: string;
}

interface formData {
  username: string;
  email: string;
  password: string;
  role: string;
};
export const registerUser = createAsyncThunk(
  "user/register",
  async (formData:formData, { rejectWithValue }) => {
    try {
      console.log(formData);
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

      return response?.data;
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
  formData: {
    username: string;
    password: string;
  };
}



export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ id, formData }: UpdateUserArgs, { rejectWithValue }) => {
    console.log(formData);
    
    try {
      const response = await api.put(`/update-user/${id}`, formData, {
        withCredentials: true,
        // headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);
