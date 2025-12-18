"use client"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar"
import Image from "next/image"
import mklogo from '@/public/assets/mk_logo.jpg'
import { Button } from "@/components/ui/button"
import { LuChevronRight } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";
import { adminAppSideBarMenu } from "@/lib/adminSidebarMenu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Link from "next/link";

const AppSideBar = () => {
    const { toggleSidebar } = useSidebar()
    return (
        <Sidebar className="z-50">
            <SidebarHeader className="border-b-2 h-16">
                <div className="flex justify-between items-center px-4">
                    <Image src={mklogo.src} height={50} width={50} alt="logo" className="h-[50px] rounded-full" />
                    <p className="font-bold">M.K.Jewellers</p>
                    {/* give md:hidden */}
                    <Button onClick={toggleSidebar} type="button" size="icon" className="md:hidden">
                        <IoMdClose />
                    </Button>
                </div>
            </SidebarHeader>
            <SidebarContent className="px-2 py-2">
                <SidebarMenu>
                    {adminAppSideBarMenu.map((menu, index) => (
                        <Collapsible key={index} className="group/collapsible">
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton asChild className="font-semibold px-2 py-5">
                                        <Link href={menu?.url} onClick={() => {
                                            // Close sidebar on mobile when clicking menu item without submenu
                                            if (!menu.submenu || menu.submenu.length === 0) {
                                                if (window.innerWidth < 768) toggleSidebar()
                                            }
                                        }}>
                                            <menu.icon />
                                            {menu.title}
                                            {menu.submenu && menu.submenu.length > 0
                                                &&
                                                <LuChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            }
                                        </Link>
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                {menu.submenu && menu.submenu.length > 0
                                    &&
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {menu.submenu.map((submenuItem, submenuIndex) => (
                                                <SidebarMenuSubItem key={submenuIndex}>
                                                    <SidebarMenuSubButton asChild className="px-2 py-5 font-semibold">
                                                        <Link href={submenuItem.url} onClick={() => {
                                                            // Close sidebar on mobile when clicking submenu item
                                                            if (window.innerWidth < 768) toggleSidebar()
                                                        }}>
                                                            {submenuItem.title}
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                }
                            </SidebarMenuItem>
                        </Collapsible>
                    ))
                    }
                </SidebarMenu>
            </SidebarContent>

        </Sidebar>
    )
}

export default AppSideBar
