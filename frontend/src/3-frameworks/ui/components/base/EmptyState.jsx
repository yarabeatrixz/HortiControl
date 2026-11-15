import { Leaf } from "lucide-react";

export function EmptyState({ icon: Icon = Leaf, title, text }) {
  return (
    <div className="empty">
      <span>
        <Icon size={26} aria-hidden="true" />
      </span>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
    </div>
  );
}
