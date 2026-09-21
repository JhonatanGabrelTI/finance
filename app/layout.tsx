import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BLACKFIN — Gestão financeira",
  description:
    "Controle financeiro inteligente para quem leva o negócio a sério.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
