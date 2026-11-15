import { Landmark, Plus, Receipt, Trash2, Wallet } from "lucide-react";
import { useState } from "react";
import { TIPO_DESPESA, TIPO_MOVIMENTO, brl, dataCurta } from "@domain";
import { Button } from "../../components/base/Button";
import { ConfirmModal } from "../../components/base/ConfirmModal";
import { EmptyState } from "../../components/base/EmptyState";
import { ErrorMessage } from "../../components/base/ErrorMessage";
import { Field } from "../../components/base/Field";
import { PageTitle } from "../../components/base/PageTitle";
import { SummaryCard } from "../../components/base/SummaryCard";
import { useApp } from "../../state/AppProvider";

const FORM_VAZIO = { description: "", type: TIPO_DESPESA.CUSTO, amount: "" };

/** Controle de custos e investimentos do produtor. */
export function ProducerExpenses() {
  const { currentUser, expenses = [], stockMovements = [], addExpense, deleteExpense } = useApp();
  const [form, setForm] = useState(FORM_VAZIO);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const minhas = expenses.filter((item) => item.producerId === currentUser.id);
  const total = (tipo) =>
    minhas.filter((item) => item.type === tipo).reduce((soma, item) => soma + item.amount, 0);
  const custoMercadoria = stockMovements
    .filter((mov) => mov.producerId === currentUser.id && mov.type === TIPO_MOVIMENTO.ENTRADA)
    .reduce((soma, mov) => soma + mov.quantity * mov.unitCost, 0);
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    try {
      await addExpense(form);
      setForm(FORM_VAZIO);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteExpense(toDelete.id);
    } catch (err) {
      setError(err.message);
    }
    setToDelete(null);
  };

  return (
    <>
      <PageTitle
        eyebrow="FINANCEIRO"
        title="Custos e investimentos"
        description="Registre gastos do dia a dia (custos) e compras duráveis (investimentos)."
      />
      <div className="summary-grid three">
        <SummaryCard label="Custos" value={brl(total(TIPO_DESPESA.CUSTO))} icon={Receipt} />
        <SummaryCard
          label="Investimentos"
          value={brl(total(TIPO_DESPESA.INVESTIMENTO))}
          icon={Landmark}
        />
        <SummaryCard
          label="Custo das entradas de estoque"
          value={brl(custoMercadoria)}
          icon={Wallet}
        />
      </div>
      <form
        className="form-card inline-form"
        onSubmit={submit}
        aria-label="Novo custo ou investimento"
      >
        <Field
          label="Descrição"
          value={form.description}
          onChange={set("description")}
          placeholder="Ex.: frete até a loja"
        />
        <Field label="Tipo">
          <select value={form.type} onChange={set("type")}>
            {Object.values(TIPO_DESPESA).map((tipo) => (
              <option key={tipo}>{tipo}</option>
            ))}
          </select>
        </Field>
        <Field
          label="Valor (R$)"
          type="number"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={set("amount")}
          placeholder="0,00"
        />
        <Button type="submit" icon={Plus}>
          Adicionar
        </Button>
      </form>
      <ErrorMessage>{error}</ErrorMessage>
      {minhas.length ? (
        <ul className="movement-list">
          {minhas.map((item) => (
            <li
              key={item.id}
              className={item.type === TIPO_DESPESA.INVESTIMENTO ? "invest" : "out"}
            >
              <span className="movement-icon" aria-hidden="true">
                {item.type === TIPO_DESPESA.INVESTIMENTO ? (
                  <Landmark size={17} />
                ) : (
                  <Receipt size={17} />
                )}
              </span>
              <span>
                <b>{item.description}</b>
                <small>
                  {item.type} · {dataCurta(item.createdAt)}
                </small>
              </span>
              <strong>{brl(item.amount)}</strong>
              <button
                type="button"
                className="icon-danger"
                aria-label={`Excluir ${item.description}`}
                onClick={() => setToDelete(item)}
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={Wallet} title="Nenhum custo ou investimento registrado" />
      )}
      {toDelete && (
        <ConfirmModal
          icon={Trash2}
          danger
          title="Excluir registro"
          confirmLabel="Excluir"
          onConfirm={confirmDelete}
          onClose={() => setToDelete(null)}
        >
          Excluir <b>{toDelete.description}</b> ({brl(toDelete.amount)})?
        </ConfirmModal>
      )}
    </>
  );
}
