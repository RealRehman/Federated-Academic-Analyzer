import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { int } from '../../utils/format';

/** Donut chart with a centre total. data: [{ name, value, color }] */
export default function ModernDonut({ data, centerLabel = 'Records' }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={3} cornerRadius={6} stroke="none" animationDuration={900}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lift">
                  <p className="font-extrabold text-slate-900">{payload[0].name}</p>
                  <p className="text-slate-600">
                    {int(payload[0].value)} records ({((payload[0].value / total) * 100).toFixed(1)}%)
                  </p>
                </div>
              ) : null
            }
          />
          <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-x-0 top-[38%] text-center">
        <p className="text-2xl font-extrabold text-slate-900">{int(total)}</p>
        <p className="text-xs font-semibold text-slate-500">{centerLabel}</p>
      </div>
    </div>
  );
}
