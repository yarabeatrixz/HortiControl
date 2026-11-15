import { Check } from "lucide-react";
import { dataHora } from "@hortilink/dominio";

/**
 * Linha do tempo de um pedido. `steps` = [{ label, event }] onde `event` é o
 * rótulo procurado em `order.timeline`. A primeira etapa sem evento é a atual.
 */
export function OrderTimeline({ order, steps }) {
  const eventos = steps.map(({ event }) => order.timeline?.find((item) => item.label === event));
  const atual = eventos.findIndex((evento) => !evento);
  return (
    <div className="order-timeline">
      {steps.map(({ label }, index) => {
        const evento = eventos[index];
        const classe = evento ? "done" : index === atual ? "current" : "";
        return (
          <div className={classe} key={label}>
            <span>{evento ? <Check size={15} aria-hidden="true" /> : index + 1}</span>
            <p>
              <b>{label}</b>
              <small>
                {evento ? dataHora(evento.at) : index === atual ? "Etapa atual" : "Aguardando"}
              </small>
            </p>
          </div>
        );
      })}
    </div>
  );
}
