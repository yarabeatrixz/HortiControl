import { ArrowLeft } from "lucide-react";

export function BackButton({ onClick, children = "Voltar" }) {
  return (
    <button type="button" className="back-button" onClick={onClick}>
      <ArrowLeft size={19} aria-hidden="true" />
      {children}
    </button>
  );
}
