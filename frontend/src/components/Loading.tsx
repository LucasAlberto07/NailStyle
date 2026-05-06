export default function Loading({ text = "Carregando..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="w-5 h-5 border-3 border-gray-300 border-t-black rounded-full animate-spin"></div>
      <span className="text-gray-500">{text}</span>
    </div>
  );
}
