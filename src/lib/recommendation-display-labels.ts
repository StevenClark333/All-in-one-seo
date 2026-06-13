export function softenRecommendationTitle(value: string) {
  const exactMatches: Record<string, string> = {
    "CMS-specific fix brief": "Website editor fix note",
    "Content gap recommendation": "Page content idea",
    "Developer fix brief": "Website helper fix note",
    "H1 suggestion": "Main heading suggestion",
    "Internal linking recommendation": "Helpful page link suggestion",
    "Meta description suggestion": "Page description suggestion",
    "Schema recommendation": "Google details suggestion",
    "SEO title suggestion": "Page title suggestion",
  };

  const exactMatch = exactMatches[value];

  if (exactMatch) {
    return exactMatch;
  }

  return value
    .replace(/\bSEO title suggestion\b/gi, exactMatches["SEO title suggestion"])
    .replace(
      /\bMeta description suggestion\b/gi,
      exactMatches["Meta description suggestion"],
    )
    .replace(/\bH1 suggestion\b/gi, exactMatches["H1 suggestion"])
    .replace(
      /\bSchema recommendation\b/gi,
      exactMatches["Schema recommendation"],
    )
    .replace(
      /\bInternal linking recommendation\b/gi,
      exactMatches["Internal linking recommendation"],
    )
    .replace(
      /\bDeveloper fix brief\b/gi,
      exactMatches["Developer fix brief"],
    )
    .replace(
      /\bCMS-specific fix brief\b/gi,
      exactMatches["CMS-specific fix brief"],
    )
    .replace(/\bSEO\b/g, "Google")
    .replace(/\bSchema\b/g, "Google details")
    .replace(/\bH1\b/g, "main heading");
}

export function softenRecommendationSummary(value: string) {
  return value
    .replace(
      /\bRecommended workflow for custom and common CMS setups\./gi,
      "Clear steps for common website editors.",
    )
    .replace(
      /\bappears in the sitemap but was not found in the internal link graph\b/gi,
      "is in the page list but needs a helpful page link",
    )
    .replace(
      /\bAdd at least one relevant internal link to this URL or remove it from the sitemap if it should not be discoverable\./gi,
      "Add a helpful page link to this page, or remove it from the page list if people should not find it.",
    )
    .replace(/\bstructured data\b/gi, "Google details")
    .replace(/\bAdd Google details that matches\b/g, "Add Google details that match")
    .replace(/\bSEO title\b/gi, "page title")
    .replace(/\bsearch engines understand\b/gi, "Google can understand")
    .replace(/\bsearch engines\b/gi, "Google")
    .replace(/\binternal link graph\b/gi, "page links")
    .replace(/\binternal links?\b/gi, "helpful page links")
    .replace(/\bsitemap\b/gi, "page list")
    .replace(/\bURL\b/g, "page")
    .replace(/\bCMS\b/g, "website editor")
    .replace(/\bSEO\b/g, "Google");
}

export function formatRecommendationTypeLabel(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("template")) {
    return "Shared note";
  }

  if (normalized.includes("issue") || normalized.includes("fix")) {
    return "Fix note";
  }

  if (normalized.includes("schema")) {
    return "Google details";
  }

  if (normalized.includes("title")) {
    return "Page title";
  }

  if (normalized.includes("meta")) {
    return "Page description";
  }

  if (normalized.includes("h1") || normalized.includes("heading")) {
    return "Main heading";
  }

  if (normalized.includes("internal") || normalized.includes("link")) {
    return "Helpful page links";
  }

  if (normalized.includes("page")) {
    return "Page idea";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
