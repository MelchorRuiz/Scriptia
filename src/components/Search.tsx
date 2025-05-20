import { useState, useEffect, useRef } from 'react';
import PostPreview from './PostPreview';
import type { PostPreviewType } from '../types/Post';

export default function Search() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<PostPreviewType[]>([]);
    const [loading, setLoading] = useState(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    const fetchResults = async (q: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
            if (!res.ok) throw new Error('Error al buscar');
            const data = await res.json();
            console.log(data);
            setResults(data.posts || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            fetchResults(query);
        }, 500);
        return () => {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        };
    }, [query]);

    return (
        <div className="w-full">
            <form className="flex gap-2 mb-4 max-w-2xl" onSubmit={e => e.preventDefault()}>
                <input
                    type="text"
                    className="flex-1 p-2 rounded-lg bg-gray-800 text-neutral-100 border border-gray-600 focus:ring-2 focus:ring-red-300 outline-none"
                    placeholder="Buscar scripts por título o descripción..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
            </form>
            {loading && <p className="text-gray-400">Buscando...</p>}
            <div className="flex flex-col gap-2 mt-4">
                {results.length > 0 ? (
                    results.map(post => (
                        <PostPreview key={post.id} post={post} />
                    ))
                ) : (
                    !loading && query && <p className="text-gray-400">No se encontraron resultados.</p>
                )}
            </div>
        </div>
    );
}
