/**
 * Campo com rótulo. Sem `children` renderiza um <input> com as props recebidas;
 * com `children` (ex.: <select>) só envolve o controle com o rótulo.
 */
export function Field({ label, error = false, children, ...inputProps }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children || <input className={error ? "input-error" : ""} {...inputProps} />}
    </label>
  );
}
