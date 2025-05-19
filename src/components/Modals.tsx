export function ConfirmModal({
    isOpen,
    onConfirm,
    onCancel,
}: {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-neutral-900/50">
            <div className="bg-neutral-300 rounded-lg shadow-lg p-6 mx-4">
                <h2 className="text-xl font-bold">¿Confirmar publicación?</h2>
                <p className="mt-2">¿Estás seguro de que quieres publicar este script?</p>
                <div className="mt-4 flex gap-2 justify-end">
                    <button
                        className="text-gray-700 px-4 py-2 rounded cursor-pointer ring-1"
                        onClick={onCancel}
                    >
                        Seguir editando
                    </button>
                    <button
                        className="bg-neutral-900 text-neutral-100 px-4 py-2 rounded flex-1 cursor-pointer"
                        onClick={onConfirm}
                    >
                        Publicar
                    </button>
                </div>
            </div>
        </div>
    );
}

export function CongratulationModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-neutral-900/50">
            <div className="bg-neutral-300 rounded-lg shadow-lg p-6 mx-4">
                <h2 className="text-xl font-bold">¡Felicidades!</h2>
                <p className="mt-2">Tu script ha sido publicado con éxito.</p>
                <div className="mt-4 flex justify-end">
                    <button
                        className="bg-neutral-900 text-neutral-100 px-4 py-2 rounded flex-1 cursor-pointer"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
