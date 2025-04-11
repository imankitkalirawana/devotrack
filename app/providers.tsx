'use client';

import { HeroUIProvider, ToastProvider } from '@heroui/react';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import NextTopLoader from 'nextjs-toploader';
import { useRouter } from 'nextjs-toploader/app';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

declare module '@react-types/shared' {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>['push']>[1]
    >;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000
      }
    }
  });

  return (
    <HeroUIProvider navigate={router.push}>
      <ToastProvider
        toastProps={{
          shouldShowTimeoutProgress: true
        }}
      />
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <NuqsAdapter>{children}</NuqsAdapter>
          <NextTopLoader
            height={4}
            showSpinner={false}
            shadow="false"
            easing="ease"
            color="hsl(var(--heroui-primary))"
          />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </SessionProvider>
    </HeroUIProvider>
  );
}
