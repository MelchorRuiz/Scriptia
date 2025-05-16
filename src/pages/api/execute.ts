import type { APIRoute } from 'astro';
import queue from '../../lib/queue.js';
import { createTask, runTask } from '../../lib/taskManager.js';

export const POST: APIRoute = async ({ locals, request }) => {
  const user = await locals.currentUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { code, params } = await request.json();
  if (!code) {
    return new Response(JSON.stringify({ error: 'No code provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id } = createTask();
  queue.add(() => runTask(id, code, params));

  return new Response(JSON.stringify({ taskId: id }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
