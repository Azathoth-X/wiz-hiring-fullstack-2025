import { Hono } from 'hono'
import { RootVariables } from '../index'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { sign } from 'hono/jwt'
import { hashPassword, comparePassword } from '../utils/auth'
import { signupSchema, signinSchema, SignupInput, SigninInput } from '../validations/user'
import { ZodError } from 'zod'
import { JWT_EXPIRATION_TIME } from '../config'


const userRouter = new Hono<{
  Bindings: CloudflareBindings;
  Variables: RootVariables;
}>();

// Signup route
userRouter.post('/signup', async (c) => {
  try {
    const body = await c.req.json();

    const validatedData = signupSchema.parse(body);
    const { name, username, email, password } = validatedData;

    const db = c.get('db');

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return c.json({ error: 'User with this email already exists' }, 409);
    }

    const existingUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUsername.length > 0) {
      return c.json({ error: 'Username already taken' }, 409);
    }
    const hashedPassword = await hashPassword(password);

    const newUser = await db
      .insert(users)
      .values({
        name,
        username,
        email,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
      });

    const payload = {
      id: newUser[0].id,
      username: newUser[0].username,
      exp: JWT_EXPIRATION_TIME, 
    };

    const secret = c.env?.JWT_SECRET 
    const token = await sign(payload, secret);

    return c.json({
      message: 'User created successfully',
      user: newUser[0],
      token,
    }, 201);
  } 
  catch (error) {

    if (error instanceof ZodError) {
      return c.json({ 
        error: 'Validation failed', 
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, 400);
    }

    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Signin route
userRouter.post('/signin', async (c) => {
  try {
    const body = await c.req.json();

    console.log(body)
    const validatedData = signinSchema.parse(body);
    const { email, password } = validatedData;

    const db = c.get('db');

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }    
    const isPasswordValid = await comparePassword(password, user[0].password);

    if (!isPasswordValid) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const payload = {
      id: user[0].id,
      username: user[0].username,
      exp:JWT_EXPIRATION_TIME,
    };

    const secret = c.env?.JWT_SECRET ;
    const token = await sign(payload, secret);

    const { password: _, ...userWithoutPassword } = user[0];

    return c.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } 
  catch (error) {

    if (error instanceof ZodError) {
      return c.json({ 
        error: 'Validation failed', 
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, 400);
    }

    console.error('Signin error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export { userRouter };
