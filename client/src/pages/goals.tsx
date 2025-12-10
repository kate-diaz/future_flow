import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Target,
  Plus,
  Edit,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  Loader2,
  Flag,
  Lightbulb,
} from "lucide-react";
import type { Goal, Profile } from "@shared/schema";

const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["short-term", "long-term"]),
  specific: z.string().optional(),
  measurable: z.string().optional(),
  achievable: z.string().optional(),
  relevant: z.string().optional(),
  timeBound: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

function GoalCard({
  goal,
  onEdit,
  onDelete,
  onUpdateProgress,
}: {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onUpdateProgress: (id: string, progress: number) => void;
}) {
  const [localProgress, setLocalProgress] = useState(goal.progress || 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "in_progress":
        return "bg-primary/10 text-primary";
      case "cancelled":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleProgressChange = (value: number[]) => {
    setLocalProgress(value[0]);
  };

  const handleProgressCommit = () => {
    if (localProgress !== goal.progress) {
      onUpdateProgress(goal.id, localProgress);
    }
  };

  return (
    <Card className="overflow-visible" data-testid={`goal-card-${goal.id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="font-display text-base">{goal.title}</CardTitle>
            {goal.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {goal.description}
              </CardDescription>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className={getStatusColor(goal.status || "in_progress")}>
            {goal.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {goal.specific && (
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
              <Lightbulb className="h-3 w-3" />
              SMART Goal
            </div>
            <p className="text-sm">{goal.specific}</p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-bold text-primary">{localProgress}%</span>
          </div>
          <Slider
            value={[localProgress]}
            onValueChange={handleProgressChange}
            onValueCommit={handleProgressCommit}
            max={100}
            step={5}
            className="cursor-pointer"
            data-testid={`slider-progress-${goal.id}`}
          />
        </div>

        {goal.targetDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Due {new Date(goal.targetDate).toLocaleDateString()}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(goal)}
            data-testid={`button-edit-${goal.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(goal.id)}
            data-testid={`button-delete-${goal.id}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function GoalForm({
  goal,
  onSubmit,
  onCancel,
  isLoading,
}: {
  goal?: Goal | null;
  onSubmit: (data: GoalFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: goal?.title || "",
      description: goal?.description || "",
      type: (goal?.type as "short-term" | "long-term") || "short-term",
      specific: goal?.specific || "",
      measurable: goal?.measurable || "",
      achievable: goal?.achievable || "",
      relevant: goal?.relevant || "",
      timeBound: goal?.timeBound || "",
    },
  });

  const [showSmart, setShowSmart] = useState(!!goal?.specific);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Goal Title</Label>
        <Input
          id="title"
          placeholder="What do you want to achieve?"
          {...form.register("title")}
          data-testid="input-goal-title"
        />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your goal in detail..."
          {...form.register("description")}
          data-testid="input-goal-description"
        />
      </div>

      <div className="space-y-2">
        <Label>Goal Type</Label>
        <Select
          value={form.watch("type")}
          onValueChange={(value: "short-term" | "long-term") => form.setValue("type", value)}
        >
          <SelectTrigger data-testid="select-goal-type">
            <SelectValue placeholder="Select goal type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="short-term">Short-term (weeks to months)</SelectItem>
            <SelectItem value="long-term">Long-term (months to years)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border-t pt-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => setShowSmart(!showSmart)}
        >
          <Lightbulb className="mr-2 h-4 w-4" />
          {showSmart ? "Hide" : "Add"} SMART Goal Framework
        </Button>

        {showSmart && (
          <div className="mt-4 space-y-4 rounded-lg bg-muted/50 p-4">
            <div className="space-y-2">
              <Label htmlFor="specific" className="text-sm">
                <strong>S</strong>pecific - What exactly will you accomplish?
              </Label>
              <Textarea
                id="specific"
                placeholder="Be specific about what you want to achieve..."
                {...form.register("specific")}
                className="min-h-[60px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="measurable" className="text-sm">
                <strong>M</strong>easurable - How will you measure progress?
              </Label>
              <Textarea
                id="measurable"
                placeholder="How will you track your progress?"
                {...form.register("measurable")}
                className="min-h-[60px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="achievable" className="text-sm">
                <strong>A</strong>chievable - Is this goal realistic?
              </Label>
              <Textarea
                id="achievable"
                placeholder="What resources and capabilities do you have?"
                {...form.register("achievable")}
                className="min-h-[60px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relevant" className="text-sm">
                <strong>R</strong>elevant - Why is this goal important?
              </Label>
              <Textarea
                id="relevant"
                placeholder="How does this align with your career goals?"
                {...form.register("relevant")}
                className="min-h-[60px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeBound" className="text-sm">
                <strong>T</strong>ime-bound - When will you achieve this?
              </Label>
              <Textarea
                id="timeBound"
                placeholder="Set a realistic deadline..."
                {...form.register("timeBound")}
                className="min-h-[60px]"
              />
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} data-testid="button-save-goal">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : goal ? (
            "Update Goal"
          ) : (
            "Create Goal"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function GoalsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: GoalFormData) => {
      const res = await apiRequest("POST", "/api/goals", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals", "recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsDialogOpen(false);
      toast({ title: "Goal created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create goal", description: error.message, variant: "destructive" });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GoalFormData & { progress: number }> }) => {
      const res = await apiRequest("PUT", `/api/goals/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals", "recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsDialogOpen(false);
      setEditingGoal(null);
      toast({ title: "Goal updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update goal", description: error.message, variant: "destructive" });
    },
  });

  const addSkillFromGoalMutation = useMutation({
    mutationFn: async (skillName: string) => {
      const currentSkills = profile?.skills || [];
      const merged = Array.from(new Set([...currentSkills, skillName]));
      const res = await apiRequest("POST", "/api/profile", { skills: merged });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ title: "Skills updated", description: "Goal completion added to your skills" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update skills", description: error.message, variant: "destructive" });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals", "recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Goal deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete goal", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (data: GoalFormData) => {
    if (editingGoal) {
      updateGoalMutation.mutate({ id: editingGoal.id, data });
    } else {
      createGoalMutation.mutate(data);
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsDialogOpen(true);
  };

  const handleUpdateProgress = (id: string, progress: number) => {
    const data: any = { progress };
    if (progress >= 100) {
      data.status = "completed";
      const goal = goals?.find((g) => g.id === id);
      if (goal?.title) {
        addSkillFromGoalMutation.mutate(goal.title);
      }
    }
    updateGoalMutation.mutate({ id, data });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      deleteGoalMutation.mutate(id);
    }
  };

  const filteredGoals = goals?.filter((goal) => {
    if (activeTab === "all") return true;
    if (activeTab === "short-term") return goal.type === "short-term";
    if (activeTab === "long-term") return goal.type === "long-term";
    if (activeTab === "completed") return goal.status === "completed";
    return true;
  });

  const stats = {
    total: goals?.length || 0,
    shortTerm: goals?.filter((g) => g.type === "short-term").length || 0,
    longTerm: goals?.filter((g) => g.type === "long-term").length || 0,
    completed: goals?.filter((g) => g.status === "completed").length || 0,
    avgProgress: goals?.length
      ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length)
      : 0,
  };

  return (
    <Layout title="Goals">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Your Goals</h2>
            <p className="text-muted-foreground">
              Track your short and long-term academic and career goals
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingGoal(null);
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-goal">
                <Plus className="mr-2 h-4 w-4" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingGoal ? "Edit Goal" : "Create New Goal"}
                </DialogTitle>
                <DialogDescription>
                  {editingGoal ? "Update your academic or career goal" : "Set a new goal to track your progress"}
                </DialogDescription>
              </DialogHeader>
              <GoalForm
                goal={editingGoal}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setEditingGoal(null);
                }}
                isLoading={createGoalMutation.isPending || updateGoalMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Goals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.shortTerm}</p>
                  <p className="text-sm text-muted-foreground">Short-term</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Flag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.longTerm}</p>
                  <p className="text-sm text-muted-foreground">Long-term</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgProgress}%</p>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
            <TabsTrigger value="short-term" data-testid="tab-short-term">Short-term</TabsTrigger>
            <TabsTrigger value="long-term" data-testid="tab-long-term">Long-term</TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredGoals && filteredGoals.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUpdateProgress={handleUpdateProgress}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">No goals yet</h3>
              <p className="mt-2 text-muted-foreground max-w-sm">
                Start by creating your first goal to track your academic and career progress
              </p>
              <Button
                className="mt-6"
                onClick={() => setIsDialogOpen(true)}
                data-testid="button-create-first-goal"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
