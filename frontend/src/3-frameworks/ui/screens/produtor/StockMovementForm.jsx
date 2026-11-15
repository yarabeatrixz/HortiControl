import { useState } from "react";
import { MOTIVOS_PERDA, TIPO_MOVIMENTO, brl, num } from "@domain";
import { Button } from "../../components/base/Button";
import { ErrorMessage } from "../../components/base/ErrorMessage";
import { Field } from "../../components/base/Field";
import { FormPage } from "../../components/FormPage";
import { useApp } from "../../state/AppProvider";

/** Registro de entrada de mercadoria (`type="Entrada"`) ou de perda (`type="Perda"`). */
export function StockMovementForm({ type, productId, back }) {
  const { currentUser, products, addStockEntry, addStockLoss } = useApp();
  const catalog = products.filter((product) => product.producerId === currentUser.id);
  const isEntry = type === TIPO_MOVIMENTO.ENTRADA;
  const [form, setForm] = useState({
    productId: productId ?? catalog[0]?.id ?? "",
    quantity: "",
    unitCost: "",
    reason: MOTIVOS_PERDA[0],
    note: "",
  });
  const [error, setError] = useState("");
  const product = catalog.find((item) => item.id === form.productId);
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    try {
      await (isEntry ? addStockEntry(form) : addStockLoss(form));
      back();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <FormPage title={isEntry ? "Registrar entrada de mercadoria" : "Registrar perda"} back={back}>
      <form onSubmit={submit}>
        <Field label="Produto">
          <select value={form.productId} onChange={set("productId")}>
            {catalog.map((item) => (
              <option value={item.id} key={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
        {product && (
          <div className="normal-price">
            <span>Estoque atual</span>
            <b>
              {product.quantity} {product.unit}
            </b>
            {!!form.quantity && (
              <small>
                Depois do registro:{" "}
                {num(product.quantity) + (isEntry ? 1 : -1) * num(form.quantity)} {product.unit}
              </small>
            )}
          </div>
        )}
        <div className="two-cols">
          <Field
            label={`Quantidade${product ? ` (${product.unit})` : ""}`}
            type="number"
            min="0"
            step="0.01"
            value={form.quantity}
            onChange={set("quantity")}
          />
          {isEntry ? (
            <Field
              label="Custo por unidade (R$)"
              type="number"
              min="0"
              step="0.01"
              value={form.unitCost}
              onChange={set("unitCost")}
              placeholder="0,00"
            />
          ) : (
            <Field label="Motivo da perda">
              <select value={form.reason} onChange={set("reason")}>
                {MOTIVOS_PERDA.map((motivo) => (
                  <option key={motivo}>{motivo}</option>
                ))}
              </select>
            </Field>
          )}
        </div>
        {isEntry && !!form.quantity && (
          <p className="form-hint">
            Custo total da entrada: {brl(num(form.quantity) * num(form.unitCost))}
          </p>
        )}
        <Field
          label="Observação (opcional)"
          value={form.note}
          onChange={set("note")}
          placeholder={isEntry ? "Ex.: colheita de terça" : "Ex.: chuva de granizo"}
        />
        <ErrorMessage>{error}</ErrorMessage>
        <div className="form-actions">
          <Button variant="ghost" type="button" onClick={back}>
            Cancelar
          </Button>
          <Button type="submit">{isEntry ? "Salvar entrada" : "Salvar perda"}</Button>
        </div>
      </form>
    </FormPage>
  );
}
