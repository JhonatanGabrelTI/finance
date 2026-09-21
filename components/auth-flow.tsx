"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type BusinessProfile = {
  ownerName: string;
  businessName: string;
  phone: string;
  email: string;
  taxId: string;
  city: string;
  state: string;
};

const PROFILE_KEY = "blackfin_business_profile_v1";

function readProfile(): BusinessProfile | null {
  try {
    const value = window.localStorage.getItem(PROFILE_KEY);
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
  ) => ReactNode;
}) {
  const [stage, setStage] = useState<"loading" | "login" | "onboarding" | "app">(
    "loading",
  );
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [registrationCode, setRegistrationCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) =>
        (await response.json()) as { authenticated?: boolean },
      )
      .then((result) => {
        if (!result.authenticated) {
          setStage("login");
          return;
        }
        const savedProfile = readProfile();
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
        body: JSON.stringify({ registrationCode, password }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Não foi possível entrar.");
        return;
      }
      const savedProfile = readProfile();
      setProfile(savedProfile);
      setStage(savedProfile ? "app" : "onboarding");
    } catch {
      setError("Não foi possível conectar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveProfile = (nextProfile: BusinessProfile) => {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
    setProfile(nextProfile);
    setStage("app");
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setPassword("");
    setRegistrationCode("");
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
          <h1>Acesse sua operação.</h1>
          <span>Use o código de registro e a senha de acesso.</span>
          <label>
            Código de registro
            <div className="auth-input-icon">
              <Building2 />
              <Input
                autoComplete="username"
                inputMode="numeric"
                value={registrationCode}
                onChange={(event) => setRegistrationCode(event.target.value)}
                placeholder="Digite o código"
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
    return <Onboarding onComplete={saveProfile} />;
  }

  return profile ? children(profile, saveProfile, logout) : null;
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
  const update = (field: keyof BusinessProfile, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));
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
        <header>
          <div className="onboarding-brand"><span>BF</span><strong>BLACKFIN</strong></div>
          <div className="onboarding-step">CONFIGURAÇÃO INICIAL · 1 DE 1</div>
        </header>
        <div className="onboarding-copy">
          <p>SEU ESPAÇO, SUA IDENTIDADE</p>
          <h1>Vamos personalizar sua operação.</h1>
          <span>
            Essas informações serão usadas no painel, nos relatórios e nos
            documentos financeiros. O nome BLACKFIN permanece como marca do sistema.
          </span>
        </div>
        <form className="onboarding-form" onSubmit={submit}>
          <label>
            Seu nome completo <em>*</em>
            <Input value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} placeholder="Nome do proprietário" />
          </label>
          <label>
            Nome da barbearia <em>*</em>
            <Input value={form.businessName} onChange={(e) => update("businessName", e.target.value)} placeholder="Ex.: Barbearia Imperial" />
          </label>
          <label>
            Telefone / WhatsApp <em>*</em>
            <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="(00) 00000-0000" inputMode="tel" />
          </label>
          <label>
            E-mail
            <Input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="contato@barbearia.com" type="email" />
          </label>
          <label>
            CPF ou CNPJ
            <Input value={form.taxId} onChange={(e) => update("taxId", e.target.value)} placeholder="Opcional" />
          </label>
          <div className="onboarding-location">
            <label>
              Cidade <em>*</em>
              <Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Sua cidade" />
            </label>
            <label>
              UF <em>*</em>
              <Input value={form.state} onChange={(e) => update("state", e.target.value.slice(0, 2))} placeholder="SP" maxLength={2} />
            </label>
          </div>
          {error && <p className="auth-error">{error}</p>}
          <Button className="gold-button onboarding-submit" type="submit">
            Entrar no meu painel <ArrowRight />
          </Button>
        </form>
      </section>
    </main>
  );
}
