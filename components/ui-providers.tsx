import type { ReactNode } from 'react';
import { SidebarProvider } from './ui/sidebar';
import { DialogRoots } from './dialog-roots';

export function UIProviders({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      {children}
      <DialogRoots />
    </SidebarProvider>
  );
}
