import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

interface LogoutModalProps {
    open: boolean;
    onClose: () => void;
    setSuccess:any;
}

export default function LogoutModal({ open, onClose,setSuccess }: LogoutModalProps) {
  const [successLoader, setLoaderSuccess] = useState(false);

    useEffect(() => {
        if (open) {
            setSuccess(false);

            const timer = setTimeout(() => setLoaderSuccess(true), 2000);
            const closeTimer = setTimeout(() => {
                onClose();
            }, 2500);

            return () => {
                clearTimeout(timer);
                clearTimeout(closeTimer);
            };
        }
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md text-center w-[90%] max-w-sm animate-fade-in">
                <div className="flex flex-col items-center justify-center gap-4">
                    {!successLoader ? (
                        <>
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-300" />
                            </div>
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Logging you out...</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we securely log you out.</p>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 animate-bounce" />
                            </div>
                            <h2 className="text-lg font-semibold text-green-700 dark:text-green-300">Logout Successful</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Redirecting to login...</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
