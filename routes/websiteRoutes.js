export const WEBSITE_HOME = "/"
export const WEBSITE_LOGIN = "/auth/login"
export const WEBSITE_REGISTER = "/auth/register"
export const WEBSITE_RESETPASSWORD = "/auth/reset-password"

export const WEBSITE_SHOP = "/shop"

export const WEBSITE_PRODUCT_DETAILS = (slug) => slug ? `/product/${slug}` : '/product'

export const WEBSITE_CART = "/cart"
export const WEBSITE_CHECKOUT = "/checkout"

export const WEBSITE_ORDER_DETAILS = (order_id) => `/order-details/${order_id}`


// User routes 
export const USER_DASHBOARD = "/my-account"
export const USER_PROFILE = "/profile"
export const USER_ORDERS = "/orders"

// ============================================
// API ROUTES (Backend Endpoints)
// ============================================

// Auth API
export const API_AUTH_LOGIN = "/api/auth/login"
export const API_AUTH_REGISTER = "/api/auth/register"
export const API_AUTH_LOGOUT = "/api/auth/logout"
export const API_AUTH_VERIFY_OTP = "/api/auth/verify-otp"
export const API_AUTH_RESET_PASSWORD = "/api/auth/reset-password"

// User API
export const API_USER_UPDATE_PROFILE = "/api/user/update-profile"
export const API_USER_ORDERS = "/api/user/get-user-orders"

// Category API
export const API_CATEGORY_GET_FEATURED = "/api/category/get-featured-categories"

// Subcategory API
export const API_SUBCATEGORY_GET_ALL = "/api/subcategory/get-all"

// Product API
export const API_PRODUCT_DETAILS = (slug) => `/api/product/details/${slug}`

// Payment API
export const API_PAYMENT_GET_ORDER_ID = "/api/payment/get-order-id"
export const API_PAYMENT_SAVE_ORDER = "/api/payment/save-order"

// Order API
export const API_ORDER_DETAILS = (order_id) => `/api/order/details/${order_id}`