export default function AdminActionButton({
  children,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`adm-btn ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
