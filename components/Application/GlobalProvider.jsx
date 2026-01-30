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

// Session restoration component - Optimized with server-side session
const SessionRestoration = ({ children, initialSession }) => {
    const dispatch = useDispatch();
    const pathname = usePathname();
    const [initialized, setInitialized] = useState(false);

    // ✅ Dispatch login synchronously BEFORE browser paint if we have server session
    React.useLayoutEffect(() => {
        if (initialSession && !pathname?.startsWith('/auth') && !initialized) {
            dispatch(login(initialSession));
            setInitialized(true);
        }
    }, [initialSession, dispatch, pathname, initialized]);

    useEffect(() => {
        // Skip session restoration on auth pages to prevent infinite loop
        if (pathname?.startsWith('/auth')) {
            setInitialized(true);
            return;
        }

        // If we have initial session, useLayoutEffect already handled it
        if (initialSession) {
            return;
        }

        // Fallback: Restore session from HTTP-only cookie (for client-side navigation)
        // Only runs if no initial session was provided
        if (!initialized && !initialSession) {
            const restoreSession = async () => {
                try {
                    const { data } = await api.get('/api/auth/session');
                    if (data?.success && data?.data) {
                        dispatch(login(data.data));
                    }
                } catch (error) {
                    // Silent fail - user is not logged in, token expired, or database unreachable
                } finally {
                    setInitialized(true);
                }
            };
            restoreSession();
        }
    }, [dispatch, pathname, initialized, initialSession]);

    return <>{children}</>;
};

const GlobalProvider = ({ children, initialSession }) => {
    return (
        <QueryClientProvider client={queryClient}>

            <Provider store={store}>
                {/* ✅ Remove blocking loading screen - cart hydrates in background */}
                <PersistGate persistor={persistor} loading={null}>
                    <SessionRestoration initialSession={initialSession}>
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

