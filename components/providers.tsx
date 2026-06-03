import type { ReactNode } from 'react';

import { AppConvexProvider } from '@/lib/convex/convex-provider';
import { HydrateClient } from '@/lib/convex/rsc';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppConvexProvider>
      <HydrateClient>{children}</HydrateClient>
    </AppConvexProvider>
  );
}
