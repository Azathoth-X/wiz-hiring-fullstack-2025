import { Hono } from 'hono'
import { Frontend } from './config'
import { drizzle } from 'drizzle-orm/postgres-js'
import { finalSchema } from './db/schema'
import { cors } from 'hono/cors'
import { userRouter } from './routes/users'
import postgres  from 'postgres'
import { eventRouter } from './routes/events'

function dbBindingType(connectionString : string){
  const pool =  postgres(connectionString,{
    idle_timeout:10,
    max:1,
  });
  return drizzle(pool, {
    schema: finalSchema
  });
}

export type RootVariables={
    db: ReturnType<typeof dbBindingType>;
};

const app = new Hono<{
  Bindings:CloudflareBindings,
  Variables:RootVariables
}>().basePath('/v1');

app.use(cors({
  origin:"*",
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length', 'Content-Type'],
  credentials: true,
  maxAge: 600
}));

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.use('*', async (c, next) => {
  const connectionString = c.env.DB_URL;
  if (!connectionString) {
    return c.json({ error: 'Database connection string not found' }, 500);
  }
  
  const db = dbBindingType(connectionString);
  c.set('db', db);
  
  await next();
});

app.route('/users', userRouter);
app.route('/events', eventRouter);

app.all('*', (c) => {
  return c.json({ 
    error: 'Route not found',
    path: c.req.path,
    method: c.req.method 
  }, 404);
});


export default app;
