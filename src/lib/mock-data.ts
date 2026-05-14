// ─── Types ──────────────────────────────────────────────────────

export interface Lead {
  id: string;
  company: string;
  name: string;
  role: string;
  email: string;
  status: "new" | "contacted" | "qualified" | "converted";
  score: number;
  source: string;
  lastActivity: string;
}

export interface KpiStat {
  label: string;
  value: string;
  rawValue: number;
  trend: string;
  trendDirection: "up" | "down";
}

export interface ChartDataPoint {
  month: string;
  leads: number;
  qualified: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  detail: string;
  time: string;
  type: "lead" | "email" | "meeting" | "task" | "system";
}

export interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  assignee: string;
  completed: boolean;
}

export interface CampaignPreview {
  id: string;
  name: string;
  status: "active" | "draft" | "paused" | "completed";
  sent: number;
  opened: number;
  replied: number;
  openRate: number;
  replyRate: number;
}

export interface AiInsight {
  id: string;
  title: string;
  description: string;
  type: "opportunity" | "risk" | "suggestion";
  confidence: number;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  employees: string;
  website: string;
  leadCount: number;
  avgScore: number;
}

// ─── KPI Stats ──────────────────────────────────────────────────

export const kpiStats: KpiStat[] = [
  {
    label: "Total Leads",
    value: "2,847",
    rawValue: 2847,
    trend: "+18.2%",
    trendDirection: "up",
  },
  {
    label: "Qualified",
    value: "891",
    rawValue: 891,
    trend: "+24.7%",
    trendDirection: "up",
  },
  {
    label: "Conversion Rate",
    value: "12.4%",
    rawValue: 12.4,
    trend: "+3.2%",
    trendDirection: "up",
  },
  {
    label: "Avg. Score",
    value: "74",
    rawValue: 74,
    trend: "+5.1%",
    trendDirection: "up",
  },
  {
    label: "Meetings Booked",
    value: "186",
    rawValue: 186,
    trend: "+31.0%",
    trendDirection: "up",
  },
  {
    label: "Emails Sent",
    value: "4,293",
    rawValue: 4293,
    trend: "+12.8%",
    trendDirection: "up",
  },
];

// ─── Chart Data ─────────────────────────────────────────────────

export const leadGrowthData: ChartDataPoint[] = [
  { month: "Jul", leads: 1240, qualified: 310 },
  { month: "Aug", leads: 1560, qualified: 420 },
  { month: "Sep", leads: 1820, qualified: 510 },
  { month: "Oct", leads: 2100, qualified: 640 },
  { month: "Nov", leads: 2480, qualified: 760 },
  { month: "Dec", leads: 2847, qualified: 891 },
];

// ─── Top Prospects ──────────────────────────────────────────────

export const topProspects: Lead[] = [
  {
    id: "1",
    company: "Stripe",
    name: "Sarah Chen",
    role: "VP of Engineering",
    email: "s.chen@stripe.com",
    status: "qualified",
    score: 92,
    source: "LinkedIn",
    lastActivity: "2 hours ago",
  },
  {
    id: "2",
    company: "Vercel",
    name: "Alex Kim",
    role: "CTO",
    email: "a.kim@vercel.com",
    status: "qualified",
    score: 88,
    source: "LinkedIn",
    lastActivity: "3 hours ago",
  },
  {
    id: "3",
    company: "Notion",
    name: "James Wilson",
    role: "Head of Sales",
    email: "j.wilson@notion.so",
    status: "contacted",
    score: 85,
    source: "Web Scraping",
    lastActivity: "5 hours ago",
  },
  {
    id: "4",
    company: "Supabase",
    name: "David Park",
    role: "Director of Growth",
    email: "d.park@supabase.io",
    status: "contacted",
    score: 81,
    source: "Conference",
    lastActivity: "8 hours ago",
  },
  {
    id: "5",
    company: "Linear",
    name: "Maria Garcia",
    role: "CEO",
    email: "m.garcia@linear.app",
    status: "new",
    score: 78,
    source: "Referral",
    lastActivity: "1 day ago",
  },
  {
    id: "6",
    company: "Resend",
    name: "Tom Nguyen",
    role: "Head of Product",
    email: "t.nguyen@resend.com",
    status: "qualified",
    score: 76,
    source: "LinkedIn",
    lastActivity: "1 day ago",
  },
  {
    id: "7",
    company: "Clerk",
    name: "Emily Rogers",
    role: "VP of Marketing",
    email: "e.rogers@clerk.dev",
    status: "new",
    score: 73,
    source: "Job Board",
    lastActivity: "2 days ago",
  },
  {
    id: "8",
    company: "Planetscale",
    name: "Raj Patel",
    role: "Director of Engineering",
    email: "r.patel@planetscale.com",
    status: "contacted",
    score: 71,
    source: "Referral",
    lastActivity: "2 days ago",
  },
];

// ─── Activity Feed ──────────────────────────────────────────────

export const activityFeed: ActivityItem[] = [
  {
    id: "1",
    action: "New lead discovered",
    detail: "Sarah Chen from Stripe matched your ICP",
    time: "2 hours ago",
    type: "lead",
  },
  {
    id: "2",
    action: "Email opened",
    detail: "James Wilson opened your follow-up email",
    time: "3 hours ago",
    type: "email",
  },
  {
    id: "3",
    action: "Lead qualified",
    detail: "Alex Kim scored 88/100 — moved to qualified list",
    time: "4 hours ago",
    type: "lead",
  },
  {
    id: "4",
    action: "Meeting scheduled",
    detail: "Discovery call with Notion team confirmed for Friday",
    time: "6 hours ago",
    type: "meeting",
  },
  {
    id: "5",
    action: "Batch import complete",
    detail: "23 new leads added from LinkedIn search campaign",
    time: "8 hours ago",
    type: "system",
  },
  {
    id: "6",
    action: "Task completed",
    detail: "Emily Rogers: Update lead scoring model — done",
    time: "1 day ago",
    type: "task",
  },
  {
    id: "7",
    action: "Email replied",
    detail: "David Park from Supabase replied to your outreach",
    time: "1 day ago",
    type: "email",
  },
];

// ─── Tasks ──────────────────────────────────────────────────────

export const tasks: TaskItem[] = [
  {
    id: "1",
    title: "Follow up with Sarah Chen",
    dueDate: "Today",
    priority: "high",
    assignee: "You",
    completed: false,
  },
  {
    id: "2",
    title: "Prepare Notion discovery call deck",
    dueDate: "Tomorrow",
    priority: "high",
    assignee: "You",
    completed: false,
  },
  {
    id: "3",
    title: "Review Q4 lead scoring thresholds",
    dueDate: "This week",
    priority: "medium",
    assignee: "You",
    completed: false,
  },
  {
    id: "4",
    title: "Add new ICP filters for fintech vertical",
    dueDate: "This week",
    priority: "medium",
    assignee: "Team",
    completed: false,
  },
  {
    id: "5",
    title: "Export Supabase leads to CRM",
    dueDate: "Done",
    priority: "low",
    assignee: "You",
    completed: true,
  },
  {
    id: "6",
    title: "Update email sequence templates",
    dueDate: "Done",
    priority: "medium",
    assignee: "Team",
    completed: true,
  },
];

// ─── Campaign Previews ──────────────────────────────────────────

export const campaignPreviews: CampaignPreview[] = [
  {
    id: "1",
    name: "Q4 Enterprise Outreach",
    status: "active",
    sent: 1240,
    opened: 498,
    replied: 86,
    openRate: 40.2,
    replyRate: 6.9,
  },
  {
    id: "2",
    name: "Fintech Vertical Campaign",
    status: "active",
    sent: 890,
    opened: 382,
    replied: 54,
    openRate: 42.9,
    replyRate: 6.1,
  },
  {
    id: "3",
    name: "Conference Follow-up",
    status: "paused",
    sent: 320,
    opened: 148,
    replied: 28,
    openRate: 46.3,
    replyRate: 8.8,
  },
  {
    id: "4",
    name: "SaaS Leaders Series",
    status: "draft",
    sent: 0,
    opened: 0,
    replied: 0,
    openRate: 0,
    replyRate: 0,
  },
];

// ─── AI Insights ────────────────────────────────────────────────

export const aiInsights: AiInsight[] = [
  {
    id: "1",
    title: "High-intent signal detected",
    description:
      "Three leads from your qualified list visited your pricing page in the last 24 hours. Consider sending a personalized follow-up.",
    type: "opportunity",
    confidence: 89,
  },
  {
    id: "2",
    title: "Reply rate dropping",
    description:
      "Email sequence #1 reply rate decreased 15% over the past two weeks. A/B testing a new subject line could help recover engagement.",
    type: "risk",
    confidence: 76,
  },
  {
    id: "3",
    title: "New segment opportunity",
    description:
      "32 newly discovered leads match your ICP with scores above 80. Import them and add to your active outreach sequence.",
    type: "suggestion",
    confidence: 92,
  },
];

// ─── Companies ──────────────────────────────────────────────────

export const topCompanies: Company[] = [
  {
    id: "1",
    name: "Stripe",
    industry: "Fintech",
    employees: "5,000+",
    website: "stripe.com",
    leadCount: 12,
    avgScore: 88,
  },
  {
    id: "2",
    name: "Notion",
    industry: "Productivity",
    employees: "1,000+",
    website: "notion.so",
    leadCount: 8,
    avgScore: 82,
  },
  {
    id: "3",
    name: "Vercel",
    industry: "Developer Tools",
    employees: "500+",
    website: "vercel.com",
    leadCount: 6,
    avgScore: 85,
  },
  {
    id: "4",
    name: "Supabase",
    industry: "Developer Tools",
    employees: "200+",
    website: "supabase.io",
    leadCount: 9,
    avgScore: 79,
  },
  {
    id: "5",
    name: "Linear",
    industry: "Project Management",
    employees: "100+",
    website: "linear.app",
    leadCount: 4,
    avgScore: 76,
  },
];

// ─── Status helpers ─────────────────────────────────────────────

export function getStatusColor(status: Lead["status"]): string {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "contacted":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "qualified":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "converted":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  }
}

export function getPriorityColor(priority: TaskItem["priority"]): string {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "medium":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "low":
      return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  }
}

export function getCampaignStatusColor(
  status: CampaignPreview["status"]
): string {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "draft":
      return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
    case "paused":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "completed":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  }
}

export function getInsightIcon(type: AiInsight["type"]): string {
  switch (type) {
    case "opportunity":
      return "↑";
    case "risk":
      return "!";
    case "suggestion":
      return "→";
  }
}
