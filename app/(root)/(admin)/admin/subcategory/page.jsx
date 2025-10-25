'use client'

import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import DatatableWrapper from "@/components/Application/Admin/DatatableWrapper"
import DeleteAction from "@/components/Application/Admin/DeleteAction"
import EditAction from "@/components/Application/Admin/EditAction"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DT_SUB_CATEGORY_COLUMN } from "@/lib/column"
import { columnConfig } from "@/lib/helperFunction"
import { ADMIN_DASHBOARD, ADMIN_SUB_CATEGORY_ADD, ADMIN_SUB_CATEGORY_EDIT, ADMIN_SUB_CATEGORY_SHOW, ADMIN_TRASH } from "@/routes/adminPanelRoutes"
import Link from "next/link"
import { useCallback, useMemo } from "react"
import { FiPlus } from "react-icons/fi"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_SUB_CATEGORY_SHOW, label: 'Sub-Category' },
]
const ShowSubCategory = () => {

    const columns = useMemo(() => {
        return columnConfig(DT_SUB_CATEGORY_COLUMN)
    }, [])

    const action = useCallback((row, deleteType, handleDelete) => {
        let actionMenu = []
        actionMenu.push(<EditAction key="edit" href={ADMIN_SUB_CATEGORY_EDIT(row.original.id)} />)
        actionMenu.push(<DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />)
        return actionMenu
    }, [])

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <Card className="py-0 rounded shadow-sm gap-0">
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                    <div className="flex justify-between items-center">
                        <h4 className='text-xl font-semibold'>Show Sub-Category</h4>
                        <Button>
                            <FiPlus />
                            <Link href={ADMIN_SUB_CATEGORY_ADD}>New Sub-Category</Link>
                        </Button>

                    </div>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                    <DatatableWrapper
                        queryKey="subcategory-data"
                        fetchUrl="/api/subcategory"
                        initialPageSize={10}
                        columnsConfig={columns}
                        exportEndpoint="/api/subcategory/export"
                        deleteEndpoint="/api/subcategory/delete"
                        deleteType="SD"
                        trashView={`${ADMIN_TRASH}?trashof=subcategory`}
                        createAction={action}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default ShowSubCategory