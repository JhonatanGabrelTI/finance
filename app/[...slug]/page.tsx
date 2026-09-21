import { BlackfinApp } from "@/components/blackfin-app";

export default async function RoutePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  return <BlackfinApp initialPath={`/${slug.join("/")}`} />;
}
