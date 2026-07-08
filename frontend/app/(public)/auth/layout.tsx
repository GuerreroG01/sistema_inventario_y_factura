export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main
            className="
                min-h-screen
                flex
                items-center
                justify-center
                p-6
                bg-gradient-to-br
                from-slate-100
                via-blue-50
                to-indigo-100
            "
        >
            {children}
        </main>
    );
}