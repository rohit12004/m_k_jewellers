'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import Select from '@/components/Application/Select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { showToast } from '@/lib/showToast'
import { zSchema } from '@/lib/zodSchema'
import { ADMIN_SUB_CATEGORY_SHOW, ADMIN_SUB_CATEGORY_ADD, ADMIN_DASHBOARD } from '@/routes/adminPanelRoutes'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import slugify from 'slugify'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_SUB_CATEGORY_SHOW, label: 'Sub-Category' },
  { href: '', label: 'Add Sub-Category' },
]

const AddSubCategory = () => {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])

  const formSchema = zSchema.pick({ name: true, slug: true }).extend({ categoryIds: zSchema.shape.categoryIds })
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', slug: '', categoryIds: [] },
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/api/category')
        setCategories(data.data || [])
      } catch {
        showToast('error', 'Failed to fetch categories')
      }
    }
    fetchCategories()
  }, [])


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
      const { data: response } = await axios.post('/api/subcategory/create', values)
      if (!response.success) throw new Error(response.message)
      form.reset()
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

              <div className='mb-3'>
                <ButtonLoading loading={loading} type="submit" text="Add Sub-Category" className="cursor-pointer" />
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AddSubCategory
