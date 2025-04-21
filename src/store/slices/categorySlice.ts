import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createCategory, fetchCategories, updateCategory, deleteCategory } from '../features/category/category';

interface CategoryItem {
  name: string;
  allowMultiple: boolean;
}

interface Category {
  _id: string;
  label: string;
  items: CategoryItem[];
  userId: string;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
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

      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const idx = state.categories.findIndex(
          (cat) => cat._id === action.payload._id
        );
        if (idx !== -1) state.categories[idx] = action.payload;
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
