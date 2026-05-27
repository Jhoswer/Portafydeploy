export default function StepLabel({ number, label }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="flex items-center justify-center w-6 h-6 text-[11px] font-semibold
        rounded-md bg-linear-to-br from-rose-300 to-rose-400 dark:from-rose-500 dark:to-rose-600
        text-white shadow-sm">
        {number}
      </span>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>
    </div>
  );
}