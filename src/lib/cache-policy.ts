export const cachePolicies = {
  noStore: "no-store",
  publicReport: "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
  script: "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
  staticAsset: "public, max-age=31536000, s-maxage=31536000, immutable",
} as const;

export function getCachePolicy(name: keyof typeof cachePolicies) {
  return cachePolicies[name];
}
