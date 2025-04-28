import { useState } from "react";
const useCategorySortOrder = () => {
    const [categorySortOrder, setCategorySortOrder] = useState<"asc" | "desc">(
      "asc"
    );

  return { categorySortOrder, setCategorySortOrder };
}

export default useCategorySortOrder