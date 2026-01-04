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
            // SECURITY: Never store tokens in Redux state
            // Remove accessToken and refreshToken from the payload
            const { accessToken, refreshToken, ...userDataWithoutTokens } = action.payload;
            state.auth = userDataWithoutTokens;
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
