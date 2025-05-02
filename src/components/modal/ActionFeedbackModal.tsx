import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {  Pencil, Trash2 } from "lucide-react";
import { useEffect } from "react";

type ModalType = "add" | "update" | "delete";

interface Props {
    open: boolean;
    onClose: () => void;
    type: ModalType;
    title?: string;
    message?: string;
    onConfirm?: () => void;
}

const iconMap = {
    update: <Pencil className="text-blue-500 w-6 h-6" />,
    delete: <Trash2 className="text-red-500 w-6 h-6" />,
};

const defaultMessages = {
    add: "Item has been added successfully.",
    update: "Item has been updated successfully.",
    delete: "Item has been deleted successfully.",
};

export default function ActionFeedbackModal({
    open,
    onClose,
    type,
    title,
    message,
    onConfirm,
}: Props) {
    useEffect(() => {
        if (open && type === "add") {
            const timer = setTimeout(() => {
                onClose();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [open, type, onClose]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="flex flex-col items-center gap-2 text-center">
                    {type === "add" ? (
                        <div className="flex justify-center">
                            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center animate-scale-pop">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    ) : (
                        iconMap[type]
                    )}

                    <DialogTitle className="text-lg font-semibold">
                        {title || `${type[0].toUpperCase() + type.slice(1)} Successful`}
                    </DialogTitle>
                    <p className="text-gray-500 text-sm">
                        {message || defaultMessages[type]}
                    </p>
                </DialogHeader>

                <DialogFooter className="mt-4 flex justify-center">
                    {type === "delete" && onConfirm ? (
                        <>
                            <Button variant="outline" className="cursor-pointer" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 cursor-pointer">
                                Confirm Delete
                            </Button>
                        </>
                    ) : type !== "add" ? (
                        <Button onClick={onClose}>OK</Button>
                    ) : null}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
