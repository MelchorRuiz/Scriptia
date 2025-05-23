import { getSecret } from 'astro:env/server';
import Database from 'better-sqlite3'
import path from 'path';

const db = new Database(path.resolve(getSecret("DB_FILE") || 'data/database.sqlite'));

export const createSavedPost = (userId: string, postId: string) => {
    const stmt = db.prepare(`
        INSERT INTO saved_posts (user_id, post_id) VALUES (?, ?)
    `);
    stmt.run(userId, postId);
}

export const deleteSavedPost = (userId: string, postId: string) => {
    const stmt = db.prepare(`
        DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?
    `);
    stmt.run(userId, postId);
}
