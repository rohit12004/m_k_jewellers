'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD,ADMIN_SUB_CATEGORY_SHOW } from '@/routes/adminPanelRoutes'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { zSchema } from '@/lib/zodSchema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { use, useEffect, useState } from 'react'
import slugify from 'slugify'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import useFetch from '@/hooks/useFetch'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_SUB_CATEGORY_SHOW, label: 'Sub-Category' },
    { href: '', label: 'Edit Subcategory' },
]

const EditSubCategory = ({ params }) => {

    const { id } = use(params)
    const { data: subCategoryData } = useFetch(`/api/subcategory/get/${id}`)


    const [loading, setLoading] = useState(false)

    const formSchema = zSchema.pick({
        id: true,
        name: true,
        slug: true,
        categoryId: true
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id,
            name: "",
            slug: "",
            categoryId: "",
        },
    })

    useEffect(() => {
        if (subCategoryData && subCategoryData.success) {
            const data = subCategoryData.data
            form.reset({
                id: data?.id,
                name: data?.name,
                slug: data?.slug,
                categoryId: data?.categoryId
            })
        }
    }, [subCategoryData])

    useEffect(() => {
        const name = form.getValues('name')
        if (name) {
            form.setValue('slug', slugify(name).toLowerCase())
        }
    }, [form.watch('name')])

    const onSubmit = async (values) => {
        setLoading(true)
        try {
            const { data: response } = await axios.put('/api/subcategory/update', values)
            if (!response.success) throw new Error(response.message)

            showToast('success', response.message)
        } catch (error) {
            showToast('error', error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <Card className="py-0 rounded shadow-sm">
                <CardHeader className="pt-3 px-3 border-b pb-2">
                    <h4 className='text-xl font-semibold'>Edit Subcategory</h4>
                </CardHeader>
                <CardContent className="pb-5">

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} >

                            <div className='mb-5'>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input type="text" placeholder="Enter subcategory name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className='mb-5'>
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Slug</FormLabel>
                                            <FormControl>
                                                <Input type="text" placeholder="Enter slug" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className='mb-5'>
                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Parent Category</FormLabel>
                                            <FormControl>
                                                <select {...field} className="border rounded p-2 w-full">
                                                    {subCategoryData?.data?.category && (
                                                        <option value={subCategoryData.data.category.id}>
                                                            {subCategoryData.data.category.name}
                                                        </option>
                                                    )}
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className='mb-3'>
                                <ButtonLoading loading={loading} type="submit" text="Update Subcategory" />
                            </div>

                        </form>
                    </Form>

                </CardContent>
            </Card>

        </div>
    )
}

export default EditSubCategory
