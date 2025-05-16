import type { APIRoute } from 'astro';
import { getTask } from '../../../lib/taskManager.js';

export const GET: APIRoute = async ({ locals, params }) => {
  const user = await locals.currentUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const id = params.id as string;
  const task = getTask(id);

  if (!task) {
    return new Response(JSON.stringify({ error: 'Task not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(task), {
    headers: { 'Content-Type': 'application/json' },
  });
}
