import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  Target,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import {
  dashboardStats,
  recentLeads,
  activityFeed,
  type Lead,
} from "@/lib/mock/data";

const statCards = [
  {
    label: "Total Leads",
    value: dashboardStats.totalLeads.toLocaleString(),
    trend: `+${dashboardStats.leadsTrend}%`,
    icon: Users,
  },
  {
    label: "Qualified",
    value: dashboardStats.qualifiedLeads.toLocaleString(),
    trend: `+${dashboardStats.qualifiedTrend}%`,
    icon: Target,
  },
  {
    label: "Conversion Rate",
    value: `${dashboardStats.conversionRate}%`,
    trend: "+3.2%",
    icon: TrendingUp,
  },
  {
    label: "Avg. Score",
    value: dashboardStats.avgScore.toString(),
    trend: "+5.1%",
    icon: BarChart3,
  },
];

function getStatusVariant(status: Lead["status"]) {
  switch (status) {
    case "qualified":
      return "default" as const;
    case "contacted":
      return "secondary" as const;
    case "new":
      return "outline" as const;
    case "converted":
      return "default" as const;
    default:
      return "outline" as const;
  }
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">
          Your lead generation performance at a glance.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="mt-1 flex items-center text-xs text-primary">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                {stat.trend} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Leads Table */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Recent Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="hidden pb-3 font-medium sm:table-cell">
                      Company
                    </th>
                    <th className="hidden pb-3 font-medium md:table-cell">
                      Status
                    </th>
                    <th className="pb-3 text-right font-medium">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead) => (
                    <tr key={lead.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {lead.role}
                          </p>
                        </div>
                      </td>
                      <td className="hidden py-3 sm:table-cell">
                        {lead.company}
                      </td>
                      <td className="hidden py-3 md:table-cell">
                        <Badge variant={getStatusVariant(lead.status)}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={
                            lead.score >= 85
                              ? "font-semibold text-primary"
                              : "text-muted-foreground"
                          }
                        >
                          {lead.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityFeed.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.detail}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
