import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { langs } from '@uiw/codemirror-extensions-langs';

export default function ShowCode({ code }: { code: string }) {
    const [params, setParams] = useState("");
    const [taskId, setTaskId] = useState(null);
    const [taskStatus, setTaskStatus] = useState(null);
    const [taskOutput, setTaskOutput] = useState(null);

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
        <div className="overflow-x-auto">
            <div className="mb-3">
                <CodeMirror
                    value={code}
                    theme="dark"
                    className='overflow-x-auto *:w-fit *:min-w-full relative'
                    minHeight='200px'
                    extensions={[langs.shell()]}
                    editable={false}
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
                        Prueba este código
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
        </div>
    );
}