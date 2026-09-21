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
import { FeaturePage } from "@/components/blackfin-pages";

const nav = [
  ["Dashboard", Gauge, "/dashboard"],
  ["Meu financeiro", WalletCards, "/financeiro/pessoal"],
  ["Barbearia", BriefcaseBusiness, "/financeiro/barbearia"],
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
const chartData = [
  { day: "14", receita: 3800, despesa: 1120 },
  { day: "15", receita: 4200, despesa: 1650 },
  { day: "16", receita: 3450, despesa: 980 },
  { day: "17", receita: 5100, despesa: 1720 },
  { day: "18", receita: 4780, despesa: 1320 },
  { day: "19", receita: 6100, despesa: 1990 },
  { day: "20", receita: 5590, despesa: 1460 },
];
const transactions = [
  {
    icon: ArrowUpRight,
    title: "Serviços — sábado",
    meta: "Barbearia · Pix",
    value: "+ R$ 2.840,00",
    positive: true,
  },
  {
    icon: ArrowDownLeft,
    title: "Fornecedor Navalha & Cia.",
    meta: "Produtos · Boleto",
    value: "− R$ 687,40",
    positive: false,
  },
  {
    icon: ArrowUpRight,
    title: "Corte + barba",
    meta: "Barbearia · Cartão",
    value: "+ R$ 148,00",
    positive: true,
  },
  {
    icon: ArrowDownLeft,
    title: "Assinatura de software",
    meta: "Operacional · Crédito",
    value: "− R$ 89,90",
    positive: false,
  },
];

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
}: {
  mobile?: boolean;
  currentPath: string;
  onNavigate: (path: string) => void;
}) {
  return (
    <aside className={mobile ? "mobile-sidebar" : "sidebar"}>
      <Brand />
      <div className="workspace-pill">
        <span>BF</span>
        <div>
          <strong>Barbearia Ferreira</strong>
          <small>Ambiente demonstrativo</small>
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
            {index === 4 && <em>2</em>}
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
          <span>JG</span>
          <div>
            <strong>Jhonatan Gabriel</strong>
            <small>Proprietário</small>
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
}) {
  const [type, setType] = useState<"receita" | "despesa">("receita");
  const [origin, setOrigin] = useState<"pessoal" | "barbearia">("barbearia");
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
  const categories =
    origin === "pessoal" ? personalCategories : businessCategories;
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
            Origem
            <Select
              value={origin}
              onValueChange={(value) => {
                const next = value as "pessoal" | "barbearia";
                setOrigin(next);
                setCategory(next === "pessoal" ? "Alimentação" : "Serviços");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="barbearia">Barbearia</SelectItem>
                <SelectItem value="pessoal">Pessoal</SelectItem>
              </SelectContent>
            </Select>
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

export function BlackfinApp({
  initialPath = "/dashboard",
}: {
  initialPath?: string;
}) {
  const [period, setPeriod] = useState("7d");
  const [currentPath, setCurrentPath] = useState(
    initialPath === "/" ? "/dashboard" : initialPath,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [addedTransactions, setAddedTransactions] = useState<
    Array<{
      type: "receita" | "despesa";
      origin: "pessoal" | "barbearia";
      amount: number;
      description: string;
      date: string;
      category: string;
    }>
  >([]);
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
  const consolidated =
    26982.6 +
    addedTransactions.reduce(
      (sum, item) =>
        sum + (item.type === "receita" ? item.amount : -item.amount),
      0,
    );
  const saveTransaction = (transaction: {
    type: "receita" | "despesa";
    origin: "pessoal" | "barbearia";
    amount: number;
    description: string;
    date: string;
    category: string;
  }) => {
    setAddedTransactions((items) => [transaction, ...items]);
    void fetch("/api/transactions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...transaction,
        amountCents: Math.round(transaction.amount * 100),
        occurredOn: transaction.date,
        paymentMethod: "pix",
        status: "pago",
      }),
    }).catch(() => {});
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
            sections: nav.map(([label, , path]) => ({ label, path })),
          }),
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => {});
    return () => lifecycle.abort();
  }, []);
  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className="app-shell">
      <Sidebar currentPath={currentPath} onNavigate={navigate} />
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
              <Sidebar mobile currentPath={currentPath} onNavigate={navigate} />
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
            <span className="demo-badge">DADOS DEMONSTRATIVOS</span>
            <button
              aria-label="Notificações"
              className="notification"
              onClick={() => setNotificationsOpen(true)}
            >
              <Bell />
              <i />
            </button>
            <div className="avatar">JG</div>
          </div>
        </header>
        {currentPath !== "/dashboard" ? (
          <FeaturePage
            path={currentPath}
            onNewTransaction={() => setDialogOpen(true)}
          />
        ) : (
          <div className="dashboard-wrap">
            <section className="page-heading">
              <div>
                <p>DOMINGO, 20 DE SETEMBRO</p>
                <h1>Boa noite, Jhonatan.</h1>
                <span>
                  Acompanhe sua vida financeira e o desempenho da sua barbearia.
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
                  <strong>12,4%</strong> acima do mês anterior
                </p>
              </div>
              <div className="balance-split">
                <div>
                  <small>PESSOAL</small>
                  <strong>R$ 8.532,60</strong>
                </div>
                <div>
                  <small>BARBEARIA</small>
                  <strong>R$ 18.450,00</strong>
                </div>
                <div>
                  <small>RESULTADO DO MÊS</small>
                  <strong>R$ {total.toLocaleString("pt-BR")}</strong>
                </div>
              </div>
              <div className="hero-watermark">BF</div>
            </section>
            <section className="metric-grid">
              <MetricCard
                eyebrow="Receita da barbearia"
                value="R$ 24.850,00"
                change="+12,4%"
                icon={BriefcaseBusiness}
              />
              <MetricCard
                eyebrow="Despesas da barbearia"
                value="R$ 8.420,00"
                change="+4,2%"
                icon={ArrowDownLeft}
                tone="red"
              />
              <MetricCard
                eyebrow="Receitas pessoais"
                value="R$ 6.780,00"
                change="+8,1%"
                icon={ArrowUpRight}
              />
              <MetricCard
                eyebrow="Despesas pessoais"
                value="R$ 3.247,40"
                change="−2,8%"
                icon={CreditCard}
                tone="gold"
              />
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
                    Receitas <strong>R$ 32.480</strong>
                  </span>
                  <span>
                    <i className="expense-dot" />
                    Despesas <strong>R$ 10.240</strong>
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
                  <strong>Seu faturamento cresceu 12,4%</strong>
                  <p>
                    Você recebeu R$ 2.740,00 a mais que no mesmo período do mês
                    anterior.
                  </p>
                </div>
                <div className="insight-row">
                  <span />
                  <div>
                    <strong>Despesas sob controle</strong>
                    <p>Custos operacionais caíram 2,8%.</p>
                  </div>
                </div>
                <div className="insight-row gold">
                  <span />
                  <div>
                    <strong>Produtos pedem atenção</strong>
                    <p>Representam 31% dos gastos do mês.</p>
                  </div>
                </div>
                <button className="text-action">
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
                <button className="text-action">
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
                  {[
                    ...addedTransactions.map((item) => ({
                      icon:
                        item.type === "receita" ? ArrowUpRight : ArrowDownLeft,
                      title: item.description,
                      meta: `${item.origin === "pessoal" ? "Pessoal" : "Barbearia"} · ${item.category}`,
                      value: `${item.type === "receita" ? "+" : "−"} ${item.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
                      positive: item.type === "receita",
                    })),
                    ...transactions,
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
                          <button aria-label={`Mais opções para ${tx.title}`}>
                            <MoreHorizontal />
                          </button>
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
      />
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="transaction-dialog notifications-dialog">
          <DialogHeader>
            <DialogTitle>Notificações</DialogTitle>
            <DialogDescription>
              Atualizações importantes da sua operação.
            </DialogDescription>
          </DialogHeader>
          <div className="notification-list">
            <div>
              <span className="warning" />
              <p>
                <strong>Conta vencendo hoje</strong>
                <small>
                  O boleto do fornecedor vence hoje, no valor de R$ 1.240,00.
                </small>
              </p>
            </div>
            <div>
              <span />
              <p>
                <strong>Faturamento em alta</strong>
                <small>
                  Suas receitas cresceram 12,4% em relação ao mês anterior.
                </small>
              </p>
            </div>
            <div>
              <span className="gold" />
              <p>
                <strong>Comprovante aguardando revisão</strong>
                <small>Confirme os dados antes de gerar o lançamento.</small>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
