"use client"
import { persistor, store } from '@/store/store';
import React, { Suspense, useEffect, useState } from 'react'
import { Provider, useDispatch } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import Loading from './Loading';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { login } from '@/store/reducer/authReducer';
import api from '@/lib/api';
import { usePathname } from 'next/navigation';

const queryClient = new QueryClient();

// Session restoration component - Industry standard approach
const SessionRestoration = ({ children }) => {
    const dispatch = useDispatch();
    const pathname = usePathname();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        // Skip session restoration on auth pages to prevent infinite loop
        if (pathname?.startsWith('/auth')) {
            return;
        }

        // Only restore session once per app load
        if (initialized) {
            return;
        }

        // Restore session from HTTP-only cookie
        const restoreSession = async () => {
            try {
                const { data } = await api.get('/api/auth/session');
                if (data.success && data.data) {
                    dispatch(login(data.data));
                }
            } catch (error) {
                // Silent fail - user is not logged in
            } finally {
                setInitialized(true);
            }
        };

        restoreSession();
    }, [dispatch, pathname, initialized]);

    return <>{children}</>;
};

const GlobalProvider = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>

            <Provider store={store}>
                <PersistGate persistor={persistor} loading={<Loading />}>
                    <SessionRestoration>
                        {children}
                    </SessionRestoration>
                </PersistGate>
            </Provider>
            <Suspense fallback={null}>
                <ReactQueryDevtools initialIsOpen={false} />
            </Suspense>
        </QueryClientProvider>
    )
}

export default GlobalProvider

