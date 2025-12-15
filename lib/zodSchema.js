import { z } from "zod";

export const zSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name must not exceed 50 characters" }),
  // .regex(/^[A-Za-z\s]+$/, { message: "Name can only contain letters and spaces" }),

  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address format" })
    .max(255, { message: "Email must not exceed 255 characters" }),

  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(64, { message: "Password must not exceed 64 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),

  otp: z
    .string()
    .regex(/^\d{6}$/, { message: "OTP must be exactly 6 digits." }),

  id: z.string().min(3, 'id is required'),
  alt: z.string().min(3, 'Alt is required'),
  title: z.string().min(3, 'Title is required'),
  slug: z.string().min(3, 'Slug is required.'),

  categoryId: z.string().min(1, { message: "Category is required" }),
  // categoryIds: z.array(z.string().min(1)).min(1, { message: "At least one category is required" }),
  subCategoryId: z.string().min(1, { message: "Sub-Category is required" }),

  variants: z.array(z.object({
    id: z.string().optional(),
    weight: z.coerce.number().positive({ message: "Weight must be positive" }),
    purity: z.string().min(1, { message: "Purity is required" }),
    gst: z.coerce.number().min(0, { message: "GST must be non-negative" }),
    labourCharge: z.coerce.number().min(0, { message: "Labour Charge must be non-negative" }),
    hallmarkCharges: z.coerce.number().min(0, { message: "Hallmark Charges must be non-negative" }),
    size: z.string().optional(),
  })).min(1, { message: "At least one variant is required" }),
  gender: z.enum(["MEN", "WOMEN"]),
  description: z.string().min(1),

  media: z.array(z.string()), // array of media IDs


});
