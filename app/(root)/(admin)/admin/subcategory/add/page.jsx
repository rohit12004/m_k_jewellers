'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zSchema } from '@/lib/zodSchema'
import { ADMIN_SUB_CATEGORY_SHOW, ADMIN_DASHBOARD } from '@/routes/adminPanelRoutes'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import slugify from 'slugify'
import MediaModal from '@/components/Application/Admin/MediaModal'
import Image from 'next/image'
import { useCategories } from '@/hooks/useAdminData'
import { useCreateSubCategory } from '@/hooks/useCategoryMutations'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_SUB_CATEGORY_SHOW, label: 'Sub-Category' },
  { href: '', label: 'Add Sub-Category' },
]

const AddSubCategory = () => {
  const [categories, setCategories] = useState([])
  const [open, setOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState([])
  const { mutateAsync: createSubCategory, isPending } = useCreateSubCategory()

  const formSchema = zSchema.pick({ name: true, slug: true }).extend({ categoryIds: zSchema.shape.categoryIds })
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', slug: '', categoryIds: [] },
  })

  // Fetch categories with caching
  const { data: categoriesData } = useCategories()

  useEffect(() => {
    if (categoriesData?.success) {
      setCategories(categoriesData.data || [])
    }
  }, [categoriesData])


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

      await createSubCategory(values)

      form.reset({ name: '', slug: '', categoryIds: [] })
      setSelectedMedia([])
    } catch (error) {
      console.error("Failed to create subcategory:", error);
    }
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="py-0 rounded shadow-sm mt-5">
        <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
          <h4 className='text-xl font-semibold'>Add Sub-Category</h4>
        </CardHeader>
        <CardContent className="pb-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} >

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
                            <p className="text-sm text-gray-500">No categories available</p>
                          ) : (
                            categories.map((cat) => (
                              <label key={cat.id} className="flex items-center space-x-2 cursor-pointer hover:bg-green-500 p-2 rounded">
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

              <div className='mb-5'>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Enter sub-category name" {...field} />
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
                      alt={selectedMedia[0].alt || 'Subcategory image'}
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
                <ButtonLoading loading={isPending} type="submit" text="Add Sub-Category" className="cursor-pointer" />
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AddSubCategory
