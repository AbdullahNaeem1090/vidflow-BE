import { z } from "zod";


export const signupSchema = z.object({
  username: z
    .string()
    .min(4, "Username must be at least 3 characters long")
    .max(20, "Username cannot exceed 20 characters"),

  email: z
    .string()
    .email("Invalid email format"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});