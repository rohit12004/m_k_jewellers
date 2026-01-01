import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    auth: null,
    lastLogin: null, // Timestamp of last login
};

export const authSlice = createSlice({
    name: "authStore",
    initialState,
    reducers: {
        login: (state, action) => {
            state.auth = action.payload;
            state.lastLogin = Date.now(); // Store login timestamp
        },
        logout: (state) => {
            state.auth = null;
            state.lastLogin = null;
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
