import type { APIRoute } from 'astro';
import { getPostsBySearch } from '../../lib/posts';

export const GET: APIRoute = async ({ locals, request }) => {
    const user = await locals.currentUser();
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    try {
        const posts = getPostsBySearch(user.id, query);
        return new Response(JSON.stringify({ posts }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}