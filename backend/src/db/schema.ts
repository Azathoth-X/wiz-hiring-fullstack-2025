import { pgTable, uuid, text, integer, boolean, timestamp, pgEnum, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const bookingStatusEnum = pgEnum('booking_status', [
  'SCHEDULED',
  'CANCELLED'
]);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Events table
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  isPrivate: boolean('is_private').default(false).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Event Slots table
export const eventSlots = pgTable('event_slots', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  maxBookings: integer('max_bookings').default(1).notNull(),
  currentBookings: integer('current_bookings').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Bookings table
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  slotId: uuid('slot_id').references(() => eventSlots.id, { onDelete: 'cascade' }),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
  guestName: text('guest_name').notNull(),
  guestEmail: text('guest_email').notNull(),
  status: bookingStatusEnum('status').default('SCHEDULED').notNull(),
  bookedAt: timestamp('booked_at').defaultNow().notNull()
}, (table) => ({
  // Unique constraint to prevent double booking: same email + slot
  uniqueEmailSlot: unique().on(table.guestEmail, table.slotId)
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events)
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id]
  }),
  slots: many(eventSlots),
  bookings: many(bookings)
}));

export const eventSlotsRelations = relations(eventSlots, ({ one, many }) => ({
  event: one(events, {
    fields: [eventSlots.eventId],
    references: [events.id]
  }),
  bookings: many(bookings)
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  slot: one(eventSlots, {
    fields: [bookings.slotId],
    references: [eventSlots.id]
  }),
  event: one(events, {
    fields: [bookings.eventId],
    references: [events.id]
  })
}));

// Export all tables for Drizzle client
export const finalSchema = {
  users,
  events,
  eventSlots,
  bookings,
  usersRelations,
  eventsRelations,
  eventSlotsRelations,
  bookingsRelations
};