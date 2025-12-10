// src/components/auth/AuthInitializer.tsx
'use client'; // 👈 Esto es OBLIGATORIO para usar useEffect

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

export default function AuthInitializer() {
  // Obtenemos la función del store.
  // Usamos un selector para evitar re-renderizados innecesarios.
  const checkAuth = useAuthStore((state) => state.checkAuthOnLoad);

  useEffect(() => {
    // Esto se ejecuta solo una vez cuando la app carga en el navegador
    checkAuth();
  }, [checkAuth]);

  // Este componente no renderiza nada visualmente, por eso retorna null
  return null; 
}