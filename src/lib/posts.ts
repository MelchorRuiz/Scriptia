import Database from 'better-sqlite3'
import path from 'path';
import type { PostPreviewType, PostMiniPreviewType } from '../types/Post';

interface PostRow {
    id: string;
    title: string;
    description: string;
    code: string;
    language: string;
    dependencies: string;
    liked: boolean;
    saved: boolean;
}

const db = new Database(path.resolve('data/database.sqlite'));

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

export const getPosts = (userId: string, page: number, limit: number): PostPreviewType[] => {
    const stmt = db.prepare(`
        SELECT
            p.id,
            pv.title,
            pv.description,
            pv.code,
            pv.language,
            pv.dependencies,
            EXISTS (
                SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?
            ) AS liked,
            EXISTS (
                SELECT 1 FROM saved_posts s WHERE s.post_id = p.id AND s.user_id = ?
            ) AS saved
        FROM posts p
        JOIN post_versions pv ON p.id = pv.post_id and pv.created_at = p.last_activity_at
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    `);
    const offset = (page - 1) * limit;
    const posts = stmt.all(userId, userId, limit, offset) as PostRow[];
    return posts.map(post => ({
        ...post,
        dependencies: post.dependencies ? post.dependencies.split(',') : [],
    }));
}

export const getPostById = (postId: string): PostPreviewType | null => {
    const stmt = db.prepare(`
        SELECT 
            p.id, 
            pv.title, 
            pv.description, 
            pv.code, 
            pv.language,
            pv.dependencies,
            EXISTS (
                SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?
            ) AS liked,
            EXISTS (
                SELECT 1 FROM saved_posts s WHERE s.post_id = p.id AND s.user_id = ?
            ) AS saved
        FROM posts p
        JOIN post_versions pv ON p.id = pv.post_id and pv.created_at = p.last_activity_at
        WHERE p.id = ?
    `);
    const post = stmt.get(postId, postId, postId) as PostRow ;
    if (!post) return null;
    return {
        ...post,
        dependencies: post.dependencies ? post.dependencies.split(',') : [],
    };

}

export const getPostsBySearch = (userId: string, search: string): PostPreviewType[] => {
    const stmt = db.prepare(`
        SELECT
            p.id,
            pv.title,
            pv.description,
            pv.code,
            pv.language,
            pv.dependencies,
            EXISTS (
                SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?
            ) AS liked,
            EXISTS (
                SELECT 1 FROM saved_posts s WHERE s.post_id = p.id AND s.user_id = ?
            ) AS saved
        FROM posts p
        JOIN post_versions pv ON p.id = pv.post_id and pv.created_at = p.last_activity_at
        WHERE pv.title LIKE ? OR pv.description LIKE ?
        ORDER BY p.created_at DESC
        LIMIT 10
    `);
    const posts = stmt.all(userId, userId, `%${search}%`, `%${search}%`) as PostRow[];
    return posts.map(post => ({
        ...post,
        dependencies: post.dependencies ? post.dependencies.split(',') : [],
    }));
}

export const getPostsByUserId = (userId: string): PostPreviewType[] => {
    const stmt = db.prepare(`
        SELECT 
            p.id, 
            pv.title, 
            pv.description, 
            pv.code, 
            pv.language,
            pv.dependencies,
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
    const posts = stmt.all(userId, userId, userId) as PostRow[];
    return posts.map(post => ({
        ...post,
        dependencies: post.dependencies ? post.dependencies.split(',') : [],
    }));
}

export const getPostsLikedByUserId = (userId: string): PostPreviewType[] => {
    const stmt = db.prepare(`
        SELECT 
            p.id, 
            pv.title, 
            pv.description, 
            pv.code, 
            pv.language,
            pv.dependencies,
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
    const posts = stmt.all(userId, userId, userId) as PostRow[];
    return posts.map(post => ({
        ...post,
        dependencies: post.dependencies ? post.dependencies.split(',') : [],
    }));
}

export const getPostsMostLiked = (): PostMiniPreviewType[] => {
    const stmt = db.prepare(`
        SELECT 
            p.id, 
            pv.title, 
            pv.language, 
            COUNT(l.post_id) as likes
        FROM posts p
        JOIN post_versions pv ON p.id = pv.post_id and pv.created_at = p.last_activity_at
        LEFT JOIN likes l ON l.post_id = p.id
        GROUP BY p.id, pv.title, pv.language
        ORDER BY likes DESC, p.created_at DESC
        LIMIT 3
    `);
    return stmt.all() as PostMiniPreviewType[];
}

export const getPostsSavedByUserId = (userId: string): PostPreviewType[] => {
    const stmt = db.prepare(`
        SELECT
            p.id,
            pv.title,
            pv.description,
            pv.code,
            pv.language,
            pv.dependencies,
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
    const posts = stmt.all(userId, userId, userId) as PostRow[];
    return posts.map(post => ({
        ...post,
        dependencies: post.dependencies ? post.dependencies.split(',') : [],
    }));
}

export const createPost = async (
    userId: string,
    title: string, 
    description: string, 
    code: string,
    language: string,
    dependencies: string[]
) => {
    const insertPost = db.prepare(`
        INSERT INTO posts (user_id, created_at, last_activity_at) VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const insertVersion = db.prepare(`
        INSERT INTO post_versions (post_id, title, description, code, language, dependencies, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const transaction = db.transaction(() => {
        const result = insertPost.run(userId);
        const postId = result.lastInsertRowid;

        insertVersion.run(postId, title, description, code, language, dependencies.join(','),);

        return postId;
    });

    return transaction();
}
