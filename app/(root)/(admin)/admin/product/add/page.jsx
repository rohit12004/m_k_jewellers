'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_SHOW } from '@/routes/adminPanelRoutes'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import slugify from 'slugify'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import useFetch from '@/hooks/useFetch'
import Select from '@/components/Application/Select'
import Editor from '@/components/Application/Admin/Editor'
import Image from 'next/image'
import MediaModal from '@/components/Application/Admin/MediaModal'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_PRODUCT_SHOW, label: 'Products' },
  { href: '', label: 'Add Product' },
]

// ✅ Matches Prisma Schema
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  categoryId: z.string().min(1, 'Category is required'),
  subCategoryId: z.string().min(1, 'Sub Category is required'),
  weight: z.string().min(1, 'Weight is required'),
  gst: z.string().min(1, 'GST is required'),
  labourCharge: z.string().min(1, 'Labour Charge is required'),
  purityFactor: z.string().min(1, 'Purity is required'),
  hallmarkCharges: z.string().min(1, 'Hallmark Charges are required'),
  gender: z.string().min(1, 'Gender is required'),
  description: z.string().min(1, 'Description is required'),
})

const AddProduct = () => {
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      categoryId: "",
      subCategoryId: "",
      weight: "",
      gst: "",
      labourCharge: "",
      purityFactor: "",
      hallmarkCharges: "",
      gender: "",
      description: "",
    },
  })

  // ✅ Fetch categories
  const { data: fetchCategory } = useFetch('/api/category?deleteType=SD&&size=10000')
  const [categoryOptions, setCategoryOptions] = useState([])

  // ✅ Fetch subcategories
  const { data: fetchSubCategory } = useFetch('/api/subcategory?deleteType=SD&&size=10000')
  const [subCategoryOption, setSubCategoryOption] = useState([])

  const [open, setOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState([])

  // ✅ Convert Category list
  useEffect(() => {
    if (fetchCategory?.success) {
      setCategoryOptions(fetchCategory.data.map(cat => ({ label: cat.name, value: cat.id })))
    }
  }, [fetchCategory])

  // ✅ Filter SubCategory list based on selected Category
  const selectedCategoryId = form.watch("categoryId")

  useEffect(() => {
    if (fetchSubCategory?.success && selectedCategoryId) {
      const filtered = fetchSubCategory.data.filter(sc => sc.category.id === selectedCategoryId)
      setSubCategoryOption(filtered.map(sc => ({ label: sc.name, value: sc.id })))
    } else {
      setSubCategoryOption([])
    }
  }, [fetchSubCategory, selectedCategoryId])

  // ✅ Auto Slug
  useEffect(() => {
    const name = form.watch("name")
    if (name) form.setValue("slug", slugify(name).toLowerCase())
  }, [form.watch("name")])

  const editorHandler = (event, editor) => {
    form.setValue("description", editor.getData())
  }

  const onSubmit = async (values) => {
    if (selectedMedia.length <= 0) return showToast('error', 'Please select media.')
    try {
      setLoading(true)

      values.media = selectedMedia.map(m => m.id)

      const { data: response } = await axios.post('/api/product/create', values)
      if (!response.success) throw new Error(response.message)

      form.reset()
      setSelectedMedia([])
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

      <Card>
        <CardHeader>
          <h4 className='text-xl font-semibold'>Add Product</h4>
        </CardHeader>
        <CardContent>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='grid md:grid-cols-2 gap-5'>

              {/* Name */}
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Slug */}
              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Category */}
              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Select options={categoryOptions} selected={field.value} setSelected={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Filtered Sub Category */}
              <FormField control={form.control} name="subCategoryId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub Category <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Select options={subCategoryOption} selected={field.value} setSelected={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Weight */}
              <FormField control={form.control} name="weight" render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (g) <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* GST */}
              <FormField control={form.control} name="gst" render={({ field }) => (
                <FormItem>
                  <FormLabel>GST (%) <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Labour Charge */}
              <FormField control={form.control} name="labourCharge" render={({ field }) => (
                <FormItem>
                  <FormLabel>Labour Charge <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Purity */}
              <FormField control={form.control} name="purityFactor" render={({ field }) => (
                <FormItem>
                  <FormLabel>Purity (Example: 22) <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Hallmark Charges */}
              <FormField control={form.control} name="hallmarkCharges" render={({ field }) => (
                <FormItem>
                  <FormLabel>Hallmark Charges <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Gender */}
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Select
                      options={[
                        { label: "Men", value: "MEN" },
                        { label: "Women", value: "WOMEN" }
                      ]}
                      selected={field.value}
                      setSelected={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Description */}
              <div className='md:col-span-2'>
                <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                <Editor onChange={editorHandler} />
              </div>

              {/* Media */}
              <div className='md:col-span-2 border p-5 rounded text-center'>
                <MediaModal open={open} setOpen={setOpen} selectedMedia={selectedMedia} setSelectedMedia={setSelectedMedia} isMultiple={true} />
                {selectedMedia.length > 0 && (
                  <div className='flex gap-2 justify-center my-3 flex-wrap'>
                    {selectedMedia?.map(media => (
                      <Image key={media.id} src={media.url} height={80} width={80} className='object-cover rounded border' alt="" />
                    ))}
                  </div>
                )}
                <div onClick={() => setOpen(true)} className='cursor-pointer border p-3 rounded inline-block'>
                  Select Media <span className="text-red-500">*</span>
                </div>
              </div>

              <div className='md:col-span-2'>
                <ButtonLoading loading={loading} text="Add Product" type="submit" />
              </div>

            </form>
          </Form>

        </CardContent>
      </Card>
    </div>
  )
}

export default AddProduct
