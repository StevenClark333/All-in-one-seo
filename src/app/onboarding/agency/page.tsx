import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import { createWorkspace } from "@/app/actions";

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
            <div className="flex size-10 items-center justify-center rounded-lg bg-slate-950 text-white">
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

            <button className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
              Create agency workspace
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
