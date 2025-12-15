'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_SUB_CATEGORY_SHOW } from '@/routes/adminPanelRoutes'
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
    const { data: categoriesData } = useFetch('/api/category')

    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState([])

    const formSchema = zSchema.pick({
        id: true,
        name: true,
        slug: true,
    }).extend({ categoryIds: zSchema.shape.categoryIds.optional() })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id,
            name: "",
            slug: "",
            categoryIds: [],
        },
    })

    useEffect(() => {
        if (categoriesData && categoriesData.success) {
            setCategories(categoriesData.data || [])
        }
    }, [categoriesData])

    useEffect(() => {
        if (subCategoryData && subCategoryData.success) {
            const data = subCategoryData.data
            // Extract category IDs from the junction table data
            const categoryIds = data?.categorySubCategories?.map(csc => csc.category.id) || []
            form.reset({
                id: data?.id,
                name: data?.name,
                slug: data?.slug,
                categoryIds: categoryIds
            })
        }
    }, [subCategoryData])

    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === 'name' && value.name) {
                form.setValue('slug', slugify(value.name).toLowerCase())
            }
        })
        return () => subscription.unsubscribe()
    }, [form])

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
                                    name="categoryIds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Categories (Select one or more)</FormLabel>
                                            <FormControl>
                                                <div className="border rounded-md p-3 space-y-2 max-h-60 overflow-y-auto">
                                                    {categories.length === 0 ? (
                                                        <p className="text-sm text-gray-500">Loading categories...</p>
                                                    ) : (
                                                        categories.map((cat) => (
                                                            <label key={cat.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                                                <input
                                                                    type="checkbox"
                                                                    value={cat.id}
                                                                    checked={field.value?.includes(cat.id)}
                                                                    onChange={(e) => {
                                                                        const updatedValue = e.target.checked
                                                                            ? [...(field.value || []), cat.id]
                                                                            : (field.value || []).filter((id) => id !== cat.id)
                                                                        field.onChange(updatedValue)
                                                                    }}
                                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                                />
                                                                <span className="text-sm">{cat.name}</span>
                                                            </label>
                                                        ))
                                                    )}
                                                </div>
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
