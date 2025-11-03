export const ADMIN_DASHBOARD = '/admin/dashboard'

//media routes

export const ADMIN_MEDIA_SHOW = '/admin/media'
export const ADMIN_MEDIA_EDIT = (id) => id ? `/admin/media/edit/${id}` : '';


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