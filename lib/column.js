// import dayjs from "dayjs"
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import userIcon from '@/public/assets/user.png'
import { Chip } from '@mui/material';
export const DT_CATEGORY_COLUMN = [
    {
        accessorKey: 'name',
        header: 'Category Name',
    },
    {
        accessorKey: 'slug',
        header: 'Slug',
    },
]

export const DT_SUB_CATEGORY_COLUMN = [
    {
        accessorKey: 'name',
        header: 'Subcategory Name',
    },
    {
        accessorKey: 'slug',
        header: 'Slug',
    },
    {
        id: 'categories', // important!!
        accessorFn: (row) => {
            // Extract category names from junction table
            const categories = row.categorySubCategories?.map(csc => csc.category?.name).filter(Boolean) || []
            return categories.join(', ')
        },
        header: 'Categories',
        filterFn: 'contains',
        Cell: ({ row }) => {
            const categories = row.original.categorySubCategories?.map(csc => csc.category) || []
            return (
                <div className="flex flex-wrap gap-1">
                    {categories.length > 0 ? (
                        categories.map((cat, index) => (
                            <Chip key={index} label={cat?.name || 'N/A'} size="small" color="primary" variant="outlined" />
                        ))
                    ) : (
                        <span className="text-gray-400 text-sm">No categories</span>
                    )}
                </div>
            )
        }
    },
]

export const DT_PRODUCT_COLUMN = [
    { accessorKey: 'name', header: 'Product Name' },
    { accessorKey: 'slug', header: 'Slug' },
    { accessorKey: 'categoryName', header: 'Category', filterFn: 'contains' },
    { accessorKey: 'subCategoryName', header: 'SubCategory', filterFn: 'contains' },
    {
        id: 'variantsCount',
        accessorKey: 'variants',
        header: 'Variants',
        Cell: ({ row }) => {
            const variants = row.original.variants || [];
            if (variants.length === 0) return <span className="text-gray-400">No variants</span>;

            const tooltipContent = variants.map((v, idx) =>
                `Variant ${idx + 1}: ${v.weight}g, ${v.purity}, GST: ${v.gst}%, Labour: ${v.labourCharge}, Hallmark: ${v.hallmarkCharges}`
            ).join('\n');

            return (
                <Chip
                    label={`${variants.length} variant${variants.length > 1 ? 's' : ''}`}
                    size="small"
                    color="primary"
                    title={tooltipContent}
                    style={{ cursor: 'help' }}
                />
            );
        }
    },
    {
        accessorKey: 'weight',
        header: 'Weight (g)',
        Cell: ({ row }) => {
            const variants = row.original.variants || [];
            if (variants.length > 0) {
                const weights = variants.map(v => v.weight).join(', ');
                return <span>{weights}</span>
            }
            return <span>N/A</span>
        }
    },
    {
        accessorKey: 'purity',
        header: 'Purity',
        Cell: ({ row }) => {
            const variants = row.original.variants || [];
            if (variants.length > 0) {
                // unique purities
                const purities = [...new Set(variants.map(v => v.purity))].join(', ');
                return <span>{purities}</span>
            }
            return <span>N/A</span>
        }
    },
    {
        accessorKey: 'gst',
        header: 'GST (%)',
        Cell: ({ row }) => {
            const variants = row.original.variants || [];
            if (variants.length > 0) {
                const gstValues = variants.map(v => `${v.gst}%`).join(', ');
                return <span>{gstValues}</span>
            }
            return <span>N/A</span>
        }
    },
    {
        accessorKey: 'labourCharge',
        header: 'Labour Charge',
        Cell: ({ row }) => {
            const variants = row.original.variants || [];
            if (variants.length > 0) {
                const charges = variants.map(v => v.labourCharge).join(', ');
                return <span>{charges}</span>
            }
            return <span>N/A</span>
        }
    },
    {
        accessorKey: 'hallmarkCharges',
        header: 'Hallmark Charges',
        Cell: ({ row }) => {
            const variants = row.original.variants || [];
            if (variants.length > 0) {
                const charges = variants.map(v => v.hallmarkCharges).join(', ');
                return <span>{charges}</span>
            }
            return <span>N/A</span>
        }
    },
    { accessorKey: 'gender', header: 'Gender' },
];

export const DT_CUSTOMERS_COLUMN = [
    {
        accessorKey: 'avatar',
        header: 'Avatar',
        Cell: ({ renderedCellValue }) => (
            <Avatar>
                <AvatarImage src={renderedCellValue?.url || userIcon.src} />
            </Avatar>
        )
    },
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'phone',
        header: 'Phone',
    },
    {
        accessorKey: 'address',
        header: 'Address',
    },
    {
        accessorKey: 'isEmailVerified',
        header: 'Is Verified',
        Cell: ({ renderedCellValue }) => (
            renderedCellValue ? <Chip color="success" label="Verified" /> : <Chip color="error" label="Not Verified" />
        )
    },

]