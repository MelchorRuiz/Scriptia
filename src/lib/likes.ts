import { turso } from './db';

export const getNumberOfLikesByUserId = async (userId: string) => {
    const { rows } = await turso.execute({
        sql: `SELECT COUNT(*) as count FROM likes WHERE post_id IN (SELECT id FROM posts WHERE user_id = ?)`,
        args: [userId],
    });
    return Number(rows[0]?.count ?? 0);
};

export const createLike = async (userId: string, postId: string) => {
    await turso.execute({
        sql: 'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
        args: [userId, postId],
    });
};

export const deleteLike = async (userId: string, postId: string) => {
    await turso.execute({
        sql: 'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
        args: [userId, postId],
    });
};
