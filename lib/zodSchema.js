import { z } from "zod";

export const zSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name must not exceed 50 characters" })
    .regex(/^[A-Za-z\s]+$/, { message: "Name can only contain letters and spaces" }),

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

  id:z.string().min(3,'id is required'),
  alt:z.string().min(3,'Alt is required'),
  title:z.string().min(3,'Title is required'),
});
