import { MailCheck } from "lucide-react";
import { verifyEmailAction } from "@/app/actions";

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token = "" } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-5 py-10 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex size-11 items-center justify-center rounded-lg bg-slate-950 text-white">
          <MailCheck className="size-5" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-normal">
          Verify email
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Confirm your email address to keep the workspace secure.
        </p>

        <form action={verifyEmailAction} className="mt-6">
          <input type="hidden" name="token" value={token} />
          <button className="inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
            Verify email
          </button>
        </form>
      </section>
    </main>
  );
}
