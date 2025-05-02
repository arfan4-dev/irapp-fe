import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  createCategory,
  fetchCategories,
  updateCategory,
  deleteCategory,
} from "../features/category/category";

interface CategoryItem {
  name: string;
  allowMultiple: boolean;
  enabled?: boolean; // ✅ Add this
}

interface Category {
  _id: string;
  label: string;
  department: string;
  items: CategoryItem[];
  userId: string;
    enabled?: boolean; // ✅ Add this

}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  loadingItem:boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  loadingItem:false,
  error: null,
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;

        const idx = state.categories.findIndex(
          (cat) => cat._id === action.payload._id
        );
        if (idx !== -1) state.categories[idx] = action.payload;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(
        deleteCategory.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.categories = state.categories.filter(
            (cat) => cat._id !== action.payload
          );
        }
      );
  },
});
export const { setCategories } = categorySlice.actions;

export default categorySlice.reducer;
