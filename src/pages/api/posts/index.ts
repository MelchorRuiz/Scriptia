import type { APIRoute } from 'astro';
import { getPosts, createPost } from '../../../lib/posts';

export const GET: APIRoute = async ({ locals, request }) => {
    try {
        const user = await locals.currentUser();
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const limit = parseInt(url.searchParams.get('limit') || '10', 10);
        const posts = await getPosts(user.id, page, limit);
        const hasMore = posts.length === limit;
        return new Response(JSON.stringify({ posts, hasMore }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};

export const POST: APIRoute = async ({ locals, request }) => {
    try {
        const user = await locals.currentUser();
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }
        
        const { title, description, language, dependecies, code } = await request.json();
        if (!title || !description || !code || !language || !dependecies) {
            return new Response('Bad Request', { status: 400 });
        }

        const postId = await createPost(user.id, title, description, code, language, dependecies);

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
