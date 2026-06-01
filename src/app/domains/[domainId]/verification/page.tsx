import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Pencil, ShieldCheck } from "lucide-react";
import { HelpLabel, InfoTooltip } from "@/components/info-tooltip";
import {
  HTML_VERIFICATION_PATH,
  META_VERIFICATION_NAME,
  VERIFICATION_RECORD_NAME,
  formatVerificationValue,
} from "@/lib/domain-verification";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type VerificationPageProps = {
  params: Promise<{ domainId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const verificationMethods = [
  {
    description: "Best for durable ownership verification across any platform.",
    help: "Add the generated TXT value to DNS. This is the most durable verification method.",
    method: "DNS_TXT",
    name: "DNS TXT",
  },
  {
    description:
      "Optional fallback: create this file on your website only if you cannot use DNS TXT.",
    help: "Create a text file at the specified path on your website and paste in the generated file contents.",
    method: "HTML_FILE",
    name: "HTML file",
  },
  {
    description: "Add a verification meta tag to the homepage head.",
    help: "Place the generated meta tag in the homepage head for ownership verification.",
    method: "META_TAG",
    name: "Meta tag",
  },
  {
    description: "Use a mapped Google Search Console property.",
    help: "Verify through a connected Google Search Console property mapped to this domain.",
    method: "GSC_OAUTH",
    name: "Search Console",
  },
] as const;

export default async function DomainVerificationPage({
  params,
  searchParams,
}: VerificationPageProps) {
  const { domainId } = await params;
  const query = searchParams ? await searchParams : {};
  const error = getSingle(query.error);
  const isEditing = getSingle(query.edit) === "1";
  const selectedMethodParam = getSingle(query.method);
  const status = getSingle(query.status);
  const domain = await getPrisma().domain.findUnique({
    where: { id: domainId },
    include: {
      client: true,
      verificationChecks: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      verifications: {
        orderBy: { createdAt: "desc" },
        take: 12,
      },
    },
  });

  if (!domain) {
    notFound();
  }

  const latestByMethod = new Map(
    domain.verifications.map((verification) => [
      verification.method,
      verification,
    ]),
  );
  const verifiedVerification = domain.verifications.find(
    (verification) => verification.status === "VERIFIED",
  );
  const availableMethods = verificationMethods.filter(
    (item) => item.method !== verifiedVerification?.method,
  );
  const selectedMethod =
    availableMethods.find((item) => item.method === selectedMethodParam) ??
    availableMethods[0] ??
    verificationMethods[0];
  const selectedVerification = latestByMethod.get(selectedMethod.method);
  const selectedVerificationValue = selectedVerification
    ? formatVerificationValue(selectedVerification.token)
    : "";
  const showMethodSetup = domain.verificationStatus !== "VERIFIED" || isEditing;

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-6 text-slate-950 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/domains"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Domains
        </Link>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-slate-950 text-white">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {domain.client?.name ?? "Unassigned"}
                </p>
                <h1 className="text-2xl font-semibold tracking-normal">
                  Verify {domain.domain}
                </h1>
              </div>
            </div>

            <span
              className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold ${
                domain.verificationStatus === "VERIFIED"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : domain.verificationStatus === "FAILED"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              {formatEnum(domain.verificationStatus)}
            </span>
          </div>

          {domain.verificationStatus === "VERIFIED" ? (
            <div className="mt-6 flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
              <CheckCircle2
                className="mt-0.5 size-5 shrink-0"
                aria-hidden="true"
              />
              <div>
                <h2 className="font-semibold">Domain ownership verified</h2>
                <p className="mt-1 text-sm leading-6">
                  Full production crawls can run for this domain
                  {verifiedVerification
                    ? ` through ${getMethodName(verifiedVerification.method)}.`
                    : "."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {verifiedVerification ? (
                    <form
                      action="/api/domains/verification/check"
                      method="post"
                    >
                      <input type="hidden" name="domainId" value={domain.id} />
                      <input
                        type="hidden"
                        name="method"
                        value={verifiedVerification.method}
                      />
                      <button className="inline-flex h-9 items-center rounded-md border border-emerald-300 bg-white px-3 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50">
                        Re-check ownership
                      </button>
                    </form>
                  ) : null}
                  <Link
                    href={`/domains/${domain.id}/verification?edit=1`}
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-emerald-300 bg-white px-3 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    Edit verification
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          {error ? (
            <StatusNotice
              tone="error"
              title="Verification action could not finish"
              message={getVerificationErrorMessage(error)}
            />
          ) : null}

          {status ? (
            <StatusNotice
              tone={status === "verified" ? "success" : "error"}
              title={getVerificationStatusTitle(status)}
              message={getVerificationStatusMessage(status)}
            />
          ) : null}

          {showMethodSetup ? (
            <section className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-semibold">
                    <HelpLabel help="Choose one ownership method. Once any method passes, the domain is verified.">
                      Choose verification method
                    </HelpLabel>
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Pick the method that matches how you control this website.
                    You only need one successful method.
                  </p>
                </div>
                {domain.verificationStatus === "VERIFIED" ? (
                  <Link
                    href={`/domains/${domain.id}/verification`}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Done editing
                  </Link>
                ) : null}
              </div>

              <form className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                {isEditing ? (
                  <input type="hidden" name="edit" value="1" />
                ) : null}
                <select
                  name="method"
                  defaultValue={selectedMethod.method}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                >
                  {availableMethods.map((item) => (
                    <option key={item.method} value={item.method}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <button className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  Use method
                </button>
              </form>

              <div className="mt-4 rounded-md border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      <HelpLabel help={selectedMethod.help}>
                        {selectedMethod.name}
                      </HelpLabel>
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {selectedMethod.description}
                    </p>
                  </div>
                  <span className="inline-flex h-7 items-center rounded-full border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600">
                    {selectedVerification
                      ? formatEnum(selectedVerification.status)
                      : "Not generated"}
                  </span>
                </div>

                {selectedVerification ? (
                  <div className="mt-4 grid gap-3">
                    <VerificationInstructions
                      domain={domain.domain}
                      method={selectedMethod.method}
                      token={selectedVerification.token}
                      value={selectedVerificationValue}
                    />
                    {selectedVerification.failureReason ? (
                      <p className="text-sm text-red-700">
                        {selectedVerification.failureReason}
                      </p>
                    ) : null}
                    {selectedVerification.nextRetryAt ? (
                      <p className="text-xs font-medium text-slate-500">
                        Next retry after{" "}
                        {selectedVerification.nextRetryAt.toLocaleString()}
                      </p>
                    ) : null}
                    <form
                      action="/api/domains/verification/check"
                      method="post"
                    >
                      <input type="hidden" name="domainId" value={domain.id} />
                      <input
                        type="hidden"
                        name="method"
                        value={selectedMethod.method}
                      />
                      <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                        Check {selectedMethod.name}
                        <InfoTooltip
                          label="Run this ownership check now and update the domain verification status."
                          passive
                          side="left"
                        />
                      </button>
                    </form>
                  </div>
                ) : (
                  <form
                    action="/api/domains/verification/generate"
                    method="post"
                    className="mt-4"
                  >
                    <input type="hidden" name="domainId" value={domain.id} />
                    <input
                      type="hidden"
                      name="method"
                      value={selectedMethod.method}
                    />
                    <button className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                      Generate {selectedMethod.name} token
                      <InfoTooltip
                        label="Create a fresh ownership token and show setup instructions for this method."
                        passive
                        side="left"
                      />
                    </button>
                  </form>
                )}
              </div>
            </section>
          ) : null}

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">
              <HelpLabel help="Recent ownership check attempts and the result returned by each method.">
                Verification history
              </HelpLabel>
            </h2>
            <div className="mt-4 grid gap-3">
              {domain.verificationChecks.length ? (
                domain.verificationChecks.map((check) => (
                  <div
                    key={check.id}
                    className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">
                        {formatEnum(check.method)}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {check.createdAt.toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-600">
                      {formatEnum(check.status)} -{" "}
                      {check.message ?? "No message recorded"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No verification checks have run yet.
                </p>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function VerificationInstructions({
  domain,
  method,
  token,
  value,
}: {
  domain: string;
  method: string;
  token: string;
  value: string;
}) {
  if (method === "HTML_FILE") {
    return (
      <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
        <DnsField label="Path" value={HTML_VERIFICATION_PATH} />
        <DnsField label="File contents" value={value} />
      </div>
    );
  }

  if (method === "META_TAG") {
    return (
      <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
        <DnsField label="Tag" value="meta" />
        <DnsField
          label="HTML"
          value={`<meta name="${META_VERIFICATION_NAME}" content="${token}">`}
        />
      </div>
    );
  }

  if (method === "GSC_OAUTH") {
    return (
      <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
        <DnsField label="Property" value={domain} />
        <DnsField label="Requirement" value="Mapped Search Console property" />
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
      <DnsField label="Type" value="TXT" />
      <DnsField label="Host / name" value={VERIFICATION_RECORD_NAME} />
      <DnsField label="Value" value={value} />
    </div>
  );
}

function DnsField({ label, value }: { label: string; value: string }) {
  return (
    <>
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </div>
      <code className="overflow-x-auto rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-800">
        {value}
      </code>
    </>
  );
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getMethodName(method: string) {
  return (
    verificationMethods.find((item) => item.method === method)?.name ??
    formatEnum(method)
  );
}

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getVerificationErrorMessage(error: string) {
  const messages: Record<string, string> = {
    "domain-access": "You do not have access to that domain.",
    "verification-check-failed":
      "The verification check could not run right now. Local DNS or remote site checks may fail until the record or file exists.",
    "verification-generate-failed":
      "A new verification token could not be generated.",
    "verification-invalid": "The verification request was incomplete.",
  };

  return messages[error] ?? "Please try again or inspect the domain settings.";
}

function getVerificationStatusTitle(status: string) {
  if (status === "verified") {
    return "Domain verified";
  }

  if (status === "verification-generated") {
    return "Verification token generated";
  }

  return "Verification did not pass";
}

function getVerificationStatusMessage(status: string) {
  const messages: Record<string, string> = {
    verified: "Ownership is confirmed and production crawls can run.",
    "verification-failed":
      "We checked the selected method, but the required ownership signal was not found yet.",
    "verification-generated":
      "Use the latest instructions below, then run the check again.",
  };

  return messages[status] ?? "The latest verification action finished.";
}

function StatusNotice({
  message,
  title,
  tone,
}: {
  message: string;
  title: string;
  tone: "error" | "success";
}) {
  const styles =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-red-200 bg-red-50 text-red-900";

  return (
    <div className={`mt-6 rounded-md border p-4 ${styles}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-6">{message}</p>
    </div>
  );
}
