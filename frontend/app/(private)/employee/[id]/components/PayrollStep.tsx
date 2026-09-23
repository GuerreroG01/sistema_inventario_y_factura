type PayrollStepProps = {
    icon: React.ElementType;
    iconClass: string;
    label: string;
    description: string;
    amount: string;
    amountClass: string;
    cardClass: string;
};

export function PayrollStep({
    icon: Icon,
    iconClass,
    label,
    description,
    amount,
    amountClass,
    cardClass
}: PayrollStepProps) {
    return (
        <div className="relative flex gap-3">
            <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[3px] border-white text-white shadow-sm ${iconClass}`}
            >
                <Icon className="h-3.5 w-3.5" />
            </div>
            <div
                className={`flex min-h-[50px] flex-1 items-center justify-between gap-3 rounded-xl border px-3.5 py-2 ${cardClass}`}
            >
                <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold text-slate-700">
                        {label}
                    </p>
                    <p className="truncate text-[10px] text-slate-400">
                        {description}
                    </p>
                </div>
                <p className={`shrink-0 text-sm font-bold ${amountClass}`}>
                    {amount}
                </p>
            </div>
        </div>
    );
}
