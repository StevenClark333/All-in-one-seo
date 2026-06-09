import Link from "next/link";
import { LogIn, Search } from "lucide-react";
import { PRODUCT_AREA_NAME, PRODUCT_BRAND_NAME } from "@/lib/product-copy";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-5 py-10 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
            <Search className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-orange-700">
              {PRODUCT_BRAND_NAME}
            </p>
            <h1 className="text-xl font-semibold tracking-normal">
              {PRODUCT_AREA_NAME}
            </h1>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-500">
          Welcome back. Log in to see today&apos;s website care plan, the clearest
          problems, and the next button to press.
        </p>

        {params.error ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {getLoginErrorMessage(params.error)}
          </div>
        ) : null}

        {params.reset ? (
          <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Password reset request received.
          </div>
        ) : null}

        <form
          action="/api/auth/login"
          method="post"
          className="mt-6 grid gap-4"
        >
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
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
            />
          </label>
          <button className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
            <LogIn className="size-4" aria-hidden="true" />
            Log in
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-500">
          New workspace?{" "}
          <Link
            href="/signup"
            className="font-medium text-orange-700 underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Forgot password?{" "}
          <Link
            href="/password-reset"
            className="font-medium text-orange-700 underline-offset-4 hover:underline"
          >
            Reset it
          </Link>
        </p>
      </section>
    </main>
  );
}

function getLoginErrorMessage(error: string) {
  if (error === "locked") {
    return "Account is temporarily locked. Try again later.";
  }

  if (error === "rate-limited") {
    return "Too many login attempts. Try again shortly.";
  }

  return "Email or password did not match a demo account.";
}
