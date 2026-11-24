export default function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
        <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden="true">
          <g stroke="#fff" strokeWidth="4" strokeLinecap="round"><path d="M14 18l18 14M14 46l18-14M50 32H32" /></g>
          <g fill="#fff"><circle cx="14" cy="18" r="6" /><circle cx="14" cy="46" r="6" /><circle cx="50" cy="32" r="7" /></g>
        </svg>
      </span>
      {!compact && (
        <div className="leading-tight">
          <p className="text-[15px] font-extrabold tracking-tight text-white">Federated</p>
          <p className="text-[13px] font-semibold text-indigo-300">Academic Analyzer</p>
        </div>
      )}
    </div>
  );
}
