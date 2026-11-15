import { Building2, Clock3, MapPin } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/base/Button";
import { ErrorMessage } from "../../components/base/ErrorMessage";
import { Field } from "../../components/base/Field";
import { PageTitle } from "../../components/base/PageTitle";
import { SuccessMessage } from "../../components/base/SuccessMessage";
import { StatusBadge } from "../../components/StatusBadge";
import { useApp } from "../../state/AppProvider";

/** Cadastro do ponto de coleta da loja parceira (com prévia ao lado). */
export function StoreProfile() {
  const { currentUser, stores, saveStore } = useApp();
  const current = stores.find((store) => store.userId === currentUser.id);
  const [form, setForm] = useState({
    name: current?.name ?? "",
    address: current?.address ?? "",
    city: current?.city ?? currentUser.city,
    hours: current?.hours ?? "",
  });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const set = (key) => (event) => {
    setForm({ ...form, [key]: event.target.value });
    setSaved(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      await saveStore(form);
      setError("");
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="LOJA PARCEIRA"
        title="Meu ponto de coleta"
        description="Mantenha os dados que serão exibidos aos produtores e compradores."
      />
      <div className="store-layout">
        <div className="store-preview">
          <div className="store-cover">
            <Building2 size={42} aria-hidden="true" />
          </div>
          <div>
            <StatusBadge
              status={current ? "Ativa" : "Cadastro pendente"}
              tone={current ? "accepted" : "waiting"}
            />
            <h2>{form.name || "Nome da sua loja"}</h2>
            <p>
              <MapPin size={15} aria-hidden="true" />
              {form.address || "Endereço da loja"} · {form.city}
            </p>
            <p>
              <Clock3 size={15} aria-hidden="true" />
              {form.hours || "Horário de funcionamento"}
            </p>
          </div>
        </div>
        <form className="form-card" onSubmit={submit}>
          {saved && <SuccessMessage>Dados atualizados com sucesso</SuccessMessage>}
          <Field label="Nome da loja" value={form.name} onChange={set("name")} />
          <Field label="Endereço" value={form.address} onChange={set("address")} />
          <div className="two-cols">
            <Field label="Cidade" value={form.city} onChange={set("city")} />
            <Field label="Horário de funcionamento" value={form.hours} onChange={set("hours")} />
          </div>
          <ErrorMessage>{error}</ErrorMessage>
          <Button type="submit">Salvar ponto de coleta</Button>
        </form>
      </div>
    </>
  );
}
