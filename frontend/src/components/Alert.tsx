interface AlertProps {
  type: "error" | "success" | "warning" | "info";
  message: string;
  onClose?: () => void;
}

export default function Alert({ type, message, onClose }: AlertProps) {
  const colors = {
    error: "bg-red-100 border-red-400 text-red-700",
    success: "bg-green-100 border-green-400 text-green-700",
    warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
    info: "bg-blue-100 border-blue-400 text-blue-700",
  };

  const icons = {
    error: "❌",
    success: "✅",
    warning: "⚠️",
    info: "ℹ️",
  };

  return (
    <div className={`border px-4 py-3 rounded mb-6 flex justify-between items-center ${colors[type]}`}>
      <div className="flex items-center gap-2">
        <span>{icons[type]}</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="font-bold opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
}
