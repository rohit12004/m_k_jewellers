// Use environment variable for API URL
// For development: Use your computer's local IP address (not localhost)
// For production: Use your deployed backend URL
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const API_ROUTES = {
    // Auth
    LOGIN: "/api/auth/login",
    VERIFY_OTP: "/api/auth/verify-otp",
    LOGOUT: "/api/auth/logout",
    REGISTER: "/api/auth/register",
    RESEND_OTP: "/api/auth/resend-otp",
    FORGOT_PASSWORD_SEND_OTP: "/api/auth/reset-password/send-otp",
    FORGOT_PASSWORD_VERIFY_OTP: "/api/auth/reset-password/verify-otp",
    FORGOT_PASSWORD_UPDATE: "/api/auth/reset-password/update-password",

    // User
    UPDATE_PROFILE: "/api/user/update-profile",
    GET_USER_ORDERS: "/api/user/get-user-orders",

    // Subcategories
    GET_ALL_SUBCATEGORIES: "/api/subcategory/get-all",

    // Products
    GET_FEATURED_PRODUCTS: "/api/product/get-featured-products",
    GET_PRODUCTS_BY_SUBCATEGORY: "/api/product/get-by-subcategory",
    GET_FILTER_OPTIONS: "/api/product/filter-options",

    // Cart & Checkout
    CALCULATE_CART_PRICES: "/api/cart/calculate-prices",
    GET_ORDER_ID: "/api/payment/get-order-id",
    SAVE_ORDER: "/api/payment/save-order",
    GET_ORDER_DETAILS: (orderId) => `/api/order/details/${orderId}`,
    GET_RECEIPT: (orderId) => `/api/order/receipt/${orderId}`,
};

export const ROUTES = {
    LOGIN: "/(auth)/login",
    REGISTER: "/(auth)/signup",
    SIGNUP: "/(auth)/signup",
    VERIFY_OTP: "/(auth)/verify-otp",
    FORGOT_PASSWORD: "/(auth)/forgot-password",
    HOME: "/(tabs)/home",
    SHOP: "/(tabs)/shop",
    CART: "/(tabs)/cart",
    ACCOUNT: "/(tabs)/account",
    CHECKOUT: "/(root)/checkout",
    ORDER_DETAILS: (orderId) => `/(root)/order/${orderId}`,
};

