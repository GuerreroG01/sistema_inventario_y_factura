type InfoItemProps = {
    icon: React.ElementType;
    label: string;
    value?: string | null;
    valueClassName?: string;
};

export function InfoItem({
    icon: Icon, label, value,
    valueClassName = "text-slate-800",
}: InfoItemProps) {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:border-slate-200 hover:bg-slate-50">
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-slate-400" />

                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {label}
                </span>
            </div>

            <p
                className={`mt-2 break-words text-sm font-semibold ${valueClassName}`}
            >
                {value && value.trim() !== ""
                    ? value
                    : "No registrado"}
            </p>
        </div>
    );
}