import type { APIRoute } from 'astro';
import { createFollow, deleteFollow } from '../../../../lib/followers';

export const POST: APIRoute = async ({ locals, params }) => {
    try {
        const user = await locals.currentUser();
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }
        
        const userId = params.id as string;
        if (!userId) {
            return new Response('Bad Request', { status: 400 });
        }

        await createFollow(user.id, userId);
        return new Response(JSON.stringify({ message: 'User followed successfully' }), {
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

export const DELETE: APIRoute = async ({ locals, params }) => {
    try {
        const user = await locals.currentUser();
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }
        
        const userId = params.id as string;
        if (!userId) {
            return new Response('Bad Request', { status: 400 });
        }

        await deleteFollow(user.id, userId);
        return new Response(JSON.stringify({ message: 'User unfollowed successfully' }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error('Error deleting follow:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};
