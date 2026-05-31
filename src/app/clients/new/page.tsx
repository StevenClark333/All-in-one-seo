import Link from "next/link";
import { ArrowLeft, UsersRound } from "lucide-react";
import { createClient } from "@/app/actions";
import { getPrimaryWorkspace } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  const workspace = await getPrimaryWorkspace();

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-6 text-slate-950 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/clients"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Clients
        </Link>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-slate-950 text-white">
              <UsersRound className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"}
              </p>
              <h1 className="text-2xl font-semibold tracking-normal">
                Add client
              </h1>
            </div>
          </div>

          {!workspace ? (
            <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Create a workspace before adding clients.
            </div>
          ) : (
            <form action={createClient} className="mt-6 grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Client name
                </span>
                <input
                  name="name"
                  required
                  placeholder="Northstar Dental"
                  className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Logo URL
                </span>
                <input
                  name="logoUrl"
                  placeholder="https://example.com/logo.png"
                  className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Tags</span>
                <input
                  name="tags"
                  placeholder="retainer, ecommerce"
                  className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Default crawl cadence
                </span>
                <select
                  name="crawlFrequency"
                  defaultValue="WEEKLY"
                  className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                >
                  <option value="MANUAL">Manual</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="DAILY">Daily</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Contact email
                </span>
                <input
                  name="contactEmail"
                  type="email"
                  placeholder="client@example.com"
                  className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Internal notes
                </span>
                <textarea
                  name="notes"
                  rows={4}
                  placeholder="Account owner, reporting cadence, special crawl rules..."
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <Link
                  href="/clients"
                  className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </Link>
                <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                  Add client
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
