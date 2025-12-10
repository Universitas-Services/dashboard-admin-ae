import type { Metadata } from "next";
import { Inter } from "next/font/google"; // O la fuente que estés usando
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Panel administrativo de Universitas Services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* Aquí ya NO va el AuthInitializer.
            El store (useAuthStore) recuperará la sesión automáticamente 
            cuando cualquier componente intente usarla.
        */}
        {children}
      </body>
    </html>
  );
}