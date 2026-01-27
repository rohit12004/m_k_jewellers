'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zSchema } from '@/lib/zodSchema'
import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD } from '@/routes/adminPanelRoutes'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import slugify from 'slugify'
import MediaModal from '@/components/Application/Admin/MediaModal'
import Image from 'next/image'
import { useCreateCategory } from '@/hooks/useCategoryMutations'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_CATEGORY_SHOW, label: 'Category' },
    { href: '', label: 'Add Category' },
]

const AddCategory = () => {

    const [open, setOpen] = useState(false)
    const [selectedMedia, setSelectedMedia] = useState([])
    const { mutateAsync: createCategory, isPending } = useCreateCategory()

    const formSchema = zSchema.pick({
        name: true, slug: true
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            slug: "",
        },
    })

    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === 'name' && value.name) {
                form.setValue('slug', slugify(value.name).toLowerCase())
            }
        })
        return () => subscription.unsubscribe()
    }, [form])

    const onSubmit = async (values) => {
        try {
            // Add mediaId if media is selected
            if (selectedMedia && selectedMedia.length > 0) {
                values.mediaId = selectedMedia[0].id
            }

            await createCategory(values)

            form.reset()
            setSelectedMedia([])
        } catch (error) {
            console.error("Failed to create category:", error);
        }
    }
    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <Card className="py-0 rounded shadow-sm mt-5">
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                    <h4 className='text-xl font-semibold'>Add Category</h4>
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
                                <div
                                    onClick={() => setOpen(true)}
                                    className='cursor-pointer border p-3 rounded inline-block hover:bg-gray-50'
                                >
                                    {selectedMedia && selectedMedia.length > 0 ? 'Change Image' : 'Select Image (Optional)'}
                                </div>
                            </div>

                            <div className='mb-3'>
                                <ButtonLoading loading={isPending} type="submit" text="Add Category" className="cursor-pointer" />
                            </div>

                        </form>
                    </Form>

                </CardContent>
            </Card>
        </div>
    )
}

export default AddCategory
