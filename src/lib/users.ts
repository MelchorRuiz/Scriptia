import { CLERK_SECRET_KEY } from 'astro:env/server';
import type { User } from '../types/User';

export const getUserById = async (user_id: string): Promise<User | null> => {
    const request = await fetch(`https://api.clerk.com/v1/users/${user_id}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
    });
    if (!request.ok) {
        return null;
    }
    const { id, username, image_url, created_at } = await request.json();
    return { id, username, image_url, created_at };
}

export const getUserByUsername = async (u: string): Promise<User | null> => {
    const request = await fetch(`https://api.clerk.com/v1/users?username_query=${u}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
    });
    if (!request.ok) {
        return null;
    }
    const users = await request.json();
    if (!users || users.length === 0) {
        return null;
    }
    const { id, username, image_url, created_at } = users[0];
    return { id, username, image_url, created_at };
}
