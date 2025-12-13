import { ADMIN_CATEGORY_ADD, ADMIN_CATEGORY_SHOW, ADMIN_CUSTOMERS_SHOW, ADMIN_DASHBOARD, ADMIN_MEDIA_SHOW, ADMIN_PRODUCT_ADD, ADMIN_PRODUCT_SHOW, ADMIN_SUB_CATEGORY_ADD, ADMIN_SUB_CATEGORY_SHOW } from "@/routes/adminPanelRoutes";


const searchData = [
    {
        label: "Dashboard",
        description: "View website analytics and reports",
        url: ADMIN_DASHBOARD,
        keywords: ["dashboard", "overview", "analytics", "insights"]
    },
    {
        label: "Category",
        description: "Manage product categories",
        url: ADMIN_CATEGORY_SHOW,
        keywords: ["category", "product category"]
    },
    {
        label: "Add Category",
        description: "Add new product categories",
        url: ADMIN_CATEGORY_ADD,
        keywords: ["add category", "new category"]
    },
    {
        label: "SubCategory",
        description: "Manage product subcategories",
        url: ADMIN_SUB_CATEGORY_SHOW,
        keywords: ["subcategory", "product subcategory"]
    },
    {
        label: "Add SubCategory",
        description: "Add new product subcategories",
        url: ADMIN_SUB_CATEGORY_ADD,
        keywords: ["add subcategory", "new subcategory"]
    },
    {
        label: "Product",
        description: "Manage all product listings",
        url: ADMIN_PRODUCT_SHOW,
        keywords: ["products", "product list"]
    },
    {
        label: "Customers",
        description: "View and manage customer information",
        url: ADMIN_CUSTOMERS_SHOW,
        keywords: ["customers", "users"]
    },
    {
        label: "Media",
        description: "Manage website media files",
        url: ADMIN_MEDIA_SHOW,
        keywords: ["images", "videos"]
    },

];

export default searchData;


