type CloudflareBindings = {
  DB?: D1Database;
  RECEIPTS?: R2Bucket;
};

/**
 * Loads Cloudflare bindings only when the application is running inside a
 * Workers-compatible runtime. Keeping the import out of the module graph lets
 * Next.js build the same application on Vercel without resolving the
 * `cloudflare:workers` virtual module.
 */
export async function getCloudflareBindings(): Promise<CloudflareBindings> {
  try {
    const importRuntime = new Function(
      "specifier",
      "return import(specifier)",
    ) as (specifier: string) => Promise<{ env?: CloudflareBindings }>;
    const runtime = await importRuntime("cloudflare:workers");
    return runtime.env ?? {};
  } catch {
    return {};
  }
}
