export function CreditBox({
    title,
    value,
    danger
}:{
    title:string;
    value:string;
    danger?:boolean;
}) {
    return (
        <div className="rounded-2xl bg-slate-50 p-5">

            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {title}
            </p>

            <p className={`mt-2 text-xl font-extrabold ${
                danger
                ? "text-rose-600"
                : "text-slate-900"
            }`}>
                {value}
            </p>

        </div>
    );
}