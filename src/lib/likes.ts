import { getSecret } from 'astro:env/server';
import Database from 'better-sqlite3'
import path from 'path';

const db = new Database(path.resolve(getSecret("DB_FILE") || 'data/database.sqlite'));

export const getNumberOfLikesByUserId = (userId: string) => {
    const stmt = db.prepare(`
        SELECT COUNT(*) as count FROM likes WHERE post_id IN (
            SELECT id FROM posts WHERE user_id = ?
        )
    `);
    const row = stmt.get(userId) as { count: number };
    return row.count;
}

export const createLike = (userId: string, postId: string) => {
    const stmt = db.prepare(`
        INSERT INTO likes (user_id, post_id) VALUES (?, ?)
    `);
    stmt.run(userId, postId);
}

export const deleteLike = (userId: string, postId: string) => {
    const stmt = db.prepare(`
        DELETE FROM likes WHERE user_id = ? AND post_id = ?
    `);
    stmt.run(userId, postId);
}
