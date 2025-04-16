// store/slices/categorySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CategoryItem {
  name: string;
  allowMultiple: boolean; // 🆕 Add this line
}


interface Category {
  id: string;
  label: string;
  items: CategoryItem[];
}

interface CategoryState {
  categories: Category[];
}

const initialState: CategoryState = {
  categories: [
    {
      id: "drinks",
      label: "Drinks",
      items: [
        { name: "Tea", allowMultiple: false },
        { name: "Coffee", allowMultiple: true },
      ],
    },
    {
      id: "food",
      label: "Food",
      items: [
        { name: "Pizza", allowMultiple: false },
        { name: "Burger", allowMultiple: true },
      ],
    },
  ],
};


const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    addCategory: (
      state,
      action: PayloadAction<{ id: string; label: string }>
    ) => {
      state.categories.push({ ...action.payload, items: [] });
    },
    addItemToCategory: (
      state,
      action: PayloadAction<{
        categoryId: string;
        itemName: string;
        allowMultiple?: boolean;
      }>
    ) => {
      const category = state.categories.find(
        (cat) => cat.id === action.payload.categoryId
      );
      if (category) {
        category.items.push({
          name: action.payload.itemName,
          allowMultiple: action.payload.allowMultiple ?? false, // default true
        });
      }
    },

    removeItemFromCategory: (
      state,
      action: PayloadAction<{ categoryId: string; itemName: string }>
    ) => {
      const category = state.categories.find(
        (cat) => cat.id === action.payload.categoryId
      );
      if (category) {
        category.items = category.items.filter(
          (item) => item.name !== action.payload.itemName
        );
      }
    },
    updateCategory: (
      state,
      action: PayloadAction<{ id: string; newLabel: string }>
    ) => {
      const category = state.categories.find(
        (cat) => cat.id === action.payload.id
      );
      if (category) {
        category.label = action.payload.newLabel;
      }
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(
        (cat) => cat.id !== action.payload
      );
    },
  },
});

export const {
  addCategory,
  addItemToCategory,
  removeItemFromCategory,
  updateCategory,
  removeCategory,
} = categorySlice.actions;

export default categorySlice.reducer;
