import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  createDepartment,
  fetchDepartments,
  updateDepartment,
  deleteDepartment,
} from "../features/department/department";

interface Department {
  _id: string;
  name: string;
}

interface DepartmentState {
  departments: Department[];
  loading: boolean;
  error: string | null;
}

const initialState: DepartmentState = {
  departments: [],
  loading: false,
  error: null,
};

const departmentSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchDepartments.fulfilled,
        (state, action: PayloadAction<Department[]>) => {
          state.departments = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(
        createDepartment.fulfilled,
        (state, action: PayloadAction<Department>) => {
          state.departments.push(action.payload);
        }
      )

      // Update
      .addCase(
        updateDepartment.fulfilled,
        (state, action: PayloadAction<Department>) => {
          const index = state.departments.findIndex(
            (d) => d._id === action.payload._id
          );
          if (index !== -1) state.departments[index] = action.payload;
        }
      )

      // Delete
      .addCase(
        deleteDepartment.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.departments = state.departments.filter(
            (d) => d._id !== action.payload
          );
        }
      );
  },
});

export default departmentSlice.reducer;
