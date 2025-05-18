import type { APIRoute } from 'astro';
import { addComment } from '../../lib/comments';

export const POST: APIRoute = async ({ locals, request }) => {
    const user = await locals.currentUser();
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { postId, content } = await request.json();
    if (!postId || !content) {
        return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
    }

    try {
        const comment = await addComment(postId, user.id, content);
        return new Response(JSON.stringify(comment), { 
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};