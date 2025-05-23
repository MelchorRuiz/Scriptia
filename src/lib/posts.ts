import { getSecret } from 'astro:env/server';
import Database from 'better-sqlite3'
import path from 'path';
import type { PostPreviewType, PostMiniPreviewType, PostRowWithUser } from '../types/Post';
import { getUserById } from './users';

const db = new Database(path.resolve(getSecret("DB_FILE") || 'data/database.sqlite'));

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

export const getPosts = async (userId: string, page: number, limit: number): Promise<PostPreviewType[]> => {
    const stmt = db.prepare(`
        SELECT
            p.id,
            pv.title,
            pv.description,
            pv.code,
            pv.language,
            pv.dependencies,
            p.user_id,
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
    const rows = stmt.all(userId, userId, limit, offset) as PostRowWithUser[];

    const posts = await Promise.all(rows.map(async (row) => {
        const user = await getUserById(row.user_id);
        return {
            id: row.id,
            title: row.title,
            description: row.description,
            code: row.code,
            language: row.language,
            dependencies: row.dependencies ? row.dependencies.split(',') : [],
            liked: row.liked,
            saved: row.saved,
            username: user?.username || 'Unknown',
        };
    }));

    return posts;
};

export const getPostById = async (postId: string): Promise<PostPreviewType | null> => {
    const stmt = db.prepare(`
        SELECT 
            p.id, 
            pv.title, 
            pv.description, 
            pv.code, 
            pv.language,
            pv.dependencies,
            p.user_id,
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
    const row = stmt.get(postId, postId, postId) as PostRowWithUser;
    if (!row) return null;

    const user = await getUserById(row.user_id);

    return {
        id: row.id,
        title: row.title,
        description: row.description,
        code: row.code,
        language: row.language,
        dependencies: row.dependencies ? row.dependencies.split(',') : [],
        liked: row.liked,
        saved: row.saved,
        username: user?.username || 'Unknown',
    };
};

export const getPostsBySearch = async (userId: string, search: string): Promise<PostPreviewType[]> => {
    const stmt = db.prepare(`
        SELECT
            p.id,
            pv.title,
            pv.description,
            pv.code,
            pv.language,
            pv.dependencies,
            p.user_id,
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
    const rows = stmt.all(userId, userId, `%${search}%`, `%${search}%`) as PostRowWithUser[];

    const posts = await Promise.all(rows.map(async (row) => {
        const user = await getUserById(row.user_id);
        return {
            id: row.id,
            title: row.title,
            description: row.description,
            code: row.code,
            language: row.language,
            dependencies: row.dependencies ? row.dependencies.split(',') : [],
            liked: row.liked,
            saved: row.saved,
            username: user?.username || 'Unknown',
        };
    }));

    return posts;
};

export const getPostsByUserId = async (userId: string): Promise<PostPreviewType[]> => {
    const stmt = db.prepare(`
        SELECT
            p.id,
            pv.title,
            pv.description,
            pv.code,
            pv.language,
            pv.dependencies,
            p.user_id,
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
    const rows = stmt.all(userId, userId, userId) as PostRowWithUser[];

    const posts = await Promise.all(rows.map(async (row) => {
        const user = await getUserById(row.user_id);
        return {
            id: row.id,
            title: row.title,
            description: row.description,
            code: row.code,
            language: row.language,
            dependencies: row.dependencies ? row.dependencies.split(',') : [],
            liked: row.liked,
            saved: row.saved,
            username: user?.username || 'Unknown',
        };
    }));

    return posts;
}

export const getPostsLikedByUserId = async (userId: string): Promise<PostPreviewType[]> => {
    const stmt = db.prepare(`
        SELECT 
            p.id, 
            pv.title, 
            pv.description, 
            pv.code, 
            pv.language,
            pv.dependencies,
            p.user_id,
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
    const rows = stmt.all(userId, userId, userId) as PostRowWithUser[];

    const posts = await Promise.all(rows.map(async (row) => {
        const user = await getUserById(row.user_id);
        return {
            id: row.id,
            title: row.title,
            description: row.description,
            code: row.code,
            language: row.language,
            dependencies: row.dependencies ? row.dependencies.split(',') : [],
            liked: row.liked,
            saved: row.saved,
            username: user?.username || 'Unknown',
        };
    }));

    return posts;
};

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

export const getPostsSavedByUserId = async (userId: string): Promise<PostPreviewType[]> => {
    const stmt = db.prepare(`
        SELECT
            p.id,
            pv.title,
            pv.description,
            pv.code,
            pv.language,
            pv.dependencies,
            p.user_id,
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
    const rows = stmt.all(userId, userId, userId) as PostRowWithUser[];

    const posts = await Promise.all(rows.map(async (row) => {
        const user = await getUserById(row.user_id);
        return {
            id: row.id,
            title: row.title,
            description: row.description,
            code: row.code,
            language: row.language,
            dependencies: row.dependencies ? row.dependencies.split(',') : [],
            liked: row.liked,
            saved: row.saved,
            username: user?.username || 'Unknown',
        };
    }));

    return posts;
};

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
