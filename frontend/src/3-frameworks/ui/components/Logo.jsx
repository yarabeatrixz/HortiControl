import { Leaf } from "lucide-react";

export function Logo({ compact = false }) {
  return (
    <div className="brand">
      <span className="brand-mark">
        <Leaf size={compact ? 19 : 24} aria-hidden="true" />
      </span>
      <span className="brand-copy">
        <b>HortiLink</b>
        {!compact && <small>ALTO TIETÊ</small>}
      </span>
    </div>
  );
}
