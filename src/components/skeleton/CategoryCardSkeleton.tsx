import { Card } from "@/components/ui/card";
import { EllipsisVertical } from "lucide-react";

export default function CategoryCardSkeleton() {
    return (
        <Card className="p-4 w-full max-w-md rounded-xl shadow-sm space-y-4 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="h-4 w-32 bg-muted rounded" />
                    {/* <Switch disabled /> */}
                    <div className="h-3 w-16 bg-muted rounded" />
                </div>
                <EllipsisVertical className="text-muted-foreground" />
            </div>

            {/* Add Button Skeleton */}
            <div className="flex justify-end">
                <div className="h-8 w-20 bg-muted rounded" />
            </div>

            {/* List Items Skeleton */}
            <div className="space-y-3">
                {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b pb-2">
                        <div className="h-3 w-28 bg-muted rounded" />
                        <EllipsisVertical className="text-muted-foreground" />
                    </div>
                ))}
            </div>
        </Card>
    );
}