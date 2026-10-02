export default function PixelButton({ variant = 'default', className = '', ...props }) {
  return <button type="button" className={`px-btn px-btn--${variant} ${className}`} {...props} />;
}
