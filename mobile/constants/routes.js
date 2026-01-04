// Use environment variable for API URL
// For development: Use your computer's local IP address (not localhost)
// For production: Use your deployed backend URL
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const API_ROUTES = {
    LOGIN: "/api/auth/login",
    VERIFY_OTP: "/api/auth/verify-otp",
    LOGOUT: "/api/auth/logout",
    REGISTER: "/api/auth/register",
    RESEND_OTP: "/api/auth/resend-otp",
    FORGOT_PASSWORD_SEND_OTP: "/api/auth/reset-password/send-otp",
    FORGOT_PASSWORD_VERIFY_OTP: "/api/auth/reset-password/verify-otp",
    FORGOT_PASSWORD_UPDATE: "/api/auth/reset-password/update-password",
    UPDATE_PROFILE: "/api/user/update-profile",
    GET_USER_ORDERS: "/api/user/get-user-orders",
};

export const ROUTES = {
    LOGIN: "/login",
    SIGNUP: "/signup",
    VERIFY_OTP: "/verify-otp",
    FORGOT_PASSWORD: "/forgot-password",
    HOME: "/(tabs)/home",
    ACCOUNT: "/(tabs)/account",
    ADMIN_DASHBOARD: "/(admin)/dashboard",
};
