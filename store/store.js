import { combineReducers, configureStore } from "@reduxjs/toolkit";
import persistReducer from "redux-persist/es/persistReducer";
import persistStore from "redux-persist/es/persistStore";
import storage from "redux-persist/es/storage";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import authReducer from "./reducer/authReducer";
import cartReducer from "./reducer/cartReducer";

// Create noop storage for SSR
const createNoopStorage = () => {
    return {
        getItem(_key) {
            return Promise.resolve(null);
        },
        setItem(_key, value) {
            return Promise.resolve(value);
        },
        removeItem(_key) {
            return Promise.resolve();
        },
    };
};

// Use localStorage in browser, noop storage on server
const storageEngine = typeof window !== "undefined" ? storage : createNoopStorage();

const rootReducer = combineReducers({
    authStore: authReducer,
    cartStore: cartReducer
})



const persistConfig = {
    key: 'root',
    storage: storageEngine,
    whitelist: ['cartStore']  // Only persist cart - auth managed via HTTP-only cookies
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
})

export const persistor = persistStore(store)