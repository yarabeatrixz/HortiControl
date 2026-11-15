import { CircleAlert } from "lucide-react";

export function ErrorMessage({ children }) {
  if (!children) return null;
  return (
    <div className="error-message" role="alert">
      <CircleAlert size={17} aria-hidden="true" />
      {children}
    </div>
  );
}
