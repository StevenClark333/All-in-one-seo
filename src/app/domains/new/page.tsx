import Link from "next/link";
import type React from "react";
import {
  ArrowLeft,
  CalendarCheck,
  Globe2,
  MonitorCog,
  ShieldCheck,
} from "lucide-react";
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
          Projects
        </Link>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
              <Globe2 className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"}
              </p>
              <h1 className="text-2xl font-semibold tracking-normal">
                Add project website
              </h1>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Add the website first. After it is saved, the portal will guide you
            through verification, crawl setup, and the first SEO check.
          </p>

          <section className="mt-5 rounded-lg border border-orange-100 bg-orange-50/60 p-4">
            <p className="text-sm font-semibold text-orange-700">
              Website setup plan
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <SetupTile
                icon={<Globe2 className="size-4" aria-hidden="true" />}
                title="Website"
                body="Use the main website address, like example.com."
              />
              <SetupTile
                icon={<MonitorCog className="size-4" aria-hidden="true" />}
                title="Platform"
                body="Pick WordPress, Shopify, Webflow, or leave it unknown."
              />
              <SetupTile
                icon={<CalendarCheck className="size-4" aria-hidden="true" />}
                title="Crawl rhythm"
                body="Weekly is a safe first setting for most websites."
              />
            </div>
          </section>

          {!workspace ? (
            <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Create a workspace before adding domains.
            </div>
          ) : (
            <form action={createDomain} className="mt-6 grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Website address
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
                  Client or brand
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
                    Crawl rhythm
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
                  <span className="text-xs leading-5 text-slate-500">
                    Weekly keeps checks useful without making the account feel
                    noisy.
                  </span>
                </label>
              </div>

              <div className="rounded-md border border-orange-100 bg-orange-50 p-4 text-sm leading-6 text-orange-900">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <p>
                    New websites start with a verification step so the portal
                    knows you are allowed to crawl and monitor them.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <Link
                  href="/domains"
                  className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </Link>
                <button className="inline-flex h-10 items-center rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
                  Add website
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

function SetupTile({
  body,
  icon,
  title,
}: {
  body: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-orange-100 bg-white p-3">
      <span className="inline-flex size-7 items-center justify-center rounded-md bg-orange-50 text-orange-700">
        {icon}
      </span>
      <p className="mt-2 text-sm font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{body}</p>
    </div>
  );
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
