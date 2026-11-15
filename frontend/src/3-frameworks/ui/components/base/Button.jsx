export function Button({ children, variant = "primary", icon: Icon, className = "", ...props }) {
  return (
    <button className={`button button-${variant} ${className}`} {...props}>
      {Icon && <Icon size={17} aria-hidden="true" />}
      {children}
    </button>
  );
}
