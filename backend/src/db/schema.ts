import { pgTable, uuid, text, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const dayOfWeekEnum = pgEnum('day_of_week', [
  'SUNDAY',
  'MONDAY', 
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY'
]);

export const meetingStatusEnum = pgEnum('meeting_status', [
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

// Availability table
export const availability = pgTable('availability', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  timeGap: integer('time_gap').default(30).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Day Availability table
export const dayAvailability = pgTable('day_availability', {
  id: uuid('id').primaryKey().defaultRandom(),
  availabilityId: uuid('availability_id').references(() => availability.id, { onDelete: 'cascade' }),
  day: dayOfWeekEnum('day').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  isAvailable: boolean('is_available').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Events table
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  duration: integer('duration').default(30).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Meetings table
export const meetings = pgTable('meetings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
  guestName: text('guest_name').notNull(),
  guestEmail: text('guest_email').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: meetingStatusEnum('status').default('SCHEDULED').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  availability: one(availability, {
    fields: [users.id],
    references: [availability.userId]
  }),
  events: many(events)
}));

export const availabilityRelations = relations(availability, ({ one, many }) => ({
  user: one(users, {
    fields: [availability.userId],
    references: [users.id]
  }),
  days: many(dayAvailability)
}));

export const dayAvailabilityRelations = relations(dayAvailability, ({ one }) => ({
  availability: one(availability, {
    fields: [dayAvailability.availabilityId],
    references: [availability.id]
  })
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id]
  }),
  meetings: many(meetings)
}));

export const meetingsRelations = relations(meetings, ({ one }) => ({
  user: one(users, {
    fields: [meetings.userId],
    references: [users.id]
  }),
  event: one(events, {
    fields: [meetings.eventId],
    references: [events.id]
  })
}));

// Export all tables for Drizzle client
export const finalSchema = {
  users,
  availability,
  dayAvailability,
  events,
  meetings,
  usersRelations,
  availabilityRelations,
  dayAvailabilityRelations,
  eventsRelations,
  meetingsRelations
};