export function MetricCard({ icon: Icon, title, value, color }: any) {
    const colorStyles: Record<string, { bg: string; text: string; border: string }> = {
        blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
        emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
        rose: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100" },
        violet: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-100" },
    };

    const currentTheme = colorStyles[color] || colorStyles.blue;

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
                </div>
                <div className={`rounded-xl p-3 border ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
}