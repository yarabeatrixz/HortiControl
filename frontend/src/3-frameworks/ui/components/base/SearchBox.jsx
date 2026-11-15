import { Search } from "lucide-react";

export function SearchBox({ value, onChange, placeholder, label = placeholder, className = "" }) {
  return (
    <div className={`search-box ${className}`}>
      <Search size={18} aria-hidden="true" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
      />
    </div>
  );
}
