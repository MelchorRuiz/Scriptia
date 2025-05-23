import { turso } from './db';
import { getUserById } from './users';
import type { Comment } from '../types/Comment';

export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
    const { rows } = await turso.execute({
        sql: 'SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC',
        args: [postId],
    });
    const commentsWithUser = await Promise.all(rows.map(async (row: any) => {
        const user = await getUserById(String(row.user_id));
        if (!user) {
            throw new Error(`User with ID ${row.user_id} not found`);
        }
        return {
            id: Number(row.id),
            post_id: Number(row.post_id),
            user_id: String(row.user_id),
            content: String(row.content),
            created_at: String(row.created_at),
            user,
        };
    }));
    return commentsWithUser;
}

export async function addComment(postId: number, userId: string, content: string): Promise<Comment> {
    await turso.execute({
        sql: 'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
        args: [postId, userId, content],
    });
    const { rows } = await turso.execute({
        sql: 'SELECT * FROM comments WHERE post_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1',
        args: [postId, userId],
    });
    const row = rows[0];
    const user = await getUserById(userId);
    if (!user) {
        throw new Error(`User with ID ${userId} not found`);
    }
    return {
        id: Number(row.id),
        post_id: Number(row.post_id),
        user_id: String(row.user_id),
        content: String(row.content),
        created_at: String(row.created_at),
        user,
    };
}
