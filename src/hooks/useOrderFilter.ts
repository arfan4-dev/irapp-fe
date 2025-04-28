import { useState } from "react";

export default function useOrderFilter() {
  const [nameFilter, setNameFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const resetFilters = () => {
    setNameFilter("");
    setDateFilter("");
    setSortOrder("asc");
  };

  return {
    nameFilter,
    dateFilter,
    sortOrder,
    setNameFilter,
    setDateFilter,
    toggleSortOrder,
    resetFilters,
  };
}
