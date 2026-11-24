export default function SectionTitle({ icon: Icon, title, desc, right }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
            <Icon size={18} aria-hidden="true" />
          </span>
        )}
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">{title}</h2>
          {desc && <p className="mt-0.5 max-w-3xl text-sm text-slate-500">{desc}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}
