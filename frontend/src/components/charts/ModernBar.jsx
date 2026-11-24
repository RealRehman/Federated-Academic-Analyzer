import { useId } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { pct } from '../../utils/format';

const axis = { fontSize: 12, fill: '#64748b' };

/** Gradient, rounded grouped / stacked bar chart. series: [{ key, name, color }] */
export default function ModernBar({
  data, xKey, series, xLabel, yLabel, domain = [0, 100], formatter = (v) => pct(v), tickFormatter = (v) => `${v}%`,
  stacked = false, layout = 'horizontal', labelPrefix = '',
}) {
  const uid = useId().replace(/:/g, '');
  const vertical = layout === 'vertical';
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout={layout} margin={{ top: 6, right: 12, left: 4, bottom: xLabel ? 22 : 4 }} barGap={4}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`${uid}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={1} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.62} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 4" stroke="#e2e8f0" vertical={vertical} horizontal={!vertical} />
        {vertical ? (
          <>
            <XAxis type="number" domain={domain} tick={axis} tickFormatter={tickFormatter} axisLine={false} tickLine={false} label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -8, style: { ...axis, fontWeight: 600 } } : undefined} />
            <YAxis type="category" dataKey={xKey} tick={axis} width={112} axisLine={false} tickLine={false} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={axis} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} interval={0} label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -10, style: { ...axis, fontWeight: 600 } } : undefined} />
            <YAxis domain={domain} tick={axis} tickFormatter={tickFormatter} axisLine={false} tickLine={false} width={52} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', offset: 4, style: { ...axis, fontWeight: 600, textAnchor: 'middle' } } : undefined} />
          </>
        )}
        <Tooltip cursor={{ fill: 'rgba(99,102,241,.07)' }} content={<ChartTooltip formatter={formatter} labelPrefix={labelPrefix} />} />
        <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingBottom: 6 }} />
        {series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={`url(#${uid}-${i})`} stackId={stacked ? 'a' : undefined}
            radius={stacked ? [0, 0, 0, 0] : vertical ? [0, 8, 8, 0] : [8, 8, 0, 0]} maxBarSize={44} animationDuration={900} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
