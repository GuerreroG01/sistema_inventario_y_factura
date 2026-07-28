export function InfoCard({ icon, title, value }:{ icon: React.ReactNode; title:string; value:string; }) {
    return (
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition">
                {icon}
            </div>

            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {title}
            </p>

            <p className="mt-2 break-words font-semibold text-slate-800">
                {value}
            </p>

        </div>
    );
}