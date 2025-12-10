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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  GraduationCap,
  Award,
  Heart,
  Briefcase,
  FileText,
  Edit,
  Plus,
  X,
  Upload,
  Loader2,
  BookOpen,
  Target,
} from "lucide-react";
import type { Profile } from "@shared/schema";

// Comprehensive skill suggestions for Computer Engineering students
const SUGGESTED_SKILLS = {
  programming: [
    "Python", "JavaScript", "TypeScript", "Java", "C", "C++", "C#", "Go", "Rust",
    "React", "Node.js", "Angular", "Vue.js", "Next.js", "Express.js",
    "HTML", "CSS", "Tailwind CSS", "Bootstrap"
  ],
  hardware: [
    "Verilog", "VHDL", "SystemVerilog", "FPGA Programming", "VLSI Design",
    "Circuit Design", "PCB Design", "Digital Logic", "Analog Electronics",
    "Microcontrollers", "Arduino", "Raspberry Pi", "ARM", "RISC-V"
  ],
  embedded: [
    "Embedded C", "RTOS", "FreeRTOS", "I2C", "SPI", "UART", "CAN",
    "Embedded Linux", "Device Drivers", "Firmware Development"
  ],
  networking: [
    "TCP/IP", "HTTP/HTTPS", "DNS", "Routing", "Switching", "Cisco",
    "Network Security", "Firewalls", "VPN", "SDN", "5G", "IoT"
  ],
  databases: [
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Firebase",
    "Database Design", "NoSQL", "SQLite"
  ],
  tools: [
    "Git", "GitHub", "Docker", "Kubernetes", "Jenkins", "CI/CD",
    "Linux", "Windows", "VS Code", "IntelliJ IDEA", "Eclipse",
    "MATLAB", "Simulink", "LabVIEW", "Quartus", "Vivado", "ModelSim"
  ],
  cloud: [
    "AWS", "Azure", "Google Cloud", "Cloud Computing", "Serverless",
    "Lambda", "EC2", "S3", "API Gateway"
  ],
  ai_ml: [
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch",
    "scikit-learn", "Keras", "Neural Networks", "Computer Vision", "NLP"
  ],
  other: [
    "Agile", "Scrum", "Problem Solving", "Team Collaboration",
    "Technical Writing", "Project Management", "REST APIs", "GraphQL",
    "Testing", "Debugging", "Data Structures", "Algorithms"
  ]
};

const ALL_SKILLS = Object.values(SUGGESTED_SKILLS).flat().sort();

// Interest suggestions
const SUGGESTED_INTERESTS = [
  "Artificial Intelligence",
  "Machine Learning",
  "Deep Learning",
  "Embedded Systems",
  "IoT (Internet of Things)",
  "Robotics",
  "VLSI Design",
  "Digital Design",
  "Analog Circuit Design",
  "Web Development",
  "Mobile App Development",
  "Cloud Computing",
  "Cybersecurity",
  "Network Engineering",
  "Database Systems",
  "Computer Vision",
  "Natural Language Processing",
  "Blockchain Technology",
  "Quantum Computing",
  "Edge Computing",
  "5G Technology",
  "Wireless Communications",
  "Signal Processing",
  "Control Systems",
  "Automotive Electronics",
  "Medical Devices",
  "Power Electronics",
  "Renewable Energy Systems",
  "Smart Grid Technology",
  "Computer Architecture",
  "Operating Systems",
  "Distributed Systems",
  "Game Development",
  "AR/VR Development",
  "Data Science",
  "Big Data Analytics",
  "DevOps",
  "Microservices",
  "Semiconductor Technology",
].sort();

// Career preferences suggestions
const SUGGESTED_CAREERS = [
  "Software Engineer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Mobile Developer",
  "DevOps Engineer",
  "Cloud Architect",
  "Data Scientist",
  "Machine Learning Engineer",
  "AI Engineer",
  "VLSI Design Engineer",
  "ASIC Design Engineer",
  "FPGA Engineer",
  "Hardware Engineer",
  "Embedded Systems Engineer",
  "Firmware Engineer",
  "IoT Engineer",
  "Robotics Engineer",
  "Network Engineer",
  "Network Architect",
  "Security Engineer",
  "Cybersecurity Analyst",
  "Systems Engineer",
  "Database Administrator",
  "Data Engineer",
  "Solutions Architect",
  "Technical Lead",
  "Engineering Manager",
  "Product Manager",
  "Research Engineer",
  "Test Engineer",
  "Quality Assurance Engineer",
  "Site Reliability Engineer",
  "Platform Engineer",
].sort();

// Certification suggestions
const SUGGESTED_CERTIFICATIONS = [
  "AWS Certified Solutions Architect",
  "AWS Certified Developer",
  "AWS Certified Cloud Practitioner",
  "Microsoft Azure Fundamentals",
  "Microsoft Azure Administrator",
  "Google Cloud Professional",
  "Cisco CCNA",
  "Cisco CCNP",
  "CompTIA A+",
  "CompTIA Network+",
  "CompTIA Security+",
  "Certified Ethical Hacker (CEH)",
  "CISSP",
  "Certified Information Systems Auditor (CISA)",
  "PMP (Project Management Professional)",
  "Scrum Master (CSM)",
  "Oracle Certified Professional",
  "Red Hat Certified Engineer",
  "Certified Kubernetes Administrator",
  "Docker Certified Associate",
  "Tableau Desktop Specialist",
  "Power BI Certification",
  "Google Analytics Certification",
  "TensorFlow Developer Certificate",
  "Certified LabVIEW Developer",
  "Certified SolidWorks Professional",
  "AutoCAD Certified User",
  "ITIL Foundation",
  "Six Sigma Green Belt",
  "FE Exam (Fundamentals of Engineering)",
  "PE License (Professional Engineer)",
  "Arm Accredited Engineer",
  "FPGA Programming Certification",
].sort();

const profileSchema = z.object({
  bio: z.string().optional(),
  gpa: z.string().optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  careerPreferences: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

function SkillsSection({
  title,
  icon: Icon,
  items,
  onAdd,
  onRemove,
  placeholder,
  suggestions,
}: {
  title: string;
  icon: React.ElementType;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
  suggestions?: string[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const filteredSuggestions = suggestions?.filter(
    skill => 
      !items.includes(skill) && 
      skill.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10) || [];

  const handleAdd = (skill: string) => {
    onAdd(skill);
    setSearchQuery("");
    setIsAdding(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-base font-display">{title}</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsAdding(!isAdding)}
          data-testid={`button-add-${title.toLowerCase().replace(/\s+/g, "-")}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-4 space-y-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              data-testid={`input-new-${title.toLowerCase().replace(/\s+/g, "-")}`}
              autoFocus
            />
            {filteredSuggestions.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-lg border bg-popover p-2 space-y-1">
                {filteredSuggestions.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleAdd(skill)}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}
            {searchQuery && !filteredSuggestions.some(s => s.toLowerCase() === searchQuery.toLowerCase()) && (
              <Button 
                onClick={() => handleAdd(searchQuery)} 
                size="sm" 
                variant="outline"
                className="w-full"
              >
                Add "{searchQuery}"
              </Button>
            )}
          </div>
        )}
        {items.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="gap-1 pl-2.5"
                data-testid={`badge-${title.toLowerCase()}-${index}`}
              >
                {item}
                <button
                  onClick={() => onRemove(index)}
                  className="ml-1 rounded-full p-0.5 hover:bg-foreground/10"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No {title.toLowerCase()} added yet. Click + to add.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const { user, refetchUser } = useAuth();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBio, setEditingBio] = useState("");
  const [editingGpa, setEditingGpa] = useState("");
  const [editingSubjects, setEditingSubjects] = useState("");

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  const [localSkills, setLocalSkills] = useState<string[]>([]);
  const [localInterests, setLocalInterests] = useState<string[]>([]);
  const [localCareerPrefs, setLocalCareerPrefs] = useState<string[]>([]);
  const [localCerts, setLocalCerts] = useState<string[]>([]);

  // Sync local state when profile loads
  useState(() => {
    if (profile) {
      setLocalSkills(profile.skills || []);
      setLocalInterests(profile.interests || []);
      setLocalCareerPrefs(profile.careerPreferences || []);
      setLocalCerts(profile.certifications || []);
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<ProfileFormData>) => {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ title: "Profile updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateArray = (field: string, items: string[]) => {
    updateProfileMutation.mutate({ [field]: items });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Layout title="Profile">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-4">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const skills = profile?.skills || localSkills;
  const interests = profile?.interests || localInterests;
  const careerPrefs = profile?.careerPreferences || localCareerPrefs;
  const certs = profile?.certifications || localCerts;

  return (
    <Layout title="Profile">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
                    {user?.name ? getInitials(user.name) : "??"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-4 font-display text-xl font-semibold" data-testid="text-profile-name">
                  {user?.name}
                </h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="secondary">
                    <GraduationCap className="mr-1 h-3 w-3" />
                    {user?.yearLevel ? `Year ${user.yearLevel}` : "Student"}
                  </Badge>
                  <Badge variant="outline">{user?.course || "Computer Engineering"}</Badge>
                </div>
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="mt-4 w-full"
                      data-testid="button-edit-profile"
                      onClick={() => {
                        setEditingBio(profile?.bio || "");
                        setEditingGpa(profile?.gpa?.toString() || "");
                        setEditingSubjects(profile?.subjectsTaken?.join(", ") || "");
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>
                        Update your bio, GPA, and subjects taken
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={editingBio}
                          onChange={(e) => setEditingBio(e.target.value)}
                          placeholder="Tell us about yourself..."
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="gpa">GPA</Label>
                          <Input
                            id="gpa"
                            type="number"
                            step="0.01"
                            min="0"
                            max="4"
                            value={editingGpa}
                            onChange={(e) => setEditingGpa(e.target.value)}
                            placeholder="e.g., 3.5"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="subjects">Subjects Taken (comma-separated)</Label>
                        <Textarea
                          id="subjects"
                          value={editingSubjects}
                          onChange={(e) => setEditingSubjects(e.target.value)}
                          placeholder="e.g., Data Structures, Algorithms, Web Development"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            const gpaValue = editingGpa ? parseFloat(editingGpa) : undefined;
                            const subjectsList = editingSubjects
                              ? editingSubjects.split(",").map(s => s.trim()).filter(Boolean)
                              : undefined;
                            
                            updateProfileMutation.mutate({
                              bio: editingBio || undefined,
                              gpa: gpaValue,
                              subjectsTaken: subjectsList,
                            });
                            setIsEditDialogOpen(false);
                          }}
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Academic Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">GPA</span>
                <span className="font-medium" data-testid="text-gpa">
                  {profile?.gpa?.toFixed(2) || "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subjects Taken</span>
                <span className="font-medium">{profile?.subjectsTaken?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Certifications</span>
                <span className="font-medium">{certs.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Skills</span>
                <Badge>{skills.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Career Interests</span>
                <Badge>{careerPrefs.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          {profile?.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-display">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          <SkillsSection
            title="Skills"
            icon={Award}
            items={skills}
            suggestions={ALL_SKILLS}
            onAdd={(item) => {
              const updated = [...skills, item];
              setLocalSkills(updated);
              handleUpdateArray("skills", updated);
            }}
            onRemove={(index) => {
              const updated = skills.filter((_, i) => i !== index);
              setLocalSkills(updated);
              handleUpdateArray("skills", updated);
            }}
            placeholder="Search skills (e.g., Python, React, VLSI)"
          />

          <SkillsSection
            title="Interests"
            icon={Heart}
            items={interests}
            suggestions={SUGGESTED_INTERESTS}
            onAdd={(item) => {
              const updated = [...interests, item];
              setLocalInterests(updated);
              handleUpdateArray("interests", updated);
            }}
            onRemove={(index) => {
              const updated = interests.filter((_, i) => i !== index);
              setLocalInterests(updated);
              handleUpdateArray("interests", updated);
            }}
            placeholder="Search interests (e.g., AI, Embedded Systems)"
          />

          <SkillsSection
            title="Career Preferences"
            icon={Briefcase}
            items={careerPrefs}
            suggestions={SUGGESTED_CAREERS}
            onAdd={(item) => {
              const updated = [...careerPrefs, item];
              setLocalCareerPrefs(updated);
              handleUpdateArray("careerPreferences", updated);
            }}
            onRemove={(index) => {
              const updated = careerPrefs.filter((_, i) => i !== index);
              setLocalCareerPrefs(updated);
              handleUpdateArray("careerPreferences", updated);
            }}
            placeholder="Search careers (e.g., Software Engineer, VLSI Engineer)"
          />

          <SkillsSection
            title="Certifications"
            icon={FileText}
            items={certs}
            suggestions={SUGGESTED_CERTIFICATIONS}
            onAdd={(item) => {
              const updated = [...certs, item];
              setLocalCerts(updated);
              handleUpdateArray("certifications", updated);
            }}
            onRemove={(index) => {
              const updated = certs.filter((_, i) => i !== index);
              setLocalCerts(updated);
              handleUpdateArray("certifications", updated);
            }}
            placeholder="Search certifications (e.g., AWS Certified, CCNA)"
          />
        </div>
      </div>
    </Layout>
  );
}
