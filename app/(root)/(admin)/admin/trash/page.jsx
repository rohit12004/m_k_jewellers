'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import DatatableWrapper from "@/components/Application/Admin/DatatableWrapper"
import DeleteAction from "@/components/Application/Admin/DeleteAction"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
    DT_CATEGORY_COLUMN,
    DT_CUSTOMERS_COLUMN,
    DT_PRODUCT_COLUMN,
    DT_SUB_CATEGORY_COLUMN
} from "@/lib/column"
import { columnConfig } from "@/lib/helperFunction"
import {
    ADMIN_CATEGORY_SHOW,
    ADMIN_DASHBOARD,
    ADMIN_PRODUCT_SHOW,
    ADMIN_TRASH
} from "@/routes/adminPanelRoutes"
import { useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"

// ✅ Central config for each trash section
const TRASH_CONFIG = {
    category: {
        title: 'Category Trash',
        columns: DT_CATEGORY_COLUMN,
        fetchUrl: '/api/category',
        exportUrl: '/api/category/export',
        deleteUrl: '/api/category/delete',
        breadcrumb: { label: 'Category', href: ADMIN_CATEGORY_SHOW },
    },
    subcategory: {
        title: 'Sub-Category Trash',
        columns: DT_SUB_CATEGORY_COLUMN,
        fetchUrl: '/api/subcategory',
        exportUrl: '/api/subcategory/export',
        deleteUrl: '/api/subcategory/delete',
        breadcrumb: { label: 'Sub-Category', href: '/admin/subcategory' },
    },
    product: {
        title: 'Product Trash',
        columns: DT_PRODUCT_COLUMN,
        fetchUrl: '/api/product',
        exportUrl: '/api/product/export',
        deleteUrl: '/api/product/delete',
        breadcrumb: { label: 'Products', href: ADMIN_PRODUCT_SHOW },
    },
    customers: {
        title: 'Customers Trash',
        columns: DT_CUSTOMERS_COLUMN,
        fetchUrl: '/api/customers',
        exportUrl: '/api/customers/export',
        deleteUrl: '/api/customers/delete',
        breadcrumb: { label: 'Customers', href: '/admin/customers' },
    },
}

const Trash = () => {
    const searchParams = useSearchParams()
    const trashOf = searchParams.get('trashof')
    const config = TRASH_CONFIG[trashOf]

    // ✅ Make breadcrumb dynamic based on config
    const breadcrumbData = useMemo(() => {
        if (!config) return [{ href: ADMIN_DASHBOARD, label: 'Home' }]

        return [
            { href: ADMIN_DASHBOARD, label: 'Home' },
            { href: config.breadcrumb.href, label: config.breadcrumb.label },
            { href: ADMIN_TRASH + `?trashof=${trashOf}`, label: 'Trash' },
        ]
    }, [trashOf, config])

    const columns = useMemo(() => {
        return columnConfig(config.columns, false, false, true)
    }, [config.columns])

    const action = useCallback((row, deleteType, handleDelete) => {
        return [<DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />]
    }, [])

    if (!config) {
        return <div className="p-4 text-red-600">Invalid Trash Type</div>
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <Card className="py-0 rounded shadow-sm gap-0">
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                    <div className="flex justify-between items-center">
                        <h4 className='text-xl font-semibold'>{config.title}</h4>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                    <DatatableWrapper
                        queryKey={`${trashOf}-data-deleted`}
                        fetchUrl={config.fetchUrl}
                        initialPageSize={10}
                        columnsConfig={columns}
                        exportEndpoint={config.exportUrl}
                        deleteEndpoint={config.deleteUrl}
                        deleteType="PD"
                        createAction={action}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default Trash
