import Link from "next/link";
import type React from "react";
import { ArrowLeft, Building2, BriefcaseBusiness, Globe2 } from "lucide-react";
import { createWorkspace } from "@/app/actions";

export default function NewWorkspacePage() {
  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-6 text-slate-950 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Dashboard
        </Link>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
              <Building2 className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Workspace</p>
              <h1 className="text-2xl font-semibold tracking-normal">
                Create workspace
              </h1>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Choose the workspace shape that matches how you work. You can change
            clients, websites, and settings later.
          </p>

          <section className="mt-5 rounded-lg border border-orange-100 bg-orange-50/60 p-4">
            <p className="text-sm font-semibold text-orange-700">
              Workspace setup plan
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <WorkspaceTile
                icon={<BriefcaseBusiness className="size-4" aria-hidden="true" />}
                title="Agency"
                body="Best when you manage multiple clients and send reports."
              />
              <WorkspaceTile
                icon={<Globe2 className="size-4" aria-hidden="true" />}
                title="Business"
                body="Best when you manage one brand or company website."
              />
            </div>
          </section>

          <form action={createWorkspace} className="mt-6 grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">
                Workspace name
              </span>
              <input
                name="name"
                required
                placeholder="All In One SEO Agency"
                className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">
                Best fit
              </span>
              <select
                name="type"
                defaultValue="AGENCY"
                className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              >
                <option value="AGENCY">Agency</option>
                <option value="BUSINESS">Business</option>
              </select>
            </label>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
              <Link
                href="/"
                className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button className="inline-flex h-10 items-center rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
                Create workspace
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function WorkspaceTile({
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
