// src/features/user/userThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/api";
import { LoginData, UpdateUserArgs } from "@/types/users";

export const registerUser = createAsyncThunk(
  "user/register",
  async (payload: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/user", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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

export const fetchAllUsers = createAsyncThunk(
  "adminUsers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/all", { withCredentials: true });

      // Only return users that are NOT admins
      const filteredUsers = response.data.filter(
        (user: any) => user.role !== "admin"
      );

      return filteredUsers;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
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

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ id, data }: UpdateUserArgs, { rejectWithValue }) => {
    try {
      console.log("data:", data);

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

export const updateUserRoleAndDepartment = createAsyncThunk(
  "user/updateRoleAndDepartment",
  async (
    {
      userId,
      role,
      department,
    }: { userId: string; role: string; department?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(
        `/users/${userId}/update-role-department`,
        {
          role,
          department,
        }
      );
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data || "Failed to update user role/department"
      );
    }
  }
);
export const updateUserRole = createAsyncThunk(
  "user/updateUserRole",
  async ({ userId, role, department }: any, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${userId}/update-role`, {
        role,
        department,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue("Update failed");
    }
  }
);

export const adminLogin = createAsyncThunk(
  "user/adminLogin",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        "/auth/admin",
        { email, password },
        { withCredentials: true }
      );
      return response.data; // Only return the actual user data object
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Admin login failed"
      );
    }
  }
);