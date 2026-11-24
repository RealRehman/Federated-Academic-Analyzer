import Card from '../common/Card';

/**
 * columns: [{ key, header, align?: 'left'|'right', render?: (row) => node }]
 * rowClass: optional (row) => extra classes (used to highlight best rows)
 */
export default function DataTable({ columns, rows, rowKey = (r, i) => i, rowClass, caption, minWidth = 640 }) {
  return (
    <Card className="overflow-hidden" spotlight={false}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth }}>
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-500">
              {columns.map((c) => (
                <th key={c.key} scope="col" className={`px-4 py-3 ${c.align === 'right' ? 'text-right' : 'text-left'}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r, i) => (
              <tr key={rowKey(r, i)} className={`table-row-hover hover:bg-indigo-50/40 ${rowClass ? rowClass(r) : ''}`}>
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 ${c.align === 'right' ? 'text-right tabular-nums' : ''}`}>
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
