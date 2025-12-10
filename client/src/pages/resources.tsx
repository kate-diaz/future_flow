import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  FileText,
  Video,
  Link2,
  FileSpreadsheet,
  Download,
  ExternalLink,
  BookOpen,
  Code2,
  Network,
  Database,
  Cpu,
  Filter,
  Grid,
  List,
  MoreVertical,
  Trash2,
  Edit,
  Plus,
} from "lucide-react";
import type { Resource } from "@shared/schema";

const typeIcons: Record<string, React.ElementType> = {
  pdf: FileText,
  video: Video,
  article: Link2,
  template: FileSpreadsheet,
  default: BookOpen,
};

const categoryIcons: Record<string, React.ElementType> = {
  programming: Code2,
  networking: Network,
  database: Database,
  ai: Cpu,
  career: BookOpen,
  all: Filter,
};

const categories = [
  { id: "all", label: "All Resources", icon: categoryIcons.all },
  { id: "programming", label: "Programming", icon: categoryIcons.programming },
  { id: "networking", label: "Networking", icon: categoryIcons.networking },
  { id: "database", label: "Database", icon: categoryIcons.database },
  { id: "ai", label: "AI & ML", icon: categoryIcons.ai },
  { id: "career", label: "Career Development", icon: categoryIcons.career },
];

function ResourceCard({
  resource,
  onDownload,
  viewMode = "grid",
}: {
  resource: Resource;
  onDownload: () => void;
  viewMode?: "grid" | "list";
}) {
  const TypeIcon = typeIcons[resource.type] || typeIcons.default;

  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <TypeIcon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{resource.title}</h4>
            <Badge variant="outline" className="text-xs capitalize">
              {resource.type}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {resource.downloadCount || 0} downloads
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onDownload}>
          <Download className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="overflow-visible hover-elevate" data-testid={`resource-card-${resource.id}`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <TypeIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs capitalize">
                {resource.type}
              </Badge>
              <Badge variant="secondary" className="text-xs capitalize">
                {resource.category}
              </Badge>
            </div>
            <h4 className="mt-2 font-display font-semibold">{resource.title}</h4>
            {resource.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {resource.description}
              </p>
            )}
          </div>
        </div>

        {resource.tags && resource.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {resource.tags.slice(0, 4).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {resource.downloadCount || 0} downloads
          </span>
          <Button onClick={onDownload} data-testid={`button-download-${resource.id}`}>
            {resource.type === "article" ? (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ResourcesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "pdf",
    category: "programming",
    url: "",
    tags: ""
  });
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const downloadMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      await apiRequest("POST", `/api/resources/${resourceId}/download`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/resources/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      toast({ title: "Resource deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete resource", variant: "destructive" });
    },
  });

  const createResourceMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/resources", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      toast({ title: "Resource created successfully" });
      setIsCreateDialogOpen(false);
      setFormData({ title: "", description: "", type: "pdf", category: "programming", url: "", tags: "" });
    },
    onError: () => {
      toast({ title: "Failed to create resource", variant: "destructive" });
    },
  });

  const handleDownload = (resource: Resource) => {
    if (!isAdmin) {
      setIsComingSoonOpen(true);
      return;
    }

    downloadMutation.mutate(resource.id);
    if (resource.url) {
      window.open(resource.url, "_blank");
    }
    toast({
      title: "Download started",
      description: `${resource.title} is being downloaded`,
    });
  };

  const filteredResources = resources?.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      activeCategory === "all" || resource.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const resourceStats = {
    total: resources?.length || 0,
    pdfs: resources?.filter((r) => r.type === "pdf").length || 0,
    videos: resources?.filter((r) => r.type === "video").length || 0,
    articles: resources?.filter((r) => r.type === "article").length || 0,
  };

  return (
    <Layout title="Resource Library">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              {isAdmin ? "Manage Resources" : "Resource Library"}
            </h2>
            <p className="text-muted-foreground">
              {isAdmin ? "Add, edit, and manage resources" : "Study materials, templates, and learning resources"}
            </p>
          </div>
          {isAdmin ? (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="outline">{resourceStats.total} Resources</Badge>
            </div>
          )}
        </div>

        {isAdmin ? (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-resources"
            />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search resources, topics, or tags..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-resources"
                />
              </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              data-testid="button-view-grid"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              data-testid="button-view-list"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="flex-wrap h-auto gap-1">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    data-testid={`tab-category-${category.id}`}
                  >
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </>
        )}

        {isAdmin ? (
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredResources && filteredResources.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResources.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell className="font-medium">{resource.title}</TableCell>
                        <TableCell><Badge variant="outline">{resource.type || "Other"}</Badge></TableCell>
                        <TableCell>{resource.category || "—"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {resource.tags?.slice(0, 3).map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                            {(resource.tags?.length || 0) > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{(resource.tags?.length || 0) - 3}
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
                              <DropdownMenuItem onClick={() => setViewMode("grid") /* placeholder for edit */}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit (coming soon)
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteResourceMutation.mutate(resource.id)}
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
                  <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">No resources found</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          isLoading ? (
            <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
              {[...Array(6)].map((_, i) =>
                viewMode === "grid" ? (
                  <Card key={i}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="flex gap-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-16" />
                          </div>
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                )
              )}
            </div>
          ) : filteredResources && filteredResources.length > 0 ? (
            <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onDownload={() => handleDownload(resource)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">No resources found</h3>
                <p className="mt-2 text-muted-foreground max-w-sm">
                  {searchQuery
                    ? "Try adjusting your search terms or category filter"
                    : "Resources will appear here as they are added"}
                </p>
              </CardContent>
            </Card>
          )
        )}

        {!isAdmin && (
          <Dialog open={isComingSoonOpen} onOpenChange={setIsComingSoonOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Resources coming soon</DialogTitle>
                <DialogDescription>
                  Downloads will be available shortly. Please check back soon.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}

        {/* Create Resource Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
              <DialogDescription>Create a new learning resource</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Python Programming Guide"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="programming">Programming</SelectItem>
                      <SelectItem value="networking">Networking</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="ai">AI & ML</SelectItem>
                      <SelectItem value="career">Career Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the resource..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., python, tutorial, beginner"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
                    createResourceMutation.mutate({ ...formData, tags });
                  }}
                  disabled={!formData.title || !formData.url || createResourceMutation.isPending}
                >
                  {createResourceMutation.isPending ? "Creating..." : "Create Resource"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
