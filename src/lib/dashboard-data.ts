import {
  AlertTriangle,
  Bell,
  Bot,
  BarChart3,
  Crosshair,
  Clock3,
  ClipboardList,
  CreditCard,
  FileText,
  Hammer,
  KeyRound,
  Globe2,
  PlugZap,
  LayoutDashboard,
  ListChecks,
  Radar,
  LineChart,
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
  scoreLabel: string;
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
    name: "Workspace and team setup",
    status: "complete",
    description:
      "Business workspaces, agency workspaces, clients, websites, and teammate access.",
    icon: LayoutDashboard,
  },
  {
    name: "Website ownership check",
    status: "complete",
    description:
      "Guided ownership checks so each website is ready to watch safely.",
    icon: ShieldCheck,
  },
  {
    name: "Website checking",
    status: "complete",
    description:
      "Website checks, page discovery, screenshots, and recent check history.",
    icon: Radar,
  },
  {
    name: "Problem finder",
    status: "complete",
    description:
      "Plain-language checks for page titles, visibility, headings, links, and page-list gaps.",
    icon: ListChecks,
  },
  {
    name: "Fix ideas",
    status: "complete",
    description:
      "Page titles, descriptions, headings, content ideas, problem explanations, and fix notes.",
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
  { label: "Search Performance", icon: BarChart3 },
  { label: "Competitive Analysis", icon: Crosshair },
  { label: "Keyword Research", icon: KeyRound },
  { label: "Rank Tracking", icon: LineChart },
  { label: "Issues", icon: AlertTriangle },
  { label: "Fix Center", icon: Hammer },
  { label: "AI", icon: Bot },
  { label: "Technical", icon: Radar },
  { label: "Reports", icon: FileText },
  { label: "Alerts", icon: Bell },
  { label: "Integrations", icon: PlugZap },
  { label: "Billing", icon: CreditCard },
  { label: "Settings", icon: Settings },
];
