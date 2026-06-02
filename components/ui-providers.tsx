import type { ReactNode } from 'react';
import { SidebarProvider } from './ui/sidebar';

export function UIProviders({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  );
}
