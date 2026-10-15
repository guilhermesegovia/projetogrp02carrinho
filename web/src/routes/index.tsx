import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { StoreProvider, useStore, brl, total, type Item, type PedidoStatus, type ComandaStatus, type Role } from "@/lib/store";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dinho's Canal 6 — Gestão do Carrinho de Praia" },
      { name: "description", content: "Comandas, pedidos, cardápio, estoque e relatórios do carrinho de praia Dinho's Canal 6." },
      { property: "og:title", content: "Dinho's Canal 6 — Gestão" },
      { property: "og:description", content: "Sistema de gestão do carrinho de praia Dinho's Canal 6." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <StoreProvider><App /></StoreProvider>,
});

const fmt = (s: string) => new Date(s).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
const sel = "h-9 rounded-md border border-input bg-card px-2 text-sm";

function App() {
  const s = useStore();
  if (!s.ready) return null;
  return s.me ? <Shell /> : <Login />;
}

function Login() {
  const s = useStore();
  const [email, setEmail] = useState("admin@dinhos.com");
  const [senha, setSenha] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="flex min-h-screen items-center justify-center bg-primary p-4">
      <form className="w-full max-w-sm rounded-lg border-t-4 border-accent bg-card p-8 shadow-2xl text-center space-y-4"
        onSubmit={(e) => { e.preventDefault(); if (!s.login(email, senha)) setErr("E-mail ou senha inválidos"); }}>
        <img src={logo} alt="Dinho's Canal 6" className="mx-auto h-32 w-32" />
        <h1 className="font-display text-3xl text-primary">Dinho's</h1>
        <Input placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">Entrar</Button>
        <p className="text-xs text-muted-foreground">Acesso inicial: admin@dinhos.com / admin123</p>
      </form>
    </div>
  );
}

const TABS: { id: string; label: string; roles: Role[] }[] = [
  { id: "venda", label: "🛒 Venda", roles: ["atendente", "gerente"] },
  { id: "comandas", label: "🧾 Comandas", roles: ["atendente", "gerente"] },
  { id: "pedidos", label: "🍤 Pedidos", roles: ["atendente", "gerente"] },
  { id: "produtos", label: "🥥 Produtos", roles: ["gerente"] },
  { id: "estoque", label: "📦 Estoque", roles: ["gerente"] },
  { id: "relatorios", label: "📊 Relatórios", roles: ["gerente"] },
  { id: "usuarios", label: "👥 Usuários", roles: [] },
];

function Shell() {
  const s = useStore();
  const tabs = TABS.filter((t) => s.can(...t.roles));
  const [tab, setTab] = useState(tabs[0]?.id ?? "venda");
  return (
    <div className="min-h-screen">
      <header className="border-b-4 border-accent bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <img src={logo} alt="" className="h-12 w-12 rounded-full bg-card" />
          <div className="flex-1">
            <div className="font-display text-xl leading-none">Dinho's Canal 6</div>
            <div className="text-xs opacity-80">{s.me!.nome} · {s.me!.role}</div>
          </div>
          <Button variant="secondary" size="sm" onClick={s.logout}>Sair</Button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4">
          {tabs.map((t) => (
            <Button key={t.id} variant="ghost" onClick={() => setTab(t.id)}
              className={`h-10 whitespace-nowrap rounded-b-none rounded-t-md px-4 py-2 text-sm font-semibold ${tab === t.id ? "bg-accent text-accent-foreground hover:bg-accent/90" : "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"}`}>
              {t.label}
            </Button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl p-4">
        {tab === "venda" && <Venda />}{tab === "comandas" && <Comandas />}{tab === "pedidos" && <Pedidos />}
        {tab === "produtos" && <Produtos />}{tab === "estoque" && <Estoque />}{tab === "relatorios" && <Relatorios />}
        {tab === "usuarios" && <Usuarios />}
      </main>
    </div>
  );
}

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) =>
  <div className={`rounded-lg border bg-card p-4 shadow-sm ${className}`}>{children}</div>;

function Venda() {
  const s = useStore();
  const [cart, setCart] = useState<Item[]>([]);
  const [q, setQ] = useState("");
  const [comanda, setComanda] = useState("");
  const [pag, setPag] = useState("Pix");
  const [msg, setMsg] = useState("");
  const abertas = s.db.comandas.filter((c) => !["fechada", "cancelada"].includes(c.status));
  const prods = s.db.products.filter((p) => p.disponivel && (p.nome + p.sku + p.categoria).toLowerCase().includes(q.toLowerCase()));
  const setQtd = (id: string, qtd: number) => {
    const p = s.db.products.find((x) => x.id === id)!;
    if (qtd > p.estoque) return setMsg(`Só há ${p.estoque} de ${p.nome} em estoque`);
    setMsg("");
    setCart((c) => qtd <= 0 ? c.filter((i) => i.productId !== id) :
      c.some((i) => i.productId === id) ? c.map((i) => i.productId === id ? { ...i, qtd } : i) : [...c, { productId: id, nome: p.nome, preco: p.preco, qtd }]);
  };
  const qtdOf = (id: string) => cart.find((i) => i.productId === id)?.qtd ?? 0;
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <div>
        <Input placeholder="Buscar produto, código ou categoria..." value={q} onChange={(e) => setQ(e.target.value)} className="mb-3 bg-card" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {prods.map((p) => (
            <button key={p.id} disabled={p.estoque === 0} onClick={() => setQtd(p.id, qtdOf(p.id) + 1)}
              className="rounded-lg border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:bg-accent/10 disabled:opacity-40">
              <div className="text-xs text-muted-foreground">{p.categoria}</div>
              <div className="font-bold">{p.nome}</div>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-lg font-extrabold text-primary">{brl(p.preco)}</span>
                <span className={`text-xs ${p.estoque <= p.minimo ? "text-destructive" : "text-muted-foreground"}`}>{p.estoque === 0 ? "Esgotado" : `${p.estoque} un`}</span>
              </div>
              {qtdOf(p.id) > 0 && <Badge className="mt-2 bg-accent text-accent-foreground">{qtdOf(p.id)} no carrinho</Badge>}
            </button>
          ))}
        </div>
      </div>
      <Card className="h-fit lg:sticky lg:top-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold">Carrinho</h2>
          {cart.length > 0 && <Button variant="ghost" size="sm" onClick={() => setCart([])}>Limpar</Button>}
        </div>
        {cart.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Toque nos produtos para adicionar</p>}
        {cart.map((i) => (
          <div key={i.productId} className="flex items-center gap-2 border-b py-2 text-sm">
            <div className="flex-1"><div className="font-semibold">{i.nome}</div><div className="text-muted-foreground">{brl(i.preco)}</div></div>
            <Button size="sm" variant="outline" onClick={() => setQtd(i.productId, i.qtd - 1)}>−</Button>
            <Input type="number" min={1} value={i.qtd} className="h-8 w-14 text-center" onChange={(e) => { const n = Math.floor(+e.target.value); if (n >= 1) setQtd(i.productId, n); }} />
            <Button size="sm" variant="outline" onClick={() => setQtd(i.productId, i.qtd + 1)}>+</Button>
            <div className="w-20 text-right font-bold">{brl(i.preco * i.qtd)}</div>
          </div>
        ))}
        <div className="mt-3 space-y-2">
          <select className={`${sel} w-full`} value={comanda} onChange={(e) => setComanda(e.target.value)}>
            <option value="">Venda avulsa (pagar agora)</option>
            {abertas.map((c) => <option key={c.id} value={c.id}>Comanda #{c.numero} — {c.cliente} ({c.local})</option>)}
          </select>
          {!comanda && <select className={`${sel} w-full`} value={pag} onChange={(e) => setPag(e.target.value)}>
            {["Pix", "Dinheiro", "Cartão de crédito", "Cartão de débito"].map((x) => <option key={x}>{x}</option>)}
          </select>}
          {msg && <p className="text-sm text-destructive">{msg}</p>}
          <div className="flex justify-between text-xl font-extrabold"><span>Total</span><span>{brl(total(cart))}</span></div>
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg" disabled={!cart.length}
            onClick={() => { const e = s.criarPedido(cart, pag, comanda || undefined); if (e) setMsg(e); else { setCart([]); setMsg(""); } }}>
            Enviar pedido
          </Button>
        </div>
      </Card>
    </div>
  );
}

const cStatus: ComandaStatus[] = ["aberta", "em atendimento", "aguardando pagamento", "fechada", "cancelada"];
function Comandas() {
  const s = useStore();
  const [cliente, setCliente] = useState(""); const [local, setLocal] = useState("");
  const [filtro, setFiltro] = useState("ativas");
  const list = s.db.comandas.filter((c) => filtro === "ativas" ? !["fechada", "cancelada"].includes(c.status) : filtro === "todas" || c.status === filtro);
  return (
    <div className="space-y-4">
      <Card>
        <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); if (!cliente.trim()) return; s.abrirComanda(cliente.trim(), local.trim() || "—"); setCliente(""); setLocal(""); }}>
          <Input placeholder="Nome do cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} className="max-w-xs" maxLength={60} />
          <Input placeholder="Local (ex: guarda-sol 12)" value={local} onChange={(e) => setLocal(e.target.value)} className="max-w-xs" maxLength={40} />
          <Button>Abrir comanda</Button>
          <select className={`${sel} ml-auto`} value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="ativas">Ativas</option><option value="todas">Todas</option>{cStatus.map((x) => <option key={x}>{x}</option>)}
          </select>
        </form>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => <ComandaCard key={c.id} id={c.id} />)}
        {!list.length && <p className="text-muted-foreground">Nenhuma comanda.</p>}
      </div>
    </div>
  );
}

function ComandaCard({ id }: { id: string }) {
  const s = useStore();
  const c = s.db.comandas.find((x) => x.id === id)!;
  const [pag, setPag] = useState("Pix");
  const ativa = !["fechada", "cancelada"].includes(c.status);
  const pedidos = s.db.pedidos.filter((p) => p.comanda === c.numero);
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div><div className="text-2xl font-extrabold text-primary">#{c.numero}</div><div className="font-semibold">{c.cliente}</div>
          <div className="text-xs text-muted-foreground">{c.local} · {fmt(c.aberta)} · {c.responsavel}</div></div>
        <Badge variant={c.status === "cancelada" ? "destructive" : "secondary"}>{c.status}</Badge>
      </div>
      <div className="my-3 space-y-1 text-sm">
        {c.itens.map((i) => (
          <div key={i.productId} className="flex justify-between"><span>{i.qtd}× {i.nome}</span><span>{brl(i.preco * i.qtd)}</span></div>
        ))}
        {!c.itens.length && <p className="text-muted-foreground">Sem itens — adicione pela aba Venda.</p>}
      </div>
      {ativa && <div className="flex items-center gap-2 text-sm">Desconto R$
        <Input type="number" min={0} className="h-8 w-24" value={c.desconto}
          onChange={(e) => s.updComanda(id, { desconto: Math.max(0, +e.target.value || 0) })} /></div>}
      <div className="mt-2 flex justify-between text-lg font-extrabold"><span>Total</span><span>{brl(total(c.itens, c.desconto))}</span></div>
      {c.pagamento && <div className="text-xs text-muted-foreground">Pago com {c.pagamento} em {fmt(c.fechada!)}</div>}
      <div className="text-xs text-muted-foreground">{pedidos.length} pedido(s)</div>
      {ativa && (
        <div className="mt-3 flex flex-wrap gap-2">
          {c.status !== "aguardando pagamento" && <Button size="sm" variant="outline" onClick={() => s.updComanda(id, { status: "aguardando pagamento" })}>Pedir conta</Button>}
          {c.status === "aguardando pagamento" && <>
            <select className={sel} value={pag} onChange={(e) => setPag(e.target.value)}>{["Pix", "Dinheiro", "Cartão de crédito", "Cartão de débito"].map((x) => <option key={x}>{x}</option>)}</select>
            <Button size="sm" onClick={() => s.updComanda(id, { status: "fechada", pagamento: pag, fechada: new Date().toISOString() })}>Fechar e receber</Button>
          </>}
          {s.can("gerente") && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => confirm("Cancelar comanda?") && s.updComanda(id, { status: "cancelada" })}>Cancelar</Button>}
        </div>
      )}
    </Card>
  );
}

const pStatus: PedidoStatus[] = ["novo", "em preparação", "pronto", "entregue", "cancelado"];
function Pedidos() {
  const s = useStore();
  const [st, setSt] = useState(""); const [num, setNum] = useState(""); const [dia, setDia] = useState("");
  const list = s.db.pedidos.filter((p) => (!st || p.status === st) && (!num || String(p.numero).includes(num)) && (!dia || p.data.startsWith(dia)));
  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap gap-2">
        <select className={sel} value={st} onChange={(e) => setSt(e.target.value)}><option value="">Todos status</option>{pStatus.map((x) => <option key={x}>{x}</option>)}</select>
        <Input placeholder="Nº do pedido" value={num} onChange={(e) => setNum(e.target.value)} className="w-36" />
        <Input type="date" value={dia} onChange={(e) => setDia(e.target.value)} className="w-44" />
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => (
          <Card key={p.id}>
            <div className="flex justify-between"><div className="text-xl font-extrabold">Pedido #{p.numero}</div><Badge variant={p.status === "cancelado" ? "destructive" : "secondary"}>{p.status}</Badge></div>
            <div className="text-xs text-muted-foreground">{fmt(p.data)} · {p.responsavel} · {p.comanda ? `Comanda #${p.comanda}` : p.pagamento}</div>
            <div className="my-2 text-sm">{p.itens.map((i) => <div key={i.productId}>{i.qtd}× {i.nome}</div>)}</div>
            <div className="font-bold">{brl(total(p.itens))}</div>
            {!["entregue", "cancelado"].includes(p.status) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {pStatus.slice(pStatus.indexOf(p.status) + 1, 4).slice(0, 1).map((n) => <Button key={n} size="sm" onClick={() => s.statusPedido(p.id, n)}>→ {n}</Button>)}
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => confirm("Cancelar pedido? O estoque será devolvido.") && s.statusPedido(p.id, "cancelado")}>Cancelar</Button>
              </div>
            )}
            <details className="mt-2 text-xs text-muted-foreground"><summary>Histórico</summary>
              {p.historico.map((h, i) => <div key={i}>{fmt(h.data)} — {h.status} ({h.usuario})</div>)}</details>
          </Card>
        ))}
        {!list.length && <p className="text-muted-foreground">Nenhum pedido.</p>}
      </div>
    </div>
  );
}

function Produtos() {
  const s = useStore();
  const empty = { nome: "", sku: "", categoria: "", descricao: "", custo: 0, preco: 0, estoque: 0, minimo: 5 };
  const [f, setF] = useState<typeof empty & { id?: string }>(empty);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const list = s.db.products.filter((p) => (p.nome + p.sku + p.categoria).toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.nome.localeCompare(b.nome));
  const field = (k: keyof typeof empty, label: string, num = false) => (
    <label className="text-xs font-semibold">{label}
      <Input type={num ? "number" : "text"} step="0.01" disabled={k === "estoque" && !!f.id} value={f[k]} onChange={(e) => setF({ ...f, [k]: num ? +e.target.value : e.target.value })} /></label>
  );
  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit">
        <form className="space-y-2" onSubmit={(e) => {
          e.preventDefault();
          if (!f.nome.trim() || f.preco <= 0 || f.custo < 0 || f.estoque < 0) return setErr("Preencha nome e valores válidos");
          s.saveProduct(f); setF(empty); setErr("");
        }}>
          <h2 className="font-bold">{f.id ? "Editar produto" : "Novo produto"}</h2>
          {field("nome", "Nome")}{field("sku", "Código/SKU")}{field("categoria", "Categoria")}{field("descricao", "Descrição")}
          <div className="grid grid-cols-2 gap-2">{field("custo", "Custo", true)}{field("preco", "Venda", true)}{field("estoque", "Estoque inicial", true)}{field("minimo", "Mínimo", true)}</div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <div className="flex gap-2"><Button>Salvar</Button>{f.id && <Button type="button" variant="ghost" onClick={() => setF(empty)}>Cancelar</Button>}</div>
        </form>
      </Card>
      <Card className="overflow-x-auto">
        <Input placeholder="Pesquisar..." value={q} onChange={(e) => setQ(e.target.value)} className="mb-3" />
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground"><tr><th>Produto</th><th>Categoria</th><th>Custo</th><th>Venda</th><th>Estoque</th><th></th></tr></thead>
          <tbody>{list.map((p) => (
            <tr key={p.id} className={`border-t ${!p.disponivel ? "opacity-50" : ""}`}>
              <td className="py-2"><div className="font-semibold">{p.nome}</div><div className="text-xs text-muted-foreground">{p.sku}</div></td>
              <td>{p.categoria}</td><td>{brl(p.custo)}</td><td className="font-bold">{brl(p.preco)}</td>
              <td className={p.estoque <= p.minimo ? "font-bold text-destructive" : ""}>{p.estoque}</td>
              <td className="space-x-1 whitespace-nowrap text-right">
                <Button size="sm" variant="outline" onClick={() => setF({ ...p })}>Editar</Button>
                <Button size="sm" variant="ghost" onClick={() => s.saveProduct({ id: p.id, disponivel: !p.disponivel })}>{p.disponivel ? "Desativar" : "Ativar"}</Button>
              </td>
            </tr>))}</tbody>
        </table>
      </Card>
    </div>
  );
}

function Estoque() {
  const s = useStore();
  const [pid, setPid] = useState(s.db.products[0]?.id ?? "");
  const [tipo, setTipo] = useState<"entrada" | "saída" | "ajuste" | "devolução">("entrada");
  const [qtd, setQtd] = useState(1); const [motivo, setMotivo] = useState(""); const [err, setErr] = useState("");
  const baixos = s.db.products.filter((p) => p.disponivel && p.estoque <= p.minimo);
  return (
    <div className="space-y-4">
      {baixos.length > 0 && <Card className="border-warning bg-warning/20">
        <b>⚠️ Estoque baixo:</b> {baixos.map((p) => <span key={p.id} className="ml-2">{p.nome} ({p.estoque === 0 ? "SEM ESTOQUE" : p.estoque})</span>)}</Card>}
      <Card>
        <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => {
          e.preventDefault(); if (qtd < (tipo === "ajuste" ? 0 : 1) || !Number.isInteger(qtd)) return setErr("Quantidade inválida");
          const r = s.stock(pid, tipo, qtd, motivo || tipo); setErr(r); if (!r) setMotivo("");
        }}>
          <select className={sel} value={pid} onChange={(e) => setPid(e.target.value)}>{s.db.products.map((p) => <option key={p.id} value={p.id}>{p.nome} ({p.estoque})</option>)}</select>
          <select className={sel} value={tipo} onChange={(e) => setTipo(e.target.value as typeof tipo)}>{["entrada", "saída", "ajuste", "devolução"].map((x) => <option key={x}>{x}</option>)}</select>
          <Input type="number" className="w-24" value={qtd} onChange={(e) => setQtd(+e.target.value)} title={tipo === "ajuste" ? "Novo saldo" : "Quantidade"} />
          <Input placeholder="Motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} className="max-w-xs" maxLength={100} />
          <Button>Registrar</Button>
          {err && <span className="text-sm text-destructive">{err}</span>}
        </form>
      </Card>
      <Card className="overflow-x-auto">
        <h2 className="mb-2 font-bold">Movimentações</h2>
        <table className="w-full text-sm"><thead className="text-left text-muted-foreground"><tr><th>Data</th><th>Produto</th><th>Tipo</th><th>Qtd</th><th>Saldo</th><th>Usuário</th><th>Motivo</th></tr></thead>
          <tbody>{s.db.movs.slice(0, 200).map((m) => <tr key={m.id} className="border-t"><td className="py-1">{fmt(m.data)}</td><td>{m.nome}</td><td>{m.tipo}</td><td>{m.qtd}</td><td>{m.antes} → {m.depois}</td><td>{m.usuario}</td><td>{m.motivo}</td></tr>)}</tbody></table>
      </Card>
    </div>
  );
}

function Relatorios() {
  const s = useStore();
  const [dia, setDia] = useState(new Date().toISOString().slice(0, 10));
  const r = useMemo(() => {
    const peds = s.db.pedidos.filter((p) => p.status !== "cancelado" && (!dia || p.data.startsWith(dia)));
    const cost = (id: string) => s.db.products.find((p) => p.id === id)?.custo ?? 0;
    let fat = 0, custo = 0; const por: Record<string, number> = {}; const prod: Record<string, number> = {};
    for (const p of peds) for (const i of p.itens) { fat += i.preco * i.qtd; custo += cost(i.productId) * i.qtd; prod[i.nome] = (prod[i.nome] ?? 0) + i.qtd; }
    for (const c of s.db.comandas.filter((c) => c.status === "fechada" && (!dia || c.fechada!.startsWith(dia)))) por[c.pagamento!] = (por[c.pagamento!] ?? 0) + total(c.itens, c.desconto);
    for (const p of peds.filter((p) => !p.comanda)) por[p.pagamento] = (por[p.pagamento] ?? 0) + total(p.itens);
    return { fat, custo, n: peds.length, por, top: Object.entries(prod).sort((a, b) => b[1] - a[1]).slice(0, 8) };
  }, [s.db, dia]);
  const Stat = ({ l, v }: { l: string; v: string }) => <Card><div className="text-xs text-muted-foreground">{l}</div><div className="text-2xl font-extrabold text-primary">{v}</div></Card>;
  return (
    <div className="space-y-4">
      <Input type="date" value={dia} onChange={(e) => setDia(e.target.value)} className="w-44 bg-card" />
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat l="Faturamento" v={brl(r.fat)} /><Stat l="Lucro bruto" v={brl(r.fat - r.custo)} />
        <Stat l="Pedidos" v={String(r.n)} /><Stat l="Ticket médio" v={brl(r.n ? r.fat / r.n : 0)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card><h3 className="mb-2 font-bold">Mais vendidos</h3>{r.top.map(([n, q]) => <div key={n} className="flex justify-between border-t py-1 text-sm"><span>{n}</span><b>{q}</b></div>)}</Card>
        <Card><h3 className="mb-2 font-bold">Recebido por forma de pagamento</h3>{Object.entries(r.por).map(([n, v]) => <div key={n} className="flex justify-between border-t py-1 text-sm"><span>{n}</span><b>{brl(v)}</b></div>)}</Card>
      </div>
    </div>
  );
}

function Usuarios() {
  const s = useStore();
  const empty = { nome: "", email: "", senha: "", role: "atendente" as Role };
  const [f, setF] = useState<typeof empty & { id?: string }>(empty); const [err, setErr] = useState("");
  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit"><form className="space-y-2" onSubmit={(e) => {
        e.preventDefault();
        if (!f.nome.trim() || !/^\S+@\S+\.\S+$/.test(f.email) || (!f.id && f.senha.length < 6)) return setErr("Nome, e-mail válido e senha (mín. 6) obrigatórios");
        if (s.db.users.some((u) => u.email === f.email && u.id !== f.id)) return setErr("E-mail já cadastrado");
        const { senha, ...rest } = f; s.saveUser(senha ? f : rest); setF(empty); setErr("");
      }}>
        <h2 className="font-bold">{f.id ? "Editar usuário" : "Novo usuário"}</h2>
        <Input placeholder="Nome" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} />
        <Input placeholder="E-mail" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <Input placeholder={f.id ? "Nova senha (opcional)" : "Senha"} type="password" value={f.senha} onChange={(e) => setF({ ...f, senha: e.target.value })} />
        <select className={`${sel} w-full`} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as Role })}>
          <option value="atendente">Atendente</option><option value="gerente">Gerente</option><option value="admin">Administrador</option></select>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button>Salvar</Button>
      </form></Card>
      <Card><table className="w-full text-sm"><thead className="text-left text-muted-foreground"><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Cadastro</th><th></th></tr></thead>
        <tbody>{s.db.users.map((u) => <tr key={u.id} className={`border-t ${!u.ativo ? "opacity-50" : ""}`}>
          <td className="py-2 font-semibold">{u.nome}</td><td>{u.email}</td><td>{u.role}</td><td>{fmt(u.criado)}</td>
          <td className="space-x-1 text-right whitespace-nowrap"><Button size="sm" variant="outline" onClick={() => setF({ id: u.id, nome: u.nome, email: u.email, senha: "", role: u.role })}>Editar</Button>
            {u.id !== s.me!.id && <Button size="sm" variant="ghost" onClick={() => s.saveUser({ id: u.id, ativo: !u.ativo })}>{u.ativo ? "Desativar" : "Ativar"}</Button>}</td>
        </tr>)}</tbody></table></Card>
    </div>
  );
}
