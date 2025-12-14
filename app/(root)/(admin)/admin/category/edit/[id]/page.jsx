'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD } from '@/routes/adminPanelRoutes'
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
import MediaModal from '@/components/Application/Admin/MediaModal'
import Image from 'next/image'
const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_CATEGORY_SHOW, label: 'Category' },
    { href: '', label: 'Edit Category' },
]

const EditCategory = ({ params }) => {

    const { id } = use(params)
    const { data: categoryData } = useFetch(`/api/category/get/${id}`)


    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [selectedMedia, setSelectedMedia] = useState([])

    const formSchema = zSchema.pick({
        id: true, name: true, slug: true
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: id,
            name: "",
            slug: "",
        },
    })


    useEffect(() => {
        if (categoryData && categoryData.success) {
            const data = categoryData.data
            form.reset({
                id: data?.id,
                name: data?.name,
                slug: data?.slug
            })

            // Pre-populate media if exists
            if (data?.media && data.media.length > 0) {
                const media = data.media[0]
                setSelectedMedia([{
                    id: media.id,
                    url: media.secure_url,
                    alt: media.alt,
                    title: media.title
                }])
            } else {
                setSelectedMedia([])
            }
        }
    }, [categoryData])


    useEffect(() => {
        const name = form.getValues('name')
        if (name) {
            form.setValue('slug', slugify(name).toLowerCase())
        }
    }, [form.watch('name')])

    const onSubmit = async (values) => {
        setLoading(true)
        try {
            // Add mediaId if media is selected
            if (selectedMedia && selectedMedia.length > 0) {
                values.mediaId = selectedMedia[0].id
            } else {
                values.mediaId = null // Remove media if deselected
            }

            const { data: response } = await axios.put('/api/category/update', values)
            if (!response.success) {
                throw new Error(response.message)
            }

            showToast('success', response.message)
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred'
            showToast('error', errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <Card className="py-0 rounded shadow-sm">
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                    <h4 className='text-xl font-semibold'>Edit Category</h4>
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
                                                <Input type="text" placeholder="Enter category name" {...field} />
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

                            {/* Media Selection */}
                            <div className='mb-5 border p-5 rounded text-center'>
                                <MediaModal
                                    open={open}
                                    setOpen={setOpen}
                                    selectedMedia={selectedMedia}
                                    setSelectedMedia={setSelectedMedia}
                                    isMultiple={false}
                                />
                                {selectedMedia && selectedMedia.length > 0 && (
                                    <div className='flex justify-center my-3'>
                                        <Image
                                            src={selectedMedia[0].url}
                                            height={120}
                                            width={120}
                                            className='object-cover rounded border'
                                            alt={selectedMedia[0].alt || 'Category image'}
                                        />
                                    </div>
                                )}
                                <div className='flex gap-2 justify-center'>
                                    <div
                                        onClick={() => setOpen(true)}
                                        className='cursor-pointer border p-3 rounded inline-block hover:bg-gray-50'
                                    >
                                        {selectedMedia && selectedMedia.length > 0 ? 'Change Image' : 'Select Image (Optional)'}
                                    </div>
                                    {selectedMedia && selectedMedia.length > 0 && (
                                        <div
                                            onClick={() => setSelectedMedia([])}
                                            className='cursor-pointer border p-3 rounded inline-block hover:bg-red-50 text-red-600'
                                        >
                                            Remove Image
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className='mb-3'>
                                <ButtonLoading loading={loading} type="submit" text="Update Category" className="cursor-pointer" />
                            </div>

                        </form>
                    </Form>

                </CardContent>
            </Card>

        </div>
    )
}

export default EditCategory