import { Leaf } from "lucide-react";
import { BackButton } from "./base/BackButton";

export function FormPage({ title, back, children }) {
  return (
    <div className="form-page">
      <BackButton onClick={back} />
      <div className="form-card">
        <div className="form-card-title">
          <span>
            <Leaf size={20} aria-hidden="true" />
          </span>
          <div>
            <small>HORTILINK</small>
            <h1>{title}</h1>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
