'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_SHOW } from '@/routes/adminPanelRoutes'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import slugify from 'slugify'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import useFetch from '@/hooks/useFetch'
import Select from '@/components/Application/Select'
import Editor from '@/components/Application/Admin/Editor'
import Image from 'next/image'
import MediaModal from '@/components/Application/Admin/MediaModal'
import { useParams, useRouter } from 'next/navigation'
import { zSchema } from '@/lib/zodSchema'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_PRODUCT_SHOW, label: 'Products' },
  { href: '', label: 'Edit Product' },
]

// ✅ Validation Schema including id
const formSchema = zSchema.pick({
  id: true,
  name: true,
  slug: true,
  categoryId: true,
  subCategoryId: true,
  weight: true,
  gst: true,
  labourCharge: true,
  purityFactor: true,
  hallmarkCharges: true,
  gender: true,
  description: true,
})

const EditProduct = () => {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: id, // <-- added
      name: '',
      slug: '',
      categoryId: '',
      subCategoryId: '',
      weight: '',
      gst: '',
      labourCharge: '',
      purityFactor: '',
      hallmarkCharges: '',
      gender: '',
      description: '',
    },
  })

  // ✅ Fetch Categories/SubCategories
  const { data: fetchCategory } = useFetch('/api/category?deleteType=SD&&size=10000')
  const { data: fetchSubCategory } = useFetch('/api/subcategory?deleteType=SD&&size=10000')

  const [categoryOptions, setCategoryOptions] = useState([])
  const [subCategoryOption, setSubCategoryOption] = useState([])
  const [open, setOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState([])

  // ✅ Fetch product data and reset form including id
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data: res } = await axios.get(`/api/product/get/${id}`)
        if (!res.success) throw new Error(res.message)

        const p = res.data
        form.reset({
          id: p.id, // <-- include product id
          name: p.name,
          slug: p.slug,
          categoryId: p.subCategory?.category?.id || '',
          subCategoryId: p.subCategory?.id || '',
          weight: p.weight,
          gst: p.gst,
          labourCharge: p.labourCharge,
          purityFactor: p.purityFactor,
          hallmarkCharges: p.hallmarkCharges,
          gender: p.gender,
          description: p.description,
          media: p.media,
        })
        setSelectedMedia(p.media || [])
      } catch (error) {
        showToast('error', error.message)
      } finally {
        setInitialLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  // ✅ Prepare Category/SubCategory options
  useEffect(() => {
    if (fetchCategory?.success) {
      setCategoryOptions(fetchCategory.data.map(cat => ({ label: cat.name, value: cat.id })))
    }
  }, [fetchCategory])

  useEffect(() => {
    if (fetchSubCategory?.success) {
      setSubCategoryOption(fetchSubCategory.data.map(sc => ({ label: sc.name, value: sc.id })))
    }
  }, [fetchSubCategory])

  // ✅ Auto slug
  useEffect(() => {
    const name = form.watch('name')
    if (name) form.setValue('slug', slugify(name, { lower: true }))
  }, [form.watch('name')])

  // ✅ Description Editor
  const editorHandler = (event, editor) => {
    form.setValue('description', editor.getData())
  }

  // ✅ Submit handler
  const onSubmit = async (values) => {
    try {
      setLoading(true)
      values.media = selectedMedia.map(m => m.id)
      // now values will include the product id
      const { data: res } = await axios.put(`/api/product/update`, values)
      if (!res.success) throw new Error(res.message)
      showToast('success', res.message)
      router.push(ADMIN_PRODUCT_SHOW)
    } catch (error) {
      showToast('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) return <div className="text-center py-20">Loading...</div>

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card>
        <CardHeader>
          <h4 className="text-xl font-semibold">Edit Product</h4>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-5">

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

              {/* Category (Disabled) */}
              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Select
                      options={categoryOptions}
                      selected={field.value}
                      setSelected={field.onChange}
                      disabled={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Sub Category (Disabled) */}
              <FormField control={form.control} name="subCategoryId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub Category <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Select
                      options={subCategoryOption}
                      selected={field.value}
                      setSelected={field.onChange}
                      disabled={true}
                    />
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

              {/* Purity Factor */}
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

              {/* Gender (Disabled) */}
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Select
                      options={[
                        { label: "Men", value: "MEN" },
                        { label: "Women", value: "WOMEN" },
                      ]}
                      selected={field.value}
                      setSelected={field.onChange}
                      disabled={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Description */}
              <div className="md:col-span-2">
                <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                <Editor onChange={editorHandler} initialData={form.getValues('description')} />
              </div>

              {/* Media */}
              <div className="md:col-span-2 border p-5 rounded text-center">
                <MediaModal
                  open={open}
                  setOpen={setOpen}
                  selectedMedia={selectedMedia}
                  setSelectedMedia={setSelectedMedia}
                  isMultiple={true}
                />
                {selectedMedia.length > 0 && (
                  <div className="flex gap-2 justify-center my-3 flex-wrap">
                    {selectedMedia.map(media => (
                      <Image
                        key={media.id}
                        src={media.secure_url || media.url}
                        height={80}
                        width={80}
                        className="object-cover rounded border"
                        alt=""
                      />
                    ))}
                  </div>
                )}
                <div onClick={() => setOpen(true)} className="cursor-pointer border p-3 rounded inline-block">
                  Select Media <span className="text-red-500">*</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <ButtonLoading loading={loading} text="Update Product" type="submit" className="cursor-pointer" />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default EditProduct
