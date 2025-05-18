import { CLERK_SECRET_KEY } from 'astro:env/server';
import type { User } from '../types/User';

export const getUserById = async (user_id: string): Promise<User> => {
    const request = await fetch(`https://api.clerk.com/v1/users/${user_id}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
    });
    if (!request.ok) {
        return Promise.reject(new Error('Failed to fetch user'));
    }
    const { id, username, image_url } = await request.json();
    return { id, username, image_url };
}
