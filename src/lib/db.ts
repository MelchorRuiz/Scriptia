import { createClient } from "@libsql/client";
import { getSecret } from 'astro:env/server';

export const turso = createClient({
  url: getSecret('TURSO_DATABASE_URL') as string,
  authToken: getSecret('TURSO_AUTH_TOKEN') as string,
});
