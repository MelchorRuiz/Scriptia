import Database from 'better-sqlite3'
import path from 'path';
import type { PostPreviewType } from '../types/Post';

const db = new Database(path.resolve('data/database.sqlite'), { verbose: console.log });

export const checkIfPostExists = (postId: string) => {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM posts WHERE id = ?');
    const row = stmt.get(postId) as { count: number };
    return row.count > 0;
}

export const getNumberOfPostsByUserId = (userId: string) => {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM posts p WHERE p.user_id = ?');
    const row = stmt.get(userId) as { count: number };
    return row.count;
}

export const getPostsByUserId = (userId: string): PostPreviewType[] => {
    const stmt = db.prepare(`
        SELECT 
            p.id, 
            pv.title, 
            pv.description, 
            pv.code, 
            pv.language,
            EXISTS (
                SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?
            ) AS liked,
            EXISTS (
                SELECT 1 FROM saved_posts s WHERE s.post_id = p.id AND s.user_id = ?
            ) AS saved
        FROM posts p
        JOIN post_versions pv ON p.id = pv.post_id and pv.created_at = p.last_activity_at
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
    `);
    return stmt.all(userId, userId, userId) as PostPreviewType[];
}

export const getPostsLikedByUserId = (userId: string): PostPreviewType[] => {
    const stmt = db.prepare(`
        SELECT 
            p.id, 
            pv.title, 
            pv.description, 
            pv.code, 
            pv.language,
            EXISTS (
                SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?
            ) AS liked,
            EXISTS (
                SELECT 1 FROM saved_posts s WHERE s.post_id = p.id AND s.user_id = ?
            ) AS saved
        FROM posts p
        JOIN post_versions pv ON p.id = pv.post_id and pv.created_at = p.last_activity_at
        JOIN likes l ON l.post_id = p.id
        WHERE l.user_id = ?
        ORDER BY p.created_at DESC
    `);
    return stmt.all(userId, userId, userId) as PostPreviewType[];
}

export const getPostsSavedByUserId = (userId: string): PostPreviewType[] => {
    const stmt = db.prepare(`
        SELECT
            p.id,
            pv.title,
            pv.description,
            pv.code,
            pv.language,
            EXISTS (
                SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?
            ) AS liked,
            EXISTS (
                SELECT 1 FROM saved_posts s WHERE s.post_id = p.id AND s.user_id = ?
            ) AS saved
        FROM posts p
        JOIN post_versions pv ON p.id = pv.post_id and pv.created_at = p.last_activity_at
        JOIN saved_posts s ON s.post_id = p.id
        WHERE s.user_id = ?
        ORDER BY p.created_at DESC
    `);
    return stmt.all(userId, userId, userId) as PostPreviewType[];
}

export const createPost = async (
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
