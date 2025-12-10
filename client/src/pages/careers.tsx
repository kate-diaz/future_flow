import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Briefcase,
  Search,
  ChevronRight,
  Code2,
  Cpu,
  Network,
  Database,
  Shield,
  Smartphone,
  Bot,
  Zap,
  DollarSign,
  BookOpen,
  Target,
  ArrowRight,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import type { Career } from "@shared/schema";

const careerIcons: Record<string, React.ElementType> = {
  software: Code2,
  hardware: Cpu,
  network: Network,
  data: Database,
  security: Shield,
  mobile: Smartphone,
  ai: Bot,
  embedded: Zap,
  default: Briefcase,
};

function CareerCard({
  career,
  onClick,
  isRecommended,
}: {
  career: Career;
  onClick: () => void;
  isRecommended?: boolean;
}) {
  const Icon = careerIcons[career.icon || "default"] || careerIcons.default;

  return (
    <Card
      className="overflow-visible hover-elevate cursor-pointer transition-all duration-200"
      onClick={onClick}
      data-testid={`career-card-${career.id}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-semibold">{career.title}</h3>
              {isRecommended && (
                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs gap-1">
                  <Star className="h-3 w-3" />
                  Recommended
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {career.description}
            </p>
            {career.requiredSkills && career.requiredSkills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {career.requiredSkills.slice(0, 4).map((skill, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {career.requiredSkills.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{career.requiredSkills.length - 4}
                  </Badge>
                )}
              </div>
            )}
            {career.salaryRange && (
              <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" />
                <span>{career.salaryRange}</span>
              </div>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

function CareerDetail({ career, onClose, onAddToGoals, isAdmin }: { career: Career; onClose: () => void; onAddToGoals: (career: Career) => void; isAdmin: boolean; }) {
  const Icon = careerIcons[career.icon || "default"] || careerIcons.default;
  const learningPath = career.learningPath as { phase: string; items: string[] }[] | null;

  return (
    <DialogContent className="max-w-2xl max-h-[90vh]">
      <DialogHeader>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-7 w-7 text-primary" />
          </div>
          <div>
            <DialogTitle className="font-display text-xl">{career.title}</DialogTitle>
            {career.industry && (
              <p className="text-sm text-muted-foreground mt-1">{career.industry}</p>
            )}
          </div>
        </div>
        <DialogDescription className="sr-only">
          Detailed information about {career.title}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="max-h-[60vh] pr-4">
        <div className="space-y-6">
          {career.overview && (
            <div>
              <h4 className="font-display font-semibold mb-2">Overview</h4>
              <p className="text-muted-foreground">{career.overview}</p>
            </div>
          )}

          {career.salaryRange && (
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-4">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Salary Range</p>
                <p className="text-lg font-bold text-primary">{career.salaryRange}</p>
              </div>
            </div>
          )}

          <Separator />

          {career.requiredSkills && career.requiredSkills.length > 0 && (
            <div>
              <h4 className="font-display font-semibold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Required Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {career.requiredSkills.map((skill, i) => (
                  <Badge key={i} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {career.recommendedTools && career.recommendedTools.length > 0 && (
            <div>
              <h4 className="font-display font-semibold mb-3 flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" />
                Recommended Tools & Technologies
              </h4>
              <div className="flex flex-wrap gap-2">
                {career.recommendedTools.map((tool, i) => (
                  <Badge key={i} variant="outline">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {learningPath && learningPath.length > 0 && (
            <div>
              <h4 className="font-display font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Learning Path
              </h4>
              <div className="space-y-4">
                {learningPath.map((phase, i) => (
                  <div key={i} className="relative pl-6">
                    <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {i + 1}
                    </div>
                    <div className="pt-0.5">
                      <h5 className="font-medium">{phase.phase}</h5>
                      <ul className="mt-2 space-y-1">
                        {phase.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <ArrowRight className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {i < learningPath.length - 1 && (
                      <div className="absolute left-3 top-6 bottom-0 w-px bg-border -translate-x-1/2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        {!isAdmin && (
          <Button onClick={() => onAddToGoals(career)}>
            Add to Goals
          </Button>
        )}
      </div>
    </DialogContent>
  );
}

export default function CareersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", industry: "", requiredSkills: "" });
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";

  const { data: careers, isLoading } = useQuery<Career[]>({
    queryKey: ["/api/careers"],
  });

  const { data: recommendedCareers } = useQuery<Career[]>({
    queryKey: ["/api/careers", "recommended"],
  });

  const createCareerMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/careers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/careers"] });
      toast({ title: "Career created successfully" });
      setIsCreateDialogOpen(false);
      setFormData({ title: "", description: "", industry: "", requiredSkills: "" });
    },
    onError: () => {
      toast({ title: "Failed to create career", variant: "destructive" });
    },
  });

  const deleteCareerMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/careers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/careers"] });
      toast({ title: "Career deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete career", variant: "destructive" });
    },
  });

  const addGoalFromCareerMutation = useMutation({
    mutationFn: async (career: Career) => {
      const payload = {
        title: career.title,
        description: career.description,
        type: "long-term" as const,
        specific: `Pursue the ${career.title} pathway`,
        measurable: "Complete required skills and learning path milestones",
        achievable: "Follow recommended tools and learning path",
        relevant: career.industry || "Career growth",
        timeBound: "Set timeline in Goals page",
      };
      const res = await apiRequest("POST", "/api/goals", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals", "recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Goal added", description: "Career added to your goals" });
      setSelectedCareer(null);
    },
    onError: (error: any) => {
      toast({ title: "Failed to add goal", description: error.message, variant: "destructive" });
    },
  });

  const handleCreateCareer = () => {
    const skills = formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
    createCareerMutation.mutate({
      ...formData,
      requiredSkills: skills,
    });
  };

  const recommendedIds = new Set(recommendedCareers?.map((c) => c.id) || []);

  const filteredCareers = careers?.filter(
    (career) =>
      career.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      career.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      career.requiredSkills?.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const groupedCareers = filteredCareers?.reduce((acc, career) => {
    const industry = career.industry || "Other";
    if (!acc[industry]) acc[industry] = [];
    acc[industry].push(career);
    return acc;
  }, {} as Record<string, Career[]>);

  return (
    <Layout title="Career Pathways">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              {isAdmin ? "Manage Careers" : "Career Pathways"}
            </h2>
            <p className="text-muted-foreground">
              {isAdmin 
                ? "Add, edit, and manage career pathways" 
                : "Explore career options aligned with your skills and interests"}
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Career
            </Button>
          )}
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={isAdmin ? "Search careers..." : "Search careers, skills, or industries..."}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-careers"
          />
        </div>

        {isAdmin ? (
          // Admin Table View
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredCareers && filteredCareers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Required Skills</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCareers.map((career) => (
                      <TableRow key={career.id}>
                        <TableCell className="font-medium">{career.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{career.industry || "Other"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {career.requiredSkills?.slice(0, 3).map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {(career.requiredSkills?.length || 0) > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{(career.requiredSkills?.length || 0) - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedCareer(career)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteCareerMutation.mutate(career.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">No careers found</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          // Student View (existing code)
          <>
            {recommendedCareers && recommendedCareers.length > 0 && !searchQuery && (
          <div>
            <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Recommended for You
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendedCareers.slice(0, 3).map((career) => (
                <CareerCard
                  key={career.id}
                  career={career}
                  onClick={() => setSelectedCareer(career)}
                  isRecommended
                />
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <div className="flex gap-2 pt-1">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : groupedCareers && Object.keys(groupedCareers).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedCareers).map(([industry, industryCareers]) => (
              <div key={industry}>
                <h3 className="font-display text-lg font-semibold mb-4">{industry}</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {industryCareers.map((career) => (
                    <CareerCard
                      key={career.id}
                      career={career}
                      onClick={() => setSelectedCareer(career)}
                      isRecommended={recommendedIds.has(career.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">No careers found</h3>
              <p className="mt-2 text-muted-foreground max-w-sm">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Career pathways will appear here as they are added"}
              </p>
            </CardContent>
          </Card>
        )}
          </>
        )}

        <Dialog open={!!selectedCareer} onOpenChange={() => setSelectedCareer(null)}>
          {selectedCareer && (
            <CareerDetail
              career={selectedCareer}
              onClose={() => setSelectedCareer(null)}
              onAddToGoals={(career) => addGoalFromCareerMutation.mutate(career)}
              isAdmin={isAdmin}
            />
          )}
        </Dialog>

        {/* Create Career Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Career</DialogTitle>
              <DialogDescription>Create a new career pathway</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g., Technology"
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the career path..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="skills">Required Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  placeholder="e.g., Python, JavaScript, React"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCareer}
                  disabled={!formData.title || !formData.description || createCareerMutation.isPending}
                >
                  {createCareerMutation.isPending ? "Creating..." : "Create Career"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
