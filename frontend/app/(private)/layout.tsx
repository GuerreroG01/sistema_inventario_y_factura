import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode;
}) { //el header ni footer se muestra lo que significa que hay un problema con los layouts group
    return (
        <div
            className="
                min-h-screen
                flex
                flex-col
            "
        >
            <Header />
            <main
                className="
                    flex-1
                "
            >
                {children}
            </main>
            <Footer />
        </div>
    );
}