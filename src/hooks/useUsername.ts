import { useEffect, useState } from "react";
import api from "@/api/api";

interface OrderType {
  userId: string;
}

const useUsername = (allOrders: OrderType[]) => {
  const [userIdToUsername, setUserIdToUsername] = useState<
    Record<string, string>
  >({});

  const fetchUsername = async (userId: string) => {
    try {
      const response = await api.get(`/${userId}`); // Update API route if needed
      return response.data.data.username; // Adjust if your API response is different
    } catch (error) {
      console.error("Failed to fetch username", error);
      return "Unknown User"; // fallback
    }
  };

  useEffect(() => {
    const uniqueUserIds = Array.from(
      new Set(allOrders.map((order) => order.userId))
    );

    const fetchAllUsernames = async () => {
      const newMapping: Record<string, string> = {};

      for (const userId of uniqueUserIds) {
        if (!userIdToUsername[userId]) {
          const username = await fetchUsername(userId);
          newMapping[userId] = username;
        }
      }

      setUserIdToUsername((prev) => ({ ...prev, ...newMapping }));
    };

    if (allOrders.length > 0) {
      fetchAllUsernames();
    }
  }, []); // also depend on allOrders

  return {
    userIdToUsername,
    setUserIdToUsername,
  };
};

export default useUsername;
