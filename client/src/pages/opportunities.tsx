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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  MapPin,
  Building2,
  Clock,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Filter,
  GraduationCap,
  Briefcase,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import type { Opportunity, SavedOpportunity } from "@shared/schema";

function OpportunityCard({
  opportunity,
  isSaved,
  onToggleSave,
}: {
  opportunity: Opportunity;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const isInternship = opportunity.type === "internship";

  return (
    <Card className="overflow-visible" data-testid={`opportunity-card-${opportunity.id}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              isInternship ? "bg-primary/10" : "bg-secondary"
            }`}>
              {isInternship ? (
                <GraduationCap className="h-6 w-6 text-primary" />
              ) : (
                <Briefcase className="h-6 w-6 text-secondary-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-semibold">{opportunity.title}</h3>
                <Badge variant={isInternship ? "default" : "secondary"}>
                  {opportunity.type}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {opportunity.company}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSave}
            data-testid={`button-save-${opportunity.id}`}
          >
            {isSaved ? (
              <BookmarkCheck className="h-5 w-5 text-primary" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
        </div>

        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {opportunity.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {opportunity.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {opportunity.location}
            </span>
          )}
          {opportunity.industry && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {opportunity.industry}
            </span>
          )}
          {opportunity.deadline && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(opportunity.deadline).toLocaleDateString()}
            </span>
          )}
        </div>

        {opportunity.requiredSkills && opportunity.requiredSkills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {opportunity.requiredSkills.slice(0, 5).map((skill, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {opportunity.requiredSkills.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{opportunity.requiredSkills.length - 5}
              </Badge>
            )}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          {opportunity.applicationUrl && (
            <Button asChild>
              <a
                href={opportunity.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`button-apply-${opportunity.id}`}
              >
                Apply Now
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function OpportunitiesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all-locations");
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    title: "", 
    company: "", 
    description: "", 
    type: "internship", 
    location: "", 
    industry: "",
    applicationUrl: ""
  });

  const { data: opportunities, isLoading } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities"],
  });

  const { data: savedOpportunities } = useQuery<SavedOpportunity[]>({
    queryKey: ["/api/opportunities", "saved"],
  });

  const savedIds = new Set(savedOpportunities?.map((s) => s.opportunityId) || []);

  const toggleSaveMutation = useMutation({
    mutationFn: async ({ opportunityId, isSaved }: { opportunityId: string; isSaved: boolean }) => {
      if (isSaved) {
        await apiRequest("DELETE", `/api/opportunities/${opportunityId}/save`);
      } else {
        await apiRequest("POST", `/api/opportunities/${opportunityId}/save`);
      }
    },
    onSuccess: (_, { isSaved }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities", "saved"] });
      toast({
        title: isSaved ? "Removed from saved" : "Saved successfully",
        description: isSaved ? "Opportunity removed from your bookmarks" : "Opportunity added to your bookmarks",
      });
    },
    onError: (error: any) => {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    },
  });

  const deleteOpportunityMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/opportunities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      toast({ title: "Opportunity deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete opportunity", variant: "destructive" });
    },
  });

  const createOpportunityMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/opportunities", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      toast({ title: "Opportunity created successfully" });
      setIsCreateDialogOpen(false);
      setFormData({ title: "", company: "", description: "", type: "internship", location: "", industry: "", applicationUrl: "" });
    },
    onError: () => {
      toast({ title: "Failed to create opportunity", variant: "destructive" });
    },
  });

  const locations = [...new Set(opportunities?.map((o) => o.location).filter(Boolean) || [])];

  const filteredOpportunities = opportunities?.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || opp.type === filterType;
    const matchesLocation = filterLocation === "all-locations" || opp.location === filterLocation;

    if (activeTab === "saved") {
      return matchesSearch && matchesType && matchesLocation && savedIds.has(opp.id);
    }

    return matchesSearch && matchesType && matchesLocation;
  });

  const internshipCount = opportunities?.filter((o) => o.type === "internship").length || 0;
  const jobCount = opportunities?.filter((o) => o.type === "job").length || 0;

  return (
    <Layout title="Opportunities">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              {isAdmin ? "Manage Opportunities" : "Opportunities"}
            </h2>
            <p className="text-muted-foreground">
              {isAdmin ? "Add, edit, and manage opportunities" : "Discover internships and job opportunities"}
            </p>
          </div>
          {isAdmin ? (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Opportunity
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <GraduationCap className="h-3 w-3" />
                {internshipCount} Internships
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Briefcase className="h-3 w-3" />
                {jobCount} Jobs
              </Badge>
            </div>
          )}
        </div>

        {isAdmin ? (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search opportunities..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-opportunities"
            />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search opportunities..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-opportunities"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[140px]" data-testid="select-filter-type">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="job">Job</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterLocation} onValueChange={setFilterLocation}>
                  <SelectTrigger className="w-[160px]" data-testid="select-filter-location">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-locations">All Locations</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc!}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all" data-testid="tab-all-opportunities">
                  All Opportunities
                </TabsTrigger>
                <TabsTrigger value="saved" data-testid="tab-saved-opportunities">
                  <Bookmark className="mr-1.5 h-4 w-4" />
                  Saved ({savedIds.size})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </>
        )}

        {isAdmin ? (
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredOpportunities && filteredOpportunities.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOpportunities.map((opp) => (
                      <TableRow key={opp.id}>
                        <TableCell className="font-medium">{opp.title}</TableCell>
                        <TableCell>{opp.company}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{opp.type}</Badge>
                        </TableCell>
                        <TableCell>{opp.location || "—"}</TableCell>
                        <TableCell>{opp.deadline ? new Date(opp.deadline).toLocaleDateString() : "—"}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setActiveTab("all") /* placeholder for edit */}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit (coming soon)
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteOpportunityMutation.mutate(opp.id)}
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
                  <Building2 className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">No opportunities found</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOpportunities && filteredOpportunities.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  isSaved={savedIds.has(opportunity.id)}
                  onToggleSave={() =>
                    toggleSaveMutation.mutate({
                      opportunityId: opportunity.id,
                      isSaved: savedIds.has(opportunity.id),
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  {activeTab === "saved" ? (
                    <Bookmark className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {activeTab === "saved" ? "No saved opportunities" : "No opportunities found"}
                </h3>
                <p className="mt-2 text-muted-foreground max-w-sm">
                  {activeTab === "saved"
                    ? "Save opportunities by clicking the bookmark icon"
                    : searchQuery
                    ? "Try adjusting your search or filters"
                    : "New opportunities will appear here as they are posted"}
                </p>
              </CardContent>
            </Card>
          )
        )}

        {/* Create Opportunity Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Opportunity</DialogTitle>
              <DialogDescription>Create a new internship or job opportunity</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Software Engineering Intern"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g., Google"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="job">Job</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Manila, Philippines"
                  />
                </div>
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
                  placeholder="Describe the opportunity..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="url">Application URL</Label>
                <Input
                  id="url"
                  value={formData.applicationUrl}
                  onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => createOpportunityMutation.mutate(formData)}
                  disabled={!formData.title || !formData.company || !formData.description || createOpportunityMutation.isPending}
                >
                  {createOpportunityMutation.isPending ? "Creating..." : "Create Opportunity"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
