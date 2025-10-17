'use client';

import { useState, useEffect } from 'react';

export default function PageLoadingOverlay() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Attendre que tous les composants soient montés et stabilisés
    const timer = setTimeout(() => {
      setIsInitializing(false);
      console.log('✅ Page stabilisée - Interactions activées');
    }, 500); // 500ms devrait suffire pour tous les délais

    return () => clearTimeout(timer);
  }, []);

  if (!isInitializing) return null;

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none" 
      style={{
        background: 'transparent',
        pointerEvents: 'all', // Bloquer TOUS les clics
        cursor: 'wait'
      }}
      aria-hidden="true"
    />
  );
}

