import type { APIRoute } from 'astro';
import queue from '../../lib/queue.js';
import { createTask, runTask } from '../../lib/taskManager.js';

export const POST: APIRoute = async ({ request }) => {
  const { code } = await request.json();
  if (!code) {
    return new Response(JSON.stringify({ error: 'No code provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id } = createTask();
  queue.add(() => runTask(id, code));

  return new Response(JSON.stringify({ taskId: id }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
