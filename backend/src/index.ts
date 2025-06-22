import { Hono } from 'hono'
import { Frontend } from './config';
import { drizzle } from 'drizzle-orm/node-postgres'
import { finalSchema } from './db/schema';
import { cors } from 'hono/cors';

function dbBindingType(connectionString : string){
  return drizzle(connectionString, {
    schema: finalSchema
  });
}

export type RootVariables={
    db: ReturnType<typeof dbBindingType>
}

const app = new Hono<{
  Bindings:CloudflareBindings,
  Variables:RootVariables
}>().basePath('/v1')

// app.use(cors({
//   allowHeaders: ['Content-Type', 'Authorization'],
//   allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   exposeHeaders: ['Content-Length', 'Content-Type'],
//   credentials: true,
//   maxAge: 600
// }));

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
