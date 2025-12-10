import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import {
  GraduationCap,
  BookOpen,
  Award,
  Target,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import type { Profile, Career, TrainingProgram } from "@shared/schema";

function SkillGapCard({
  skill,
  currentLevel,
  requiredLevel,
}: {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
}) {
  const gap = requiredLevel - currentLevel;
  const isAhead = gap <= 0;

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
        isAhead ? "bg-green-100 dark:bg-green-900/30" : "bg-primary/10"
      }`}>
        {isAhead ? (
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium truncate">{skill}</span>
          <Badge variant={isAhead ? "secondary" : "outline"} className="shrink-0">
            {isAhead ? "On Track" : `Gap: ${gap}%`}
          </Badge>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Progress value={currentLevel} className="h-2 flex-1" />
          <span className="text-sm font-medium text-muted-foreground w-12 text-right">
            {currentLevel}%
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Industry requires: {requiredLevel}%
        </p>
      </div>
    </div>
  );
}

function CourseRecommendation({
  course,
  reason,
}: {
  course: string;
  reason: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-4 hover-elevate cursor-pointer">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <BookOpen className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium">{course}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{reason}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
    </div>
  );
}

function TrainingCard({ program }: { program: TrainingProgram }) {
  return (
    <Card className="overflow-visible hover-elevate">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <Award className="h-5 w-5 text-secondary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium">{program.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {program.description}
            </p>
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              {program.provider && (
                <span className="text-xs text-muted-foreground">{program.provider}</span>
              )}
              {program.duration && (
                <Badge variant="outline" className="text-xs">
                  {program.duration}
                </Badge>
              )}
              {program.certificationOffered && (
                <Badge variant="secondary" className="text-xs">
                  Certification
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RoadmapStep({
  step,
  title,
  items,
  isCompleted,
  isCurrent,
}: {
  step: number;
  title: string;
  items: string[];
  isCompleted?: boolean;
  isCurrent?: boolean;
}) {
  return (
    <div className="relative pl-8">
      <div className={`absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
        isCompleted
          ? "bg-green-600 text-white"
          : isCurrent
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground"
      }`}>
        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : step}
      </div>
      <div className="pb-8">
        <h4 className={`font-medium ${isCurrent ? "text-primary" : ""}`}>{title}</h4>
        <ul className="mt-2 space-y-1">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <ArrowRight className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute left-3 top-6 bottom-0 w-px bg-border -translate-x-1/2" />
    </div>
  );
}

export default function AcademicPage() {
  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery<{
    courses: { name: string; reason: string }[];
    skillGaps: { skill: string; current: number; required: number }[];
    roadmap: { phase: string; items: string[]; completed?: boolean; current?: boolean }[];
  }>({
    queryKey: ["/api/academic/recommendations"],
  });

  const { data: training, isLoading: trainingLoading } = useQuery<TrainingProgram[]>({
    queryKey: ["/api/training"],
  });

  // Sample data for display (will be replaced with real data)
  const sampleSkillGaps = recommendations?.skillGaps || [
    { skill: "Python Programming", current: 75, required: 85 },
    { skill: "Data Structures", current: 60, required: 80 },
    { skill: "Machine Learning", current: 40, required: 70 },
    { skill: "System Design", current: 55, required: 75 },
    { skill: "Database Management", current: 70, required: 70 },
  ];

  const sampleCourses = recommendations?.courses || [
    { name: "Advanced Algorithms", reason: "Strengthens problem-solving skills for technical interviews" },
    { name: "Cloud Computing Fundamentals", reason: "High demand skill in current job market" },
    { name: "Machine Learning Basics", reason: "Addresses skill gap in AI/ML domain" },
  ];

  const sampleRoadmap = recommendations?.roadmap || [
    { phase: "Foundation", items: ["Complete core CS courses", "Build programming fundamentals", "Learn version control"], completed: true },
    { phase: "Specialization", items: ["Choose focus area", "Take advanced courses", "Get industry certifications"], current: true },
    { phase: "Experience", items: ["Complete internship", "Build portfolio projects", "Contribute to open source"] },
    { phase: "Career Launch", items: ["Prepare for interviews", "Network with professionals", "Apply for positions"] },
  ];

  const sampleTraining = training || [
    { id: "1", title: "AWS Cloud Practitioner", description: "Foundation-level cloud certification", provider: "Amazon Web Services", duration: "6 weeks", certificationOffered: true, isActive: true, skills: [], url: "" },
    { id: "2", title: "React Developer Bootcamp", description: "Comprehensive frontend development training", provider: "Udemy", duration: "8 weeks", certificationOffered: true, isActive: true, skills: [], url: "" },
    { id: "3", title: "Python for Data Science", description: "Learn data analysis and visualization", provider: "Coursera", duration: "4 weeks", certificationOffered: true, isActive: true, skills: [], url: "" },
  ];

  const isLoading = profileLoading || recommendationsLoading;

  return (
    <Layout title="Academic Alignment">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Academic Alignment</h2>
            <p className="text-muted-foreground">
              Personalized recommendations to align your academics with career goals
            </p>
          </div>
          <Button asChild>
            <Link href="/profile">
              <Target className="mr-2 h-4 w-4" />
              Update Profile
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{profile?.skills?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Skills Tracked</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {sampleSkillGaps.filter(s => s.current >= s.required).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Skills on Track</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {sampleSkillGaps.filter(s => s.current < s.required).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Skill Gaps</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Skill Gap Analysis
              </CardTitle>
              <CardDescription>
                Compare your skills against industry requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  </div>
                ))
              ) : (
                sampleSkillGaps.map((skill, i) => (
                  <SkillGapCard
                    key={i}
                    skill={skill.skill}
                    currentLevel={skill.current}
                    requiredLevel={skill.required}
                  />
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Recommended Courses
              </CardTitle>
              <CardDescription>
                Courses aligned with your career goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border p-4">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))
              ) : (
                sampleCourses.map((course, i) => (
                  <CourseRecommendation
                    key={i}
                    course={course.name}
                    reason={course.reason}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Your Learning Roadmap
            </CardTitle>
            <CardDescription>
              A personalized path to your career goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-2xl">
              {sampleRoadmap.map((phase, i) => (
                <RoadmapStep
                  key={i}
                  step={i + 1}
                  title={phase.phase}
                  items={phase.items}
                  isCompleted={phase.completed}
                  isCurrent={phase.current}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="font-display flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Recommended Training & Certifications
              </CardTitle>
              <CardDescription>
                Industry-recognized programs to boost your profile
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/resources">
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {trainingLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sampleTraining.map((program) => (
                  <TrainingCard key={program.id} program={program as TrainingProgram} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
