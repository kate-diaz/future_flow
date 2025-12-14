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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  Upload,
  CheckCircle2,
  FileText,
  Send,
  X,
  Eye,
  AlertCircle,
} from "lucide-react";
import type { Opportunity, SavedOpportunity, OpportunityApplication } from "@shared/schema";

function OpportunityCard({
  opportunity,
  isSaved,
  isApplied,
  onToggleSave,
  onApply,
  onViewApplication,
  onEdit,
  onDelete,
  isAdmin,
  showEditDelete,
}: {
  opportunity: Opportunity;
  isSaved: boolean;
  isApplied: boolean;
  onToggleSave: () => void;
  onApply: () => void;
  onViewApplication?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isAdmin?: boolean;
  showEditDelete?: boolean;
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
          <div className="flex items-center gap-2">
            {showEditDelete && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onEdit}
                  title="Edit application"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="text-destructive hover:text-destructive"
                  title="Delete application"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
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
          {isApplied && onViewApplication ? (
            <Button onClick={onViewApplication} variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              View Application
            </Button>
          ) : (
            <Button onClick={onApply} data-testid={`button-apply-${opportunity.id}`}>
              <Send className="mr-2 h-4 w-4" />
              Apply Now
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
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isViewApplicationOpen, setIsViewApplicationOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<OpportunityApplication | null>(null);
  const [formData, setFormData] = useState({ 
    title: "", 
    company: "", 
    description: "", 
    type: "internship", 
    location: "", 
    industry: "",
    applicationUrl: "",
    deadline: ""
  });
  const [editFormData, setEditFormData] = useState({ 
    title: "", 
    company: "", 
    description: "", 
    type: "internship", 
    location: "", 
    industry: "",
    applicationUrl: "",
    deadline: ""
  });
  const [applicationData, setApplicationData] = useState({
    profilePictureUrl: "",
    resumeUrl: "",
    coverLetter: "",
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Helper function to compress and convert image to base64
  const handleImageUpload = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 400x400)
          let width = img.width;
          let height = img.height;
          const maxSize = 400;
          
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(base64);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image size should be less than 5MB", variant: "destructive" });
      return;
    }
    
    try {
      setIsUploadingImage(true);
      const base64 = await handleImageUpload(file);
      setApplicationData({ ...applicationData, profilePictureUrl: base64 });
      toast({ title: "Image uploaded successfully" });
    } catch (error) {
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const { data: opportunities, isLoading } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities"],
  });

  const { data: savedOpportunities } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities/saved"],
    enabled: !!user && !isAdmin,
  });

  const { data: applications } = useQuery<OpportunityApplication[]>({
    queryKey: ["/api/opportunity-applications/mine"],
    enabled: !!user && !isAdmin,
  });

  const savedIds = new Set(savedOpportunities?.map((s) => s.id) || []);
  const appliedIds = new Set(applications?.map((a) => a.opportunityId) || []);

  const toggleSaveMutation = useMutation({
    mutationFn: async ({ opportunityId, isSaved }: { opportunityId: string; isSaved: boolean }) => {
      if (isSaved) {
        await apiRequest("DELETE", `/api/opportunities/${opportunityId}/save`);
      } else {
        await apiRequest("POST", `/api/opportunities/${opportunityId}/save`);
      }
    },
    onSuccess: (_, { isSaved }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities/saved"] });
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
      setFormData({ title: "", company: "", description: "", type: "internship", location: "", industry: "", applicationUrl: "", deadline: "" });
    },
    onError: async (error: any) => {
      let message = "Failed to create opportunity";
      if (error instanceof Error) message = error.message;
      setErrorDetails(message);
      setIsErrorDialogOpen(true);
      toast({ title: "Creation error", description: message, variant: "destructive" });
    },
  });

  const editOpportunityMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PATCH", `/api/opportunities/${selectedOpportunity!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      toast({ title: "Opportunity updated successfully" });
      setIsEditDialogOpen(false);
      setSelectedOpportunity(null);
    },
    onError: async (error: any) => {
      let message = "Failed to update opportunity";
      if (error instanceof Error) message = error.message;
      setErrorDetails(message);
      setIsErrorDialogOpen(true);
      toast({ title: "Update error", description: message, variant: "destructive" });
    },
  });

  const handleEditOpportunity = () => {
    const skills = editFormData.applicationUrl ? [] : [];
    editOpportunityMutation.mutate({
      ...editFormData,
      requiredSkills: skills,
    });
  };

  const applyMutation = useMutation({
    mutationFn: async ({ opportunityId, data }: { opportunityId: string; data: any }) => {
      await apiRequest("POST", `/api/opportunities/${opportunityId}/apply`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunity-applications/mine"] });
      setIsApplyDialogOpen(false);
      setIsSuccessDialogOpen(true);
      setApplicationData({ profilePictureUrl: "", resumeUrl: "", coverLetter: "" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to submit application", 
        description: error.message || "You may have already applied to this opportunity",
        variant: "destructive" 
      });
    },
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      await apiRequest("DELETE", `/api/opportunity-applications/${applicationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunity-applications/mine"] });
      toast({ title: "Application deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete application", variant: "destructive" });
    },
  });

  const handleApplyClick = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setApplicationData({ profilePictureUrl: "", resumeUrl: "", coverLetter: "" });
    setIsApplyDialogOpen(true);
  };

  const handleSubmitApplication = () => {
    if (!selectedOpportunity) return;
    if (!applicationData.resumeUrl) {
      toast({ title: "Resume URL is required", variant: "destructive" });
      return;
    }
    applyMutation.mutate({
      opportunityId: selectedOpportunity.id,
      data: applicationData,
    });
  };

  const handleClearProfilePicture = () => {
    setApplicationData({ ...applicationData, profilePictureUrl: "" });
  };

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

    if (activeTab === "requests") {
      return matchesSearch && matchesType && matchesLocation && appliedIds.has(opp.id);
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
                <TabsTrigger value="requests" data-testid="tab-requests">
                  <Send className="mr-1.5 h-4 w-4" />
                  Requests ({appliedIds.size})
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
                              <DropdownMenuItem onClick={() => {
                                setSelectedOpportunity(opp);
                                setEditFormData({
                                  title: opp.title,
                                  company: opp.company,
                                  description: opp.description,
                                  type: opp.type as "internship" | "job",
                                  location: opp.location || "",
                                  industry: opp.industry || "",
                                  applicationUrl: opp.applicationUrl || "",
                                  deadline: opp.deadline ? new Date(opp.deadline).toISOString().slice(0,10) : "",
                                });
                                setIsEditDialogOpen(true);
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
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
              {filteredOpportunities.map((opportunity) => {
                const application = applications?.find(a => a.opportunityId === opportunity.id);
                return (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    isSaved={savedIds.has(opportunity.id)}
                    isApplied={appliedIds.has(opportunity.id)}
                    isAdmin={isAdmin}
                    showEditDelete={isAdmin || activeTab === "requests"}
                    onToggleSave={() =>
                      toggleSaveMutation.mutate({
                        opportunityId: opportunity.id,
                        isSaved: savedIds.has(opportunity.id),
                      })
                    }
                    onApply={() => handleApplyClick(opportunity)}
                    onViewApplication={() => {
                      if (application) {
                        setSelectedApplication(application);
                        setIsViewApplicationOpen(true);
                      }
                    }}
                    onEdit={() => {
                      const application = applications?.find(a => a.opportunityId === opportunity.id);
                      if (application) {
                        setSelectedApplication(application);
                        setApplicationData({
                          profilePictureUrl: application.profilePictureUrl || "",
                          resumeUrl: application.resumeUrl || "",
                          coverLetter: application.coverLetter || "",
                        });
                        setIsApplyDialogOpen(true);
                      }
                    }}
                    onDelete={() => {
                      const application = applications?.find(a => a.opportunityId === opportunity.id);
                      if (application) {
                        deleteApplicationMutation.mutate(application.id);
                      }
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  {activeTab === "saved" ? (
                    <Bookmark className="h-8 w-8 text-muted-foreground" />
                  ) : activeTab === "requests" ? (
                    <Send className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {activeTab === "saved" 
                    ? "No saved opportunities" 
                    : activeTab === "requests"
                    ? "No applications yet"
                    : "No opportunities found"}
                </h3>
                <p className="mt-2 text-muted-foreground max-w-sm">
                  {activeTab === "saved"
                    ? "Save opportunities by clicking the bookmark icon"
                    : activeTab === "requests"
                    ? "Apply to opportunities to see your requests here"
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
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
                  onClick={() => {
                    const payload = {
                      ...formData,
                      deadline: formData.deadline ? new Date(formData.deadline) : undefined,
                    };
                    createOpportunityMutation.mutate(payload);
                  }}
                  disabled={!formData.title || !formData.company || !formData.description || createOpportunityMutation.isPending}
                >
                  {createOpportunityMutation.isPending ? "Creating..." : "Create Opportunity"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Error Details Dialog */}
        <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Something went wrong
              </DialogTitle>
              <DialogDescription>
                Please review the error details below.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-md bg-muted p-4 text-sm break-words">
              {errorDetails || "Unknown error"}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsErrorDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Opportunity Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Opportunity</DialogTitle>
              <DialogDescription>Update the opportunity details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  placeholder="e.g., Software Engineer Internship"
                />
              </div>
              <div>
                <Label htmlFor="edit-company">Company *</Label>
                <Input
                  id="edit-company"
                  value={editFormData.company}
                  onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                  placeholder="e.g., Tech Corp"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-type">Type *</Label>
                  <Select value={editFormData.type} onValueChange={(value) => setEditFormData({ ...editFormData, type: value as "internship" | "job" })}>
                    <SelectTrigger id="edit-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="job">Job</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-deadline">Deadline</Label>
                  <Input
                    id="edit-deadline"
                    type="date"
                    value={editFormData.deadline}
                    onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-industry">Industry</Label>
                <Input
                  id="edit-industry"
                  value={editFormData.industry}
                  onChange={(e) => setEditFormData({ ...editFormData, industry: e.target.value })}
                  placeholder="e.g., Technology"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Describe the opportunity..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="edit-applicationUrl">Application URL</Label>
                <Input
                  id="edit-applicationUrl"
                  value={editFormData.applicationUrl}
                  onChange={(e) => setEditFormData({ ...editFormData, applicationUrl: e.target.value })}
                  placeholder="https://example.com/apply"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    const payload = {
                      ...editFormData,
                      deadline: editFormData.deadline ? new Date(editFormData.deadline) : undefined,
                    };
                    editOpportunityMutation.mutate(payload);
                  }}
                  disabled={!editFormData.title || !editFormData.company || !editFormData.description || editOpportunityMutation.isPending}
                >
                  {editOpportunityMutation.isPending ? "Updating..." : "Update Opportunity"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Application Dialog */}
        <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedApplication ? "Edit Application" : `Apply for ${selectedOpportunity?.title}`}
              </DialogTitle>
              <DialogDescription>
                {selectedApplication 
                  ? `Update your application for ${selectedApplication.opportunity?.title}`
                  : `Submit your application for this opportunity at ${selectedOpportunity?.company}`
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="profilePictureUrl">Profile Picture (Optional)</Label>
                <div className="flex gap-3 mt-2">
                  {applicationData.profilePictureUrl && (
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-lg border bg-muted overflow-hidden">
                      <img 
                        src={applicationData.profilePictureUrl} 
                        alt="Profile preview" 
                        className="h-full w-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={handleClearProfilePicture}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="profilePictureFile"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="cursor-pointer"
                      disabled={isUploadingImage}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {isUploadingImage ? "Uploading and compressing..." : "Upload an image (max 5MB). Will be compressed automatically."}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="resumeUrl">Resume URL *</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="resumeUrl"
                    value={applicationData.resumeUrl}
                    onChange={(e) => setApplicationData({ ...applicationData, resumeUrl: e.target.value })}
                    placeholder="https://drive.google.com/your-resume.pdf"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Paste a URL to your resume (Google Drive, Dropbox, etc.)</p>
              </div>

              <div>
                <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                <Textarea
                  id="coverLetter"
                  value={applicationData.coverLetter}
                  onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                  placeholder="Tell us why you're interested in this opportunity..."
                  rows={5}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
                  Cancel
                </Button>
                {selectedApplication ? (
                  <Button 
                    onClick={() => {
                      if (!selectedApplication) return;
                      apiRequest("PATCH", `/api/opportunity-applications/${selectedApplication.id}`, applicationData)
                        .then(() => {
                          queryClient.invalidateQueries({ queryKey: ["/api/opportunity-applications/mine"] });
                          toast({ title: "Application updated successfully" });
                          setIsApplyDialogOpen(false);
                          setSelectedApplication(null);
                        })
                        .catch((error) => {
                          toast({ title: "Failed to update application", description: error.message, variant: "destructive" });
                        });
                    }}
                    disabled={!applicationData.resumeUrl}
                  >
                    Update Application
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmitApplication}
                    disabled={!applicationData.resumeUrl || applyMutation.isPending}
                  >
                    {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Application Dialog */}
        <Dialog open={isViewApplicationOpen} onOpenChange={setIsViewApplicationOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application for {selectedApplication?.opportunity?.title}</DialogTitle>
              <DialogDescription>
                Application submitted to {selectedApplication?.opportunity?.company}
              </DialogDescription>
            </DialogHeader>

            {selectedApplication && (
              <div className="space-y-6 mt-4">
                {/* PDF-like container */}
                <div className="border-2 border-border rounded-lg bg-white dark:bg-slate-950 p-8 space-y-6">
                  {/* Profile Section - Left Image, Right Details */}
                  <div className="grid grid-cols-3 gap-6">
                    {/* Left: Profile Image */}
                    <div className="col-span-1 flex flex-col items-center">
                      <Avatar className="h-32 w-32 mb-4">
                        <AvatarImage 
                          src={selectedApplication.profilePictureUrl} 
                          alt="Profile" 
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                          {selectedApplication.profilePictureUrl ? "?" : "NO IMAGE"}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-center text-sm text-muted-foreground">Profile Photo</p>
                    </div>

                    {/* Right: Student Details */}
                    <div className="col-span-2 space-y-4">
                      <div>
                        <h3 className="font-display font-semibold text-lg mb-4">Applicant Information</h3>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase font-semibold">Resume URL</p>
                              <a 
                                href={selectedApplication.resumeUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm break-all"
                              >
                                {selectedApplication.resumeUrl}
                              </a>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase font-semibold">Application Date</p>
                              <p className="text-sm font-medium">
                                {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Status</p>
                            <Badge className="mt-1">{selectedApplication.status}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Cover Letter Section */}
                  <div>
                    <h3 className="font-display font-semibold text-lg mb-3">Cover Letter</h3>
                    {selectedApplication.coverLetter ? (
                      <div className="bg-muted/50 rounded-lg p-4 min-h-32 whitespace-pre-wrap text-sm leading-relaxed">
                        {selectedApplication.coverLetter}
                      </div>
                    ) : (
                      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground italic">
                        No cover letter provided
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Opportunity Details */}
                  <div>
                    <h3 className="font-display font-semibold text-lg mb-3">Opportunity Details</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Position</p>
                        <p className="font-medium">{selectedApplication.opportunity?.title}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Company</p>
                        <p className="font-medium">{selectedApplication.opportunity?.company}</p>
                      </div>
                      {selectedApplication.opportunity?.location && (
                        <div>
                          <p className="text-muted-foreground">Location</p>
                          <p className="font-medium">{selectedApplication.opportunity.location}</p>
                        </div>
                      )}
                      {selectedApplication.opportunity?.type && (
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <Badge variant="outline">{selectedApplication.opportunity.type}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsViewApplicationOpen(false)}>
                    Close
                  </Button>
                  {selectedApplication.resumeUrl && (
                    <Button asChild>
                      <a 
                        href={selectedApplication.resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        View Resume
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
          <DialogContent className="max-w-md">
            <div className="flex flex-col items-center text-center py-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <DialogHeader className="mt-4">
                <DialogTitle className="text-2xl">Request Sent!</DialogTitle>
                <DialogDescription className="mt-2">
                  Your application has been successfully submitted to {selectedOpportunity?.company}.
                  You can track your application status in the Requests tab.
                </DialogDescription>
              </DialogHeader>
              <Button 
                onClick={() => {
                  setIsSuccessDialogOpen(false);
                  setActiveTab("requests");
                }}
                className="mt-6"
              >
                View My Requests
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
