// Admin Sidebar icons.
import { AiOutlineDashboard } from "react-icons/ai";
import { BiCategory } from "react-icons/bi";
import { IoShirtOutline } from "react-icons/io5";
import { MdOutlineShoppingBag } from "react-icons/md";
import { LuUserRound } from "react-icons/lu";
import { IoMdStarOutline } from "react-icons/io";
import { MdOutlinePermMedia } from "react-icons/md";
import { RiCoupon2Line } from "react-icons/ri";
import { ADMIN_CATEGORY_ADD, ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD, ADMIN_MEDIA_SHOW, ADMIN_SUB_CATEGORY_ADD, ADMIN_SUB_CATEGORY_SHOW } from "@/routes/adminPanelRoutes";

export const adminAppSideBarMenu = [
    {
        title: "Dashboard",
        url: ADMIN_DASHBOARD,
        icon: AiOutlineDashboard
    },
    {
        title: "Category",
        url: '#',
        icon: BiCategory,
        submenu: [
            {
                title: "Add Category",
                url: ADMIN_CATEGORY_ADD
            },
            {
                title: "All Category",
                url: ADMIN_CATEGORY_SHOW
            }
        ]
    },
    {
        title: "Sub-Category",
        url: '#',
        icon: BiCategory,
        submenu: [
            {
                title: "Add Sub-Category",
                url: ADMIN_SUB_CATEGORY_ADD
            },
            {
                title: "All Sub-Category",
                url: ADMIN_SUB_CATEGORY_SHOW
            }
        ]
    },
    {
        title: "Media",
        url: ADMIN_MEDIA_SHOW,
        icon: MdOutlinePermMedia,
    },

]