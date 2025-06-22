import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title must not exceed 100 characters'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters long')
    .max(500, 'Description must not exceed 500 characters'),
  
  isPrivate: z.boolean().optional().default(false),
  
  slots: z.array(
    z.object({
      startTime: z.string()
        .datetime('Invalid datetime format. Use ISO 8601 format (e.g., 2025-06-20T10:00:00Z)'),
      endTime: z.string()
        .datetime('Invalid datetime format. Use ISO 8601 format (e.g., 2025-06-20T10:30:00Z)'),
      maxBookings: z.number()
        .min(1, 'Maximum bookings must be at least 1')
        .max(50, 'Maximum bookings cannot exceed 50')
    })
  )
  .min(1, 'At least one slot is required')
  .max(20, 'Cannot create more than 20 slots per event')
  .refine(
    (slots) => {
      return slots.every(slot => new Date(slot.endTime) > new Date(slot.startTime));
    },
    {
      message: 'End time must be after start time for all slots'
    }
  )
  .refine(
    (slots) => {
      const now = new Date();
      return slots.every(slot => new Date(slot.startTime) > now);
    },
    {
      message: 'All slots must be scheduled for future dates'
    }
  )
});

// Book slot validation schema
export const bookSlotSchema = z.object({
  slotId: z.string()
    .uuid('Invalid slot ID format'),
  
  guestName: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces'),
  
  guestEmail: z.string()
    .email('Invalid email format')
    .max(100, 'Email must not exceed 100 characters')
    .toLowerCase(),
  
});

// Get bookings query validation
export const getBookingsQuerySchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
});

// Type exports for TypeScript
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type BookSlotInput = z.infer<typeof bookSlotSchema>;
export type GetBookingsQuery = z.infer<typeof getBookingsQuerySchema>;
