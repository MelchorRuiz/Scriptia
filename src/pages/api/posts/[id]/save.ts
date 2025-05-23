import type { APIRoute } from 'astro';
import { checkIfPostExists } from '../../../../lib/posts';
import { createSavedPost, deleteSavedPost } from '../../../../lib/saves';

export const POST: APIRoute = async ({ locals, params }) => {
    try {
        const user = await locals.currentUser();
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }
        
        const postId = params.id as string;
        if (!postId) {
            return new Response('Bad Request', { status: 400 });
        }

        const postExists = await checkIfPostExists(postId);
        if (!postExists) {
            return new Response('Post not found', { status: 404 });
        }

        await createSavedPost(user.id, postId);
        return new Response(JSON.stringify({ message: 'Post saved successfully' }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error saving post:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};

export const DELETE: APIRoute = async ({ locals, params }) => {
    try {
        const user = await locals.currentUser();
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }
        
        const postId = params.id as string;
        if (!postId) {
            return new Response('Bad Request', { status: 400 });
        }

        const postExists = await checkIfPostExists(postId);
        if (!postExists) {
            return new Response('Post not found', { status: 404 });
        }

        await deleteSavedPost(user.id, postId);
        return new Response(JSON.stringify({ message: 'Post unsaved successfully' }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error unsaving post:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};