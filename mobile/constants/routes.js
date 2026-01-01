export const API_BASE_URL = "http://localhost:3000"; // Update with your actual backend URL

export const API_ROUTES = {
    LOGIN: "/api/auth/login",
    VERIFY_OTP: "/api/auth/verify-otp",
    LOGOUT: "/api/auth/logout",
    REGISTER: "/api/auth/register",
    RESEND_OTP: "/api/auth/resend-otp",
    FORGOT_PASSWORD_SEND_OTP: "/api/auth/reset-password/send-otp",
    FORGOT_PASSWORD_VERIFY_OTP: "/api/auth/reset-password/verify-otp",
    FORGOT_PASSWORD_UPDATE: "/api/auth/reset-password/update-password",
};

export const ROUTES = {
    LOGIN: "/login",
    SIGNUP: "/signup",
    VERIFY_OTP: "/verify-otp",
    FORGOT_PASSWORD: "/forgot-password",
    HOME: "/(tabs)/home",
    ADMIN_DASHBOARD: "/(admin)/dashboard",
};
