export function FlightSkeleton() {
    return (
        <div className="glass rounded-2xl p-6 mb-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 skeleton-shimmer rounded-xl" />
                <div className="space-y-2">
                    <div className="h-5 w-32 skeleton-shimmer rounded-md" />
                    <div className="h-4 w-20 skeleton-shimmer rounded-md" />
                </div>
            </div>

            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                    <div className="h-4 w-16 skeleton-shimmer rounded-md" />
                    <div className="h-8 w-24 skeleton-shimmer rounded-md" />
                    <div className="h-5 w-12 skeleton-shimmer rounded-md" />
                    <div className="h-4 w-20 skeleton-shimmer rounded-md" />
                </div>

                <div className="flex-1 flex flex-col items-center justify-center pt-8 px-4">
                    <div className="h-3 w-16 skeleton-shimmer rounded-md mb-2" />
                    <div className="w-full flex justify-center">
                        <div className="w-full h-1 skeleton-shimmer rounded-full" />
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-end space-y-3">
                    <div className="h-4 w-16 skeleton-shimmer rounded-md" />
                    <div className="h-8 w-24 skeleton-shimmer rounded-md" />
                    <div className="h-5 w-12 skeleton-shimmer rounded-md" />
                    <div className="h-4 w-20 skeleton-shimmer rounded-md" />
                </div>
            </div>
        </div>
    );
}
