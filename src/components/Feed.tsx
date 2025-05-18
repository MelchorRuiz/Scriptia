import { useEffect, useState, useRef, useCallback } from 'react';
import PostPreview from './PostPreview';
import type { PostPreviewType } from '../types/Post';

export default function Feed() {
    const [posts, setPosts] = useState<PostPreviewType[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);

    interface FetchPostsResponse {
        posts: PostPreviewType[];
        hasMore: boolean;
    }

    const fetchPosts = async (pageNum: number): Promise<void> => {
        setLoading(true);
        try {
            const res = await fetch(`/api/posts?page=${pageNum}&limit=10`);
            const data: FetchPostsResponse = await res.json();
            setPosts((prev) => {
                const ids = new Set(prev.map((p) => p.id));
                const uniqueNewPosts = data.posts.filter((p) => !ids.has(p.id));
                return [...prev, ...uniqueNewPosts];
            });

            setHasMore(data.hasMore);
        } catch (err) {
            console.error('Error fetching posts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts(page);
    }, [page]);

    interface LastPostRefNode extends Element { }

    const lastPostRef = useCallback(
        (node: LastPostRefNode | null): void => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage((prev: number) => prev + 1);
                }
            });

            if (node) observer.current.observe(node);
        },
        [loading, hasMore]
    );

    return (
        <div className='flex flex-col gap-2 mt-4'>
            {posts.map((post, index) => {
                if (index === posts.length - 1) {
                    return (
                        <div key={post.id} ref={lastPostRef}>
                            <PostPreview post={post} />
                        </div>
                    );
                }
                return <PostPreview key={post.id} post={post} />;
            })}
            {loading && <p className="text-center text-gray-500">Cargando...</p>}
            {!hasMore && !loading && (
                <p className="text-center text-gray-400 mt-4">No hay más publicaciones</p>
            )}
        </div>
    );
}
