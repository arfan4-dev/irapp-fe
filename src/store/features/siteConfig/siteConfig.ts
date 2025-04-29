import { createAsyncThunk } from "@reduxjs/toolkit";
import { setConfig } from "../../slices/siteConfigSlice";
import api from "@/api/api";

export const fetchSiteConfig = createAsyncThunk(
  "siteConfig/fetch",
  async (_, { dispatch }) => {
    try {
      const res = await api.get("/site-config");
      dispatch(setConfig(res.data.data));
    } catch (error: any) {
      
      
    } 
  }
);
export const updateSiteConfig = createAsyncThunk(
  "siteConfig/update",
  async (payload: any, { rejectWithValue }) => {
    try {
      
      const res = await api.post("/site-config/update", payload, {
        headers: {
          "Content-Type": "multipart/form-data", // because you're uploading images
        },
      });
      return res.data.data; // returning data directly
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update site config."
      );
    }
  }
);