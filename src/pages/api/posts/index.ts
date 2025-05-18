import type { APIRoute } from 'astro';
import { createPost } from '../../../lib/posts';

export const POST: APIRoute = async ({ locals, request }) => {
    try {
        const user = await locals.currentUser();
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }
        
        const { title, description, code } = await request.json();
        if (!title || !description || !code) {
            return new Response('Bad Request', { status: 400 });
        }

        const postId = await createPost(user.id, title, description, code, 'alpine');

        return new Response(JSON.stringify({ postId }), {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error('Error creating post:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};