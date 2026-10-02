export default function PixelPanel({ title, className = '', children, ...rest }) {
  return (
    <section className={`px-panel ${className}`} {...rest}>
      {title && <h2 className="px-panel__title">{title}</h2>}
      {children}
    </section>
  );
}
