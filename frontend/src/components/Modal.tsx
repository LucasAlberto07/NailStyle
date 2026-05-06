interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        
        <div className="mb-6">
          {children}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}