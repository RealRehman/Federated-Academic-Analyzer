/** 3D keycap-style control used in the top bar. Works as a button or a router Link (`as`). */
export default function Keycap({ as: Tag = 'button', children, hint, active = false, pressed = false, className = '', ...rest }) {
  return (
    <Tag
      type={Tag === 'button' ? 'button' : undefined}
      data-pressed={pressed ? 'true' : 'false'}
      className={`keycap ${active ? 'keycap-active' : ''} ${className}`}
      {...rest}
    >
      {children}
      {hint && <kbd className="keycap-hint">{hint}</kbd>}
    </Tag>
  );
}
