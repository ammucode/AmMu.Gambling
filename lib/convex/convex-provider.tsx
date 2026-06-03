'use client';

import { QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query';
import { ConvexAuthProvider } from 'kitcn/auth/client';
import {
  ConvexReactClient,
  getConvexQueryClientSingleton,
  getQueryClientSingleton,
} from 'kitcn/react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { authClient } from '@/lib/convex/auth-client';
import { CRPCProvider } from '@/lib/convex/crpc';
import { createQueryClient } from '@/lib/convex/query-client';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function AppConvexProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = getQueryClientSingleton(createQueryClient);
  const convexQueryClient = getConvexQueryClientSingleton({
    convex,
    queryClient,
  });

  return (
    <ConvexAuthProvider
      authClient={authClient}
      client={convex}
      convexQueryClient={convexQueryClient}
      onMutationUnauthorized={() => {
        router.push('/auth');
      }}
      onQueryUnauthorized={() => {
        router.push('/auth');
      }}
    >
      <TanstackQueryClientProvider client={queryClient}>
        <CRPCProvider
          convexClient={convex}
          convexQueryClient={convexQueryClient}
        >
          {children}
          {(process.env.NODE_ENV ?? "development") === "development" ? <TanStackDevtools
            config={{
              defaultOpen: true,
              panelLocation: 'top',
            }}
            plugins={[
              formDevtoolsPlugin(),
              { name: 'TanStack Query', render: <ReactQueryDevtoolsPanel /> },
            ]}
          /> : null}
        </CRPCProvider>
      </TanstackQueryClientProvider>
    </ConvexAuthProvider>
  );
}
