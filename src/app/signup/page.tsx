import Link from "next/link";
import type React from "react";
import { Building2, Mail, Search, ShieldCheck } from "lucide-react";
import { signUp } from "@/app/actions";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-5 py-10 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
            <Search className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-orange-700">
              All In One
            </p>
            <h1 className="text-xl font-semibold tracking-normal">SEO Ops</h1>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-500">
          Create your calm SEO workspace. You can add websites, invite teammates,
          and connect tools after the account is ready.
        </p>

        <section className="mt-5 rounded-lg border border-orange-100 bg-orange-50/60 p-4">
          <p className="text-sm font-semibold text-orange-700">
            Start in three steps
          </p>
          <div className="mt-3 grid gap-3">
            <StartStep
              icon={<Mail className="size-4" aria-hidden="true" />}
              title="Your login"
              body="Use the email you want for alerts and reports."
            />
            <StartStep
              icon={<Building2 className="size-4" aria-hidden="true" />}
              title="Workspace"
              body="Name the business, agency, or brand you will manage."
            />
            <StartStep
              icon={<ShieldCheck className="size-4" aria-hidden="true" />}
              title="Password"
              body="Choose a strong password so the account stays protected."
            />
          </div>
        </section>

        <form action={signUp} className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              name="name"
              autoComplete="name"
              className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">
              Workspace name
            </span>
            <input
              name="workspaceName"
              required
              placeholder="Agency name"
              className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              name="password"
              required
              minLength={10}
              autoComplete="new-password"
              className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
            />
          </label>
          <button className="mt-2 inline-flex h-11 items-center justify-center rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
            Create my workspace
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-slate-800 underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}

function StartStep({
  body,
  icon,
  title,
}: {
  body: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-orange-100 bg-white p-3">
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-orange-50 text-orange-700">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-950">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{body}</p>
      </div>
    </div>
  );
}
