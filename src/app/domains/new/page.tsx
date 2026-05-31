import Link from "next/link";
import { ArrowLeft, Globe2 } from "lucide-react";
import { createDomain } from "@/app/actions";
import { getDomainManagementData } from "@/lib/management-queries";

export const dynamic = "force-dynamic";

const platforms = [
  "WORDPRESS",
  "SHOPIFY",
  "WEBFLOW",
  "WIX",
  "SQUARESPACE",
  "CUSTOM",
  "UNKNOWN",
];

const crawlFrequencies = ["WEEKLY", "DAILY", "MANUAL"];

export default async function NewDomainPage() {
  const { workspace, clients } = await getDomainManagementData();

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-6 text-slate-950 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/domains"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Domains
        </Link>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Globe2 className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"}
              </p>
              <h1 className="text-2xl font-semibold tracking-normal">
                Add domain
              </h1>
            </div>
          </div>

          {!workspace ? (
            <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Create a workspace before adding domains.
            </div>
          ) : (
            <form action={createDomain} className="mt-6 grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Domain
                </span>
                <input
                  name="domain"
                  required
                  placeholder="example.com"
                  className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Client
                </span>
                <select
                  name="clientId"
                  defaultValue={clients.at(0)?.id ?? ""}
                  className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                >
                  <option value="">Unassigned</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    Platform
                  </span>
                  <select
                    name="platform"
                    defaultValue="UNKNOWN"
                    className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  >
                    {platforms.map((platform) => (
                      <option key={platform} value={platform}>
                        {formatEnum(platform)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    Crawl frequency
                  </span>
                  <select
                    name="crawlFrequency"
                    defaultValue="WEEKLY"
                    className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  >
                    {crawlFrequencies.map((frequency) => (
                      <option key={frequency} value={frequency}>
                        {formatEnum(frequency)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                New domains start as pending verification. The next task-list
                slice will generate DNS TXT tokens and check ownership.
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <Link
                  href="/domains"
                  className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </Link>
                <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                  Add domain
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
