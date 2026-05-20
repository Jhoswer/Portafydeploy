export default function StepLabel({ number, label }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="flex items-center justify-center w-6 h-6 text-[11px] font-semibold 
      rounded-md bg-linear-to-br from-rose-300 to-rose-300 text-white shadow-sm">
        {number}
      </span>

      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>
    </div>
  );
}