'use client'

import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import DatatableWrapper from "@/components/Application/Admin/DatatableWrapper"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DT_ORDERS_COLUMN } from "@/lib/column"
import { columnConfig } from "@/lib/helperFunction"
import { ADMIN_DASHBOARD, ADMIN_ORDERS_SHOW } from "@/routes/adminPanelRoutes"
import { useMemo } from "react"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_ORDERS_SHOW, label: 'Orders' },
]

const ShowOrders = () => {
    const columns = useMemo(() => {
        return columnConfig(DT_ORDERS_COLUMN)
    }, [])

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <Card className="py-0 rounded shadow-sm gap-0">
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                    <div className="flex justify-between items-center">
                        <h4 className="text-xl font-semibold">All Orders</h4>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                    <DatatableWrapper
                        queryKey="orders-data"
                        fetchUrl="/api/admin/orders"
                        initialPageSize={10}
                        columnsConfig={columns}
                        trashView="#"
                        exportEndpoint="/api/admin/orders/export"
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default ShowOrders
