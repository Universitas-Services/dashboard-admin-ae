// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // O la fuente que uses
import "./globals.css";

// 1. IMPORTA TU COMPONENTE
import AuthInitializer from "../components/auth/AuthInitializer"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard Administrativo",
  description: "Panel de control",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* 2. COLÓCALO AQUÍ, DENTRO DEL BODY PERO ANTES DE CHILDREN */}
        <AuthInitializer />
        
        {children}
      </body>
    </html>
  );
}