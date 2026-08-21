import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./../fonts/Geist-wght.woff2",
  variable: "--font-geist-sans",
  display: "swap",
  weight: "100 900",
  style: "normal",
});

const geistMono = localFont({
  src: "./../fonts/GeistMono-wght.woff2",
  variable: "--font-geist-mono",
  display: "swap",
  weight: "100 900",
  style: "normal",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Inventarium",
    default: "Inventarium System",
  },
  description: "Control de Inventario y Facturación de tu negocio.",
  keywords: [
    "inventario",
    "stock",
    "gestión",
    "almacén",
    "productos"
  ],
  authors: [
    {
      name: "Gabriel Guerrero By LocalNet Systems"
    }
  ],
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="
          min-h-screen
          bg-gradient-to-br
          from-neutral-100/80
          via-white
          to-neutral-200/80
          text-slate-900
          font-sans
          antialiased
          selection:bg-neutral-400/60
          selection:text-white
        "
      >
        {children}
      </body>
    </html>
  );
}