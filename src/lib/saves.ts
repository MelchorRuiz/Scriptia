import { turso } from './db';

export const createSavedPost = async (userId: string, postId: string) => {
    await turso.execute({
        sql: 'INSERT INTO saved_posts (user_id, post_id) VALUES (?, ?)',
        args: [userId, postId],
    });
};

export const deleteSavedPost = async (userId: string, postId: string) => {
    await turso.execute({
        sql: 'DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?',
        args: [userId, postId],
    });
};
