import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Contenedor principal: Centrado absoluto y fondo gris (extraído de tu page.tsx original)
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4">
      {/* Wrapper del contenido con ancho máximo para mantener la forma de tarjeta */}
      <div className="w-full max-w-sm">
        {/* Aquí se renderizará tu page.tsx (el formulario de login) */}
        {children}
      </div>
    </div>
  );
}
