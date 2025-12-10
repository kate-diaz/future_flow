import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import {
  Target,
  Briefcase,
  Award,
  TrendingUp,
  BookOpen,
  Clock,
  ChevronRight,
  Sparkles,
  Calendar,
  GraduationCap,
  Trophy,
} from "lucide-react";
import type { Goal, Career, Opportunity, ProgressRecord } from "@shared/schema";

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

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "primary",
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: string;
  color?: "primary" | "secondary" | "accent";
}) {
  return (
    <Card className="overflow-visible">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-display" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, "-")}`}>
          {value}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="mt-2 flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
            <TrendingUp className="h-3 w-3" />
            <span>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "in_progress":
        return "bg-primary/10 text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4" data-testid={`goal-card-${goal.id}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Target className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-medium truncate">{goal.title}</h4>
          <Badge variant="secondary" className={getStatusColor(goal.status || "in_progress")}>
            {goal.type}
          </Badge>
        </div>
        <div className="mt-2 flex items-center gap-4">
          <Progress value={goal.progress || 0} className="h-2 flex-1" />
          <span className="text-sm font-medium text-muted-foreground">{goal.progress}%</span>
        </div>
      </div>
    </div>
  );
}

function CareerCard({ career }: { career: Career }) {
  return (
    <Link href={`/careers/${career.id}`}>
      <Card className="overflow-visible hover-elevate cursor-pointer transition-all duration-200" data-testid={`career-card-${career.id}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium font-display">{career.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {career.description}
              </p>
              {career.requiredSkills && career.requiredSkills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {career.requiredSkills.slice(0, 3).map((skill, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {career.requiredSkills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{career.requiredSkills.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4" data-testid={`opportunity-card-${opportunity.id}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
        <GraduationCap className="h-5 w-5 text-secondary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{opportunity.title}</h4>
        <p className="text-sm text-muted-foreground">{opportunity.company}</p>
      </div>
      <Badge variant={opportunity.type === "internship" ? "default" : "secondary"}>
        {opportunity.type}
      </Badge>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<{
    goalsCount: number;
    completedGoals: number;
    skillsCount: number;
    careersCount: number;
    overallProgress: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentGoals, isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals", "recent"],
  });

  const { data: recommendedCareers, isLoading: careersLoading } = useQuery<Career[]>({
    queryKey: ["/api/careers", "recommended"],
  });

  const { data: latestOpportunities, isLoading: opportunitiesLoading } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities", "latest"],
  });

  const { data: ranking, isLoading: rankingLoading } = useQuery<RankingResponse>({
    queryKey: ["/api/students/ranking"],
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Layout title="Dashboard">
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-2xl font-bold tracking-tight" data-testid="text-greeting">
            {getGreeting()}, {user?.name?.split(" ")[0] || "Student"}!
          </h2>
          <p className="text-muted-foreground">
            Here's an overview of your academic alignment progress.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="mt-2 h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Active Goals"
                value={stats?.goalsCount || 0}
                description={`${stats?.completedGoals || 0} completed`}
                icon={Target}
                trend="+2 this week"
              />
              <StatCard
                title="Skills"
                value={stats?.skillsCount || 0}
                description="Tracked competencies"
                icon={Award}
              />
              <StatCard
                title="Career Matches"
                value={stats?.careersCount || 0}
                description="Based on your profile"
                icon={Briefcase}
              />
              <StatCard
                title="Overall Progress"
                value={`${stats?.overallProgress || 0}%`}
                description="Toward your goals"
                icon={TrendingUp}
              />
            </>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="font-display">Recent Goals</CardTitle>
                <CardDescription>Your active short and long-term goals</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/goals">
                  View all
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {goalsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-2 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentGoals && recentGoals.length > 0 ? (
                recentGoals.slice(0, 3).map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Target className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="mt-4 font-medium">No goals yet</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create your first goal to start tracking progress
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/goals">Create Goal</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="font-display">Recommended Careers</CardTitle>
                <CardDescription>Paths aligned with your profile</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/careers">
                  View all
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {careersLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Skeleton className="h-12 w-12 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-full" />
                            <div className="flex gap-1">
                              <Skeleton className="h-5 w-16" />
                              <Skeleton className="h-5 w-16" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : recommendedCareers && recommendedCareers.length > 0 ? (
                recommendedCareers.slice(0, 2).map((career) => (
                  <CareerCard key={career.id} career={career} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Briefcase className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="mt-4 font-medium">No recommendations yet</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Complete your profile to get career recommendations
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/profile">Update Profile</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="font-display">Student Ranking</CardTitle>
                <CardDescription>Score based on skills, goals, and GPA</CardDescription>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {rankingLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : ranking && ranking.leaderboard.length > 0 ? (
                <>
                  <div className="rounded-lg border bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Your rank</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold font-display">
                        {ranking.currentUser ? `#${ranking.currentUser.rank}` : "—"}
                      </span>
                      {ranking.currentUser && (
                        <span className="text-sm text-muted-foreground">
                          Score {ranking.currentUser.score}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {ranking.leaderboard.slice(0, 5).map((entry) => (
                      <div
                        key={entry.userId}
                        className={`flex items-center gap-3 rounded-lg border p-3 ${
                          ranking.currentUser?.userId === entry.userId ? "border-primary/60 bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                          #{entry.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{entry.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.skillsCount} skills • {entry.completedGoals} completed goals • GPA {entry.gpa !== null ? entry.gpa.toFixed(2) : "—"}
                          </p>
                        </div>
                        <Badge variant="secondary">{entry.score}</Badge>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Trophy className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="mt-3 font-medium">No ranking data yet</h4>
                  <p className="text-sm text-muted-foreground">Add skills, complete goals, and track GPA to appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="font-display">Latest Opportunities</CardTitle>
              <CardDescription>Internships and jobs matching your skills</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/opportunities">
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {opportunitiesLoading ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : latestOpportunities && latestOpportunities.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {latestOpportunities.slice(0, 6).map((opportunity) => (
                  <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <GraduationCap className="h-6 w-6 text-muted-foreground" />
                </div>
                <h4 className="mt-4 font-medium">No opportunities available</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Check back soon for new internships and job openings
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">Ready to level up?</h3>
                <p className="text-sm text-muted-foreground">
                  Explore learning resources tailored to your career goals
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/resources">
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Resources
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
