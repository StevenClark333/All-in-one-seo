import "dotenv/config";

type SmokeCheck = {
  expectText?: RegExp;
  name: string;
  path: string;
  status: number;
};

const targetUrl = process.env.SMOKE_TEST_TARGET_URL ?? "http://127.0.0.1:3003";

const checks: SmokeCheck[] = [
  {
    expectText: /SEO Ops|All In One/i,
    name: "home",
    path: "/",
    status: 200,
  },
  {
    expectText: /"ok":true/,
    name: "health",
    path: "/api/health",
    status: 200,
  },
  {
    expectText: /data-site-id|script-event/i,
    name: "install script",
    path: "/seo.js",
    status: 200,
  },
  {
    expectText: /login|email|password/i,
    name: "login",
    path: "/login",
    status: 200,
  },
];

async function main() {
  const results = [];

  for (const check of checks) {
    const url = new URL(check.path, targetUrl);
    const response = await fetch(url, { redirect: "follow" });
    const body = await response.text();
    const passedStatus = response.status === check.status;
    const passedText = check.expectText ? check.expectText.test(body) : true;
    const passed = passedStatus && passedText;

    results.push({
      name: check.name,
      passed,
      status: response.status,
      url: url.toString(),
    });

    if (!passed) {
      console.error(
        `${check.name} smoke check failed: expected ${check.status}, got ${response.status}`,
      );
    }
  }

  console.log(JSON.stringify({ results, targetUrl }, null, 2));

  if (results.some((result) => !result.passed)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
