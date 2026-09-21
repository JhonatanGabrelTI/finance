"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  FileText,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Workspace } from "@/lib/auth-session";

export type BusinessProfile = {
  ownerName: string;
  businessName: string;
  phone: string;
  email: string;
  taxId: string;
  city: string;
  state: string;
};

const LEGACY_PROFILE_KEY = "blackfin_business_profile_v1";
const profileKey = (workspace: Workspace) => `blackfin_${workspace}_profile_v2`;
const CLEAN_START_KEY = "blackfin_clean_start_2026_09_21";
const testDataKeys = [
  LEGACY_PROFILE_KEY,
  "blackfin_business_profile_v2",
  "blackfin_personal_profile_v2",
  "blackfin_transactions_v1",
  "blackfin_transactions_business_v2",
  "blackfin_transactions_personal_v2",
  "blackfin_barbers_v1",
  "blackfin_products_business_v1",
  "blackfin_notification_preferences_business_v1",
  "blackfin_notification_preferences_personal_v1",
];

function clearTestDataOnce() {
  if (window.localStorage.getItem(CLEAN_START_KEY)) return;
  testDataKeys.forEach((key) => window.localStorage.removeItem(key));
  window.localStorage.setItem(CLEAN_START_KEY, "done");
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatTaxId(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function readProfile(workspace: Workspace): BusinessProfile | null {
  try {
    const value = window.localStorage.getItem(profileKey(workspace)) ??
      (workspace === "business" ? window.localStorage.getItem(LEGACY_PROFILE_KEY) : null);
    if (!value) return null;
    const profile = JSON.parse(value) as Partial<BusinessProfile>;
    if (!profile.ownerName || !profile.businessName) return null;
    return {
      ownerName: profile.ownerName,
      businessName: profile.businessName,
      phone: profile.phone ?? "",
      email: profile.email ?? "",
      taxId: profile.taxId ?? "",
      city: profile.city ?? "",
      state: profile.state ?? "",
    };
  } catch {
    return null;
  }
}

export function AuthFlow({
  children,
}: {
  children: (
    profile: BusinessProfile,
    updateProfile: (profile: BusinessProfile) => void,
    logout: () => Promise<void>,
    workspace: Workspace,
  ) => ReactNode;
}) {
  const [stage, setStage] = useState<"loading" | "login" | "onboarding" | "app">(
    "loading",
  );
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [workspace, setWorkspace] = useState<Workspace>("business");
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    clearTestDataOnce();
    void fetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) =>
        (await response.json()) as { authenticated?: boolean; workspace?: Workspace | null },
      )
      .then((result) => {
        if (!result.authenticated || !result.workspace) {
          setStage("login");
          return;
        }
        setWorkspace(result.workspace);
        const savedProfile = readProfile(result.workspace);
        setProfile(savedProfile);
        setStage(savedProfile ? "app" : "onboarding");
      })
      .catch(() => setStage("login"));
  }, []);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ workspace, login: loginName, password }),
      });
      const result = (await response.json()) as { error?: string; workspace?: Workspace };
      if (!response.ok) {
        setError(result.error ?? "Não foi possível entrar.");
        return;
      }
      const activeWorkspace = result.workspace ?? workspace;
      setWorkspace(activeWorkspace);
      const savedProfile = readProfile(activeWorkspace);
      setProfile(savedProfile);
      setStage(savedProfile ? "app" : "onboarding");
    } catch {
      setError("Não foi possível conectar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveProfile = (nextProfile: BusinessProfile) => {
    window.localStorage.setItem(profileKey(workspace), JSON.stringify(nextProfile));
    setProfile(nextProfile);
    setStage("app");
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setPassword("");
    setLoginName("");
    setStage("login");
  };

  if (stage === "loading") {
    return (
      <div className="auth-loading" role="status" aria-label="Carregando">
        <div className="login-mark">BF</div>
        <LoaderCircle />
      </div>
    );
  }

  if (stage === "login") {
    return (
      <div className="login-page">
        <div className="login-brand">
          <div className="login-mark">BF</div>
          <p>BLACKFIN</p>
          <span>
            Gestão financeira de alto nível para sua barbearia crescer com
            clareza, controle e segurança.
          </span>
          <div className="auth-security-note">
            <ShieldCheck />
            Sessão protegida e acesso restrito
          </div>
        </div>
        <form className="login-card" onSubmit={login}>
          <p>PORTAL BLACKFIN</p>
          <h1>Acesse seu ambiente.</h1>
          <span>Escolha o ambiente e use as credenciais correspondentes.</span>
          <div className="workspace-selector" aria-label="Escolha do ambiente">
            <button type="button" className={workspace === "business" ? "active" : ""} onClick={() => { setWorkspace("business"); setError(""); }}>
              <Building2 /> Empresarial
            </button>
            <button type="button" className={workspace === "personal" ? "active" : ""} onClick={() => { setWorkspace("personal"); setError(""); }}>
              <UserRound /> Pessoal
            </button>
          </div>
          <label>
            Código de acesso
            <div className="auth-input-icon">
              <Building2 />
              <Input
                autoComplete="username"
                inputMode="numeric"
                value={loginName}
                onChange={(event) => setLoginName(event.target.value)}
                placeholder="Digite apenas números"
                required
              />
            </div>
          </label>
          <label>
            Senha
            <div className="password-field auth-input-icon">
              <LockKeyhole />
              <Input
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite sua senha"
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </label>
          {error && <p className="auth-error">{error}</p>}
          <Button className="login-button" disabled={submitting} type="submit">
            {submitting ? <LoaderCircle className="spin" /> : <ShieldCheck />}
            {submitting ? "Validando..." : "Entrar com segurança"}
          </Button>
          <small>BLACKFIN · Ambiente financeiro protegido</small>
        </form>
      </div>
    );
  }

  if (stage === "onboarding") {
    return workspace === "personal" ? (
      <PersonalSetup onComplete={saveProfile} />
    ) : (
      <Onboarding onComplete={saveProfile} />
    );
  }

  return profile ? children(profile, saveProfile, logout, workspace) : null;
}

function PersonalSetup({ onComplete }: { onComplete: (profile: BusinessProfile) => void }) {
  const [name, setName] = useState("");
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onComplete({ ownerName: name.trim(), businessName: "Financeiro pessoal", phone: "", email: "", taxId: "", city: "", state: "" });
  };
  return (
    <main className="onboarding-page">
      <section className="onboarding-shell personal-setup">
        <aside className="onboarding-aside">
          <div className="onboarding-brand"><span>BF</span><strong>BLACKFIN</strong></div>
          <div className="onboarding-aside-copy"><p>AMBIENTE PESSOAL</p><h1>Suas contas, só suas.</h1><span>Este espaço não compartilha lançamentos, comprovantes ou informações com a empresa.</span></div>
          <div className="onboarding-protected"><ShieldCheck /> Ambiente pessoal protegido</div>
        </aside>
        <div className="onboarding-content">
          <div className="onboarding-copy"><p>PRIMEIRO ACESSO</p><h2>Como podemos chamar você?</h2><span>Você pode mudar estas informações depois.</span></div>
          <form className="onboarding-form" onSubmit={submit}>
            <label><span>Seu nome <em>*</em></span><div className="onboarding-input"><UserRound /><Input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome" required /></div></label>
            <Button className="gold-button onboarding-submit" type="submit">Entrar no financeiro pessoal <ArrowRight /></Button>
          </form>
        </div>
      </section>
    </main>
  );
}

function Onboarding({
  onComplete,
}: {
  onComplete: (profile: BusinessProfile) => void;
}) {
  const [form, setForm] = useState<BusinessProfile>({
    ownerName: "",
    businessName: "",
    phone: "",
    email: "",
    taxId: "",
    city: "",
    state: "",
  });
  const [error, setError] = useState("");
  const update = (field: keyof BusinessProfile, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) setError("");
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !form.ownerName.trim() ||
      !form.businessName.trim() ||
      !form.phone.trim() ||
      !form.city.trim() ||
      !form.state.trim()
    ) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    onComplete({
      ...form,
      ownerName: form.ownerName.trim(),
      businessName: form.businessName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      taxId: form.taxId.trim(),
      city: form.city.trim(),
      state: form.state.trim().toUpperCase(),
    });
  };
  return (
    <main className="onboarding-page">
      <section className="onboarding-shell">
        <aside className="onboarding-aside">
          <div className="onboarding-brand">
            <span>BF</span>
            <strong>BLACKFIN</strong>
          </div>
          <div className="onboarding-aside-copy">
            <p>COMECE POR AQUI</p>
            <h1>Seu financeiro, do seu jeito.</h1>
            <span>
              Crie a identidade da sua operação. Leva menos de dois minutos.
            </span>
          </div>
          <ul className="onboarding-benefits">
            <li>
              <Check /> Painel personalizado para sua barbearia
            </li>
            <li>
              <Check /> Dados prontos para relatórios e recibos
            </li>
            <li>
              <Check /> Suas informações ficam só com você
            </li>
          </ul>
          <div className="onboarding-protected">
            <ShieldCheck /> Ambiente financeiro protegido
          </div>
        </aside>
        <div className="onboarding-content">
          <header className="onboarding-header">
            <div>
              <span>CONFIGURAÇÃO INICIAL</span>
              <strong>Etapa 1 de 1</strong>
            </div>
            <div
              className="onboarding-progress"
              aria-label="Configuração concluída em uma etapa"
            >
              <i />
            </div>
          </header>
          <div className="onboarding-copy">
            <p>SEU ESPAÇO, SUA IDENTIDADE</p>
            <h2>Vamos personalizar sua operação.</h2>
            <span>
              Use informações que você reconheça rapidamente no dia a dia.
            </span>
          </div>
          <form className="onboarding-form" onSubmit={submit} noValidate>
            <label>
              <span>
                Seu nome completo <em>*</em>
              </span>
              <div className="onboarding-input">
                <UserRound />
                <Input
                  autoComplete="name"
                  value={form.ownerName}
                  onChange={(e) => update("ownerName", e.target.value)}
                  placeholder="Nome do proprietário"
                  aria-invalid={Boolean(error && !form.ownerName.trim())}
                />
              </div>
            </label>
            <label>
              <span>
                Nome da barbearia <em>*</em>
              </span>
              <div className="onboarding-input">
                <Store />
                <Input
                  autoComplete="organization"
                  value={form.businessName}
                  onChange={(e) => update("businessName", e.target.value)}
                  placeholder="Ex.: Barbearia Imperial"
                  aria-invalid={Boolean(error && !form.businessName.trim())}
                />
              </div>
            </label>
            <label>
              <span>
                Telefone / WhatsApp <em>*</em>
              </span>
              <div className="onboarding-input">
                <Phone />
                <Input
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", formatPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  inputMode="tel"
                  aria-invalid={Boolean(error && !form.phone.trim())}
                />
              </div>
            </label>
            <label>
              <span>
                E-mail <small>Opcional</small>
              </span>
              <div className="onboarding-input">
                <Mail />
                <Input
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="contato@barbearia.com"
                  type="email"
                />
              </div>
            </label>
            <label>
              <span>
                CPF ou CNPJ <small>Opcional</small>
              </span>
              <div className="onboarding-input">
                <FileText />
                <Input
                  value={form.taxId}
                  onChange={(e) => update("taxId", formatTaxId(e.target.value))}
                  placeholder="Somente para documentos"
                  inputMode="numeric"
                />
              </div>
            </label>
            <div className="onboarding-location">
              <label>
                <span>
                  Cidade <em>*</em>
                </span>
                <div className="onboarding-input">
                  <MapPin />
                  <Input
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="Sua cidade"
                    aria-invalid={Boolean(error && !form.city.trim())}
                  />
                </div>
              </label>
              <label>
                <span>
                  UF <em>*</em>
                </span>
                <Input
                  autoComplete="address-level1"
                  value={form.state}
                  onChange={(e) =>
                    update(
                      "state",
                      e.target.value
                        .replace(/[^a-z]/gi, "")
                        .slice(0, 2)
                        .toUpperCase(),
                    )
                  }
                  placeholder="SP"
                  maxLength={2}
                  aria-invalid={Boolean(error && !form.state.trim())}
                />
              </label>
            </div>
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            <Button className="gold-button onboarding-submit" type="submit">
              Entrar no meu painel <ArrowRight />
            </Button>
            <p className="onboarding-required">
              <em>*</em> Campos obrigatórios
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
