import { AlertTriangle } from "lucide-react";

export default function ErrorMessage({ message, onRetry, compact = false }) {
  if (!message) return null;
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 ${
        compact ? "p-3" : "p-4"
      }`}
      role="alert"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-500" />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm font-semibold text-rose-700 underline hover:text-rose-900"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
