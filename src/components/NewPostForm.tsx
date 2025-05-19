import { useState, useEffect } from 'react';
import { navigate } from 'astro:transitions/client';
import CodeMirror from '@uiw/react-codemirror';
import { loadLanguage } from '@uiw/codemirror-extensions-langs';

import { ConfirmModal, CongratulationModal } from './Modals';

export default function NewPostForm() {
    const [showErrors, setShowErrors] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [language, setLanguage] = useState("ubuntu");
    const [dependecies, setDependencies] = useState([""]);
    const [code, setCode] = useState("");
    const [params, setParams] = useState("");

    const [taskId, setTaskId] = useState(null);
    const [taskStatus, setTaskStatus] = useState(null);
    const [taskOutput, setTaskOutput] = useState(null);

    const [showConfirm, setShowConfirm] = useState(false);
    const [showCongratulation, setShowCongratulation] = useState(false);

    const handleDependenciesChange = (index: number, value: string) => {
        const newDependencies = [...dependecies];
        newDependencies[index] = value;
        setDependencies(newDependencies);
    }

    const handleAddDependency = () => {
        setDependencies([...dependecies, ""]);
    }

    const handleRemoveDependency = (index: number) => {
        const newDependencies = [...dependecies];
        newDependencies.splice(index, 1);
        setDependencies(newDependencies);
    }

    const handleTryCode = async () => {
        try {
            const response = await fetch('/api/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ language, dependecies, code, params }),
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
                body: JSON.stringify({ title, description, language, dependecies, code }),
            });

            if (response.ok) {
                setShowConfirm(false);
                setShowCongratulation(true);
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
                    className="border rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-neutral-100 focus:ring-neutral-500 focus:border-neutral-500 focus-visible:outline-none text-sm"
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
                    className="block p-2.5 w-full rounded-lg border bg-gray-700 border-gray-600 placeholder-gray-400 text-neutral-100 focus:ring-neutral-500 focus:border-neutral-500 focus-visible:outline-none text-sm"
                    placeholder="Escribe algo..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                >
                </textarea>
            </div>
            <div className="mb-3">
                <div className='flex items-center gap-2 mb-2'>
                    <label htmlFor="language" className="block font-medium text-neutral-300">Lenguaje</label>
                    {showErrors && !language && (
                        <label className="text-red-500 text-sm">* El lenguaje es obligatorio</label>
                    )}
                </div>
                <select
                    id="language"
                    className="block p-2.5 w-full rounded-lg border bg-gray-700 border-gray-600 placeholder-gray-400 text-neutral-100 focus:ring-neutral-500 focus:border-neutral-500 focus-visible:outline-none text-sm"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    <option value="alpine">Bash (Alpine)</option>
                    <option value="ubuntu">Bash (Ubuntu)</option>
                    <option value="python">Python 3.13</option>
                    <option value="nodejs">Node.js v24</option>
                </select>
            </div>
            <div className="mb-3">
                <div className='flex items-center gap-2 mb-2'>
                    <label htmlFor="dependencies" className="block font-medium text-neutral-300">Dependencias</label>
                    <button
                        type="button"
                        className="text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 focus:outline-none rounded-lg px-2 cursor-pointer disabled:opacity-50"
                        onClick={handleAddDependency}
                    >
                        +
                    </button>
                </div>
                <div className='flex flex-col gap-2'>
                    {dependecies.map((dependency, index) => (
                        <div key={index} className="flex flex-col lg:flex-row w-full">
                            <div className='bg-gray-700 flex items-center justify-center px-4 text-neutral-100 text-nowrap lg:rounded-l-lg h-8 lg:h-auto text-sm'>
                                {language === 'python' ? 'pip install' :
                                    language === 'nodejs' ? 'npm install' :
                                        language === 'ubuntu' ? 'apt-get install' :
                                            language === 'alpine' ? 'apk add' : ''
                                }
                            </div>
                            <input
                                type="text"
                                className="block p-2.5 text-sm gray-100 border bg-gray-700 border-gray-600 placeholder-gray-400 text-neutral-100 focus-visible:outline-none flex-1"
                                placeholder="Escribe una dependencia..."
                                value={dependency}
                                onChange={(e) => handleDependenciesChange(index, e.target.value)}
                            />
                            <button
                                type="button"
                                className="text-gray-900 bg-gradient-to-r hover:bg-gradient-to-br from-red-300 via-red-300 to-red-400 focus:outline-none lg:rounded-r-lg px-5 cursor-pointer disabled:opacity-50 text-nowrap flex items-center justify-center h-8 lg:h-auto text-sm"
                                onClick={() => handleRemoveDependency(index)}
                            >
                                Eliminar
                            </button>
                        </div>
                    ))}
                </div>
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
                    className='overflow-x-auto *:w-fit *:min-w-full relative'
                    minHeight='200px'
                    onChange={(val) => setCode(val)}
                    extensions={([loadLanguage(
                        language === 'python' ? 'python' : language === 'nodejs' ? 'javascript' : 'shell',
                    )] as NonNullable<ReturnType<typeof loadLanguage>>[])}
                    basicSetup={{ searchKeymap: false, foldGutter: false }}
                />
            </div>
            <div className="mb-3">
                <div className='flex items-center gap-2 p-4 rounded-lg opacity-80 ring-1 ring-neutral-200'>
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12 text-neutral-900 fill-yellow-700">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                    </div>
                    <div>
                        <p className='text-yellow-700 font-bold'>Advertencia</p>
                        <p className='text-neutral-100 text-sm'>
                            El código se ejecuta en un contenedor Docker aislado. No tiene acceso a recursos del sistema como namespaces, dispositivos o archivos externos, ni consola interactiva (no se puede usar input() en Python). Sin embargo, sí cuenta con acceso a internet. Ten esto en cuenta al ejecutar tu código.
                        </p>
                    </div>
                </div>
            </div>
            <div className='mb-3'>
                <div className="flex flex-col lg:flex-row w-full">
                    <div className='bg-gray-700 flex items-center justify-center px-4 text-neutral-100 text-nowrap lg:rounded-l-lg h-8 lg:h-auto'>
                        ./mi-script.sh
                    </div>
                    <input
                        type="text"
                        className="block p-2.5 text-sm gray-100 border focus:ring-neutral-500 bg-gray-700 border-gray-600 placeholder-gray-400 text-neutral-100 focus:border-neutral-500 focus-visible:outline-none flex-1"
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
                        {taskStatus === 'queued' || (taskStatus === "running" && taskOutput === "") ? (
                            <div className='flex flex-col items-center justify-center py-4'>
                                <svg className='size-20' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150"><path fill="none" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="round" strokeDasharray="300 385" strokeDashoffset="0" d="M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z"><animate attributeName="stroke-dashoffset" calcMode="spline" dur="2" values="685;-685" keySplines="0 0 1 1" repeatCount="indefinite"></animate></path></svg>
                                <p className="text-neutral-100 text-sm">Esperando a que se ejecute el código...</p>
                            </div>
                        ) : (
                            <pre className="text-neutral-100 text-sm max-h-96 overflow-y-auto">{taskOutput}</pre>
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
