import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "gerente" | "atendente";
export type User = { id: string; nome: string; email: string; senha: string; role: Role; ativo: boolean; criado: string };
export type Product = {
  id: string; nome: string; descricao: string; sku: string; categoria: string;
  custo: number; preco: number; estoque: number; minimo: number; disponivel: boolean; criado: string;
};
export type Item = { productId: string; nome: string; preco: number; qtd: number };
export type ComandaStatus = "aberta" | "em atendimento" | "aguardando pagamento" | "fechada" | "cancelada";
export type Comanda = {
  id: string; numero: number; cliente: string; local: string; aberta: string; responsavel: string;
  itens: Item[]; desconto: number; status: ComandaStatus; pagamento?: string; fechada?: string;
};
export type PedidoStatus = "novo" | "em preparação" | "pronto" | "entregue" | "cancelado";
export type Pedido = {
  id: string; numero: number; data: string; responsavel: string; itens: Item[]; pagamento: string;
  status: PedidoStatus; comanda?: number | undefined; historico: { status: PedidoStatus; data: string; usuario: string }[];
};
export type Mov = {
  id: string; productId: string; nome: string; tipo: "entrada" | "saída" | "ajuste" | "devolução";
  qtd: number; antes: number; depois: number; data: string; usuario: string; motivo: string;
};
type DB = { users: User[]; products: Product[]; comandas: Comanda[]; pedidos: Pedido[]; movs: Mov[]; seq: number };

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();
export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const total = (itens: Item[], desc = 0) => Math.max(0, itens.reduce((s, i) => s + i.preco * i.qtd, 0) - desc);

const P = (nome: string, cat: string, custo: number, preco: number, estoque: number, sku: string): Product => ({
  id: uid(), nome, descricao: "", sku, categoria: cat, custo, preco, estoque, minimo: 10, disponivel: true, criado: now(),
});
const seed = (): DB => ({
  seq: 100,
  users: [{ id: uid(), nome: "Dinho", email: "admin@dinhos.com", senha: "admin123", role: "admin", ativo: true, criado: now() }],
  products: [
    P("Água de coco", "Bebidas", 3, 8, 60, "BEB-01"), P("Cerveja lata", "Bebidas", 3.5, 8, 120, "BEB-02"),
    P("Caipirinha", "Drinks", 5, 18, 40, "DRK-01"), P("Refrigerante", "Bebidas", 2.5, 7, 8, "BEB-03"),
    P("Isca de peixe", "Petiscos", 18, 45, 25, "PET-01"), P("Camarão alho e óleo", "Petiscos", 30, 69, 15, "PET-02"),
    P("Queijo coalho", "Petiscos", 4, 12, 50, "PET-03"), P("Aluguel cadeira", "Serviços", 0, 10, 40, "SRV-01"),
    P("Aluguel guarda-sol", "Serviços", 0, 15, 20, "SRV-02"),
  ],
  comandas: [], pedidos: [], movs: [],
});

function useDBState() {
  const [db, setDb] = useState<DB>(seed);
  const [me, setMe] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const raw = localStorage.getItem("dinhos-db");
    if (raw) setDb(JSON.parse(raw));
    const m = localStorage.getItem("dinhos-me");
    if (m) setMe(JSON.parse(m));
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("dinhos-db", JSON.stringify(db)); }, [db, ready]);
  useEffect(() => { if (ready) me ? localStorage.setItem("dinhos-me", JSON.stringify(me)) : localStorage.removeItem("dinhos-me"); }, [me, ready]);

  const user = me?.nome ?? "?";
  const mut = (f: (d: DB) => DB) => setDb((d) => f(structuredClone(d)));

  const moveStock = (d: DB, productId: string, tipo: Mov["tipo"], qtd: number, motivo: string) => {
    const p = d.products.find((x) => x.id === productId)!;
    const delta = tipo === "saída" ? -qtd : tipo === "ajuste" ? qtd - p.estoque : qtd;
    const depois = p.estoque + delta;
    if (depois < 0) throw new Error(`Estoque insuficiente de ${p.nome}`);
    d.movs.unshift({ id: uid(), productId, nome: p.nome, tipo, qtd, antes: p.estoque, depois, data: now(), usuario: user, motivo });
    p.estoque = depois;
  };

  return {
    db, me, ready,
    login(email: string, senha: string) {
      const u = db.users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.senha === senha && x.ativo);
      if (!u) return false; setMe(u); return true;
    },
    logout: () => setMe(null),
    can: (...r: Role[]) => !!me && (me.role === "admin" || r.includes(me.role)),
    saveUser: (u: Partial<User> & { id?: string }) => mut((d) => {
      if (u.id) Object.assign(d.users.find((x) => x.id === u.id)!, u);
      else d.users.push({ id: uid(), criado: now(), ativo: true, role: "atendente", nome: "", email: "", senha: "", ...u });
      return d;
    }),
    saveProduct: (p: Partial<Product> & { id?: string }) => mut((d) => {
      if (p.id) Object.assign(d.products.find((x) => x.id === p.id)!, p);
      else d.products.push({ ...P("", "", 0, 0, 0, ""), ...p, id: uid() });
      return d;
    }),
    stock(productId: string, tipo: Mov["tipo"], qtd: number, motivo: string) {
      let err = ""; mut((d) => { try { moveStock(d, productId, tipo, qtd, motivo); } catch (e) { err = (e as Error).message; return db; } return d; });
      return err;
    },
    abrirComanda: (cliente: string, local: string) => mut((d) => {
      d.seq++; d.comandas.unshift({ id: uid(), numero: d.seq, cliente, local, aberta: now(), responsavel: user, itens: [], desconto: 0, status: "aberta" });
      return d;
    }),
    updComanda: (id: string, patch: Partial<Comanda>) => mut((d) => { Object.assign(d.comandas.find((c) => c.id === id)!, patch); return d; }),
    /** Envia carrinho como pedido; baixa estoque; adiciona itens na comanda. */
    criarPedido(itens: Item[], pagamento: string, comandaId?: string) {
      let err = "";
      const next = structuredClone(db);
      try {
        for (const i of itens) moveStock(next, i.productId, "saída", i.qtd, "Venda");
        const c = comandaId ? next.comandas.find((x) => x.id === comandaId) : undefined;
        if (c) {
          for (const i of itens) { const e = c.itens.find((x) => x.productId === i.productId); e ? (e.qtd += i.qtd) : c.itens.push({ ...i }); }
          if (c.status === "aberta") c.status = "em atendimento";
        }
        next.seq++;
        next.pedidos.unshift({ id: uid(), numero: next.seq, data: now(), responsavel: user, itens, pagamento: c ? "Na comanda" : pagamento,
          status: "novo", comanda: c?.numero, historico: [{ status: "novo", data: now(), usuario: user }] });
        setDb(next);
      } catch (e) { err = (e as Error).message; }
      return err;
    },
    statusPedido: (id: string, status: PedidoStatus) => mut((d) => {
      const p = d.pedidos.find((x) => x.id === id)!;
      if (status === "cancelado" && p.status !== "cancelado")
        for (const i of p.itens) moveStock(d, i.productId, "devolução", i.qtd, `Cancelamento pedido #${p.numero}`);
      p.status = status; p.historico.push({ status, data: now(), usuario: user });
      return d;
    }),
  };
}

const Ctx = createContext<ReturnType<typeof useDBState> | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const v = useDBState();
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
export const useStore = () => useContext(Ctx)!;
