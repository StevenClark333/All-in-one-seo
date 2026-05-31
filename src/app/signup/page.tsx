import Link from "next/link";
import { Search } from "lucide-react";
import { signUp } from "@/app/actions";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-5 py-10 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-slate-950 text-white">
            <Search className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              All In One
            </p>
            <h1 className="text-xl font-semibold tracking-normal">SEO Ops</h1>
          </div>
        </div>

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
              Workspace
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
          <button className="mt-2 inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
            Create account
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
