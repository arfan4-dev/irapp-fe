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

export const createUserByAdmin = createAsyncThunk(
  "user/createUserByAdmin",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/create-user", formData,{
        headers: {
          "Content-Type": "multipart/form-data",
        }});
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to create user"
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
      console.log("error:", error);
      
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

export const forgetPassword = createAsyncThunk(
  "user/forgetPassword",
  async (
    { email }: { email: string},
    { rejectWithValue }
  ) => {
    try {
        const response = await api.post("/auth/forgot-password", { email });
      return response.data; // Only return the actual user data object
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Admin login failed"
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "user/resetPassword",
  async ({ password, token }: { password: string,token:string }, { rejectWithValue }) => {
    try {
      const response = api.post(`/auth/reset-password/${token}`, { password });
      return response; // Only return the actual user data object
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || " login failed"
      );
    }
  }
);

export const generateOTP = createAsyncThunk(
  "user/generateOTP",
  async ({ userId}: { userId: string }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/generate-otp/${userId}`);
      return res.data;
    } catch (err:any) {
      return rejectWithValue(
        err.response?.data?.message || " Failed to generate OTP"
      );
    }
  }
);


export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response; // returning id to update state if needed
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete user"
      );
    }
  }
);

