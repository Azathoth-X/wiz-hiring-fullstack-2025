import { Hono } from 'hono';
import { RootVariables } from '../index';
import { events, eventSlots, bookings, users } from '../db/schema';
import { eq, and, sql, desc, asc } from 'drizzle-orm';
import { createEventSchema, bookSlotSchema, getBookingsQuerySchema, CreateEventInput, BookSlotInput } from '../validations/event';
import { ZodError } from 'zod';

interface eventRouterBindings extends CloudflareBindings{
  currentUserID : string
}
const eventRouter = new Hono<{
  Bindings: eventRouterBindings;
  Variables: RootVariables;
}>();



//  POST /events (requires authentication)
eventRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = createEventSchema.parse(body);
    const { title, description, isPrivate, slots } = validatedData;

    const db = c.get('db');
    
    // TODO: Replace with actual authenticated user ID
    const userId = c.req.header('user-id') || 'mock-user-id';

    // Use transaction to create event and slots atomically
    const result = await db.transaction(async (tx) => {

      const newEvent = await tx
        .insert(events)
        .values({
          title,
          description,
          isPrivate,
          userId,
        })
        .returning();

      const eventId = newEvent[0].id;
      const slotsToInsert = slots.map(slot => ({
        eventId,
        startTime: new Date(slot.startTime),
        endTime: new Date(slot.endTime),
        maxBookings: slot.maxBookings,
      }));

      const createdSlots = await tx
        .insert(eventSlots)
        .values(slotsToInsert)
        .returning();

      return {
        event: newEvent[0],
        slots: createdSlots
      };
    });

    return c.json({
      message: 'Event created successfully',
      event: {
        ...result.event,
        slots: result.slots
      }
    }, 201);

  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, 400);
    }

    console.error('Create event error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /events (public)
eventRouter.get('/list', async (c) => {
  try {
    const db = c.get('db');

    const eventList = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        isPrivate: events.isPrivate,
        createdAt: events.createdAt,
        creator: {
          name: users.name,
          username: users.username
        },
        totalSlots: sql<number>`count(${eventSlots.id})`,
        availableSlots: sql<number>`count(case when ${eventSlots.currentBookings} < ${eventSlots.maxBookings} and ${eventSlots.isActive} = true then 1 end)`
      })
      .from(events)
      .leftJoin(users, eq(events.userId, users.id))
      .leftJoin(eventSlots, eq(events.id, eventSlots.eventId))
      .where(eq(events.isPrivate, false))
      .groupBy(events.id, users.name, users.username)
      .orderBy(desc(events.createdAt));

    return c.json({
      events: eventList
    });

  } catch (error) {
    console.error('List events error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /events/:id (public)
eventRouter.get('/:id', async (c) => {
  try {
    const eventId = c.req.param('id');
    const db = c.get('db');

    const eventData = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        isPrivate: events.isPrivate,
        createdAt: events.createdAt,
        creator: {
          name: users.name,
          username: users.username
        }
      })
      .from(events)
      .leftJoin(users, eq(events.userId, users.id))
      .where(eq(events.id, eventId))
      .limit(1);

    if (eventData.length === 0) {
      return c.json({ error: 'Event not found' }, 404);
    }

    const eventSlotsList = await db
      .select({
        id: eventSlots.id,
        startTime: eventSlots.startTime,
        endTime: eventSlots.endTime,
        maxBookings: eventSlots.maxBookings,
        currentBookings: eventSlots.currentBookings,
        isActive: eventSlots.isActive,
        isAvailable: sql<boolean>`${eventSlots.currentBookings} < ${eventSlots.maxBookings} and ${eventSlots.isActive} = true`
      })
      .from(eventSlots)
      .where(eq(eventSlots.eventId, eventData[0].id))
      .orderBy(asc(eventSlots.startTime));

    return c.json({
      event: {
        ...eventData[0],
        slots: eventSlotsList
      }
    });

  } catch (error) {
    console.error('Get event details error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /events/:id/bookings (public)
eventRouter.post('/:id/bookings', async (c) => {
  try {
    const eventId = c.req.param('id');
    const body = await c.req.json();
    const validatedData = bookSlotSchema.parse(body);
    const { slotId, guestName, guestEmail  } = validatedData;

    const db = c.get('db');

    const result = await db.transaction(async (tx) => {

      const eventData = await tx
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (eventData.length === 0) {
        throw new Error('Event not found');
      }

      const slot = await tx
        .select()
        .from(eventSlots)
        .where(and(
          eq(eventSlots.id, slotId),
          eq(eventSlots.eventId, eventData[0].id)
        ))
        .limit(1);

      if (slot.length === 0) {
        throw new Error('Slot not found');
      }

      if (slot[0].currentBookings >= slot[0].maxBookings) {
        throw new Error('Slot is fully booked');
      }

      if (!slot[0].isActive) {
        throw new Error('Slot is not active');
      }

      //prevent duplication
      const existingBooking = await tx
        .select()
        .from(bookings)
        .where(and(
          eq(bookings.slotId, slotId),
          eq(bookings.guestEmail, guestEmail),
          eq(bookings.status, 'SCHEDULED')
        ))
        .limit(1);

      if (existingBooking.length > 0) {
        throw new Error('You have already booked this slot');
      }

      const newBooking = await tx
        .insert(bookings)
        .values({
          slotId,
          eventId: eventData[0].id,
          guestName,
          guestEmail,
        })
        .returning();

      await tx
        .update(eventSlots)
        .set({
          currentBookings: sql`${eventSlots.currentBookings} + 1`,
          updatedAt: new Date()
        })
        .where(eq(eventSlots.id, slotId));

      return {
        booking: newBooking[0],
        slot: slot[0],
        event: eventData[0]
      };
    });

    return c.json({
      message: 'Booking successful',
      booking: {
        id: result.booking.id,
        guestName: result.booking.guestName,
        guestEmail: result.booking.guestEmail,
        slot: {
          startTime: result.slot.startTime,
          endTime: result.slot.endTime
        },
        event: {
          title: result.event.title,
        },
        bookedAt: result.booking.bookedAt
      }
    }, 201);

  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, 400);
    }

    if (error instanceof Error) {
      if (error.message === 'Event not found') {
        return c.json({ error: 'Event not found' }, 404);
      }
      if (error.message === 'Slot not found') {
        return c.json({ error: 'Slot not found' }, 404);
      }
      if (error.message === 'Slot is fully booked') {
        return c.json({ error: 'Slot is fully booked' }, 409);
      }
      if (error.message === 'Slot is not active') {
        return c.json({ error: 'Slot is not active' }, 409);
      }
      if (error.message === 'You have already booked this slot') {
        return c.json({ error: 'You have already booked this slot' }, 409);
      }
      
      if (error.message.includes('unique') || error.message.includes('duplicate')) {
        return c.json({ error: 'You have already booked this slot' }, 409);
      }
    }

    console.error('Book slot error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

//  GET /bookings?email=user@example.com (public)
eventRouter.get('/bookings', async (c) => {
  try {
    const query = c.req.query();
    const validatedQuery = getBookingsQuerySchema.parse(query);
    const { email } = validatedQuery;

    const db = c.get('db');

    const userBookings = await db
      .select({
        id: bookings.id,
        guestName: bookings.guestName,
        guestEmail: bookings.guestEmail,
        status: bookings.status,
        bookedAt: bookings.bookedAt,
        slot: {
          id: eventSlots.id,
          startTime: eventSlots.startTime,
          endTime: eventSlots.endTime
        },
        event: {
          id: events.id,
          title: events.title,
          description: events.description
        }
      })
      .from(bookings)
      .leftJoin(eventSlots, eq(bookings.slotId, eventSlots.id))
      .leftJoin(events, eq(bookings.eventId, events.id))
      .where(eq(bookings.guestEmail, email))
      .orderBy(desc(bookings.bookedAt));

    return c.json({
      bookings: userBookings
    });

  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, 400);
    }

    console.error('Get bookings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export { eventRouter };
