import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import * as SecureStore from "expo-secure-store";
import authReducer from "./slices/authSlice";

// SECURITY: Use SecureStore instead of AsyncStorage for encrypted persistence
// SecureStore keys must only contain alphanumeric, ".", "-", and "_"
const secureStorage = {
    // Sanitize keys by replacing colons with underscores
    sanitizeKey(key) {
        return key.replace(/:/g, '_');
    },
    async getItem(key) {
        const sanitizedKey = this.sanitizeKey(key);
        return await SecureStore.getItemAsync(sanitizedKey);
    },
    async setItem(key, value) {
        const sanitizedKey = this.sanitizeKey(key);
        await SecureStore.setItemAsync(sanitizedKey, value);
    },
    async removeItem(key) {
        const sanitizedKey = this.sanitizeKey(key);
        await SecureStore.deleteItemAsync(sanitizedKey);
    },
};

// Redux Persist configuration
const persistConfig = {
    key: 'root',
    storage: secureStorage, // Use encrypted SecureStore
    whitelist: ['auth', 'lastLogin'], // Persist auth and lastLogin timestamp
};

// Create persisted reducer
const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
    reducer: {
        authStore: persistedAuthReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore redux-persist actions
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PURGE'],
            },
        }),
});

export const persistor = persistStore(store);
