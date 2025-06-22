import { z } from 'zod';

// User signup validation schema
export const signupSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces'),
  
  username: z.string()
    .min(3, 'Username must be at least 3 characters long')
    .max(20, 'Username must not exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username must contain only letters, numbers, and underscores')
    .toLowerCase(),
  
  email: z.string()
    .email('Invalid email format')
    .max(100, 'Email must not exceed 100 characters')
    .toLowerCase(),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
});

// User signin validation schema
export const signinSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(100, 'Email must not exceed 100 characters')
    .toLowerCase(),
  
  password: z.string()
    .min(1, 'Password is required')
    .max(100, 'Password must not exceed 100 characters')
});

// User profile update schema (for future use)
export const updateProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces')
    .optional(),
  
  imageUrl: z.string()
    .url('Invalid URL format')
    .optional()
    .nullable()
});

// Type exports for TypeScript
export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
