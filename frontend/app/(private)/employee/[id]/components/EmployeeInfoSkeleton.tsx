export function EmployeeInfoSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-slate-200" />

                    <div className="space-y-2">
                        <div className="h-6 w-56 rounded-lg bg-slate-200" />
                        <div className="h-4 w-36 rounded-lg bg-slate-100" />
                    </div>
                </div>
            </div>

            {[1, 2].map((section) => (
                <div
                    key={section}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                    <div className="mb-5 h-6 w-44 rounded-lg bg-slate-200" />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div
                                key={item}
                                className="h-20 rounded-xl bg-slate-100"
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}