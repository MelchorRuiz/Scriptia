import type { APIRoute } from 'astro';
import queue from '../../lib/queue.js';
import { createTask, runTask } from '../../lib/taskManager.js';

export const POST: APIRoute = async ({ locals, request }) => {
  const user = await locals.currentUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { language, dependecies, code, params } = await request.json();
  if (!language || !dependecies || !code) {
    return new Response(JSON.stringify({ error: 'No code provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id } = await createTask();
  queue.add(() => runTask(id, code, params, language, dependecies))

  return new Response(JSON.stringify({ taskId: id }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
