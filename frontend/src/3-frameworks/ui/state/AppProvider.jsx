// Ponte entre React e a camada de aplicação: guarda o estado para renderizar e
// expõe ações que chamam os casos de uso. As telas usam só `useApp()`.

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ casosDeUso, children }) {
  const [data, setData] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    Promise.all([casosDeUso.carregarEstado(), casosDeUso.carregarSessao()])
      .then(([estado, userId]) => {
        setData(estado);
        setCurrentUserId(userId);
      })
      .catch(() => setLoadError("Não foi possível carregar os dados. Recarregue a página."));
  }, [casosDeUso]);

  const value = useMemo(() => {
    if (!data) return null;
    /** Roda um caso de uso e atualiza a tela com o novo estado. */
    const aplicar = async (casoDeUso, ...args) => {
      const resultado = await casoDeUso(...args);
      setData(resultado.state);
      return resultado;
    };

    return {
      ...data,
      currentUser: data.users.find((user) => user.id === currentUserId) ?? null,

      login: async (credenciais) => {
        const { user } = await aplicar(casosDeUso.entrar, credenciais);
        setCurrentUserId(user.id);
      },
      register: async (dados) => {
        const { user } = await aplicar(casosDeUso.cadastrar, dados);
        setCurrentUserId(user.id);
      },
      logout: async () => {
        await casosDeUso.sair();
        setCurrentUserId(null);
      },

      saveProduct: (dados) => aplicar(casosDeUso.salvarProduto, dados),
      deleteProduct: (id) => aplicar(casosDeUso.excluirProduto, id),
      addOffer: (dados) => aplicar(casosDeUso.criarOferta, dados),
      endOffer: (id) => aplicar(casosDeUso.encerrarOferta, id),
      saveProducerPickupStores: (storeIds) =>
        aplicar(casosDeUso.salvarPontosRetirada, currentUserId, storeIds),

      addOrder: async (dados) => (await aplicar(casosDeUso.criarPedido, dados)).order,
      payOrder: (id, metodo) => aplicar(casosDeUso.pagarPedido, id, metodo),
      confirmOrderDelivered: (id) => aplicar(casosDeUso.confirmarEntregaNaLoja, id),

      saveStore: (dados) => aplicar(casosDeUso.salvarLoja, currentUserId, dados),
    };
  }, [data, currentUserId, casosDeUso]);

  if (loadError) return <p className="app-loading">{loadError}</p>;
  if (!value) return <p className="app-loading">Carregando…</p>;
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp precisa estar dentro de <AppProvider>");
  return context;
}
