import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { Link, Redirect } from "wouter";
import {
  Shield,
  Users,
  Briefcase,
  Building2,
  BookOpen,
  GraduationCap,
  TrendingUp,
  BarChart3,
  Target,
  Award,
  Activity,
  ChevronRight,
  Trophy,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type RankingEntry = {
  userId: string;
  name: string;
  score: number;
  skillsCount: number;
  completedGoals: number;
  overallProgress: number;
  gpa: number | null;
  rank: number;
};

type RankingResponse = {
  leaderboard: RankingEntry[];
  currentUser: RankingEntry | null;
  total: number;
};

const CHART_COLORS = [
  "hsl(35, 95%, 52%)",
  "hsl(25, 85%, 48%)",
  "hsl(20, 75%, 50%)",
  "hsl(15, 70%, 52%)",
  "hsl(45, 100%, 63%)",
];

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  href?: string;
}) {
  const content = (
    <Card className={href ? "overflow-visible hover-elevate cursor-pointer" : ""}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold font-display">{value}</p>
              <p className="text-sm text-muted-foreground">{title}</p>
            </div>
          </div>
          {href && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
        </div>
        {description && (
          <p className="mt-3 text-sm text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export default function AdminPage() {
  const { user } = useAuth();

  // Redirect non-admin users
  if (user && user.role !== "admin") {
    return <Redirect to="/" />;
  }

  const { data: stats, isLoading } = useQuery<{
    totalStudents: number;
    totalCareers: number;
    totalOpportunities: number;
    totalResources: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: ranking, isLoading: rankingLoading } = useQuery<RankingResponse>({
    queryKey: ["/api/students/ranking"],
  });

  // Sample data for charts
  const userGrowthData = [
    { month: "Jan", users: 45 },
    { month: "Feb", users: 72 },
    { month: "Mar", users: 98 },
    { month: "Apr", users: 124 },
    { month: "May", users: 156 },
    { month: "Jun", users: 189 },
  ];

  const skillDistributionData = [
    { name: "Programming", value: 35 },
    { name: "Networking", value: 20 },
    { name: "Database", value: 18 },
    { name: "Hardware", value: 15 },
    { name: "Other", value: 12 },
  ];

  const activityData = [
    { day: "Mon", goals: 12, resources: 8, opportunities: 5 },
    { day: "Tue", goals: 15, resources: 12, opportunities: 7 },
    { day: "Wed", goals: 10, resources: 15, opportunities: 9 },
    { day: "Thu", goals: 18, resources: 10, opportunities: 6 },
    { day: "Fri", goals: 14, resources: 18, opportunities: 12 },
    { day: "Sat", goals: 8, resources: 6, opportunities: 4 },
    { day: "Sun", goals: 6, resources: 4, opportunities: 3 },
  ];

  const sampleStats = {
    totalUsers: stats?.totalStudents || 0,
    activeUsers: Math.floor((stats?.totalStudents || 0) * 0.75),
    totalCareers: stats?.totalCareers || 0,
    totalOpportunities: stats?.totalOpportunities || 0,
    totalResources: stats?.totalResources || 0,
    totalTraining: 5,
  };

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Admin Dashboard</h2>
            <p className="text-muted-foreground">
              Monitor and manage the Future Flow platform
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Students"
            value={sampleStats.totalUsers}
            description={`${sampleStats.activeUsers} active this month`}
            icon={Users}
          />
          <StatCard
            title="Career Pathways"
            value={sampleStats.totalCareers}
            icon={Briefcase}
            href="/careers"
          />
          <StatCard
            title="Opportunities"
            value={sampleStats.totalOpportunities}
            icon={Building2}
            href="/opportunities"
          />
          <StatCard
            title="Resources"
            value={sampleStats.totalResources}
            icon={BookOpen}
            href="/resources"
          />
          <StatCard
            title="Training Programs"
            value={sampleStats.totalTraining}
            icon={GraduationCap}
            href="/resources"
          />
          <StatCard
            title="Avg. Progress"
            value="68%"
            description="Average student progress"
            icon={TrendingUp}
          />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="font-display">Top Students</CardTitle>
              <CardDescription>Ranking by skills, completed goals, progress, and GPA</CardDescription>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {rankingLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))}
              </div>
            ) : ranking && ranking.leaderboard.length > 0 ? (
              <div className="space-y-3">
                {ranking.leaderboard.slice(0, 10).map((entry) => (
                  <div key={entry.userId} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      #{entry.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{entry.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.skillsCount} skills • {entry.completedGoals} completed • GPA {entry.gpa !== null ? entry.gpa.toFixed(2) : "—"}
                      </p>
                    </div>
                    <Badge variant="secondary">{entry.score}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Trophy className="h-6 w-6 text-muted-foreground" />
                </div>
                <h4 className="mt-3 font-medium">No ranking data yet</h4>
                <p className="text-sm text-muted-foreground">Student data is required to build the leaderboard.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Growth
              </CardTitle>
              <CardDescription>Monthly registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke={CHART_COLORS[0]}
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Skill Distribution
              </CardTitle>
              <CardDescription>Popular skill categories among students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={skillDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {skillDistributionData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Weekly Activity
            </CardTitle>
            <CardDescription>User interactions this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="goals" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} name="Goals" />
                  <Bar dataKey="resources" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} name="Resources" />
                  <Bar dataKey="opportunities" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} name="Opportunities" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/careers">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Manage Career Pathways
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/opportunities">
                  <Building2 className="mr-2 h-4 w-4" />
                  Manage Opportunities
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/resources">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Manage Resources
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">5 new users registered</p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">12 goals completed</p>
                  <p className="text-xs text-muted-foreground">This week</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">43 resource downloads</p>
                  <p className="text-xs text-muted-foreground">This week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
