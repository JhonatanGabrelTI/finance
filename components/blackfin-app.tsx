"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  FileText,
  Gauge,
  Lightbulb,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  ReceiptText,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  UsersRound,
  WalletCards,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FeaturePage, type FinancialTransaction } from "@/components/blackfin-pages";
import { AuthFlow, type BusinessProfile } from "@/components/auth-flow";
import type { Workspace } from "@/lib/auth-session";

const businessNav = [
  ["Dashboard", Gauge, "/dashboard"],
  ["Financeiro empresarial", BriefcaseBusiness, "/financeiro/empresarial"],
  ["Produtos", ReceiptText, "/produtos"],
  ["Movimentações", CreditCard, "/movimentacoes"],
  ["Comprovantes", ReceiptText, "/comprovantes"],
  ["Contas a pagar", CalendarClock, "/contas-pagar"],
  ["Contas a receber", CircleDollarSign, "/contas-receber"],
  ["Relatórios", BarChart3, "/relatorios"],
  ["Histórico", FileText, "/historico"],
  ["Barbeiros", UsersRound, "/barbeiros"],
  ["Comissões", TrendingUp, "/comissoes"],
  ["Insights", Lightbulb, "/insights"],
] as const;
const personalNav = [
  ["Dashboard", Gauge, "/dashboard"],
  ["Meu financeiro", WalletCards, "/financeiro/pessoal"],
  ["Movimentações", CreditCard, "/movimentacoes"],
  ["Comprovantes", ReceiptText, "/comprovantes"],
  ["Contas a pagar", CalendarClock, "/contas-pagar"],
  ["Contas a receber", CircleDollarSign, "/contas-receber"],
  ["Relatórios", BarChart3, "/relatorios"],
  ["Histórico", FileText, "/historico"],
  ["Insights", Lightbulb, "/insights"],
] as const;
const chartData = [
  { day: "14", receita: 0, despesa: 0 },
  { day: "15", receita: 0, despesa: 0 },
  { day: "16", receita: 0, despesa: 0 },
  { day: "17", receita: 0, despesa: 0 },
  { day: "18", receita: 0, despesa: 0 },
  { day: "19", receita: 0, despesa: 0 },
  { day: "20", receita: 0, despesa: 0 },
];
const transactions: Array<{
  icon: typeof ArrowUpRight;
  title: string;
  meta: string;
  value: string;
  positive: boolean;
}> = [];

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function Brand() {
  return (
    <div className="brand-lockup">
      <span className="brand-mark">
        <span />
      </span>
      <div>
        <strong>BLACKFIN</strong>
        <small>FINANCE & BUSINESS</small>
      </div>
    </div>
  );
}

function Sidebar({
  mobile = false,
  currentPath,
  onNavigate,
  profile,
  workspace,
}: {
  mobile?: boolean;
  currentPath: string;
  onNavigate: (path: string) => void;
  profile: BusinessProfile;
  workspace: Workspace;
}) {
  const nav = workspace === "business" ? businessNav : personalNav;
  const workspaceName = workspace === "business" ? profile.businessName : "Financeiro pessoal";
  return (
    <aside className={mobile ? "mobile-sidebar" : "sidebar"}>
      <Brand />
      <div className="workspace-pill">
        <span>{initials(workspaceName)}</span>
        <div>
          <strong>{workspaceName}</strong>
          <small>{workspace === "business" ? "Ambiente empresarial" : "Ambiente isolado"}</small>
        </div>
        <ChevronDown />
      </div>
      <nav aria-label="Navegação principal">
        <p>GESTÃO</p>
        {nav.map(([label, Icon, path], index) => (
          <a
            href={path}
            key={label}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(path);
            }}
            className={
              currentPath === path || (index === 0 && currentPath === "/")
                ? "active"
                : ""
            }
          >
            <Icon />
            <span>{label}</span>
            {workspace === "business" && index === 3 && <em>2</em>}
          </a>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <Link
          href="/configuracoes"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("/configuracoes");
          }}
        >
          <Settings />
          <span>Configurações</span>
        </Link>
        <div className="profile-mini">
          <span>{initials(profile.ownerName)}</span>
          <div>
            <strong>{profile.ownerName}</strong>
            <small>{workspace === "business" ? "Proprietário" : "Conta pessoal"}</small>
          </div>
          <MoreHorizontal />
        </div>
      </div>
    </aside>
  );
}

function MetricCard({
  eyebrow,
  value,
  change,
  icon: Icon,
  tone = "green",
}: {
  eyebrow: string;
  value: string;
  change: string;
  icon: typeof TrendingUp;
  tone?: string;
}) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tone}`}>
        <Icon />
      </div>
      <p>{eyebrow}</p>
      <h3>{value}</h3>
      <small>
        <span className={tone === "red" ? "down" : "up"}>{change}</span> vs. mês
        anterior
      </small>
    </article>
  );
}

function TransactionDialog({
  open,
  onOpenChange,
  onSaved,
  workspace,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onSaved: (transaction: {
    type: "receita" | "despesa";
    origin: "pessoal" | "barbearia";
    amount: number;
    description: string;
    date: string;
    category: string;
  }) => void;
  workspace: Workspace;
}) {
  const [type, setType] = useState<"receita" | "despesa">("receita");
  const origin = workspace === "business" ? "barbearia" : "pessoal";
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("2026-09-20");
  const [category, setCategory] = useState("Serviços");
  const [error, setError] = useState("");
  const personalCategories = [
    "Alimentação",
    "Gasolina",
    "Moradia",
    "Lazer",
    "Compras",
    "Saúde",
    "Educação",
    "Assinaturas",
    "Cartão",
    "Transporte",
    "Outros",
  ];
  const businessCategories = [
    "Serviços",
    "Aluguel",
    "Energia",
    "Água",
    "Internet",
    "Produtos",
    "Salários",
    "Comissões",
    "Marketing",
    "Equipamentos",
    "Manutenção",
    "Fornecedores",
    "Impostos",
    "Outros",
  ];
  const categories = workspace === "personal" ? personalCategories : businessCategories;
  const save = () => {
    const numeric = Number(amount.replace(/\./g, "").replace(",", "."));
    if (!numeric || !description.trim() || !date) {
      setError("Preencha valor, descrição e data para continuar.");
      return;
    }
    onSaved({
      type,
      origin,
      amount: numeric,
      description: description.trim(),
      date,
      category,
    });
    setAmount("");
    setDescription("");
    setError("");
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="transaction-dialog">
        <DialogHeader>
          <DialogTitle>Nova movimentação</DialogTitle>
          <DialogDescription>
            Registre uma receita ou despesa. Você poderá editar depois.
          </DialogDescription>
        </DialogHeader>
        <div className="type-toggle">
          <button
            className={type === "receita" ? "selected" : ""}
            onClick={() => setType("receita")}
          >
            <ArrowUpRight />
            Receita
          </button>
          <button
            className={type === "despesa" ? "selected expense" : ""}
            onClick={() => setType("despesa")}
          >
            <ArrowDownLeft />
            Despesa
          </button>
        </div>
        <div className="form-grid">
          <label>
            Ambiente
            <Input value={workspace === "business" ? "Empresarial" : "Pessoal"} readOnly />
          </label>
          <label>
            Valor
            <Input
              placeholder="R$ 0,00"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </label>
          <label className="wide">
            Descrição
            <Input
              placeholder="Ex.: Serviços do dia"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <label>
            Categoria
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label>
            Data
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="dialog-actions">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="gold-button" onClick={save}>
            Salvar movimentação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BlackfinWorkspace({
  initialPath = "/dashboard",
  profile,
  onProfileChange,
  onLogout,
  workspace,
}: {
  initialPath?: string;
  profile: BusinessProfile;
  onProfileChange: (profile: BusinessProfile) => void;
  onLogout: () => Promise<void>;
  workspace: Workspace;
}) {
  const [period, setPeriod] = useState("7d");
  const [currentPath, setCurrentPath] = useState(
    initialPath === "/" || initialPath === "/login"
      ? "/dashboard"
      : initialPath,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [transactionsLoaded, setTransactionsLoaded] = useState(false);
  const [addedTransactions, setAddedTransactions] = useState<FinancialTransaction[]>([]);
  useEffect(() => {
    let stored: typeof addedTransactions = [];
    try {
      const saved = window.localStorage.getItem(`blackfin_transactions_${workspace}_v2`) ??
        (workspace === "business" ? window.localStorage.getItem("blackfin_transactions_v1") : null);
      if (saved) stored = JSON.parse(saved) as typeof addedTransactions;
    } catch {
      window.localStorage.removeItem(`blackfin_transactions_${workspace}_v2`);
    }
    const timer = window.setTimeout(() => {
      setAddedTransactions(stored);
      setTransactionsLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [workspace]);
  useEffect(() => {
    if (!transactionsLoaded) return;
    window.localStorage.setItem(
      `blackfin_transactions_${workspace}_v2`,
      JSON.stringify(addedTransactions),
    );
  }, [addedTransactions, transactionsLoaded, workspace]);
  const liveChart = useMemo(() => {
    const next = chartData.map((item) => ({ ...item }));
    for (const transaction of addedTransactions) {
      const target = next[next.length - 1];
      if (transaction.type === "receita") target.receita += transaction.amount;
      else target.despesa += transaction.amount;
    }
    return next;
  }, [addedTransactions]);
  const total = useMemo(
    () => liveChart.reduce((acc, item) => acc + item.receita - item.despesa, 0),
    [liveChart],
  );
  const consolidated = addedTransactions.reduce(
      (sum, item) =>
        sum + (item.type === "receita" ? item.amount : -item.amount),
      0,
    );
  const revenueTotal = addedTransactions
    .filter((item) => item.type === "receita")
    .reduce((sum, item) => sum + item.amount, 0);
  const expenseTotal = addedTransactions
    .filter((item) => item.type === "despesa")
    .reduce((sum, item) => sum + item.amount, 0);
  const personalBalance = addedTransactions
    .filter((item) => item.origin === "pessoal")
    .reduce((sum, item) => sum + (item.type === "receita" ? item.amount : -item.amount), 0);
  const businessBalance = addedTransactions
    .filter((item) => item.origin === "barbearia")
    .reduce((sum, item) => sum + (item.type === "receita" ? item.amount : -item.amount), 0);
  const formatMoney = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const saveTransaction = (transaction: FinancialTransaction) => {
    const item = { ...transaction, id: crypto.randomUUID() };
    setAddedTransactions((items) => [item, ...items]);
    void fetch("/api/transactions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...item,
        amountCents: Math.round(item.amount * 100),
        occurredOn: item.date,
        paymentMethod: "pix",
        status: "pago",
      }),
    }).catch(() => {});
  };
  const deleteTransaction = (id: string) => {
    const item = addedTransactions.find((transaction) => (transaction.id ?? `${transaction.date}-${transaction.description}-${transaction.amount}`) === id);
    if (!item || !window.confirm(`Excluir o lançamento “${item.description}”?`)) return;
    setAddedTransactions((items) => items.filter((transaction) => (transaction.id ?? `${transaction.date}-${transaction.description}-${transaction.amount}`) !== id));
    if (item.id) void fetch(`/api/transactions?id=${encodeURIComponent(item.id)}`, { method: "DELETE" }).catch(() => {});
  };
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: unknown,
            options?: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(
      context.registerTool(
        {
          name: "start_transaction_creation",
          title: "Nova movimentação",
          description:
            "Abre o formulário visível para registrar uma nova movimentação financeira.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute: () => {
            setDialogOpen(true);
            return { status: "form_opened" };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => {});
    void Promise.resolve(
      context.registerTool(
        {
          name: "list_financial_sections",
          title: "Seções financeiras",
          description:
            "Lista as áreas disponíveis no BLACKFIN e seus caminhos.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true, untrustedContentHint: false },
          execute: () => ({
            sections: (workspace === "business" ? businessNav : personalNav).map(([label, , path]) => ({ label, path })),
          }),
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => {});
    return () => lifecycle.abort();
  }, [workspace]);
  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className="app-shell">
      <Sidebar currentPath={currentPath} onNavigate={navigate} profile={profile} workspace={workspace} />
      <main className="main-panel">
        <header className="topbar">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="menu-button" size="icon" variant="ghost">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sheet-nav">
              <SheetHeader>
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Navegação do sistema
                </SheetDescription>
              </SheetHeader>
              <Sidebar mobile currentPath={currentPath} onNavigate={navigate} profile={profile} workspace={workspace} />
            </SheetContent>
          </Sheet>
          <div className="topbar-search">
            <Search />
            <input
              aria-label="Buscar"
              placeholder="Buscar movimentações, relatórios..."
            />
            <kbd>⌘ K</kbd>
          </div>
          <div className="topbar-actions">
            <span className="demo-badge">{workspace === "business" ? "EMPRESARIAL" : "PESSOAL"}</span>
            <button
              aria-label="Notificações"
              className="notification"
              onClick={() => setNotificationsOpen(true)}
            >
              <Bell />
              <i />
            </button>
            <div className="avatar">{initials(profile.ownerName)}</div>
            <button className="logout-button" onClick={() => void onLogout()} aria-label="Sair do BLACKFIN" title="Sair">
              <LogOut />
            </button>
          </div>
        </header>
        {currentPath !== "/dashboard" ? (
          <FeaturePage
            path={currentPath}
            onNewTransaction={() => setDialogOpen(true)}
            profile={profile}
            onProfileChange={onProfileChange}
            workspace={workspace}
            transactions={addedTransactions}
            onDeleteTransaction={deleteTransaction}
          />
        ) : (
          <div className="dashboard-wrap">
            <section className="page-heading">
              <div>
                <p>DOMINGO, 20 DE SETEMBRO</p>
                <h1>Olá, {profile.ownerName.split(" ")[0]}.</h1>
                <span>
                  {workspace === "business" ? "Acompanhe o desempenho da sua empresa." : "Acompanhe sua vida financeira com privacidade."}
                </span>
              </div>
              <Button
                className="gold-button"
                size="lg"
                onClick={() => setDialogOpen(true)}
              >
                <Plus />
                Nova movimentação
              </Button>
            </section>
            <section className="balance-hero">
              <div className="balance-copy">
                <span>SALDO CONSOLIDADO</span>
                <h2>
                  {consolidated.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </h2>
                <p>
                  <TrendingUp />
                  <strong>{addedTransactions.length} {addedTransactions.length === 1 ? "registro" : "registros"}</strong> no período atual
                </p>
              </div>
              <div className="balance-split">
                <div>
                  <small>{workspace === "business" ? "EMPRESA" : "PESSOAL"}</small>
                  <strong>{formatMoney(workspace === "business" ? businessBalance : personalBalance)}</strong>
                </div>
                <div>
                  <small>RESULTADO DO MÊS</small>
                  <strong>{formatMoney(total)}</strong>
                </div>
              </div>
              <div className="hero-watermark">BF</div>
            </section>
            <section className="metric-grid">
              <MetricCard
                eyebrow={workspace === "business" ? "Receita da empresa" : "Receitas pessoais"}
                value={formatMoney(revenueTotal)}
                change="Sem receitas"
                icon={BriefcaseBusiness}
              />
              <MetricCard
                eyebrow={workspace === "business" ? "Despesas da empresa" : "Despesas pessoais"}
                value={formatMoney(expenseTotal)}
                change="Sem despesas"
                icon={ArrowDownLeft}
                tone="red"
              />
              <MetricCard eyebrow="Saldo do período" value={formatMoney(consolidated)} change="Sem comparativo" icon={workspace === "business" ? BriefcaseBusiness : WalletCards} tone="gold" />
            </section>
            <section className="content-grid">
              <article className="chart-card">
                <div className="card-header">
                  <div>
                    <p>FLUXO FINANCEIRO</p>
                    <h2>Receitas x despesas</h2>
                  </div>
                  <div className="period-tabs">
                    {[
                      ["7d", "7 dias"],
                      ["30d", "30 dias"],
                      ["6m", "6 meses"],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setPeriod(key)}
                        className={period === key ? "active" : ""}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="chart-legend">
                  <span>
                    <i />
                    Receitas <strong>{formatMoney(revenueTotal)}</strong>
                  </span>
                  <span>
                    <i className="expense-dot" />
                    Despesas <strong>{formatMoney(expenseTotal)}</strong>
                  </span>
                </div>
                <div className="chart-wrap">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minWidth={0}
                    minHeight={0}
                    initialDimension={{ width: 1, height: 1 }}
                  >
                    <AreaChart data={liveChart}>
                      <defs>
                        <linearGradient
                          id="incomeFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#72d6ad"
                            stopOpacity={0.22}
                          />
                          <stop
                            offset="100%"
                            stopColor="#72d6ad"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#ffffff0a" vertical={false} />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#777", fontSize: 12 }}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          background: "#111",
                          border: "1px solid #2b2b2b",
                          borderRadius: 10,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="receita"
                        stroke="#72d6ad"
                        strokeWidth={2}
                        fill="url(#incomeFill)"
                      />
                      <Area
                        type="monotone"
                        dataKey="despesa"
                        stroke="#a68b55"
                        strokeWidth={1.5}
                        fill="transparent"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </article>
              <article className="insights-card">
                <div className="card-header">
                  <div>
                    <p>ANÁLISE BLACKFIN</p>
                    <h2>Insights do mês</h2>
                  </div>
                  <span className="spark-icon">
                    <Sparkles />
                  </span>
                </div>
                <div className="insight-primary">
                  <small>PRINCIPAL DESTAQUE</small>
                  <strong>Seu ambiente está pronto</strong>
                  <p>
                    Adicione as primeiras movimentações para gerar análises financeiras.
                  </p>
                </div>
                <div className="insight-row">
                  <span />
                  <div>
                    <strong>Nenhuma despesa cadastrada</strong>
                    <p>Seus indicadores começarão do zero.</p>
                  </div>
                </div>
                <div className="insight-row gold">
                  <span />
                  <div>
                    <strong>Sem alertas financeiros</strong>
                    <p>Cadastre contas e vencimentos para receber avisos.</p>
                  </div>
                </div>
                <button className="text-action" onClick={() => navigate("/insights")}>
                  Ver todos os insights <ArrowUpRight />
                </button>
              </article>
            </section>
            <section className="transactions-card">
              <div className="card-header">
                <div>
                  <p>ATIVIDADE RECENTE</p>
                  <h2>Últimas movimentações</h2>
                </div>
                <button className="text-action" onClick={() => navigate("/historico")}>
                  Ver histórico completo <ArrowUpRight />
                </button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>DESCRIÇÃO</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead>VALOR</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addedTransactions.length === 0 && transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="empty-table">
                        Nenhuma movimentação cadastrada.
                      </TableCell>
                    </TableRow>
                  )}
                  {[
                    ...addedTransactions.map((item) => ({
                      id: item.id ?? `${item.date}-${item.description}-${item.amount}`,
                      icon:
                        item.type === "receita" ? ArrowUpRight : ArrowDownLeft,
                      title: item.description,
                      meta: `${item.origin === "pessoal" ? "Pessoal" : "Empresa"} · ${item.category}`,
                      value: `${item.type === "receita" ? "+" : "−"} ${item.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
                      positive: item.type === "receita",
                    })),
                    ...transactions.map((item) => ({ ...item, id: item.title })),
                  ]
                    .slice(0, 6)
                    .map((tx) => (
                      <TableRow key={tx.title}>
                        <TableCell>
                          <div
                            className={`tx-name ${tx.positive ? "positive" : "negative"}`}
                          >
                            <span>
                              <tx.icon />
                            </span>
                            <div>
                              <strong>{tx.title}</strong>
                              <small>{tx.meta}</small>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="status-pill">
                            <i />
                            Pago
                          </span>
                        </TableCell>
                        <TableCell
                          className={tx.positive ? "value-positive" : ""}
                        >
                          {tx.value}
                        </TableCell>
                        <TableCell>
                          {tx.id && <button aria-label={`Excluir ${tx.title}`} title="Excluir lançamento" className="delete-transaction" onClick={() => deleteTransaction(tx.id)}><MoreHorizontal /></button>}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </section>
          </div>
        )}
      </main>
      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={saveTransaction}
        workspace={workspace}
      />
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="transaction-dialog notifications-dialog">
          <DialogHeader>
            <DialogTitle>Notificações</DialogTitle>
            <DialogDescription>
              Atualizações importantes da sua operação.
            </DialogDescription>
          </DialogHeader>
          <div className="empty-list">Nenhuma notificação no momento.</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function BlackfinApp({
  initialPath = "/dashboard",
}: {
  initialPath?: string;
}) {
  return (
    <AuthFlow>
      {(profile, updateProfile, logout, workspace) => (
        <BlackfinWorkspace
          key={workspace}
          initialPath={initialPath}
          profile={profile}
          onProfileChange={updateProfile}
          onLogout={logout}
          workspace={workspace}
        />
      )}
    </AuthFlow>
  );
}
