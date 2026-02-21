export function FlightSkeleton() {
    return (
        <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/20 dark:border-zinc-800 rounded-3xl p-6 mb-4 animate-pulse">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                <div className="space-y-2">
                    <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                    <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                </div>
            </div>

            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                    <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                    <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                    <div className="h-5 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                    <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                </div>

                <div className="flex-1 flex flex-col items-center justify-center pt-8 px-4">
                    <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md mb-2" />
                    <div className="w-full flex justify-center">
                        <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-end space-y-3">
                    <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                    <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                    <div className="h-5 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                    <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                </div>
            </div>
        </div>
    );
}
