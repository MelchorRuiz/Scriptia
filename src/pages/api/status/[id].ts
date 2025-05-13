import type { APIRoute } from 'astro';
import { getTask } from '../../../lib/taskManager.js';

export const GET: APIRoute = ({ params }) => {
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
