
export default function Skeleton() {
    return (
        <section
        className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-b from-slate-50/80 via-white to-white p-4 shadow-sm md:p-6"
        aria-label="Cargando detalle de nómina"
        aria-busy="true"
        >
            <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-indigo-100/50 blur-3xl" />

            <div className="relative z-10 space-y-6">
                <div className="space-y-3">
                <div className="h-4 w-36 animate-pulse rounded-full bg-slate-200/80" />
                <div className="h-9 w-72 max-w-full animate-pulse rounded-2xl bg-slate-200/80" />
                <div className="h-4 w-56 animate-pulse rounded-full bg-slate-100" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                    key={index}
                    className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 backdrop-blur-sm"
                    >
                    <div className="flex items-center justify-between">
                        <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200/80" />
                        <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
                    </div>
                    <div className="mt-5 h-7 w-36 animate-pulse rounded-xl bg-slate-200/80" />
                    <div className="mt-3 h-3 w-44 animate-pulse rounded-full bg-slate-100" />
                    </div>
                ))}
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 backdrop-blur-sm">
                <div className="h-6 w-48 animate-pulse rounded-xl bg-slate-200/80" />
                <div className="mt-5 space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-16 animate-pulse rounded-xl bg-slate-100/80"
                    />
                    ))}
                </div>
                </div>
            </div>
        </section>
    );
}
