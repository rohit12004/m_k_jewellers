"use client"
import { persistor, store } from '@/store/store';
import React, { Suspense, useEffect } from 'react'
import { Provider, useDispatch } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import Loading from './Loading';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { login } from '@/store/reducer/authReducer';
import axios from 'axios';

const queryClient = new QueryClient();

// Session restoration component
const SessionRestoration = ({ children }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Restore session from HTTP-only cookie on app load
        const restoreSession = async () => {
            try {
                const { data } = await axios.get('/api/auth/session');
                if (data.success && data.data) {
                    dispatch(login(data.data));
                }
            } catch (error) {
                // No active session, user is not logged in
                console.log('No active session');
            }
        };

        restoreSession();
    }, [dispatch]);

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

