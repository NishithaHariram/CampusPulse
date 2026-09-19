export default function LoadingSpinner({ size = "md", label }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={`${sizes[size] || sizes.md} animate-spin rounded-full border-slate-200 border-t-brand-600`}
        role="status"
        aria-label="Loading"
      />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  );
}
