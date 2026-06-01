import {
  AlertTriangle,
  Bell,
  Bot,
  Clock3,
  ClipboardList,
  CreditCard,
  FileText,
  Globe2,
  PlugZap,
  LayoutDashboard,
  ListChecks,
  Radar,
  Settings,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Severity = "critical" | "warning" | "suggestion";

export type Site = {
  client: string;
  domain: string;
  platform: string;
  score: number;
  pages: number;
  critical: number;
  warnings: number;
  lastCrawl: string;
  verification: "verified" | "pending";
};

export type Issue = {
  title: string;
  client: string;
  domain: string;
  severity: Severity;
  pages: number;
  owner: string;
  status: "open" | "in progress" | "fixed";
};

export type MvpModule = {
  name: string;
  status: "complete" | "in progress" | "planned" | "ready to build";
  description: string;
  icon: LucideIcon;
};

export const mvpModules: MvpModule[] = [
  {
    name: "Workspace and agency model",
    status: "complete",
    description:
      "Business workspaces, agency workspaces, clients, domains, and roles.",
    icon: LayoutDashboard,
  },
  {
    name: "Domain verification",
    status: "complete",
    description:
      "DNS TXT token generation, polling, expiry, and verified domain state.",
    icon: ShieldCheck,
  },
  {
    name: "Crawler pipeline",
    status: "complete",
    description:
      "HTTP crawler, sitemap discovery, robots.txt checks, snapshots, and crawl runs.",
    icon: Radar,
  },
  {
    name: "SEO analyzer",
    status: "complete",
    description:
      "Rule engine for metadata, indexability, canonicals, headings, links, and sitemap issues.",
    icon: ListChecks,
  },
  {
    name: "AI recommendations",
    status: "complete",
    description:
      "Title, meta, H1, schema, internal linking, content gap, issue explanations, and fix briefs.",
    icon: Bot,
  },
  {
    name: "Reports and alerts",
    status: "complete",
    description:
      "Client-ready reports, critical change alerts, and weekly monitoring summaries.",
    icon: Clock3,
  },
];

export const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Clients", icon: UsersRound },
  { label: "Sites", icon: Globe2 },
  { label: "Pages", icon: ClipboardList },
  { label: "Issues", icon: AlertTriangle },
  { label: "AI", icon: Bot },
  { label: "Technical", icon: Radar },
  { label: "Reports", icon: FileText },
  { label: "Alerts", icon: Bell },
  { label: "Integrations", icon: PlugZap },
  { label: "Billing", icon: CreditCard },
  { label: "Settings", icon: Settings },
];
