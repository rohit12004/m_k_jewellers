'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
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

  const formSchema = zSchema.pick({ name: true, slug: true, categoryId: true })
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', slug: '', categoryId: '' },
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
    const name = form.getValues('name')
    if (name) form.setValue('slug', slugify(name).toLowerCase())
  }, [form.watch('name')])

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
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <select {...field} className="border rounded p-2 w-full">
                          <option value="">Select Category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
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
