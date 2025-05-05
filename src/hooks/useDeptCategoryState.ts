import { useState } from "react";

export function useDeptCategoryState() {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [showSettings, setShowSettings] = useState(false);
  const [search, setSearch] = useState("");
  const [editDept, setEditDept] = useState<{ id: string; name: string } | null>(
    null
  );
    const [feedbackModal, setFeedbackModal] = useState<{
      open: boolean;
      type: "delete" | "add" | "update";
      title: string;
      message: string;
      onConfirm?: () => void;
    }>({
      open: false,
      type: "delete",
      title: "",
      message: "",
    });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editedLabel, setEditedLabel] = useState("");
  const [editedDepartment, setEditedDepartment] = useState("");
  const [_, setEditedEnabled] = useState(true); // optional, only keep if needed
  const [editingItem, setEditingItem] = useState<{
    categoryId: string;
    name: string;
  } | null>(null);
  const [editItemsLoader, setEditItemsLoader] = useState(false);
  const [editedAllowMultiple, setEditedAllowMultiple] = useState(false);
  const [offlineCategoryItems, setOfflineCategoryItems] = useState<
    Record<string, { name: string; allowMultiple: boolean }[]>
  >({});
  const [addItemLoader, setAddItemLoader] = useState<{
    [categoryId: string]: boolean;
  }>({});
  const [newItems, setNewItems] = useState<Record<string, string>>({});
  const [itemOptions, setItemOptions] = useState<Record<string, boolean>>({});
  const [editedItemName, setEditedItemName] = useState("");
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [newDeptModalOpen, setNewDeptModalOpen] = useState(false);
  const [newDeptInput, setNewDeptInput] = useState("");
  return {
    editingCategoryId,
    setEditingCategoryId,
    editedLabel,
    setEditedLabel,
    editedDepartment,
    setEditedDepartment,
    setEditedEnabled,
    editingItem,
    setEditingItem,
    editItemsLoader,
    setEditItemsLoader,
    editedAllowMultiple,
    setEditedAllowMultiple,
    offlineCategoryItems,
    setOfflineCategoryItems,
    addItemLoader,
    setAddItemLoader,
    newItems,
    setNewItems,
    itemOptions,
    setItemOptions,
    editedItemName,
    setEditedItemName,
    selectedDept,
    setSelectedDept,
    newDeptModalOpen,
    setNewDeptModalOpen,
    newDeptInput,
    setNewDeptInput,
    search,
    setSearch,
    editDept,
    setEditDept,
    showCategoryModal,
    setShowCategoryModal,
    showSettings,
    setShowSettings,
    feedbackModal,
    setFeedbackModal,
  };
}
