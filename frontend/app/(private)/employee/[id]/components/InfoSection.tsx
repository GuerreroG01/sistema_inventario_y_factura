type InfoSectionProps = {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
};

export function InfoSection({ title, icon: Icon, children }: InfoSectionProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                    <Icon className="h-5 w-5" />
                </div>

                <h3 className="text-base font-bold text-slate-900">
                    {title}
                </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {children}
            </div>
        </div>
    );
}