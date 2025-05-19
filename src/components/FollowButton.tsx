import { useState } from 'react';

interface FollowButtonProps {
    userId: string;
    isFollowingInitial: boolean;
}

export default function FollowButton({ userId, isFollowingInitial }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(isFollowingInitial);

    const handleFollow = () => {
        fetch(`/api/users/${userId}/follow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        setIsFollowing(true);
    };

    const handleUnfollow = () => {
        fetch(`/api/users/${userId}/follow`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        setIsFollowing(false);
    };

    return (
        <button 
            className={`w-full bg-gradient-to-r ${isFollowing ? 'from-red-800 via-red-500 to-red-500' : 'from-violet-800 via-purple-500 to-fuchsia-500'} text-white font-bold py-2 px-4 rounded-lg shadow-md mt-4 cursor-pointer`}
            onClick={isFollowing ? handleUnfollow : handleFollow}
        >
            {isFollowing ? 'Dejar de seguir' : 'Comenzar a seguir'}
        </button>
    );
}
