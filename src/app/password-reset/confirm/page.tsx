import { KeyRound } from "lucide-react";
import { resetPasswordAction } from "@/app/actions";

type PasswordResetConfirmPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function PasswordResetConfirmPage({
  searchParams,
}: PasswordResetConfirmPageProps) {
  const { token = "" } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-5 py-10 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex size-11 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
          <KeyRound className="size-5" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-normal">
          Choose a new password
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Use at least 8 characters. Once saved, you can sign in again and keep
          working from your SEO dashboard.
        </p>

        <form action={resetPasswordAction} className="mt-6 grid gap-4">
          <input type="hidden" name="token" value={token} />
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">
              New password
            </span>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />
          </label>
          <button className="mt-2 inline-flex h-11 items-center justify-center rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
            Save new password
          </button>
        </form>
      </section>
    </main>
  );
}
