"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Calendar,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  FileSpreadsheet,
  Lightbulb,
  PackagePlus,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trash2,
  Upload,
  UserPlus,
  UsersRound,
  WalletCards,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { BusinessProfile } from "@/components/auth-flow";
import type { Workspace } from "@/lib/auth-session";

type PageProps = {
  path: string;
  onNewTransaction: () => void;
  profile: BusinessProfile;
  onProfileChange: (profile: BusinessProfile) => void;
  workspace: Workspace;
  transactions: FinancialTransaction[];
};
export type FinancialTransaction = {
  id?: string;
  type: "receita" | "despesa";
  origin: "pessoal" | "barbearia";
  amount: number;
  description: string;
  date: string;
  category: string;
};
type Tx = {
  id: string;
  date: string;
  description: string;
  category: string;
  origin: string;
  type: "Receita" | "Despesa";
  status: string;
  value: number;
};
function toTableRows(transactions: FinancialTransaction[]): Tx[] {
  return transactions.map((transaction) => ({
    date: transaction.date.split("-").reverse().join("/"),
    id: transaction.id ?? `${transaction.date}-${transaction.description}-${transaction.amount}`,
    description: transaction.description,
    category: transaction.category,
    origin: transaction.origin === "barbearia" ? "Empresa" : "Pessoal",
    type: transaction.type === "receita" ? "Receita" : "Despesa",
    status: "Pago",
    value: transaction.amount,
  }));
}
const reportData = [
  { m: "Abr", r: 0, d: 0 },
  { m: "Mai", r: 0, d: 0 },
  { m: "Jun", r: 0, d: 0 },
  { m: "Jul", r: 0, d: 0 },
  { m: "Ago", r: 0, d: 0 },
  { m: "Set", r: 0, d: 0 },
];
const categories = [
  { name: "Produtos", value: 0, color: "#c5a467" },
  { name: "Aluguel", value: 0, color: "#72d6ad" },
  { name: "Comissões", value: 0, color: "#7299d6" },
  { name: "Outros", value: 0, color: "#5f5f5f" },
];
const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="feature-heading">
      <div>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        <span>{description}</span>
      </div>
      {action}
    </section>
  );
}
function Stat({
  label,
  value,
  detail,
  tone = "green",
  icon: Icon = TrendingUp,
}: {
  label: string;
  value: string;
  detail: string;
  tone?: string;
  icon?: typeof TrendingUp;
}) {
  return (
    <article className="feature-stat">
      <div className={`feature-stat-icon ${tone}`}>
        <Icon />
      </div>
      <small>{label}</small>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function TransactionTable({
  rows = [],
  onDelete,
}: {
  rows?: Tx[];
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="data-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>DATA</TableHead>
            <TableHead>DESCRIÇÃO</TableHead>
            <TableHead>CATEGORIA</TableHead>
            <TableHead>ORIGEM</TableHead>
            <TableHead>STATUS</TableHead>
            <TableHead className="text-right">VALOR</TableHead>
            {onDelete && <TableHead />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={onDelete ? 7 : 6} className="empty-table">
                Nenhuma movimentação cadastrada.
              </TableCell>
            </TableRow>
          )}
          {rows.map((tx, i) => (
            <TableRow key={`${tx.description}-${i}`}>
              <TableCell>{tx.date}</TableCell>
              <TableCell>
                <strong>{tx.description}</strong>
              </TableCell>
              <TableCell>{tx.category}</TableCell>
              <TableCell>{tx.origin}</TableCell>
              <TableCell>
                <span
                  className={`data-status ${tx.status === "Pendente" ? "pending" : ""}`}
                >
                  <i />
                  {tx.status}
                </span>
              </TableCell>
              <TableCell
                className={`text-right ${tx.type === "Receita" ? "value-positive" : "value-negative"}`}
              >
                {tx.type === "Receita" ? "+ " : "− "}
                {money(tx.value)}
              </TableCell>
              {onDelete && <TableCell className="text-right"><Button variant="ghost" size="icon" className="delete-transaction" aria-label={`Excluir ${tx.description}`} title="Excluir lançamento" onClick={() => onDelete(tx.id)}><Trash2 /></Button></TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TransactionsPage({ onNew, transactions, onDelete }: { onNew: () => void; transactions: FinancialTransaction[]; onDelete: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const visible = toTableRows(transactions).filter(
    (tx) =>
      (filter === "todos" || tx.type.toLowerCase() === filter) &&
      tx.description.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        eyebrow="GESTÃO FINANCEIRA"
        title="Movimentações"
        description="Consulte, filtre e organize todos os lançamentos."
        action={
          <Button className="gold-button" onClick={onNew}>
            <Plus />
            Nova movimentação
          </Button>
        }
      />
      <div className="filter-bar">
        <div className="search-field">
          <Search />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por descrição..."
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="receita">Receitas</SelectItem>
            <SelectItem value="despesa">Despesas</SelectItem>
          </SelectContent>
        </Select>
        <span>{visible.length} resultados</span>
      </div>
      <TransactionTable rows={visible} onDelete={onDelete} />
    </>
  );
}

function FinancePage({
  business = false,
  onNew,
  transactions,
  onDelete,
}: {
  business?: boolean;
  onNew: () => void;
  transactions: FinancialTransaction[];
  onDelete: (id: string) => void;
}) {
  const cats = business
    ? ["Produtos", "Comissões", "Aluguel", "Marketing", "Impostos"]
    : ["Moradia", "Alimentação", "Transporte", "Lazer", "Assinaturas"];
  const rows = toTableRows(transactions);
  const revenue = transactions.filter((item) => item.type === "receita").reduce((total, item) => total + item.amount, 0);
  const expenses = transactions.filter((item) => item.type === "despesa").reduce((total, item) => total + item.amount, 0);
  const balance = revenue - expenses;
  const expensesByCategory = cats.map((category) => ({
    category,
    total: transactions.filter((item) => item.type === "despesa" && item.category === category).reduce((total, item) => total + item.amount, 0),
  }));
  return (
    <>
      <PageHeader
        eyebrow={business ? "OPERAÇÃO" : "VIDA PESSOAL"}
        title={business ? "Financeiro empresarial" : "Meu financeiro"}
        description={
          business
            ? "Fluxo de caixa, custos e resultado do seu negócio."
            : "Organize seus compromissos sem misturar as contas."
        }
        action={
          <Button className="gold-button" onClick={onNew}>
            <Plus />
            Adicionar lançamento
          </Button>
        }
      />
      <div className="feature-stats">
        <Stat
          label={business ? "Faturamento" : "Saldo atual"}
          value={money(business ? revenue : balance)}
          detail={`${transactions.length} ${transactions.length === 1 ? "lançamento" : "lançamentos"}`}
          icon={business ? BriefcaseBusiness : WalletCards}
        />
        <Stat
          label="Despesas"
          value={money(expenses)}
          detail={expenses ? "Atualizado com seus lançamentos" : "Nenhuma despesa"}
          tone="red"
          icon={ArrowDownLeft}
        />
        <Stat
          label={business ? "Lucro estimado" : "Saldo líquido"}
          value={money(balance)}
          detail="Resultado atualizado automaticamente"
          icon={TrendingUp}
        />
        <Stat
          label={business ? "Contas a pagar" : "Limite mensal"}
          value="R$ 0,00"
          detail="Nenhum compromisso"
          tone="gold"
          icon={Calendar}
        />
      </div>
      <div className="two-columns">
        <div className="data-card padded">
          <div className="section-title">
            <div>
              <p>DISTRIBUIÇÃO</p>
              <h2>Gastos por categoria</h2>
            </div>
          </div>
          {expensesByCategory.map(({ category, total }) => (
            <div className="category-line" key={category}>
              <span>{category}</span>
              <Progress value={expenses ? (total / expenses) * 100 : 0} />
              <strong>{expenses ? Math.round((total / expenses) * 100) : 0}%</strong>
            </div>
          ))}
        </div>
        <div className="data-card padded">
          <div className="section-title">
            <div>
              <p>RESUMO</p>
              <h2>Saúde financeira</h2>
            </div>
          </div>
          <div className="score-ring">
            <span>{transactions.length ? Math.min(100, Math.max(1, Math.round((revenue / Math.max(expenses, 1)) * 50))) : 0}</span>
            <small>/ 100</small>
          </div>
          <p className="score-copy">
            Adicione movimentações para calcular sua saúde financeira.
          </p>
        </div>
      </div>
      <TransactionTable rows={rows} onDelete={onDelete} />
    </>
  );
}

function ReceiptsPage({ onNew, workspace }: { onNew: () => void; workspace: Workspace }) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  return (
    <>
      <PageHeader
        eyebrow="DOCUMENTOS"
        title="Central de comprovantes"
        description="Envie comprovantes e revise os dados antes de gerar o lançamento."
      />
      <div className="receipt-layout">
        <div
          className="upload-card"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setFile(e.dataTransfer.files[0] || null);
          }}
        >
          <input
            ref={input}
            type="file"
            accept="image/*,.pdf"
            hidden
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <span>
            <Upload />
          </span>
          <h2>{file ? file.name : "Arraste seu comprovante aqui"}</h2>
          <p>
            PNG, JPG ou PDF de até 10 MB. No celular, você também pode usar a
            câmera.
          </p>
          <Button variant="outline" onClick={() => input.current?.click()}>
            {file ? "Trocar arquivo" : "Selecionar arquivo"}
          </Button>
        </div>
        <div className="data-card padded receipt-review">
          <div className="section-title">
            <div>
              <p>LEITURA ASSISTIDA</p>
              <h2>
                {confirmed
                  ? "Lançamento confirmado"
                  : "Confira os dados identificados"}
              </h2>
            </div>
            {confirmed && <Check className="success-check" />}
          </div>
          {file && !confirmed ? (
            <div className="review-form">
              <label>
                Valor
                <Input defaultValue="187,50" />
              </label>
              <label>
                Data
                <Input type="date" defaultValue="2026-09-20" />
              </label>
              <label className="wide">
                Descrição
                <Input defaultValue="Compra de produtos" />
              </label>
              <label>
                Ambiente
                <Input value={workspace === "business" ? "Empresarial" : "Pessoal"} readOnly />
              </label>
              <label>
                Categoria
                <Select defaultValue="produtos">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="produtos">Produtos</SelectItem>
                    <SelectItem value="outros">
                      Confirmar manualmente
                    </SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <Button
                className="gold-button wide"
                onClick={() => setConfirmed(true)}
              >
                Confirmar lançamento
              </Button>
            </div>
          ) : file && confirmed ? (
            <div className="receipt-success">
              <ShieldCheck />
              <p>O comprovante foi vinculado à movimentação com segurança.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setConfirmed(false);
                }}
              >
                Enviar outro
              </Button>
            </div>
          ) : (
            <div className="empty-review">
              <Sparkles />
              <p>
                Os campos identificados aparecerão aqui. Quando não houver
                certeza, deixaremos o valor em branco para sua confirmação.
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="data-card padded">
        <div className="section-title">
          <div>
            <p>ARQUIVOS RECENTES</p>
            <h2>Comprovantes enviados</h2>
          </div>
          <Button variant="outline" size="sm" onClick={onNew}>
            <Plus />
            Lançar manualmente
          </Button>
        </div>
        <div className="empty-list">Nenhum comprovante enviado.</div>
      </div>
    </>
  );
}

function AccountsPage({ receivable = false, onNew }: { receivable?: boolean; onNew: () => void }) {
  const rows: Array<{ n: string; v: number; d: string; s: string }> = [];
  return (
    <>
      <PageHeader
        eyebrow="COMPROMISSOS"
        title={receivable ? "Contas a receber" : "Contas a pagar"}
        description={
          receivable
            ? "Acompanhe entradas previstas e valores em atraso."
            : "Visualize vencimentos e mantenha os pagamentos em dia."
        }
        action={
          <Button className="gold-button" onClick={onNew}>
            <Plus />
            Nova conta
          </Button>
        }
      />
      <div className="feature-stats">
        <Stat
          label={receivable ? "Total a receber" : "Total em aberto"}
          value="R$ 0,00"
          detail="Próximos 30 dias"
          icon={CircleDollarSign}
        />
        <Stat
          label={receivable ? "Recebidos" : "Vencidas"}
          value="R$ 0,00"
          detail="Nenhum registro"
          tone={receivable ? "green" : "red"}
          icon={receivable ? ArrowUpRight : AlertTriangle}
        />
        <Stat
          label="Vencendo hoje"
          value="R$ 0,00"
          detail="Nenhum compromisso"
          tone="gold"
          icon={Clock3}
        />
      </div>
      <div className="data-card padded">
        <div className="section-title">
          <div>
            <p>AGENDA FINANCEIRA</p>
            <h2>Próximos compromissos</h2>
          </div>
        </div>
        {rows.map((row) => (
          <div className="account-row" key={row.n}>
            <span
              className={`account-icon ${row.s === "Vencida" ? "late" : ""}`}
            >
              <Calendar />
            </span>
            <div>
              <strong>{row.n}</strong>
              <small>Vencimento: {row.d}</small>
            </div>
            <b>{money(row.v)}</b>
            <em className={row.s === "Vencida" ? "late" : ""}>{row.s}</em>
            <Button variant="outline" size="sm">
              {receivable ? "Marcar recebido" : "Marcar pago"}
            </Button>
          </div>
        ))}
        {rows.length === 0 && <div className="empty-list">Nenhuma conta cadastrada.</div>}
      </div>
    </>
  );
}

function ReportsPage({ profile, workspace, transactions }: { profile: BusinessProfile; workspace: Workspace; transactions: FinancialTransaction[] }) {
  const [month, setMonth] = useState("setembro-2026");
  const [pdfReady, setPdfReady] = useState(false);
  const revenue = transactions.filter((item) => item.type === "receita").reduce((total, item) => total + item.amount, 0);
  const expenses = transactions.filter((item) => item.type === "despesa").reduce((total, item) => total + item.amount, 0);
  const liveReportData = useMemo(() => {
    const data = reportData.map((item) => ({ ...item }));
    const monthIndex: Record<string, number> = { "04": 0, "05": 1, "06": 2, "07": 3, "08": 4, "09": 5 };
    for (const transaction of transactions) {
      const index = monthIndex[transaction.date.slice(5, 7)];
      if (index === undefined) continue;
      if (transaction.type === "receita") data[index].r += transaction.amount;
      else data[index].d += transaction.amount;
    }
    return data;
  }, [transactions]);
  const months = [
    ["setembro-2026", "Setembro de 2026"],
    ["agosto-2026", "Agosto de 2026"],
    ["julho-2026", "Julho de 2026"],
    ["junho-2026", "Junho de 2026"],
    ["maio-2026", "Maio de 2026"],
  ];
  const exportCsv = () => {
    const csv =
      "Mês,Receitas,Despesas\n" +
      liveReportData.map((i) => `${i.m},${i.r},${i.d}`).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "blackfin-relatorio.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const downloadPdf = async () => {
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const label = months.find(([value]) => value === month)?.[1] ?? month;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    doc.setFillColor(8, 8, 8);
    doc.rect(0, 0, 210, 42, "F");
    doc.setTextColor(197, 164, 103);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("BLACKFIN", 16, 18);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("RELATORIO FINANCEIRO MENSAL", 16, 27);
    doc.setTextColor(110, 110, 110);
    doc.text(label.toUpperCase(), 16, 34);
    doc.setTextColor(25, 25, 25);
    doc.setFontSize(9);
    doc.text(workspace === "business" ? profile.businessName : profile.ownerName, 16, 53);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Resumo executivo", 16, 64);
    const cards = [
      ["Receitas", money(revenue)],
      ["Despesas", money(expenses)],
      ["Resultado", money(revenue - expenses)],
    ];
    cards.forEach(([title, value], index) => {
      const x = 16 + index * 61;
      doc.setDrawColor(225, 225, 225);
      doc.roundedRect(x, 72, 55, 23, 2, 2);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(105, 105, 105);
      doc.text(title, x + 4, 80);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(
        index === 2 ? 23 : 30,
        index === 2 ? 125 : 30,
        index === 2 ? 88 : 30,
      );
      doc.text(value, x + 4, 89);
    });
    autoTable(doc, {
      startY: 106,
      head: [["Data", "Descricao", "Categoria", "Origem", "Status", "Valor"]],
      body: toTableRows(transactions).map((tx) => [
        tx.date,
        tx.description,
        tx.category,
        tx.origin,
        tx.status,
        `${tx.type === "Receita" ? "+" : "-"} ${money(tx.value)}`,
      ]),
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 3,
        textColor: [55, 55, 55],
        lineColor: [230, 230, 230],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [15, 15, 15],
        textColor: [215, 185, 125],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [247, 247, 247] },
      margin: { left: 16, right: 16 },
    });
    const finalY =
      (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
        ?.finalY ?? 160;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    doc.text(
      "Documento gerado pelo BLACKFIN.",
      16,
      Math.min(285, finalY + 12),
    );
    doc.save(`blackfin-${month}.pdf`);
    setPdfReady(true);
  };
  return (
    <>
      <PageHeader
        eyebrow="ANÁLISE"
        title="Relatórios"
        description="Compare períodos e transforme números em decisões."
        action={
          <div className="report-actions">
            <Button variant="outline" onClick={exportCsv}>
              <FileSpreadsheet />
              CSV
            </Button>
            <Button className="gold-button" onClick={downloadPdf}>
              {pdfReady ? <Check /> : <Download />}
              {pdfReady ? "PDF gerado" : "Baixar PDF"}
            </Button>
          </div>
        }
      />
      <div className="filter-bar">
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map(([value, label]) => (
              <SelectItem value={value} key={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue="6m">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30d">30 dias</SelectItem>
            <SelectItem value="3m">3 meses</SelectItem>
            <SelectItem value="6m">6 meses</SelectItem>
            <SelectItem value="12m">12 meses</SelectItem>
          </SelectContent>
        </Select>
        <span>Atualizado em 20 set 2026</span>
      </div>
      <div className="two-columns report-columns">
        <div className="data-card padded">
          <div className="section-title">
            <div>
              <p>COMPARATIVO</p>
              <h2>Receitas e despesas</h2>
            </div>
          </div>
          <div className="report-chart">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={0}
              initialDimension={{ width: 1, height: 1 }}
            >
              <BarChart data={liveReportData}>
                <CartesianGrid stroke="#ffffff0a" vertical={false} />
                <XAxis
                  dataKey="m"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#777" }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "#111",
                    border: "1px solid #292929",
                  }}
                />
                <Bar dataKey="r" fill="#72d6ad" radius={[4, 4, 0, 0]} />
                <Bar dataKey="d" fill="#a68b55" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="data-card padded">
          <div className="section-title">
            <div>
              <p>CATEGORIAS</p>
              <h2>Composição dos gastos</h2>
            </div>
          </div>
          <div className="donut-wrap">
            <ResponsiveContainer
              width="100%"
              height={180}
              minWidth={0}
              minHeight={0}
              initialDimension={{ width: 1, height: 180 }}
            >
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="value"
                  innerRadius={52}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {categories.map((c) => (
                    <Cell key={c.name} fill={c.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#111",
                    border: "1px solid #292929",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div>
              {categories.map((c) => (
                <p key={c.name}>
                  <i style={{ background: c.color }} />
                  {c.name}
                  <strong>{c.value}%</strong>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="report-list">
        {[
          ["Receita mensal", ArrowUpRight],
          ["Fluxo de caixa", TrendingUp],
          ["Gastos por categoria", BarChart3],
          workspace === "business"
            ? ["Resultado da empresa", BriefcaseBusiness]
            : ["Resumo pessoal", WalletCards],
        ].map(([label, Icon]) => (
          <button key={label as string} onClick={() => window.alert(`O relatório “${label as string}” usa os lançamentos exibidos nesta página.`)}>
            <Icon />
            <span>{label as string}</span>
            <ChevronRight />
          </button>
        ))}
      </div>
    </>
  );
}

function HistoryPage({ transactions, onDelete }: { transactions: FinancialTransaction[]; onDelete: (id: string) => void }) {
  const [month, setMonth] = useState("Setembro");
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const selectedMonth = months.indexOf(month) + 1;
  const currentTransactions = transactions.filter((transaction) => Number(transaction.date.slice(5, 7)) === selectedMonth);
  const revenue = currentTransactions.filter((item) => item.type === "receita").reduce((total, item) => total + item.amount, 0);
  const expenses = currentTransactions.filter((item) => item.type === "despesa").reduce((total, item) => total + item.amount, 0);
  return (
    <>
      <PageHeader
        eyebrow="ARQUIVO"
        title="Histórico financeiro"
        description="Uma visão organizada de cada mês do seu ano."
      />
      <div className="month-grid">
        {months.map((m) => (
          <button
            key={m}
            className={month === m ? "active" : ""}
            onClick={() => setMonth(m)}
          >
            <small>2026</small>
            <strong>{m}</strong>
            <span>{money(transactions.filter((transaction) => Number(transaction.date.slice(5, 7)) === months.indexOf(m) + 1).reduce((total, item) => total + (item.type === "receita" ? item.amount : -item.amount), 0))}</span>
          </button>
        ))}
      </div>
      <div className="section-title history-title">
        <div>
          <p>{month.toUpperCase()} DE 2026</p>
          <h2>Resumo do período</h2>
        </div>
      </div>
      <div className="feature-stats">
        <Stat
          label="Receitas"
          value={money(revenue)}
          detail={`${currentTransactions.length} ${currentTransactions.length === 1 ? "lançamento" : "lançamentos"}`}
          icon={ArrowUpRight}
        />
        <Stat
          label="Despesas"
          value={money(expenses)}
          detail={expenses ? "Atualizado automaticamente" : "Nenhuma despesa"}
          tone="red"
          icon={ArrowDownLeft}
        />
        <Stat
          label="Saldo"
          value={money(revenue - expenses)}
          detail="Resultado consolidado"
          icon={TrendingUp}
        />
      </div>
      <TransactionTable rows={toTableRows(currentTransactions)} onDelete={onDelete} />
    </>
  );
}

function PeoplePage({ commissions = false }: { commissions?: boolean }) {
  const [barbers, setBarbers] = useState<Array<{ initial: string; name: string; pct: number; sales: number }>>([]);
  const [barbersLoaded, setBarbersLoaded] = useState(false);
  const [barberOpen, setBarberOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [name, setName] = useState("");
  const [percent, setPercent] = useState("35");
  const [selectedBarber, setSelectedBarber] = useState("");
  const [serviceValue, setServiceValue] = useState("");
  const [commissionValue, setCommissionValue] = useState("");
  useEffect(() => {
    let stored: typeof barbers = [];
    try {
      const saved = window.localStorage.getItem("blackfin_barbers_v1");
      if (saved) {
        stored = JSON.parse(saved) as typeof barbers;
      }
    } catch {
      window.localStorage.removeItem("blackfin_barbers_v1");
    }
    const timer = window.setTimeout(() => {
      setBarbers(stored);
      setSelectedBarber(stored[0]?.name ?? "");
      setBarbersLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!barbersLoaded) return;
    window.localStorage.setItem("blackfin_barbers_v1", JSON.stringify(barbers));
  }, [barbers, barbersLoaded]);
  const current =
    barbers.find((item) => item.name === selectedBarber) ?? barbers[0];
  const calculated = serviceValue && current
    ? (Number(serviceValue.replace(",", ".")) * current.pct) / 100
    : 0;
  const totalSales = barbers.reduce((sum, barber) => sum + barber.sales, 0);
  const totalCommissions = barbers.reduce(
    (sum, barber) => sum + (barber.sales * barber.pct) / 100,
    0,
  );
  const addBarber = () => {
    const pct = Math.min(100, Math.max(0, Number(percent)));
    if (!name.trim() || !Number.isFinite(pct)) return;
    const parts = name.trim().split(/\s+/);
    setBarbers((items) => [
      ...items,
      {
        initial: `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase(),
        name: name.trim(),
        pct,
        sales: 0,
      },
    ]);
    setSelectedBarber(name.trim());
    setName("");
    setBarberOpen(false);
  };
  const addService = () => {
    const value = Number(serviceValue.replace(",", "."));
    if (!value || !current) return;
    setBarbers((items) =>
      items.map((item) =>
        item.name === selectedBarber
          ? { ...item, sales: item.sales + value }
          : item,
      ),
    );
    setServiceValue("");
    setCommissionValue("");
    setServiceOpen(false);
  };
  return (
    <>
      <PageHeader
        eyebrow="EQUIPE"
        title={commissions ? "Comissões" : "Barbeiros"}
        description={
          commissions
            ? "Acompanhe produção, repasses e resultado líquido."
            : "Cadastre profissionais e configure percentuais."
        }
        action={
          <Button
            className="gold-button"
            onClick={() =>
              commissions && barbers.length > 0
                ? setServiceOpen(true)
                : setBarberOpen(true)
            }
          >
            <UserPlus />
            {commissions && barbers.length > 0
              ? "Registrar serviço"
              : "Novo barbeiro"}
          </Button>
        }
      />
      <div className="feature-stats">
        <Stat
          label={commissions ? "Total vendido" : "Profissionais ativos"}
          value={commissions ? money(totalSales) : String(barbers.length)}
          detail="No mês atual"
          icon={UsersRound}
        />
        <Stat
          label={commissions ? "Total de comissões" : "Atendimentos"}
          value={commissions ? money(totalCommissions) : "0"}
          detail={commissions ? "Calculado por profissional" : "Este mês"}
          tone="gold"
          icon={CircleDollarSign}
        />
        <Stat
          label={commissions ? "Líquido da barbearia" : "Ticket médio"}
          value={commissions ? money(totalSales - totalCommissions) : "R$ 0,00"}
          detail="Dados do período atual"
          icon={TrendingUp}
        />
      </div>
      <div className="team-grid">
        {barbers.map(({ initial, name, pct, sales }) => (
          <article className="team-card" key={name}>
            <div className="team-avatar">{initial}</div>
            <div>
              <h3>{name}</h3>
              <p>Comissão configurada em {pct}%</p>
            </div>
            <span>ATIVO</span>
            <dl>
              <div>
                <dt>VENDAS</dt>
                <dd>{money(sales)}</dd>
              </div>
              <div>
                <dt>COMISSÃO</dt>
                <dd>{money((sales * pct) / 100)}</dd>
              </div>
            </dl>
            <Button variant="outline" size="sm">
              Ver detalhes
            </Button>
          </article>
        ))}
        {barbers.length === 0 && (
          <div className="empty-team">
            <UsersRound />
            <strong>Nenhum barbeiro cadastrado</strong>
            <p>Adicione o primeiro profissional para começar seus testes.</p>
            <Button className="gold-button" onClick={() => setBarberOpen(true)}>
              <UserPlus /> Novo barbeiro
            </Button>
          </div>
        )}
      </div>
      <Dialog open={barberOpen} onOpenChange={setBarberOpen}>
        <DialogContent className="transaction-dialog">
          <DialogHeader>
            <DialogTitle>Novo barbeiro</DialogTitle>
            <DialogDescription>
              Defina o nome e o percentual individual de comissão.
            </DialogDescription>
          </DialogHeader>
          <div className="review-form">
            <label className="wide">
              Nome completo
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: João da Silva"
              />
            </label>
            <label>
              Percentual de comissão
              <Input
                value={percent}
                onChange={(event) => setPercent(event.target.value)}
                type="number"
                min="0"
                max="100"
                placeholder="35"
              />
            </label>
            <label>
              Prévia por R$ 100
              <Input value={money(Number(percent || 0))} readOnly />
            </label>
            <Button className="gold-button wide" onClick={addBarber}>
              <UserPlus />
              Adicionar barbeiro
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={serviceOpen} onOpenChange={setServiceOpen}>
        <DialogContent className="transaction-dialog">
          <DialogHeader>
            <DialogTitle>Registrar serviço e comissão</DialogTitle>
            <DialogDescription>
              Informe o valor do serviço. A comissão usa o percentual do
              barbeiro e também pode ser ajustada.
            </DialogDescription>
          </DialogHeader>
          <div className="review-form">
            <label className="wide">
              Barbeiro
              <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((item) => (
                    <SelectItem value={item.name} key={item.name}>
                      {item.name} · {item.pct}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label>
              Valor do serviço
              <Input
                value={serviceValue}
                onChange={(event) => {
                  setServiceValue(event.target.value);
                  setCommissionValue("");
                }}
                inputMode="decimal"
                placeholder="R$ 0,00"
              />
            </label>
            <label>
              Valor da comissão
              <Input
                value={
                  commissionValue ||
                  (calculated ? calculated.toFixed(2).replace(".", ",") : "")
                }
                onChange={(event) => setCommissionValue(event.target.value)}
                inputMode="decimal"
                placeholder="Calculado automaticamente"
              />
            </label>
            <label>
              Data
              <Input type="date" defaultValue="2026-09-20" />
            </label>
            <label>
              Percentual aplicado
              <Input value={`${current?.pct ?? 0}%`} readOnly />
            </label>
            <Button className="gold-button wide" onClick={addService}>
              <Check />
              Registrar comissão
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InsightsPage({ workspace }: { workspace: Workspace }) {
  return (
    <>
      <PageHeader
        eyebrow="INTELIGÊNCIA FINANCEIRA"
        title="Insights"
        description="Sinais calculados somente a partir dos seus dados confirmados."
      />
      <div className="insight-grid">
        <article className="insight-feature">
          <span>
            <Sparkles />
          </span>
          <p>DESTAQUE DO MÊS</p>
          <h2>Seu ambiente está pronto</h2>
          <p>{workspace === "business" ? "Cadastre as movimentações da empresa para receber análises e recomendações." : "Cadastre suas movimentações pessoais para receber análises e recomendações."}</p>
          <Button variant="outline" onClick={() => window.alert("Os insights são atualizados automaticamente quando você adiciona ou exclui lançamentos.")}>Como funcionam os insights</Button>
        </article>
        {[
          ["Maior gasto", "Aguardando movimentações.", "gold"],
          ["Melhor dia", "Aguardando movimentações.", "green"],
          ["Atenção", "Nenhuma pendência cadastrada.", "red"],
          ["Oportunidade", workspace === "business" ? "Comece registrando seus serviços." : "Comece registrando suas receitas.", "blue"],
        ].map(([title, copy, tone]) => (
          <article className={`mini-insight ${tone}`} key={title}>
            <Lightbulb />
            <small>{title}</small>
            <strong>{copy}</strong>
            <span>Baseado nos últimos 30 dias</span>
          </article>
        ))}
      </div>
    </>
  );
}

function SettingsPage({
  profile,
  onProfileChange,
  workspace,
}: {
  profile: BusinessProfile;
  onProfileChange: (profile: BusinessProfile) => void;
  workspace: Workspace;
}) {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(profile);
  const [section, setSection] = useState("perfil");
  const [financialAlerts, setFinancialAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const sections = workspace === "business"
    ? [["perfil", "Perfil"], ["empresa", "Empresa"], ["categorias", "Categorias"], ["notificacoes", "Notificações"], ["seguranca", "Segurança"]]
    : [["perfil", "Perfil"], ["categorias", "Categorias"], ["notificacoes", "Notificações"], ["seguranca", "Segurança"]];
  const update = (field: keyof BusinessProfile, value: string) => {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  };
  const save = () => {
    onProfileChange(form);
    window.localStorage.setItem(`blackfin_notification_preferences_${workspace}_v1`, JSON.stringify({ financialAlerts, weeklySummary }));
    setSaved(true);
  };
  const titles: Record<string, [string, string, string]> = {
    perfil: ["PERFIL", "Informações pessoais", "Dados usados para identificar este ambiente."],
    empresa: ["EMPRESA", "Dados da empresa", "Informações exclusivas da operação empresarial."],
    categorias: ["ORGANIZAÇÃO", "Categorias financeiras", "As categorias sugeridas ajudam a classificar os lançamentos."],
    notificacoes: ["ALERTAS", "Notificações", "Escolha o que deseja acompanhar neste ambiente."],
    seguranca: ["SEGURANÇA", "Acesso protegido", "Cada ambiente usa credenciais e sessão próprias."],
  };
  const [eyebrow, title, description] = titles[section] ?? titles.perfil;
  return (
    <>
      <PageHeader
        eyebrow="PREFERÊNCIAS"
        title="Configurações"
        description="Gerencie perfil, empresa, categorias e alertas."
      />
      <div className="settings-layout">
        <nav>
          {sections.map(([id, label]) => (
            <button className={section === id ? "active" : ""} key={id} onClick={() => { setSection(id); setSaved(false); }}>
              <Settings />
              {label}
            </button>
          ))}
        </nav>
        <div className="data-card padded settings-form">
          <div className="section-title">
            <div>
              <p>{eyebrow}</p>
              <h2>{title}</h2>
            </div>
          </div>
          <p className="settings-section-description">{description}</p>
          {section === "perfil" && <div className="review-form">
            <label><span>Nome</span><Input value={form.ownerName} onChange={(event) => update("ownerName", event.target.value)} /></label>
            <label><span>E-mail</span><Input value={form.email} onChange={(event) => update("email", event.target.value)} type="email" /></label>
          </div>}
          {section === "empresa" && workspace === "business" && <div className="review-form">
            <label className="wide"><span>Nome da empresa</span><Input value={form.businessName} onChange={(event) => update("businessName", event.target.value)} /></label>
            <label><span>Telefone</span><Input value={form.phone} onChange={(event) => update("phone", event.target.value)} /></label>
            <label><span>E-mail da empresa</span><Input value={form.email} onChange={(event) => update("email", event.target.value)} type="email" /></label>
            <label><span>Cidade</span><Input value={form.city} onChange={(event) => update("city", event.target.value)} /></label>
            <label><span>UF</span><Input value={form.state} onChange={(event) => update("state", event.target.value.toUpperCase())} maxLength={2} /></label>
          </div>}
          {section === "categorias" && <div className="settings-category-list">
            {(workspace === "business" ? ["Serviços", "Produtos", "Fornecedores", "Comissões", "Impostos"] : ["Moradia", "Alimentação", "Transporte", "Saúde", "Lazer"]).map((category) => <span key={category}>{category}</span>)}
          </div>}
          {section === "notificacoes" && <>
            <div className="settings-switch"><div><strong>Notificações financeiras</strong><p>Receba alertas de vencimentos e mudanças relevantes.</p></div><Switch checked={financialAlerts} onCheckedChange={(value) => { setFinancialAlerts(value); setSaved(false); }} /></div>
            <div className="settings-switch"><div><strong>Resumo semanal</strong><p>Uma visão consolidada toda segunda-feira.</p></div><Switch checked={weeklySummary} onCheckedChange={(value) => { setWeeklySummary(value); setSaved(false); }} /></div>
          </>}
          {section === "seguranca" && <div className="settings-security-note"><ShieldCheck /><div><strong>Ambiente {workspace === "business" ? "empresarial" : "pessoal"} ativo</strong><p>Para alterar login ou senha publicada, atualize as variáveis de ambiente na Vercel e faça um novo deploy.</p></div></div>}
          {section !== "seguranca" && <Button className="gold-button" onClick={save}>{saved ? <><Check /> Alterações salvas</> : "Salvar alterações"}</Button>}
        </div>
      </div>
    </>
  );
}

type Product = {
  id: string;
  name: string;
  price: number;
  photo?: string;
};

function ProductsPage() {
  const photoInput = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [photo, setPhoto] = useState<string>();
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem("blackfin_products_business_v1");
        if (saved) setProducts(JSON.parse(saved) as Product[]);
      } catch {
        window.localStorage.removeItem("blackfin_products_business_v1");
      } finally {
        setLoaded(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (loaded) window.localStorage.setItem("blackfin_products_business_v1", JSON.stringify(products));
  }, [products, loaded]);
  const selectPhoto = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(typeof reader.result === "string" ? reader.result : undefined);
    reader.readAsDataURL(file);
  };
  const save = () => {
    const value = Number(price.replace(/\./g, "").replace(",", "."));
    if (!name.trim() || !Number.isFinite(value) || value <= 0) return;
    setProducts((items) => [{ id: crypto.randomUUID(), name: name.trim(), price: value, photo }, ...items]);
    setName(""); setPrice(""); setPhoto(undefined); setOpen(false);
  };
  return <>
    <PageHeader eyebrow="CATÁLOGO EMPRESARIAL" title="Produtos" description="Cadastre produtos da empresa com foto e preço. Este catálogo não aparece no ambiente pessoal." action={<Button className="gold-button" onClick={() => setOpen(true)}><PackagePlus /> Novo produto</Button>} />
    <div className="product-grid">
      {products.map((product) => <article className="product-card" key={product.id}>
        <div className="product-photo">{product.photo ? <img /* eslint-disable-line @next/next/no-img-element -- the photo is an in-browser preview */ src={product.photo} alt={product.name} /> : <PackagePlus />}</div>
        <div><small>PRODUTO</small><h3>{product.name}</h3><strong>{money(product.price)}</strong></div>
      </article>)}
      {products.length === 0 && <div className="empty-products"><PackagePlus /><strong>Nenhum produto cadastrado</strong><p>Adicione fotos e preços para organizar o catálogo da empresa.</p><Button className="gold-button" onClick={() => setOpen(true)}>Cadastrar produto</Button></div>}
    </div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="transaction-dialog"><DialogHeader><DialogTitle>Novo produto</DialogTitle><DialogDescription>Inclua a foto e o valor de venda do produto.</DialogDescription></DialogHeader><div className="review-form">
      <input ref={photoInput} hidden type="file" accept="image/*" onChange={(event) => selectPhoto(event.target.files?.[0])} />
      <button type="button" className="product-upload" onClick={() => photoInput.current?.click()}>{photo ? <img /* eslint-disable-line @next/next/no-img-element -- the photo is an in-browser preview */ src={photo} alt="Prévia do produto" /> : <><Upload /> Adicionar foto</>}</button>
      <label className="wide">Nome do produto<Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Pomada modeladora" /></label>
      <label className="wide">Valor de venda<Input value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" placeholder="R$ 0,00" /></label>
      <Button className="gold-button wide" onClick={save}>Salvar produto</Button>
    </div></DialogContent></Dialog>
  </>;
}

function RestrictedPage({ workspace }: { workspace: Workspace }) {
  return (
    <div className="access-restricted">
      <ShieldCheck />
      <p>ACESSO SEPARADO</p>
      <h1>Esta área pertence ao ambiente {workspace === "business" ? "pessoal" : "empresarial"}.</h1>
      <span>Faça login no ambiente correspondente para visualizar essas informações.</span>
    </div>
  );
}

export function FeaturePage({ path, onNewTransaction, profile, onProfileChange, workspace, transactions, onDeleteTransaction }: PageProps & { onDeleteTransaction: (id: string) => void }) {
  const content = useMemo(() => {
    const businessOnly = ["/financeiro/empresarial", "/produtos", "/barbeiros", "/comissoes"];
    if (workspace === "personal" && businessOnly.includes(path)) return <RestrictedPage workspace={workspace} />;
    if (workspace === "business" && path === "/financeiro/pessoal") return <RestrictedPage workspace={workspace} />;
    if (path === "/financeiro/pessoal")
      return <FinancePage onNew={onNewTransaction} transactions={transactions} onDelete={onDeleteTransaction} />;
    if (path === "/financeiro/empresarial")
      return <FinancePage business onNew={onNewTransaction} transactions={transactions} onDelete={onDeleteTransaction} />;
    if (path === "/produtos" && workspace === "business") return <ProductsPage />;
    if (path === "/movimentacoes")
      return <TransactionsPage onNew={onNewTransaction} transactions={transactions} onDelete={onDeleteTransaction} />;
    if (path === "/comprovantes")
      return <ReceiptsPage onNew={onNewTransaction} workspace={workspace} />;
    if (path === "/contas-pagar") return <AccountsPage onNew={onNewTransaction} />;
    if (path === "/contas-receber") return <AccountsPage receivable onNew={onNewTransaction} />;
    if (path === "/relatorios") return <ReportsPage profile={profile} workspace={workspace} transactions={transactions} />;
    if (path === "/historico") return <HistoryPage transactions={transactions} onDelete={onDeleteTransaction} />;
    if (path === "/barbeiros") return <PeoplePage />;
    if (path === "/comissoes") return <PeoplePage commissions />;
    if (path === "/insights") return <InsightsPage workspace={workspace} />;
    if (path === "/configuracoes") return <SettingsPage profile={profile} onProfileChange={onProfileChange} workspace={workspace} />;
    return <TransactionsPage onNew={onNewTransaction} transactions={transactions} onDelete={onDeleteTransaction} />;
  }, [path, onNewTransaction, profile, onProfileChange, workspace, transactions, onDeleteTransaction]);
  return <div className="feature-wrap">{content}</div>;
}
