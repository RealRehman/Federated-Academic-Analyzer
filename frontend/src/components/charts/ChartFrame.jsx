import Card from '../common/Card';

export default function ChartFrame({ title, subtitle, height = 300, right, children, footer }) {
  return (
    <Card className="p-5" spotlight={false}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-extrabold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {right}
      </div>
      <div style={{ height }} role="img" aria-label={`${title}. ${subtitle || ''}`}>
        {children}
      </div>
      {footer && <p className="mt-3 text-xs text-slate-400">{footer}</p>}
    </Card>
  );
}
