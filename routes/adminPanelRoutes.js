export const ADMIN_DASHBOARD = '/admin/dashboard'

//media routes

export const ADMIN_MEDIA_SHOW = '/admin/media'
export const ADMIN_MEDIA_EDIT = (id) => id ? `/admin/media/edit/${id}` : '';

// Metal Rates route
export const ADMIN_METAL_RATES = '/admin/metal-rates'

// Category routes 

export const ADMIN_CATEGORY_ADD = '/admin/category/add'
export const ADMIN_CATEGORY_SHOW = '/admin/category'
export const ADMIN_CATEGORY_EDIT = (id) => id ? `/admin/category/edit/${id}` : ''


// sub  Category routes 

export const ADMIN_SUB_CATEGORY_ADD = '/admin/subcategory/add'
export const ADMIN_SUB_CATEGORY_SHOW = '/admin/subcategory'
export const ADMIN_SUB_CATEGORY_EDIT = (id) => id ? `/admin/subcategory/edit/${id}` : ''

//Trash Route
export const ADMIN_TRASH = '/admin/trash'


// Product routes 
export const ADMIN_PRODUCT_ADD = '/admin/product/add'
export const ADMIN_PRODUCT_SHOW = '/admin/product'
export const ADMIN_PRODUCT_EDIT = (id) => id ? `/admin/product/edit/${id}` : ''



// Customer route 
export const ADMIN_CUSTOMERS_SHOW = '/admin/customers'

// Orders route
export const ADMIN_ORDERS_SHOW = '/admin/orders'

// ============================================
// API ROUTES (Backend Endpoints)
// ============================================

// Product API
export const API_PRODUCT = "/api/product"
export const API_PRODUCT_EXPORT = "/api/product/export"
export const API_PRODUCT_DELETE = "/api/product/delete"

// Category API
export const API_CATEGORY = "/api/category"
export const API_CATEGORY_EXPORT = "/api/category/export"
export const API_CATEGORY_DELETE = "/api/category/delete"

// Subcategory API
export const API_SUBCATEGORY = "/api/subcategory"
export const API_SUBCATEGORY_EXPORT = "/api/subcategory/export"
export const API_SUBCATEGORY_DELETE = "/api/subcategory/delete"

// Media API
export const API_MEDIA = "/api/media"
export const API_MEDIA_DELETE = "/api/media/delete"

// Metal Rates API
export const API_METAL_RATES = "/api/metal-rates"

// Customer API
export const API_CUSTOMERS = "/api/customers"
export const API_CUSTOMERS_EXPORT = "/api/customers/export"
export const API_CUSTOMERS_DELETE = "/api/customers/delete"