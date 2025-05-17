import { useState, useEffect } from 'react';
import { navigate } from 'astro:transitions/client';
import CodeMirror from '@uiw/react-codemirror';
import { langs } from '@uiw/codemirror-extensions-langs';

import { ConfirmModal, CongratulationModal } from './Modals';

export default function NewPostForm() {
    const [showErrors, setShowErrors] = useState(false);
    const [code, setCode] = useState("");
    const [params, setParams] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [taskId, setTaskId] = useState(null);
    const [taskStatus, setTaskStatus] = useState(null);
    const [taskOutput, setTaskOutput] = useState(null);

    const [showConfirm, setShowConfirm] = useState(false);
    const [showCongratulation, setShowCongratulation] = useState(false);

    const handleTryCode = async () => {
        try {
            const response = await fetch('/api/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, params }),
            });

            const data = await response.json();
            setTaskId(data.taskId)
        } catch (error) {
            console.error('Error executing code:', error);
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowErrors(true);

        if (!title || !description || !code) {
            return;
        }

        setShowConfirm(true);
    };
    
    const handleConfirm = async () => {
        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, description, code }),
            });
    
            if (response.ok) {
                setShowConfirm(false);
                setShowCongratulation(true);
                // navigate('/')
            } 
        } catch (error) {
            console.error('Error creating post:', error);
        }

    }

    useEffect(() => {
        if (!taskId) return;

        const interval = setInterval(async () => {
            try {
                const response = await fetch(`/api/status/${taskId}`);
                const data = await response.json();
                setTaskStatus(data.status);
                setTaskOutput(data.log);

                if (data.status === 'finished' || data.status === 'failed') {
                    setTaskId(null);
                    clearInterval(interval);
                }
            } catch (error) {
                console.error('Error fetching task status:', error);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [taskId]);

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <div className='flex items-center gap-2 mb-2'>
                    <label htmlFor="title" className="block font-medium text-neutral-300">Título</label>
                    {showErrors && !title && (
                        <label className="text-red-500 text-sm">* El título es obligatorio</label>
                    )}
                </div>
                <input
                    type="text"
                    id="title"
                    className="border rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-neutral-500 focus:border-neutral-500 focus-visible:outline-none"
                    placeholder="Escribe un título..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <div className='flex items-center gap-2 mb-2'>
                    <label htmlFor="description" className="block font-medium text-neutral-300">Descripción</label>
                    {showErrors && !description && (
                        <label className="text-red-500 text-sm">* La descripción es obligatoria</label>
                    )}
                </div>
                <textarea
                    id="description"
                    rows={2}
                    className="block p-2.5 w-full rounded-lg border bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-neutral-500 focus:border-neutral-500 focus-visible:outline-none"
                    placeholder="Escribe algo..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                >
                </textarea>
            </div>
            <div className="mb-3">
                <div className='flex items-center gap-2 mb-2'>
                    <label className="block font-medium text-neutral-300">Código</label>
                    {showErrors && !code && (
                        <label className="text-red-500 text-sm">* El código es obligatorio</label>
                    )}
                </div>
                <CodeMirror
                    value={code}
                    theme="dark"
                    className='overflow-x-auto *:w-fit *:min-w-full relative -z-10'
                    minHeight='200px'
                    onChange={(val) => setCode(val)}
                    extensions={[langs.shell()]}
                    basicSetup={{ searchKeymap: false, foldGutter: false }}
                />
            </div>
            <div className='mb-3'>
                <div className="flex flex-col lg:flex-row w-full">
                    <div className='bg-gray-700 flex items-center justify-center px-4 text-white text-nowrap lg:rounded-l-lg h-8 lg:h-auto'>
                        ./mi-script.sh
                    </div>
                    <input
                        type="text"
                        className="block p-2.5 text-sm gray-100 border focus:ring-neutral-500 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:border-neutral-500 focus-visible:outline-none flex-1"
                        placeholder="Parámetros de entrada (opcional) ej: --parametro1 valor1 --parametro2 valor2"
                        value={params}
                        onChange={(e) => setParams(e.target.value)}
                    />
                    <button
                        type="button"
                        className="text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 focus:outline-none lg:rounded-r-lg px-5 cursor-pointer disabled:opacity-50 text-nowrap flex items-center justify-center h-8 lg:h-auto"
                        onClick={handleTryCode}
                        disabled={!code || taskId !== null}
                    >
                        Prueba tu código
                    </button>
                </div>
            </div>
            {taskStatus && (
                <div className="mb-3">
                    <label className="block mb-2 font-medium text-neutral-300">Salida</label>
                    <div className="bg-gray-700 p-4 rounded-lg">
                        {taskStatus === 'queued' ? (
                            <div className='flex flex-col items-center justify-center py-4'>
                                <svg className='size-20' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150"><path fill="none" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="round" strokeDasharray="300 385" strokeDashoffset="0" d="M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z"><animate attributeName="stroke-dashoffset" calcMode="spline" dur="2" values="685;-685" keySplines="0 0 1 1" repeatCount="indefinite"></animate></path></svg>
                                <p className="text-white text-sm">Esperando a que el contenedor se inicie...</p>
                            </div>
                        ) : (
                            <pre className="text-white text-sm max-h-96 overflow-y-auto">{taskOutput}</pre>
                        )}
                    </div>
                </div>
            )}
            <div className="mb-3">
                <button type="submit" className="text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 cursor-pointer flex items-center gap-2">
                    Compartir
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                </button>
            </div>

            <ConfirmModal
                isOpen={showConfirm}
                onConfirm={handleConfirm}
                onCancel={() => setShowConfirm(false)}
            />

            <CongratulationModal
                isOpen={showCongratulation}
                onClose={() => {
                    setShowCongratulation(false);
                    navigate('/');
                }}
            />
        </form>
    )
}