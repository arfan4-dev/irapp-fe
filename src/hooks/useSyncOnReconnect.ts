// hooks/useSyncOnReconnect.ts
import { useEffect } from "react";
import { useOfflineStatus } from "./useOfflineStatus";
import { getOfflineOrders } from "@/utils/orderStorage";

export const useSyncOnReconnect = () => {
  const isOnline = useOfflineStatus();

  useEffect(() => {
    if (isOnline) {
      console.log("🌐 Back online - syncing orders...");
     const getoffline= getOfflineOrders();
     console.log("getoffline:", getoffline);
     
    }
  }, [isOnline]);
};
