/** White card with a cursor-following glow. `lift` adds a hover elevation; `spotlight={false}` disables the glow. */
export default function Card({ children, className = '', lift = false, spotlight = true, as: Tag = 'div', ...rest }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <Tag onMouseMove={spotlight ? onMove : undefined} className={`spot-card ${lift ? 'spot-lift' : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
