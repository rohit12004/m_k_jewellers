'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_SHOW } from '@/routes/adminPanelRoutes'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { FiPlus } from "react-icons/fi"
import slugify from 'slugify'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { useCategories, useSubcategories } from '@/hooks/useAdminData'
import Select from '@/components/Application/Select'
import Editor from '@/components/Application/Admin/Editor'
import Image from 'next/image'
import MediaModal from '@/components/Application/Admin/MediaModal'
import { useParams, useRouter } from 'next/navigation'
import { zSchema } from '@/lib/zodSchema'
import { getPurityOptions } from '@/lib/purityHelper'
import { useWatch } from 'react-hook-form'
import { RING_SIZES } from '@/lib/ringSizes'

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
  gender: true,
  description: true,
  variants: true,
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
      gender: '',
      description: '',
      variants: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants"
  });

  // Watch subcategory to conditionally show size field for rings
  const watchedSubCategoryId = useWatch({ control: form.control, name: 'subCategoryId' })
  const watchedCategoryId = useWatch({ control: form.control, name: 'categoryId' })

  // ✅ Fetch Categories/SubCategories with caching
  const { data: fetchCategory } = useCategories()
  const { data: fetchSubCategory } = useSubcategories()

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
          categoryId: p.categoryId || '', // ✅ Use direct categoryId
          subCategoryId: p.subCategoryId || '', // ✅ Use direct subCategoryId
          gender: p.gender,
          description: p.description,
          media: p.media,
          variants: p.variants?.map(v => ({
            id: v.id,
            weight: String(v.weight),
            purity: v.purity,
            size: v.size || '', // Include size for rings
            length: v.length || '', // Include length for chains/mangalsutra
            gst: String(v.gst),
            labourCharge: String(v.labourCharge),
            hallmarkCharges: String(v.hallmarkCharges),
          })) || [],
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
    const subscription = form.watch((value, { name }) => {
      if (name === 'name' && value.name) {
        form.setValue('slug', slugify(value.name, { lower: true }))
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

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

              {/* Variants Section */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <FormLabel className="text-lg font-semibold">Product Variants</FormLabel>
                  <Button type="button" size="sm" onClick={() => append({ weight: "", gst: "", labourCharge: "", purity: "", hallmarkCharges: "", size: "", length: "" })}>
                    <FiPlus className="mr-2" /> Add Variant
                  </Button>
                </div>

                {fields.map((item, index) => {
                  // Check if selected subcategory is a ring or chain/mangalsutra
                  const selectedSubCategory = subCategoryOption.find(sc => sc.value === watchedSubCategoryId)
                  const subCatName = selectedSubCategory?.label?.toLowerCase() || ''
                  // Use word boundary to match 'ring' or 'rings' but not 'earring'
                  const isRing = /\brings?\b/.test(subCatName)
                  const isChainOrMangalsutra = subCatName.includes('chain') || subCatName.includes('mangalsutra')
                  const gridCols = (isRing || isChainOrMangalsutra) ? 'md:grid-cols-6' : 'md:grid-cols-5'

                  return (
                    <div key={item.id} className={`grid ${gridCols} gap-4 border p-4 rounded relative`}>
                      {fields.length > 1 && (
                        <Button type="button" variant="destructive" size="icon" className="absolute -top-3 -right-3 h-6 w-6 rounded-full" onClick={() => remove(index)}>
                          <span className="text-xs">X</span>
                        </Button>
                      )}

                      {/* Weight */}
                      <FormField control={form.control} name={`variants.${index}.weight`} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (g) <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Purity */}
                      <FormField control={form.control} name={`variants.${index}.purity`} render={({ field }) => {
                        // Use watched value from top level
                        const selectedCategory = categoryOptions.find(cat => cat.value === watchedCategoryId)
                        const purityOptions = selectedCategory ? getPurityOptions(selectedCategory.label) : []

                        return (
                          <FormItem>
                            <FormLabel>Purity <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Select
                                options={purityOptions}
                                selected={field.value}
                                setSelected={field.onChange}
                                disabled={!watchedCategoryId}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      }} />

                      {/* Size (Only for rings) */}
                      {isRing && (
                        <FormField control={form.control} name={`variants.${index}.size`} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Size</FormLabel>
                            <FormControl>
                              <Select
                                options={RING_SIZES}
                                selected={field.value}
                                setSelected={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      )}

                      {/* Length (Only for chains/mangalsutra) */}
                      {isChainOrMangalsutra && (
                        <FormField control={form.control} name={`variants.${index}.length`} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Length</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., 18 inches" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      )}

                      {/* GST */}
                      <FormField control={form.control} name={`variants.${index}.gst`} render={({ field }) => (
                        <FormItem>
                          <FormLabel>GST (%) <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Labour Charge */}
                      <FormField control={form.control} name={`variants.${index}.labourCharge`} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Labour (%) <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input {...field} placeholder="e.g., 10" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Hallmark Charges */}
                      <FormField control={form.control} name={`variants.${index}.hallmarkCharges`} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hallmark <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  )
                })}
              </div>

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
