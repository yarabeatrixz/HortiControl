import { Check } from "lucide-react";

export function SuccessMessage({ children }) {
  if (!children) return null;
  return (
    <div className="success-message" role="status">
      <Check size={17} aria-hidden="true" />
      {children}
    </div>
  );
}
