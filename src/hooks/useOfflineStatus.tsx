import { useEffect, useState } from "react";

export const useOfflineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    console.log(isOnline)
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
};
