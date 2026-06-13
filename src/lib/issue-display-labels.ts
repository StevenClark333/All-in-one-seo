export function formatIssueNoteAuthor(value: string | null | undefined) {
  return value?.trim() ? value : "No author yet";
}

export function softenIssueTitle(value: string) {
  const exactMatches: Record<string, string> = {
    "Broken Internal Link": "Page link that needs help",
    "Broken internal link detected": "Page link that needs help",
    "Canonical points to a non-200 URL":
      "Preferred page link points to a page that is not loading",
    "Duplicate meta descriptions across page template":
      "Page template repeats the same description",
    "Homepage blocked by robots.txt": "Homepage blocked from Google",
    "Missing page title": "Page title missing",
    "Missing canonical tag": "Preferred page link missing",
    "Homepage became noindex after latest deploy":
      "Homepage was hidden from Google after deploy",
    "Product template canonical points to non-200 URLs":
      "Product template points to a broken preferred page",
  };

  const exactMatch = exactMatches[value];

  if (exactMatch) {
    return exactMatch;
  }

  return value
    .replace(/\bBroken Internal Link\b/gi, exactMatches["Broken Internal Link"])
    .replace(
      /\bBroken internal link detected\b/gi,
      exactMatches["Broken internal link detected"],
    )
    .replace(
      /\bCanonical points to a non-200 URL\b/gi,
      exactMatches["Canonical points to a non-200 URL"],
    )
    .replace(
      /\bDuplicate meta descriptions across page template\b/gi,
      exactMatches["Duplicate meta descriptions across page template"],
    )
    .replace(
      /\bHomepage blocked by robots\.txt\b/gi,
      exactMatches["Homepage blocked by robots.txt"],
    )
    .replace(/\bMissing page title\b/gi, exactMatches["Missing page title"])
    .replace(
      /\bMissing canonical tag\b/gi,
      exactMatches["Missing canonical tag"],
    )
    .replace(
      /\bProduct template canonical points to non-200 URLs\b/gi,
      exactMatches["Product template canonical points to non-200 URLs"],
    )
    .replace(/\bURLs?\b/g, "pages")
    .replace(/\bCanonical\b/g, "preferred page link")
    .replace(/\bnoindex\b/gi, "hidden from Google");
}

export function softenIssueDescription(value: string) {
  return value
    .replace(
      /\bInternal link (https?:\/\/\S+) returned HTTP (\d+)\./gi,
      "Link that stopped working: $1 could not be opened ($2).",
    )
    .replace(
      /\b(https?:\/\/\S+) canonical returned HTTP (\d+)\./gi,
      "$1 preferred page link could not be opened ($2).",
    );
}
