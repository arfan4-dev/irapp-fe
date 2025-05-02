import { createSlice } from "@reduxjs/toolkit";
import { updateSiteConfig } from "../features/siteConfig/siteConfig"; // correct path

interface SiteConfigState {
  config: any;
  loading: boolean;
  error: string | null;
}

const initialState: SiteConfigState = {
  config: null,
  loading: false,
  error: null,
}; 

const siteConfigSlice = createSlice({
  name: "siteConfig",
  initialState,
  reducers: {
    setConfig: (state, action) => {
      state.config = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateSiteConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSiteConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(updateSiteConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setConfig } = siteConfigSlice.actions;
export default siteConfigSlice.reducer;
