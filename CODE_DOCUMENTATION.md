# Future Flow - Code Documentation

## Table of Contents
- [Authentication System](#authentication-system)
- [Admin Functions & Screens](#admin-functions--screens)
- [Student Functions & Screens](#student-functions--screens)
- [Route Protection](#route-protection)
- [Database Schema](#database-schema)

---

## Authentication System

### Backend Authentication Middleware

**File:** `server/routes.ts`

#### 1. `requireAuth` - Basic Authentication Check
```typescript
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}
```
**What it does:**
- Checks if user has an active session
- Returns 401 error if not authenticated
- Used on all protected routes

#### 2. `requireAdmin` - Admin Role Verification
```typescript
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, req.session.userId),
  });

  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}
```
**What it does:**
- First checks authentication
- Queries database to fetch user
- Verifies user role is "admin"
- Returns 403 if not admin
- Used on all admin-only routes (CRUD operations)

### Backend Auth API Endpoints

**File:** `server/routes.ts`

#### Register Endpoint
```typescript
app.post("/api/auth/register", async (req: Request, res: Response) => {
  const { email, password, name, yearLevel, course } = req.body;

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return res.status(400).json({ error: "Email already registered" });
  }

  // Only allow student registration
  const [user] = await db.insert(users).values({
    email,
    password,
    name,
    role: "student", // Force student role
    yearLevel: parseInt(yearLevel),
    course: course || "Computer Engineering",
  }).returning();

  req.session.userId = user.id;
  res.json({ user });
});
```
**What it does:**
- Validates email is not already registered
- Creates new user with "student" role only
- Admin accounts must be created via seed script
- Creates session for immediate login
- Returns user object

#### Login Endpoint
```typescript
app.post("/api/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || password !== user.password) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  req.session.userId = user.id;
  res.json({ user });
});
```
**What it does:**
- Finds user by email
- Validates password matches
- Creates session on success
- Returns user object including role

#### Logout Endpoint
```typescript
app.post("/api/auth/logout", async (req: Request, res: Response) => {
  req.session.destroy((err: any) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ message: "Logged out successfully" });
  });
});
```
**What it does:**
- Destroys user session
- Clears authentication cookie
- Returns success message

#### Get Current User
```typescript
app.get("/api/auth/me", async (req: Request, res: Response) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, req.session.userId),
  });

  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  res.json({ user });
});
```
**What it does:**
- Checks session validity
- Fetches current user from database
- Returns user object
- Called on app initialization

### Frontend Auth Context

**File:** `client/src/lib/auth.tsx`

#### Auth Provider
```typescript
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
```
**What it does:**
- Provides auth state to entire app
- Fetches user on mount
- Handles loading states
- Manages user session

#### Login Function
```typescript
const login = async (email: string, password: string) => {
  const res = await apiRequest("POST", "/api/auth/login", { email, password });
  const data = await res.json();
  setUser(data.user);
  queryClient.invalidateQueries();
};
```
**What it does:**
- Calls login API endpoint
- Updates user state on success
- Invalidates all queries to fetch fresh data
- Triggers re-render with authenticated state

#### Register Function
```typescript
const register = async (data: { 
  email: string; 
  password: string; 
  name: string; 
  yearLevel?: number 
}) => {
  const res = await apiRequest("POST", "/api/auth/register", data);
  const userData = await res.json();
  setUser(userData.user);
  queryClient.invalidateQueries();
};
```
**What it does:**
- Calls register API endpoint
- Creates student account
- Sets user state immediately (auto-login)
- Refreshes all queries

#### Logout Function
```typescript
const logout = async () => {
  await apiRequest("POST", "/api/auth/logout", {});
  setUser(null);
  queryClient.clear();
};
```
**What it does:**
- Calls logout API endpoint
- Clears user from state
- Clears all cached query data
- Forces re-authentication

### Auth Screen (Login/Register)

**File:** `client/src/pages/auth.tsx`

#### Login Form Schema
```typescript
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
```

#### Register Form Schema
```typescript
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  yearLevel: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

#### Login Handler
```typescript
const handleLogin = async (data: LoginFormData) => {
  setIsLoading(true);
  try {
    await login(data.email, data.password);
    toast({ title: "Welcome back!", description: "You have successfully signed in." });
  } catch (error: any) {
    toast({
      title: "Sign in failed",
      description: error.message || "Invalid email or password",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};
```
**What it does:**
- Validates form data with Zod
- Calls login function from auth context
- Shows success/error toasts
- Handles loading states

#### Register Handler
```typescript
const handleRegister = async (data: RegisterFormData) => {
  setIsLoading(true);
  try {
    await registerUser({
      email: data.email,
      password: data.password,
      name: data.name,
      yearLevel: data.yearLevel ? parseInt(data.yearLevel) : undefined,
    });
    toast({ title: "Account created!", description: "Welcome to Future Flow." });
  } catch (error: any) {
    toast({
      title: "Registration failed",
      description: error.message || "Could not create account",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};
```
**What it does:**
- Validates form including password confirmation
- Creates student account
- Auto-logs in on success
- Shows feedback toasts

---

## Admin Functions & Screens

### Admin Dashboard

**File:** `client/src/pages/admin.tsx`

**Route:** `/admin`

**Access:** Admin only (protected by `AdminRoute` component)

#### Stats Query
```typescript
const { data: stats, isLoading } = useQuery<{
  totalStudents: number;
  totalCareers: number;
  totalOpportunities: number;
  totalResources: number;
}>({
  queryKey: ["/api/dashboard/stats"],
});
```
**What it does:**
- Fetches system-wide statistics
- Shows total counts for all entities
- Displays in stat cards with icons

#### Ranking Query
```typescript
const { data: ranking, isLoading: rankingLoading } = useQuery<RankingResponse>({
  queryKey: ["/api/students/ranking"],
});
```
**What it does:**
- Fetches top 5 students leaderboard
- Shows student scores, skills, goals
- Displays ranking table

**Screen Components:**
- System stats cards (students, careers, opportunities, resources)
- User growth area chart
- Skill distribution pie chart
- Activity bar chart
- Top 5 students leaderboard

### Students Management Screen

**File:** `client/src/pages/students.tsx`

**Route:** `/students`

**Access:** Admin only

#### Fetch All Students
```typescript
const { data: students = [], isLoading, refetch } = useQuery<Student[]>({
  queryKey: ["/api/admin/students"],
});
```
**What it does:**
- Lists all registered students
- Supports search/filter by name or email
- Shows student cards with basic info

#### Delete Student
```typescript
const deleteStudentMutation = useMutation({
  mutationFn: async (studentId: string) => {
    await apiRequest("DELETE", `/api/admin/students/${studentId}`);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
    toast({ title: "Student deleted successfully" });
    setDeleteConfirmation(null);
    setSelectedStudent(null);
    refetch();
  },
});
```
**What it does:**
- Deletes student account
- Shows confirmation dialog
- Refreshes student list
- Shows success notification

#### View Student Analytics
```typescript
const { data: analytics, isLoading: isLoadingAnalytics } = useQuery<StudentAnalytics>({
  queryKey: selectedStudent ? [`/api/admin/students/${selectedStudent.id}/analytics`] : [],
  enabled: !!selectedStudent,
});
```
**What it does:**
- Opens modal with detailed student view
- Shows profile, goals, progress, skills
- Displays statistics and charts

**Backend Endpoint:**
```typescript
// File: server/routes.ts
app.get("/api/admin/students", requireAdmin, async (req: Request, res: Response) => {
  const allUsers = await db.query.users.findMany({
    where: eq(users.role, "student"),
    orderBy: desc(users.createdAt),
  });
  res.json(allUsers);
});

app.get("/api/admin/students/:id/analytics", requireAdmin, async (req: Request, res: Response) => {
  const userId = req.params.id;
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
  
  const goalsData = await db.query.goals.findMany({
    where: eq(goals.userId, userId),
  });
  
  // ... more analytics data
  
  res.json({ user, profile, goals: goalsData, progressRecords, stats });
});
```

### Student Detail Screen

**File:** `client/src/pages/student-detail.tsx`

**Route:** `/students/:id`

**Access:** Admin only

**What it shows:**
- Comprehensive student profile
- All student goals with progress
- Skills and progress records
- Opportunity applications
- Academic modules taken
- Performance analytics

### Careers Management

**File:** `client/src/pages/careers.tsx` (Admin view)

**Route:** `/careers`

**Access:** Admin can create/edit/delete

#### Create Career
```typescript
const createCareerMutation = useMutation({
  mutationFn: async (data: any) => {
    return await apiRequest("POST", "/api/careers", data);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/careers"] });
    toast({ title: "Career created successfully" });
    setIsCreateDialogOpen(false);
  },
});
```
**Backend:**
```typescript
app.post("/api/careers", requireAdmin, async (req: Request, res: Response) => {
  const [career] = await db.insert(careers).values(req.body).returning();
  res.json(career);
});
```
**What it does:**
- Opens dialog with form
- Creates new career path
- Sets title, description, required skills, salary range
- Adds learning path and recommended tools

#### Edit Career
```typescript
const updateCareerMutation = useMutation({
  mutationFn: async ({ id, data }: { id: string; data: any }) => {
    return await apiRequest("PUT", `/api/careers/${id}`, data);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/careers"] });
    toast({ title: "Career updated successfully" });
  },
});
```
**Backend:**
```typescript
app.put("/api/careers/:id", requireAdmin, async (req: Request, res: Response) => {
  const [career] = await db.update(careers)
    .set(req.body)
    .where(eq(careers.id, req.params.id))
    .returning();
  res.json(career);
});
```

#### Delete Career
```typescript
const deleteCareerMutation = useMutation({
  mutationFn: async (id: string) => {
    return await apiRequest("DELETE", `/api/careers/${id}`);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/careers"] });
    toast({ title: "Career deleted successfully" });
  },
});
```
**Backend:**
```typescript
app.delete("/api/careers/:id", requireAdmin, async (req: Request, res: Response) => {
  await db.delete(careers).where(eq(careers.id, req.params.id));
  res.json({ message: "Career deleted" });
});
```

### Opportunities Management

**File:** `client/src/pages/opportunities.tsx` (Admin view)

**Route:** `/opportunities`

**Access:** Admin can create/edit/delete, Students can view/save/apply

#### Create Opportunity (Admin)
```typescript
const createOpportunityMutation = useMutation({
  mutationFn: async (data: any) => {
    return await apiRequest("POST", "/api/opportunities", data);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
    toast({ title: "Opportunity created successfully" });
  },
});
```
**Backend:**
```typescript
app.post("/api/opportunities", requireAdmin, async (req: Request, res: Response) => {
  const [opportunity] = await db.insert(opportunities).values(req.body).returning();
  res.json(opportunity);
});
```
**What it does:**
- Creates internship or job posting
- Sets company, location, type, skills required
- Sets application deadline
- Can mark as active/inactive

#### Edit Opportunity (Admin)
```typescript
app.put("/api/opportunities/:id", requireAdmin, async (req: Request, res: Response) => {
  const [opportunity] = await db.update(opportunities)
    .set(req.body)
    .where(eq(opportunities.id, req.params.id))
    .returning();
  res.json(opportunity);
});
```

#### Delete Opportunity (Admin)
```typescript
app.delete("/api/opportunities/:id", requireAdmin, async (req: Request, res: Response) => {
  await db.delete(opportunities).where(eq(opportunities.id, req.params.id));
  res.json({ message: "Opportunity deleted" });
});
```

### Resources Management

**File:** `client/src/pages/resources.tsx` (Admin view)

**Route:** `/resources`

**Access:** Admin can create/edit/delete, Students can view/download

#### Create Resource (Admin)
```typescript
app.post("/api/resources", requireAdmin, async (req: Request, res: Response) => {
  const [resource] = await db.insert(resources).values(req.body).returning();
  res.json(resource);
});
```
**What it does:**
- Creates learning resource
- Sets title, description, category, resource URL
- Marks as free or premium
- Can add to training programs

#### Create Training Program (Admin)
```typescript
app.post("/api/training-programs", requireAdmin, async (req: Request, res: Response) => {
  const [program] = await db.insert(trainingPrograms).values(req.body).returning();
  res.json(program);
});
```
**What it does:**
- Creates structured training program
- Links multiple resources
- Sets duration and skill level
- Organizes learning paths

---

## Student Functions & Screens

### Student Dashboard

**File:** `client/src/pages/dashboard.tsx`

**Route:** `/` (default for students)

**Access:** Any authenticated student

#### Dashboard Stats Query
```typescript
const { data: stats } = useQuery({
  queryKey: ["/api/dashboard/my-stats"],
});
```
**Backend:**
```typescript
app.get("/api/dashboard/my-stats", requireAuth, async (req: Request, res: Response) => {
  const userId = req.session.userId!;
  
  const goalsData = await db.query.goals.findMany({
    where: eq(goals.userId, userId),
  });
  
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
  
  const activeGoals = goalsData.filter(g => g.status === "in_progress").length;
  const completedGoals = goalsData.filter(g => g.status === "completed").length;
  const skillsCount = profile?.skills?.length || 0;
  const overallProgress = goalsData.length > 0 
    ? Math.round(goalsData.reduce((sum, g) => sum + (g.progress || 0), 0) / goalsData.length) 
    : 0;
  
  res.json({ activeGoals, completedGoals, skillsCount, overallProgress });
});
```
**What it does:**
- Shows personal stats: active goals, completed goals, skills count
- Displays overall progress percentage
- Shows recent goals list
- Lists recommended careers (top 3)
- Shows latest opportunities
- Displays student ranking position

#### Student Ranking
```typescript
const { data: ranking } = useQuery<RankingResponse>({
  queryKey: ["/api/students/ranking"],
});
```
**Backend:**
```typescript
app.get("/api/students/ranking", requireAuth, async (req: Request, res: Response) => {
  const allUsers = await db.query.users.findMany({
    where: eq(users.role, "student"),
  });
  
  // For each user, calculate score based on:
  // - Completed goals
  // - Skills count
  // - Overall progress
  // - GPA
  
  const leaderboard = // ... calculate and sort
  
  res.json({
    leaderboard: leaderboard.slice(0, 5), // Top 5
    currentUser: currentUserRanking,
    total: allUsers.length,
  });
});
```
**What it shows:**
- Student's current rank
- Score breakdown
- Surrounding students (rank ±2)
- Comparison metrics

### Profile Management

**File:** `client/src/pages/profile.tsx`

**Route:** `/profile`

**Access:** Any authenticated user

#### Fetch Profile
```typescript
const { data: profile } = useQuery({
  queryKey: ["/api/profile"],
});
```
**Backend:**
```typescript
app.get("/api/profile", requireAuth, async (req: Request, res: Response) => {
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, req.session.userId!),
  });
  res.json(profile || {});
});
```

#### Update Profile
```typescript
const updateProfileMutation = useMutation({
  mutationFn: async (data: any) => {
    return await apiRequest("PUT", "/api/profile", data);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    toast({ title: "Profile updated successfully" });
  },
});
```
**Backend:**
```typescript
app.put("/api/profile", requireAuth, async (req: Request, res: Response) => {
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.userId, req.session.userId!),
  });

  if (existing) {
    const [updated] = await db.update(profiles)
      .set(req.body)
      .where(eq(profiles.userId, req.session.userId!))
      .returning();
    res.json(updated);
  } else {
    const [created] = await db.insert(profiles)
      .values({ userId: req.session.userId!, ...req.body })
      .returning();
    res.json(created);
  }
});
```
**What it does:**
- Edit personal info: bio, GPA
- Manage skills array (add/remove)
- Set interests and career preferences
- Add certifications
- List subjects taken
- Upload resume URL

### Goals Management

**File:** `client/src/pages/goals.tsx`

**Route:** `/goals`

**Access:** Authenticated students

#### Fetch Goals
```typescript
const { data: goals = [] } = useQuery<Goal[]>({
  queryKey: ["/api/goals"],
});
```
**Backend:**
```typescript
app.get("/api/goals", requireAuth, async (req: Request, res: Response) => {
  const userGoals = await db.query.goals.findMany({
    where: eq(goals.userId, req.session.userId!),
    orderBy: desc(goals.createdAt),
  });
  res.json(userGoals);
});
```

#### Create Goal
```typescript
const createGoalMutation = useMutation({
  mutationFn: async (data: any) => {
    return await apiRequest("POST", "/api/goals", data);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    toast({ title: "Goal created successfully" });
  },
});
```
**Backend:**
```typescript
app.post("/api/goals", requireAuth, async (req: Request, res: Response) => {
  const [goal] = await db.insert(goals)
    .values({ userId: req.session.userId!, ...req.body })
    .returning();
  res.json(goal);
});
```
**What it does:**
- Creates SMART goal (Specific, Measurable, Achievable, Relevant, Time-bound)
- Sets goal type: short-term or long-term
- Initializes progress at 0%
- Sets target date

#### Update Goal Progress
```typescript
const updateGoalMutation = useMutation({
  mutationFn: async ({ id, data }: { id: string; data: any }) => {
    return await apiRequest("PATCH", `/api/goals/${id}`, data);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    toast({ title: "Goal updated successfully" });
  },
});
```
**Backend:**
```typescript
app.patch("/api/goals/:id", requireAuth, async (req: Request, res: Response) => {
  const [goal] = await db.update(goals)
    .set(req.body)
    .where(and(eq(goals.id, req.params.id), eq(goals.userId, req.session.userId!)))
    .returning();
  res.json(goal);
});
```
**What it does:**
- Updates progress percentage (0-100)
- Can change status: in_progress, completed, cancelled
- Updates SMART fields
- When completed, can update profile skills

#### Delete Goal
```typescript
app.delete("/api/goals/:id", requireAuth, async (req: Request, res: Response) => {
  await db.delete(goals)
    .where(and(eq(goals.id, req.params.id), eq(goals.userId, req.session.userId!)));
  res.json({ message: "Goal deleted" });
});
```

### Careers Explorer (Student View)

**File:** `client/src/pages/careers.tsx` (Student view)

**Route:** `/careers`

**Access:** Any authenticated user

#### View All Careers
```typescript
const { data: careers = [] } = useQuery<Career[]>({
  queryKey: ["/api/careers"],
});
```
**Backend:**
```typescript
app.get("/api/careers", async (req: Request, res: Response) => {
  const allCareers = await db.query.careers.findMany();
  res.json(allCareers);
});
```
**What students see:**
- Browse all career paths
- View career cards with title, description
- See required skills, recommended tools
- View salary range and industry
- Click to see detailed view

#### View Career Details
```typescript
const { data: career } = useQuery<Career>({
  queryKey: [`/api/careers/${careerId}`],
  enabled: !!careerId,
});
```
**What it shows:**
- Full career overview
- Complete skills list
- Learning path/roadmap
- Recommended tools and technologies
- Related opportunities

### Opportunities (Student View)

**File:** `client/src/pages/opportunities.tsx` (Student view)

**Route:** `/opportunities`

**Access:** Authenticated students

#### Browse Opportunities
```typescript
const { data: opportunities = [] } = useQuery<Opportunity[]>({
  queryKey: ["/api/opportunities"],
});
```
**Backend:**
```typescript
app.get("/api/opportunities", async (req: Request, res: Response) => {
  const allOpportunities = await db.query.opportunities.findMany({
    where: eq(opportunities.isActive, true),
    orderBy: desc(opportunities.createdAt),
  });
  res.json(allOpportunities);
});
```
**What students see:**
- List of active internships and jobs
- Filter by type (internship/job)
- Search by company or title
- See required skills and location
- View application deadline

#### Save Opportunity (Bookmark)
```typescript
const saveOpportunityMutation = useMutation({
  mutationFn: async (opportunityId: string) => {
    return await apiRequest("POST", `/api/opportunities/${opportunityId}/save`);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/opportunities/saved"] });
    toast({ title: "Opportunity saved" });
  },
});
```
**Backend:**
```typescript
app.post("/api/opportunities/:id/save", requireAuth, async (req: Request, res: Response) => {
  const existing = await db.query.savedOpportunities.findFirst({
    where: and(
      eq(savedOpportunities.userId, req.session.userId!),
      eq(savedOpportunities.opportunityId, req.params.id)
    ),
  });

  if (existing) {
    return res.status(400).json({ error: "Already saved" });
  }

  const [saved] = await db.insert(savedOpportunities)
    .values({
      userId: req.session.userId!,
      opportunityId: req.params.id,
    })
    .returning();
  res.json(saved);
});
```
**What it does:**
- Bookmarks opportunity for later
- Prevents duplicate saves
- Shows in "Saved" tab

#### Apply to Opportunity
```typescript
const applyMutation = useMutation({
  mutationFn: async (data: {
    opportunityId: string;
    resumeUrl: string;
    coverLetter?: string;
  }) => {
    return await apiRequest("POST", `/api/opportunities/${data.opportunityId}/apply`, {
      resumeUrl: data.resumeUrl,
      coverLetter: data.coverLetter,
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/opportunity-applications/mine"] });
    toast({ title: "Application submitted successfully" });
  },
});
```
**Backend:**
```typescript
app.post("/api/opportunities/:id/apply", requireAuth, async (req: Request, res: Response) => {
  const { resumeUrl, coverLetter, profilePictureUrl } = req.body;

  // Check if already applied
  const existing = await db.query.opportunityApplications.findFirst({
    where: and(
      eq(opportunityApplications.userId, req.session.userId!),
      eq(opportunityApplications.opportunityId, req.params.id)
    ),
  });

  if (existing) {
    return res.status(400).json({ error: "Already applied" });
  }

  const [application] = await db.insert(opportunityApplications)
    .values({
      userId: req.session.userId!,
      opportunityId: req.params.id,
      resumeUrl,
      coverLetter,
      profilePictureUrl,
      status: "pending",
    })
    .returning();
  res.json(application);
});
```
**What it does:**
- Submits application with resume
- Optional cover letter
- Optional profile picture
- Prevents duplicate applications
- Status starts as "pending"

#### View My Applications
```typescript
const { data: myApplications = [] } = useQuery({
  queryKey: ["/api/opportunity-applications/mine"],
});
```
**Backend:**
```typescript
app.get("/api/opportunity-applications/mine", requireAuth, async (req: Request, res: Response) => {
  const applications = await db.query.opportunityApplications.findMany({
    where: eq(opportunityApplications.userId, req.session.userId!),
    with: { opportunity: true },
    orderBy: desc(opportunityApplications.appliedAt),
  });
  res.json(applications);
});
```
**What students see:**
- All their applications
- Application status (pending, reviewed, accepted, rejected)
- Linked opportunity details
- Application date

### Academic Alignment

**File:** `client/src/pages/academic.tsx`

**Route:** `/academic`

**Access:** Authenticated students

#### View Academic Modules
```typescript
const { data: modules = [] } = useQuery({
  queryKey: ["/api/academic-modules"],
});
```
**Backend:**
```typescript
app.get("/api/academic-modules", async (req: Request, res: Response) => {
  const modules = await db.query.academicModules.findMany();
  res.json(modules);
});
```
**What it shows:**
- Computer Engineering curriculum
- Course modules by year level
- Prerequisites for each module
- Career alignments
- Skills developed per module

### Resources (Student View)

**File:** `client/src/pages/resources.tsx` (Student view)

**Route:** `/resources`

**Access:** Authenticated students

#### Browse Resources
```typescript
const { data: resources = [] } = useQuery({
  queryKey: ["/api/resources"],
});

const { data: programs = [] } = useQuery({
  queryKey: ["/api/training-programs"],
});
```
**Backend:**
```typescript
app.get("/api/resources", async (req: Request, res: Response) => {
  const allResources = await db.query.resources.findMany();
  res.json(allResources);
});

app.get("/api/training-programs", async (req: Request, res: Response) => {
  const allPrograms = await db.query.trainingPrograms.findMany();
  res.json(allPrograms);
});
```
**What students see:**
- Learning resources (articles, videos, courses)
- Filter by category and skill level
- Free vs premium resources
- Training programs with multiple resources
- Download/view resources

#### Track Resource Download
```typescript
app.post("/api/resources/:id/download", requireAuth, async (req: Request, res: Response) => {
  // Track that user downloaded/viewed resource
  // Can be used for analytics
  res.json({ message: "Download tracked" });
});
```

### Progress Tracking

**File:** `client/src/pages/progress.tsx`

**Route:** `/progress`

**Access:** Authenticated students

#### View Progress Records
```typescript
const { data: progressRecords = [] } = useQuery({
  queryKey: ["/api/progress"],
});
```
**Backend:**
```typescript
app.get("/api/progress", requireAuth, async (req: Request, res: Response) => {
  const records = await db.query.progressRecords.findMany({
    where: eq(progressRecords.userId, req.session.userId!),
    orderBy: desc(progressRecords.updatedAt),
  });
  res.json(records);
});
```
**What it shows:**
- Skill development over time
- Skill levels (1-5)
- Progress charts and graphs
- Last updated dates
- Comparison with goals

---

## Route Protection

### Frontend Route Guards

**File:** `client/src/App.tsx`

#### ProtectedRoute Component
```typescript
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component />;
}
```
**What it does:**
- Shows loading spinner while checking auth
- Redirects to login if not authenticated
- Renders protected component if authenticated
- Used for all student/user routes

#### AdminRoute Component
```typescript
function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Redirect to="/" />;
  }

  return <Component />;
}
```
**What it does:**
- Checks authentication first
- Verifies user has admin role
- Redirects non-admins to dashboard
- Used for admin-only routes

#### PublicRoute Component
```typescript
function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Redirect to="/" />;
  }

  return <Component />;
}
```
**What it does:**
- Only allows non-authenticated users
- Redirects authenticated users to dashboard
- Used for login/register page

#### Route Configuration
```typescript
function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      {/* Root route - role-based redirect */}
      <Route path="/" component={() => {
        if (!user) return <Redirect to="/auth" />;
        return user.role === "admin" 
          ? <Redirect to="/admin" /> 
          : <ProtectedRoute component={DashboardPage} />;
      }} />
      
      {/* Public route */}
      <Route path="/auth" component={() => <PublicRoute component={AuthPage} />} />
      
      {/* Student routes */}
      <Route path="/profile" component={() => <ProtectedRoute component={ProfilePage} />} />
      <Route path="/goals" component={() => <ProtectedRoute component={GoalsPage} />} />
      <Route path="/careers" component={() => <ProtectedRoute component={CareersPage} />} />
      <Route path="/opportunities" component={() => <ProtectedRoute component={OpportunitiesPage} />} />
      <Route path="/resources" component={() => <ProtectedRoute component={ResourcesPage} />} />
      <Route path="/progress" component={() => <ProtectedRoute component={ProgressPage} />} />
      <Route path="/academic" component={() => <ProtectedRoute component={AcademicPage} />} />
      
      {/* Admin routes */}
      <Route path="/admin" component={() => <AdminRoute component={AdminPage} />} />
      <Route path="/students" component={() => <AdminRoute component={StudentsPage} />} />
      <Route path="/students/:id" component={() => <AdminRoute component={StudentDetailPage} />} />
      
      <Route component={NotFound} />
    </Switch>
  );
}
```

### Navigation Sidebar

**File:** `client/src/components/app-sidebar.tsx`

#### Student Navigation
```typescript
const studentMenuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Academic Alignment", url: "/academic", icon: GraduationCap },
  { title: "Careers", url: "/careers", icon: Briefcase },
  { title: "Opportunities", url: "/opportunities", icon: Building2 },
  { title: "Resources", url: "/resources", icon: BookOpen },
  { title: "Progress", url: "/progress", icon: TrendingUp },
];
```

#### Admin Navigation
```typescript
const adminMenuItems = [
  { title: "Admin Dashboard", url: "/admin", icon: Shield },
  { title: "Students", url: "/students", icon: Users },
  { title: "Careers", url: "/careers", icon: Briefcase },
  { title: "Opportunities", url: "/opportunities", icon: Building2 },
  { title: "Resources", url: "/resources", icon: BookOpen },
];
```

#### Role-Based Sidebar
```typescript
export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === "admin";
  const menuItems = isAdmin ? adminMenuItems : studentMenuItems;

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/">
          <TrendingUp className="h-5 w-5" />
          Future Flow
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={location === item.url}
              >
                <Link href={item.url}>
                  <item.icon />
                  {item.title}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter>
        <Button onClick={logout}>
          <LogOut /> Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
```

---

## Database Schema

**File:** `shared/schema.ts`

### Users Table
```typescript
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("student"), // 'admin' | 'student'
  yearLevel: integer("year_level"),
  course: text("course").default("Computer Engineering"),
  avatarUrl: text("avatar_url"),
});
```
**Purpose:** Main user authentication and role management

### Profiles Table
```typescript
export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gpa: real("gpa"),
  skills: text("skills").array(),
  interests: text("interests").array(),
  careerPreferences: text("career_preferences").array(),
  certifications: text("certifications").array(),
  subjectsTaken: text("subjects_taken").array(),
  resumeUrl: text("resume_url"),
  bio: text("bio"),
});
```
**Purpose:** Extended student profile information

### Goals Table
```typescript
export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'short-term' | 'long-term'
  specific: text("specific"),
  measurable: text("measurable"),
  achievable: text("achievable"),
  relevant: text("relevant"),
  timeBound: text("time_bound"),
  progress: integer("progress").default(0), // 0-100
  status: text("status").default("in_progress"), // 'in_progress' | 'completed' | 'cancelled'
  targetDate: timestamp("target_date"),
  createdAt: timestamp("created_at").defaultNow(),
});
```
**Purpose:** SMART goal tracking for students

### Careers Table
```typescript
export const careers = pgTable("careers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  overview: text("overview"),
  requiredSkills: text("required_skills").array(),
  recommendedTools: text("recommended_tools").array(),
  salaryRange: text("salary_range"),
  industry: text("industry"),
  learningPath: jsonb("learning_path"),
  icon: text("icon"),
});
```
**Purpose:** Career path information

### Opportunities Table
```typescript
export const opportunities = pgTable("opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  company: text("company").notNull(),
  description: text("description").notNull(),
  location: text("location"),
  type: text("type").notNull(), // 'internship' | 'job'
  industry: text("industry"),
  requiredSkills: text("required_skills").array(),
  applicationUrl: text("application_url"),
  deadline: timestamp("deadline"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});
```
**Purpose:** Internship and job postings

### Opportunity Applications Table
```typescript
export const opportunityApplications = pgTable("opportunity_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  opportunityId: varchar("opportunity_id").notNull().references(() => opportunities.id),
  profilePictureUrl: text("profile_picture_url"),
  resumeUrl: text("resume_url").notNull(),
  coverLetter: text("cover_letter"),
  status: text("status").default("pending"), // 'pending' | 'reviewed' | 'accepted' | 'rejected'
  appliedAt: timestamp("applied_at").defaultNow(),
});
```
**Purpose:** Student applications to opportunities

---

## Summary

### Admin Capabilities
- **Authentication:** Login with admin credentials (created via seed)
- **Dashboard:** View system statistics, user growth, top students
- **Students:** View all students, search, view analytics, delete accounts
- **Careers:** Create, edit, delete career paths
- **Opportunities:** Create, edit, delete opportunities
- **Resources:** Create, edit, delete resources and training programs
- **Full Access:** Can view but also manage all content

### Student Capabilities
- **Authentication:** Register new account, login
- **Dashboard:** Personal overview, goals progress, recommendations, ranking
- **Profile:** Manage GPA, skills, interests, certifications, resume
- **Goals:** Create SMART goals, track progress, complete goals
- **Careers:** Browse careers, view requirements, explore learning paths
- **Opportunities:** Browse, save, apply with resume and cover letter
- **Resources:** Access learning materials, training programs
- **Progress:** Track skill development over time
- **Academic:** View curriculum alignment with careers

### Key Differences
| Feature | Admin | Student |
|---------|-------|---------|
| Content Management | Full CRUD | View only |
| User Management | Can delete students | Manage own profile |
| Dashboard Focus | System-wide analytics | Personal progress |
| Default Landing | `/admin` | `/` (dashboard) |
| Navigation Items | 5 items | 8 items |
