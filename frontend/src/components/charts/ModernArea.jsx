import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { pct } from '../../utils/format';

const axis = { fontSize: 12, fill: '#64748b' };

/** Smooth gradient-area line chart. series: [{ key, name, color, dashed? }] */
export default function ModernArea({
  data, xKey = 'round', series, xLabel = 'Federated round', yLabel, domain = ['auto', 'auto'],
  formatter = (v) => pct(v), tickFormatter = (v) => `${Number(v).toFixed(0)}%`, labelPrefix = 'Round ',
}) {
  const uid = useId().replace(/:/g, '');
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 6, right: 14, left: 4, bottom: 22 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`${uid}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 4" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey={xKey} tick={axis} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} allowDecimals={false}
          label={{ value: xLabel, position: 'insideBottom', offset: -10, style: { ...axis, fontWeight: 600 } }} />
        <YAxis domain={domain} tick={axis} tickFormatter={tickFormatter} axisLine={false} tickLine={false} width={58}
          label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', offset: 4, style: { ...axis, fontWeight: 600, textAnchor: 'middle' } } : undefined} />
        <Tooltip cursor={{ stroke: '#a5b4fc', strokeDasharray: '4 4' }} content={<ChartTooltip formatter={formatter} labelPrefix={labelPrefix} />} />
        <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingBottom: 6 }} />
        {series.map((s, i) => (
          <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2.5}
            strokeDasharray={s.dashed ? '6 4' : undefined} fill={`url(#${uid}-${i})`} connectNulls
            dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 2, fill: '#fff' }} animationDuration={1000} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
