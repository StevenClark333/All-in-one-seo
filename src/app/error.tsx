"use client";

import { RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-5 text-slate-950">
      <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-red-700">Something went wrong</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal">
          Dashboard could not load
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {error.message || "Refresh this view or try again in a moment."}
        </p>
        <button
          onClick={reset}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Try again
        </button>
      </section>
    </main>
  );
}
