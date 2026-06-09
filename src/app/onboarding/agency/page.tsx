import Link from "next/link";
import type React from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  FileText,
  UsersRound,
} from "lucide-react";
import { createWorkspace } from "@/app/actions";
import { PRODUCT_BEGINNER_COPY } from "@/lib/product-copy";

export default function AgencyOnboardingPage() {
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
              <BriefcaseBusiness className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Agency onboarding
              </p>
              <h1 className="text-2xl font-semibold tracking-normal">
                Create agency workspace
              </h1>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Set up one agency workspace for clients, websites, fixes, and
            reports. You can invite teammates after the workspace is ready.
          </p>

          <OnboardingPlan
            items={[
              {
                icon: (
                  <BriefcaseBusiness className="size-4" aria-hidden="true" />
                ),
                title: "Name the agency",
                body: "Use the name clients and teammates recognize.",
              },
              {
                icon: <UsersRound className="size-4" aria-hidden="true" />,
                title: "Add clients next",
                body: "Keep each client grouped with their websites and reports.",
              },
              {
                icon: <FileText className="size-4" aria-hidden="true" />,
                title: "Share progress",
                body: PRODUCT_BEGINNER_COPY.agencyProgressBody,
              },
            ]}
          />

          <form action={createWorkspace} className="mt-6 grid gap-5">
            <input type="hidden" name="type" value="AGENCY" />
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">
                Agency name
              </span>
              <input
                name="name"
                required
                placeholder="All In One SEO Agency"
                className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              />
            </label>

            <button className="inline-flex h-10 items-center justify-center rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
              Create workspace
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function OnboardingPlan({
  items,
}: {
  items: Array<{ body: string; icon: React.ReactNode; title: string }>;
}) {
  return (
    <section className="mt-5 rounded-lg border border-orange-100 bg-orange-50/60 p-4">
      <p className="text-sm font-semibold text-orange-700">Gentle setup plan</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-lg border border-orange-100 bg-white p-3"
          >
            <span className="inline-flex size-7 items-center justify-center rounded-md bg-orange-50 text-orange-700">
              {item.icon}
            </span>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {item.title}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
