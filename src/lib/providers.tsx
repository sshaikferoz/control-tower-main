'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        retry: 1,
                        staleTime: 5 * 60 * 1000, // 5 minutes
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <Provider store={store}>{children}</Provider>
        </QueryClientProvider>
    );
}

