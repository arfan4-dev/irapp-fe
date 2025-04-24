import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserManageSkeleton() {
    return (
        <Card className="rounded-lg p-4 bg-gray-50 dark:bg-zinc-800">
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <Skeleton className="w-40 h-4 mb-1 bg-gray-200" />
                        <Skeleton className="w-52 h-4 bg-gray-200" />
                    </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="w-20 h-3 bg-gray-200" />
                        <Skeleton className="w-40 h-10 rounded-md bg-gray-200" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Skeleton className="w-24 h-3 bg-gray-200" />
                        <Skeleton className="w-56 h-10 rounded-md bg-gray-200" />
                    </div>
                </div>

                <Skeleton className="w-32 h-10 mt-4 rounded-md bg-gray-200" />
            </CardContent>
        </Card>
    );
}
