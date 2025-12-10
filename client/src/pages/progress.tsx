import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Target,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  BarChart3,
  LineChart,
  Trophy,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import type { ProgressRecord, Goal, AcademicModule } from "@shared/schema";

const CHART_COLORS = [
  "hsl(35, 95%, 52%)", // primary orange
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
  trend,
  trendDirection,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold font-display">{value}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${
              trendDirection === "up" ? "text-green-600 dark:text-green-400" :
              trendDirection === "down" ? "text-red-600 dark:text-red-400" :
              "text-muted-foreground"
            }`}>
              {trendDirection === "up" ? <ArrowUp className="h-3 w-3" /> :
               trendDirection === "down" ? <ArrowDown className="h-3 w-3" /> :
               <Minus className="h-3 w-3" />}
              <span>{trend}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SkillProgressCard({ skill, level }: { skill: string; level: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{skill}</span>
        <span className="text-sm font-bold text-primary">{level}%</span>
      </div>
      <Progress value={level} className="h-2" />
    </div>
  );
}

export default function ProgressPage() {
  const { data: progressData, isLoading: progressLoading } = useQuery<{
    skillProgress: ProgressRecord[];
    goals: Goal[];
    modules: AcademicModule[];
    overallProgress: number;
    weeklyGrowth: number;
    skillsImproved: number;
  }>({
    queryKey: ["/api/progress"],
  });

  // Sample data for charts (will be replaced with real data when backend is connected)
  const skillGrowthData = [
    { month: "Jan", Python: 30, JavaScript: 40, React: 20 },
    { month: "Feb", Python: 45, JavaScript: 50, React: 35 },
    { month: "Mar", Python: 55, JavaScript: 55, React: 45 },
    { month: "Apr", Python: 65, JavaScript: 65, React: 55 },
    { month: "May", Python: 75, JavaScript: 70, React: 65 },
    { month: "Jun", Python: 80, JavaScript: 75, React: 70 },
  ];

  const goalCompletionData = [
    { name: "Completed", value: progressData?.goals?.filter(g => g.status === "completed").length || 3 },
    { name: "In Progress", value: progressData?.goals?.filter(g => g.status === "in_progress").length || 5 },
    { name: "Not Started", value: progressData?.goals?.filter(g => g.status === "pending").length || 2 },
  ];

  const skillRadarData = [
    { subject: "Programming", A: 85, fullMark: 100 },
    { subject: "Networking", A: 65, fullMark: 100 },
    { subject: "Database", A: 75, fullMark: 100 },
    { subject: "Security", A: 55, fullMark: 100 },
    { subject: "Hardware", A: 60, fullMark: 100 },
    { subject: "Software Eng", A: 80, fullMark: 100 },
  ];

  const moduleCompletionData = [
    { name: "Year 1", completed: 8, total: 8 },
    { name: "Year 2", completed: 7, total: 8 },
    { name: "Year 3", completed: 4, total: 8 },
    { name: "Year 4", completed: 1, total: 8 },
  ];

  const topSkills = progressData?.skillProgress?.slice(0, 5) || [
    { skillName: "Python", level: 80 },
    { skillName: "JavaScript", level: 75 },
    { skillName: "React", level: 70 },
    { skillName: "Node.js", level: 65 },
    { skillName: "SQL", level: 60 },
  ];

  if (progressLoading) {
    return (
      <Layout title="Progress">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Progress">
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Your Progress</h2>
          <p className="text-muted-foreground">
            Track your academic and skill development journey
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Overall Progress"
            value={`${progressData?.overallProgress || 72}%`}
            icon={TrendingUp}
            trend="+5%"
            trendDirection="up"
          />
          <StatCard
            title="Goals Achieved"
            value={progressData?.goals?.filter(g => g.status === "completed").length || 8}
            icon={Trophy}
            trend="+2 this month"
            trendDirection="up"
          />
          <StatCard
            title="Skills Tracked"
            value={topSkills.length}
            icon={Award}
            trend="3 improved"
            trendDirection="up"
          />
          <StatCard
            title="Modules Completed"
            value={progressData?.modules?.filter(m => m.completed).length || 20}
            icon={BookOpen}
            trend="On track"
            trendDirection="neutral"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <LineChart className="h-5 w-5 text-primary" />
                Skill Growth Over Time
              </CardTitle>
              <CardDescription>Track your skill progression</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={skillGrowthData}>
                    <defs>
                      <linearGradient id="colorPython" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorJS" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS[1]} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS[1]} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="Python"
                      stroke={CHART_COLORS[0]}
                      fillOpacity={1}
                      fill="url(#colorPython)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="JavaScript"
                      stroke={CHART_COLORS[1]}
                      fillOpacity={1}
                      fill="url(#colorJS)"
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
                <Target className="h-5 w-5 text-primary" />
                Goal Completion
              </CardTitle>
              <CardDescription>Status of your goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={goalCompletionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {goalCompletionData.map((_, index) => (
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
              <div className="flex justify-center gap-6 mt-4">
                {goalCompletionData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index] }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Skill Proficiency
              </CardTitle>
              <CardDescription>Your competency across domains</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillRadarData}>
                    <PolarGrid className="stroke-border" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar
                      name="Skills"
                      dataKey="A"
                      stroke={CHART_COLORS[0]}
                      fill={CHART_COLORS[0]}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Academic Modules
              </CardTitle>
              <CardDescription>Course completion by year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moduleCompletionData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="completed" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-display">Top Skills</CardTitle>
              <CardDescription>Your highest proficiency skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topSkills.map((skill: any, index) => (
                <SkillProgressCard
                  key={index}
                  skill={skill.skillName || skill.skill}
                  level={skill.level}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-primary/10 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">First Goal Completed</p>
                  <p className="text-xs text-muted-foreground">Achieved your first milestone</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-foreground/10">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">Skill Master</p>
                  <p className="text-xs text-muted-foreground">5 skills above 70%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-foreground/10">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">Consistent Learner</p>
                  <p className="text-xs text-muted-foreground">7-day learning streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
