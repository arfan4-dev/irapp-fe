// store/slices/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { adminLogin, createUserByAdmin, fetchAllUsers, fetchUserById, loginUser, registerUser, updateUserRole } from "../features/user/user";

interface UserState {
  loading: boolean;
  departmentLoading: boolean;
  error: string | null;
  currentUser: any;
  users: [];
  success:boolean
}

const initialState: UserState = {
  loading: false,
  departmentLoading: false,
  error: null,
  currentUser: null,
  users: [],
  success:false
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
    },
     resetUserStatus: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
 .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 🔹 REGISTER USER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(registerUser.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

       .addCase(createUserByAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createUserByAdmin.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createUserByAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // 🔹 LOGIN USER
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.currentUser = action.payload; // ✅ Make sure payload has .user
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
    // ✅ Handle fetchUserById
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserRole.pending, (state) => {
        state.departmentLoading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const index = state.currentUser.findIndex(
          (u: any) => u._id === action.payload._id
        );
        if (index !== -1) {
          state.currentUser[index] = action.payload;
        }
        state.departmentLoading = false;
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.departmentLoading = false;
        state.error = action.payload as string;
      })
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

  },
});

export const { logout, resetUserStatus } = userSlice.actions;
export default userSlice.reducer;
