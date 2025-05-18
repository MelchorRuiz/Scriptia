import Database from 'better-sqlite3'
import path from 'path';

const db = new Database(path.resolve('data/database.sqlite'), { verbose: console.log });

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
