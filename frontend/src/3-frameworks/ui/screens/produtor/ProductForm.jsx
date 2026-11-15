import { ImagePlus } from "lucide-react";
import { useState } from "react";
import { CATEGORIAS, UNIDADES } from "@domain";
import { Button } from "../../components/base/Button";
import { ErrorMessage } from "../../components/base/ErrorMessage";
import { Field } from "../../components/base/Field";
import { FormPage } from "../../components/FormPage";
import { ProductImage } from "../../components/ProductImage";
import { useApp } from "../../state/AppProvider";

export function ProductForm({ id, back }) {
  const { currentUser, products, saveProduct } = useApp();
  const original = products.find((product) => product.id === id);
  const [form, setForm] = useState({
    name: original?.name ?? "",
    category: original?.category ?? "Verduras",
    unit: original?.unit ?? "kg",
    price: original?.price ?? "",
    quantity: original?.quantity ?? "",
    photo: original?.photo ?? "",
  });
  const [error, setError] = useState("");
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  // Foto salva como base64 só no modo demonstração; com back-end, trocar por upload.
  const choosePhoto = (event) => {
    const selected = event.target.files[0];
    if (!selected) return;
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, photo: reader.result }));
    reader.readAsDataURL(selected);
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      await saveProduct({ ...form, id: original?.id, producerId: currentUser.id });
      back();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <FormPage title={original ? "Editar produto" : "Cadastrar produto"} back={back}>
      <form onSubmit={submit}>
        <div className="photo-field">
          <ProductImage src={form.photo} alt="Prévia do produto" />
          <label>
            <ImagePlus size={19} aria-hidden="true" />
            <span>
              Escolher foto <small>Opcional · JPG ou PNG</small>
            </span>
            <input type="file" accept="image/*" onChange={choosePhoto} />
          </label>
        </div>
        <Field
          label="Nome do produto"
          value={form.name}
          onChange={set("name")}
          placeholder="Ex.: Alface crespa"
        />
        <div className="two-cols">
          <Field label="Categoria">
            <select value={form.category} onChange={set("category")}>
              {CATEGORIAS.map((categoria) => (
                <option key={categoria}>{categoria}</option>
              ))}
            </select>
          </Field>
          <Field label="Unidade de medida">
            <select value={form.unit} onChange={set("unit")}>
              {UNIDADES.map((unidade) => (
                <option key={unidade}>{unidade}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="two-cols">
          <Field
            label="Preço"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={set("price")}
            placeholder="0,00"
          />
          <Field
            label="Quantidade disponível"
            type="number"
            min="0"
            step="0.01"
            value={form.quantity}
            onChange={set("quantity")}
            placeholder="0"
          />
        </div>
        <ErrorMessage>{error}</ErrorMessage>
        <div className="form-actions">
          <Button variant="ghost" type="button" onClick={back}>
            Cancelar
          </Button>
          <Button type="submit">Salvar produto</Button>
        </div>
      </form>
    </FormPage>
  );
}
