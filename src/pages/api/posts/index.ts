import type { APIRoute } from 'astro';
import Database from 'better-sqlite3'
import path from 'path';

const db = new Database(path.resolve('data/database.sqlite'), { verbose: console.log });

const createPost = async (
    userId: string,
    title: string, 
    description: string, 
    code: string,
    language: string,
) => {
    const insertPost = db.prepare(`
        INSERT INTO posts (user_id, created_at, last_activity_at) VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const insertVersion = db.prepare(`
        INSERT INTO post_versions (post_id, title, description, code, language, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const transaction = db.transaction(() => {
        const result = insertPost.run(userId);
        const postId = result.lastInsertRowid;

        insertVersion.run(postId, title, description, code, language);

        return postId;
    });

    return transaction();
}

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