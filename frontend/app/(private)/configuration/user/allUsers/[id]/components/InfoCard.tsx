export function InfoCard({ icon, title, value }:{ icon:React.ReactNode; title:string; value:string; }){
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500">
                <div className="text-blue-600">
                    {icon}
                </div>

                <span className="text-sm">
                    {title}
                </span>
            </div>
            <p className="mt-3 font-semibold text-slate-900">
                {value}
            </p>
        </div>
    );
}