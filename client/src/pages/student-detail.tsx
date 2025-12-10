import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  GraduationCap,
  Award,
  Target,
  TrendingUp,
  BookOpen,
  Briefcase,
  Heart,
  FileText,
  BarChart3,
  Calendar,
  Mail,
  User,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface StudentProfile {
  userId: string;
  bio?: string;
  gpa?: number;
  skills: string[];
  interests: string[];
  careerPreferences: string[];
  certifications: string[];
  subjectsTaken: string[];
  user?: {
    name: string;
    email: string;
    yearLevel?: number;
    course?: string;
    avatarUrl?: string;
  };
}

interface StudentGoal {
  id: string;
  title: string;
  category: string;
  status: string;
  targetDate?: string;
  progress: number;
}

interface ProgressRecord {
  skillName: string;
  level: number;
  lastUpdated: string;
}

interface StudentAnalytics {
  user: {
    id: string;
    name: string;
    email: string;
    yearLevel?: number;
    course?: string;
    avatarUrl?: string;
  };
  profile: StudentProfile | null;
  goals: StudentGoal[];
  progressRecords: ProgressRecord[];
  stats: {
    totalGoals: number;
    completedGoals: number;
    inProgressGoals: number;
    totalSkills: number;
    averageSkillLevel: number;
  };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function StudentDetailPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const studentId = params.id;

  const { data: profile, isLoading: isLoadingProfile } = useQuery<StudentProfile>({
    queryKey: [`/api/admin/students/${studentId}/profile`],
    enabled: !!studentId,
  });

  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery<StudentAnalytics>({
    queryKey: [`/api/admin/students/${studentId}/analytics`],
    enabled: !!studentId,
  });

  const isLoading = isLoadingProfile || isLoadingAnalytics;

  if (isLoading) {
    return (
      <Layout title="Student Profile">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-64" />
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const displayUser = analytics?.user || profile?.user;
  const studentProfile = analytics?.profile || profile;

  // Prepare chart data
  const goalStatusData = analytics ? [
    { name: 'Completed', value: analytics.stats.completedGoals },
    { name: 'In Progress', value: analytics.stats.inProgressGoals },
    { name: 'Not Started', value: analytics.stats.totalGoals - analytics.stats.completedGoals - analytics.stats.inProgressGoals },
  ].filter(d => d.value > 0) : [];

  const skillLevelData = analytics?.progressRecords.slice(0, 6).map(record => ({
    name: record.skillName,
    level: record.level,
  })) || [];

  return (
    <Layout title={`Student Profile - ${displayUser?.name || 'Loading...'}`}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setLocation('/students')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Students
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Sidebar - Student Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={displayUser?.avatarUrl} alt={displayUser?.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
                      {displayUser?.name ? getInitials(displayUser.name) : "??"}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="mt-4 font-display text-xl font-semibold">
                    {displayUser?.name}
                  </h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" />
                    {displayUser?.email}
                  </p>
                  <div className="mt-4 flex items-center gap-2 flex-wrap justify-center">
                    <Badge variant="secondary">
                      <GraduationCap className="mr-1 h-3 w-3" />
                      {displayUser?.yearLevel ? `Year ${displayUser.yearLevel}` : "Student"}
                    </Badge>
                    <Badge variant="outline">{displayUser?.course || "Computer Engineering"}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Academic Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">GPA</span>
                  <span className="font-medium">
                    {studentProfile?.gpa?.toFixed(2) || "Not set"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subjects Taken</span>
                  <span className="font-medium">{studentProfile?.subjectsTaken?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Certifications</span>
                  <span className="font-medium">{studentProfile?.certifications?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Skills</span>
                  <span className="font-medium">{studentProfile?.skills?.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            {analytics && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Goal Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Goals</span>
                    <span className="font-medium">{analytics.stats.totalGoals}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="font-medium text-green-600">{analytics.stats.completedGoals}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">In Progress</span>
                    <span className="font-medium text-blue-600">{analytics.stats.inProgressGoals}</span>
                  </div>
                  {analytics.stats.totalGoals > 0 && (
                    <div className="pt-2">
                      <Progress 
                        value={(analytics.stats.completedGoals / analytics.stats.totalGoals) * 100} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1 text-center">
                        {Math.round((analytics.stats.completedGoals / analytics.stats.totalGoals) * 100)}% Complete
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="goals">Goals</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                {studentProfile?.bio && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{studentProfile.bio}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {studentProfile?.interests && studentProfile.interests.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Heart className="h-4 w-4 text-primary" />
                          Interests
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {studentProfile.interests.map((interest) => (
                            <Badge key={interest} variant="secondary">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {studentProfile?.careerPreferences && studentProfile.careerPreferences.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-primary" />
                          Career Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {studentProfile.careerPreferences.map((career) => (
                            <Badge key={career} variant="outline">
                              {career}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {studentProfile?.certifications && studentProfile.certifications.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        Certifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {studentProfile.certifications.map((cert) => (
                          <Badge key={cert} variant="default">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="profile" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{displayUser?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{displayUser?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Year Level</p>
                        <p className="font-medium">{displayUser?.yearLevel || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Course</p>
                        <p className="font-medium">{displayUser?.course || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">GPA</p>
                        <p className="font-medium">{studentProfile?.gpa?.toFixed(2) || "Not set"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {studentProfile?.subjectsTaken && studentProfile.subjectsTaken.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        Subjects Taken
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {studentProfile.subjectsTaken.map((subject) => (
                          <Badge key={subject} variant="secondary">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {studentProfile?.bio && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Bio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{studentProfile.bio}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="skills" className="space-y-4 mt-4">
                {studentProfile?.skills && studentProfile.skills.length > 0 ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">All Skills ({studentProfile.skills.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {studentProfile.skills.map((skill) => (
                            <Badge key={skill} variant="default">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {analytics?.progressRecords && analytics.progressRecords.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Skill Proficiency Levels</CardTitle>
                          <CardDescription>Current proficiency for tracked skills</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {analytics.progressRecords.map((record) => (
                              <div key={record.skillName} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{record.skillName}</span>
                                  <span className="text-sm text-muted-foreground">
                                    Level {record.level}/5
                                  </span>
                                </div>
                                <Progress value={(record.level / 5) * 100} className="h-2" />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">No skills added yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="goals" className="space-y-4 mt-4">
                {analytics?.goals && analytics.goals.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.goals.map((goal) => (
                      <Card key={goal.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base">{goal.title}</CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {goal.category}
                                </Badge>
                                {goal.targetDate && (
                                  <span className="text-xs flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(goal.targetDate).toLocaleDateString()}
                                  </span>
                                )}
                              </CardDescription>
                            </div>
                            <Badge
                              variant={
                                goal.status === "completed"
                                  ? "default"
                                  : goal.status === "in-progress"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {goal.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-4 text-muted-foreground">No goals created yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4 mt-4">
                {analytics && (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      {goalStatusData.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Goal Status Distribution</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                              <PieChart>
                                <Pie
                                  data={goalStatusData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {goalStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}

                      {skillLevelData.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Top Skills by Proficiency</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                              <PieChart>
                                <Pie
                                  data={skillLevelData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name }) => name}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="level"
                                >
                                  {skillLevelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Performance Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Average Skill Level</p>
                            <p className="text-2xl font-bold">
                              {analytics.stats.averageSkillLevel.toFixed(1)}/5
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Goal Completion Rate</p>
                            <p className="text-2xl font-bold">
                              {analytics.stats.totalGoals > 0
                                ? Math.round((analytics.stats.completedGoals / analytics.stats.totalGoals) * 100)
                                : 0}%
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Active Skills</p>
                            <p className="text-2xl font-bold">{analytics.stats.totalSkills}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}
