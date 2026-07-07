import React, { createContext, useContext, useState, useCallback } from 'react';

type HeaderContextType = {
  items: Record<string, React.ReactNode>;
  registerItem: (id: string, node: React.ReactNode) => void;
  unregisterItem: (id: string) => void;
};

const HeaderContext = createContext<HeaderContextType | null>(null);

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Record<string, React.ReactNode>>({});

  const registerItem = useCallback((id: string, node: React.ReactNode) => {
    setItems((prev) => ({ ...prev, [id]: node }));
  }, []);

  const unregisterItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  return (
    <HeaderContext.Provider value={{ items, registerItem, unregisterItem }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (!context) throw new Error('useHeader must be used within HeaderProvider');
  return context;
}