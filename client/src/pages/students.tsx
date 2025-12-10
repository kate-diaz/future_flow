import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Search, 
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
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  yearLevel?: number;
  course?: string;
  avatarUrl?: string;
  createdAt: string;
}

interface StudentProfile {
  userId: string;
  bio?: string;
  gpa?: number;
  skills: string[];
  interests: string[];
  careerPreferences: string[];
  certifications: string[];
  subjectsTaken: string[];
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
  user: Student;
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

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ["/api/admin/students"],
  });

  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery<StudentAnalytics>({
    queryKey: selectedStudent ? [`/api/admin/students/${selectedStudent.id}/analytics`] : [],
    enabled: !!selectedStudent,
  });

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout title="Students">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">View and analyze student profiles and progress</p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Users className="mr-2 h-4 w-4" />
            {students.length} Students
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search students by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                    <Skeleton className="h-9 w-24" />
                  </div>
                ))}
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  {searchQuery ? "No students found matching your search" : "No students registered yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatarUrl} alt={student.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{student.name}</h3>
                        {student.yearLevel && (
                          <Badge variant="secondary" className="text-xs">
                            Year {student.yearLevel}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                      {student.course && (
                        <p className="text-xs text-muted-foreground mt-1">{student.course}</p>
                      )}
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => window.location.href = `/students/${student.id}`}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student Analytics Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-3">
              {selectedStudent && (
                <>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedStudent.avatarUrl} alt={selectedStudent.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(selectedStudent.name)}
                    </AvatarFallback>
                  </Avatar>
                  {selectedStudent.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Comprehensive analytics and progress tracking
            </DialogDescription>
          </DialogHeader>

          {isLoadingAnalytics ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : analytics ? (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="goals">Goals</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Total Goals
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.stats.totalGoals}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        In Progress
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.stats.inProgressGoals}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Completed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.stats.completedGoals}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Total Skills
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.stats.totalSkills}</div>
                    </CardContent>
                  </Card>
                </div>

                {analytics.profile && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Academic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analytics.profile.gpa && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">GPA</span>
                          <Badge variant="secondary">{analytics.profile.gpa.toFixed(2)}</Badge>
                        </div>
                      )}
                      {analytics.profile.subjectsTaken.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Subjects Taken</p>
                          <div className="flex flex-wrap gap-2">
                            {analytics.profile.subjectsTaken.map((subject, idx) => (
                              <Badge key={idx} variant="outline">{subject}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="profile" className="space-y-4">
                {analytics.profile ? (
                  <>
                    {analytics.profile.bio && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">About</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{analytics.profile.bio}</p>
                        </CardContent>
                      </Card>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      {analytics.profile.interests && analytics.profile.interests.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Heart className="h-4 w-4 text-primary" />
                              Interests
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {analytics.profile.interests.map((interest, idx) => (
                                <Badge key={idx} variant="secondary">{interest}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {analytics.profile.careerPreferences && analytics.profile.careerPreferences.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-primary" />
                              Career Preferences
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {analytics.profile.careerPreferences.map((career, idx) => (
                                <Badge key={idx} variant="secondary">{career}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {analytics.profile.certifications && analytics.profile.certifications.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              Certifications
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {analytics.profile.certifications.map((cert, idx) => (
                                <Badge key={idx} variant="secondary">{cert}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-muted-foreground">No profile information available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="goals" className="space-y-4">
                {analytics.goals.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.goals.map((goal) => (
                      <Card key={goal.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base">{goal.title}</CardTitle>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">{goal.category}</Badge>
                                <Badge 
                                  variant={
                                    goal.status === "completed" ? "default" :
                                    goal.status === "in-progress" ? "secondary" :
                                    "outline"
                                  }
                                >
                                  {goal.status.replace("-", " ")}
                                </Badge>
                                {goal.targetDate && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(goal.targetDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-4 text-muted-foreground">No goals set yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="skills" className="space-y-4">
                {analytics.profile && analytics.profile.skills.length > 0 ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Skill Proficiency Levels</CardTitle>
                        <CardDescription>
                          Average: {analytics.stats.averageSkillLevel.toFixed(0)}%
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {analytics.progressRecords.map((record, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{record.skillName}</span>
                              <span className="text-muted-foreground">{record.level}%</span>
                            </div>
                            <Progress value={record.level} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">All Skills</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {analytics.profile.skills.map((skill, idx) => (
                            <Badge key={idx} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Award className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-4 text-muted-foreground">No skills added yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          ) : null}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
