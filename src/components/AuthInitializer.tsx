'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

export function AuthInitializer() {
  const checkAuthOnLoad = useAuthStore((state) => state.checkAuthOnLoad);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      checkAuthOnLoad();
      initialized.current = true;
    }
  }, [checkAuthOnLoad]);

  return null; // Este componente no renderiza nada visualmente
}