import express, { type Request, Response, NextFunction } from "express";
import { db } from "./db";
import { 
  users, careers, opportunities, goals, resources, trainingPrograms,
  profiles, savedOpportunities, progressRecords, academicModules, opportunityApplications
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { storage } from "./storage";

// Middleware to check authentication
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

// Middleware to check admin role
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

export function registerRoutes(app: express.Application) {
  // ========== AUTH ROUTES ==========
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
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
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user || password !== user.password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      req.session.userId = user.id;
      res.json({ user });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

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

  // ========== CAREERS CRUD ==========
  app.get("/api/careers", async (req: Request, res: Response) => {
    try {
      const allCareers = await db.query.careers.findMany();
      res.json(allCareers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch careers" });
    }
  });

  app.get("/api/careers/recommended", requireAuth, async (req: Request, res: Response) => {
    try {
      const allCareers = await db.query.careers.findMany();
      res.json(allCareers.slice(0, 3)); // Return top 3 for now
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recommended careers" });
    }
  });

  app.get("/api/careers/:id", async (req: Request, res: Response) => {
    try {
      const career = await db.query.careers.findFirst({
        where: eq(careers.id, req.params.id),
      });
      if (!career) {
        return res.status(404).json({ error: "Career not found" });
      }
      res.json(career);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch career" });
    }
  });

  app.post("/api/careers", requireAdmin, async (req: Request, res: Response) => {
    try {
      const [career] = await db.insert(careers).values(req.body).returning();
      res.json(career);
    } catch (error) {
      res.status(500).json({ error: "Failed to create career" });
    }
  });

  app.put("/api/careers/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const [career] = await db.update(careers)
        .set(req.body)
        .where(eq(careers.id, req.params.id))
        .returning();
      res.json(career);
    } catch (error) {
      res.status(500).json({ error: "Failed to update career" });
    }
  });

  app.patch("/api/careers/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const [career] = await db.update(careers)
        .set(req.body)
        .where(eq(careers.id, req.params.id))
        .returning();
      res.json(career);
    } catch (error) {
      res.status(500).json({ error: "Failed to update career" });
    }
  });

  app.delete("/api/careers/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(careers).where(eq(careers.id, req.params.id));
      res.json({ message: "Career deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete career" });
    }
  });

  // ========== OPPORTUNITIES CRUD ==========
  app.get("/api/opportunities", async (req: Request, res: Response) => {
    try {
      const allOpportunities = await db.query.opportunities.findMany({
        where: eq(opportunities.isActive, true),
        orderBy: desc(opportunities.createdAt),
      });
      res.json(allOpportunities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch opportunities" });
    }
  });

  // All specific routes MUST come before /:id route
  app.get("/api/opportunities/latest", async (req: Request, res: Response) => {
    try {
      const latest = await db.query.opportunities.findMany({
        where: eq(opportunities.isActive, true),
        orderBy: desc(opportunities.createdAt),
        limit: 3,
      });
      res.json(latest);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch opportunities" });
    }
  });

  // Get saved opportunities for current user
  app.get("/api/opportunities/saved", requireAuth, async (req: Request, res: Response) => {
    try {
      const saved = await db.query.savedOpportunities.findMany({
        where: eq(savedOpportunities.userId, req.session.userId!),
        with: {
          opportunity: true,
        },
      });
      res.json(saved.map(s => s.opportunity));
    } catch (error) {
      console.error("Error fetching saved opportunities:", error);
      res.status(500).json({ error: "Failed to fetch saved opportunities" });
    }
  });

  // Get user's applications (separate endpoint to avoid route conflicts)
  app.get("/api/opportunity-applications/mine", requireAuth, async (req: Request, res: Response) => {
    try {
      const applications = await db.query.opportunityApplications.findMany({
        where: eq(opportunityApplications.userId, req.session.userId!),
        with: {
          opportunity: true,
        },
        orderBy: desc(opportunityApplications.appliedAt),
      });
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  // Now the :id route - this catches everything else
  app.get("/api/opportunities/:id", async (req: Request, res: Response) => {
    try {
      const opportunity = await db.query.opportunities.findFirst({
        where: eq(opportunities.id, req.params.id),
      });
      if (!opportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      res.json(opportunity);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch opportunity" });
    }
  });

  app.post("/api/opportunities", requireAdmin, async (req: Request, res: Response) => {
    try {
      const [opportunity] = await db.insert(opportunities).values(req.body).returning();
      res.json(opportunity);
    } catch (error) {
      res.status(500).json({ error: "Failed to create opportunity" });
    }
  });

  app.put("/api/opportunities/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const [opportunity] = await db.update(opportunities)
        .set(req.body)
        .where(eq(opportunities.id, req.params.id))
        .returning();
      res.json(opportunity);
    } catch (error) {
      res.status(500).json({ error: "Failed to update opportunity" });
    }
  });

  app.patch("/api/opportunities/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const [opportunity] = await db.update(opportunities)
        .set(req.body)
        .where(eq(opportunities.id, req.params.id))
        .returning();
      res.json(opportunity);
    } catch (error) {
      res.status(500).json({ error: "Failed to update opportunity" });
    }
  });

  app.delete("/api/opportunities/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(opportunities).where(eq(opportunities.id, req.params.id));
      res.json({ message: "Opportunity deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete opportunity" });
    }
  });

  // Save/unsave opportunity
  app.post("/api/opportunities/:id/save", requireAuth, async (req: Request, res: Response) => {
    try {
      // Check if already saved
      const existing = await db.query.savedOpportunities.findFirst({
        where: and(
          eq(savedOpportunities.userId, req.session.userId!),
          eq(savedOpportunities.opportunityId, req.params.id)
        ),
      });

      if (existing) {
        return res.status(400).json({ error: "Already saved" });
      }

      const [saved] = await db.insert(savedOpportunities).values({
        userId: req.session.userId!,
        opportunityId: req.params.id,
      }).returning();

      res.json(saved);
    } catch (error) {
      res.status(500).json({ error: "Failed to save opportunity" });
    }
  });

  app.delete("/api/opportunities/:id/save", requireAuth, async (req: Request, res: Response) => {
    try {
      await db.delete(savedOpportunities)
        .where(and(
          eq(savedOpportunities.userId, req.session.userId!),
          eq(savedOpportunities.opportunityId, req.params.id)
        ));
      res.json({ message: "Removed from saved" });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove from saved" });
    }
  });

  // Apply for opportunity
  app.post("/api/opportunities/:id/apply", requireAuth, async (req: Request, res: Response) => {
    try {
      const { profilePictureUrl, resumeUrl, coverLetter } = req.body;

      // Check if already applied
      const existing = await db.query.opportunityApplications.findFirst({
        where: and(
          eq(opportunityApplications.userId, req.session.userId!),
          eq(opportunityApplications.opportunityId, req.params.id)
        ),
      });

      if (existing) {
        return res.status(400).json({ error: "You have already applied to this opportunity" });
      }

      const [application] = await db.insert(opportunityApplications).values({
        userId: req.session.userId!,
        opportunityId: req.params.id,
        profilePictureUrl,
        resumeUrl,
        coverLetter,
        status: "pending",
      }).returning();

      res.json(application);
    } catch (error) {
      console.error("Application error:", error);
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  // ========== RESOURCES CRUD ==========
  app.get("/api/resources", async (req: Request, res: Response) => {
    try {
      const allResources = await db.query.resources.findMany({
        orderBy: desc(resources.createdAt),
      });
      res.json(allResources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch resources" });
    }
  });

  app.get("/api/resources/:id", async (req: Request, res: Response) => {
    try {
      const resource = await db.query.resources.findFirst({
        where: eq(resources.id, req.params.id),
      });
      if (!resource) {
        return res.status(404).json({ error: "Resource not found" });
      }
      res.json(resource);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch resource" });
    }
  });

  app.post("/api/resources", requireAdmin, async (req: Request, res: Response) => {
    try {
      const [resource] = await db.insert(resources).values(req.body).returning();
      res.json(resource);
    } catch (error) {
      res.status(500).json({ error: "Failed to create resource" });
    }
  });

  app.put("/api/resources/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const [resource] = await db.update(resources)
        .set(req.body)
        .where(eq(resources.id, req.params.id))
        .returning();
      res.json(resource);
    } catch (error) {
      res.status(500).json({ error: "Failed to update resource" });
    }
  });

  app.delete("/api/resources/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(resources).where(eq(resources.id, req.params.id));
      res.json({ message: "Resource deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete resource" });
    }
  });

  // Increment resource download count
  app.post("/api/resources/:id/download", requireAuth, async (req: Request, res: Response) => {
    try {
      await storage.incrementResourceDownload(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to track download" });
    }
  });

  // ========== TRAINING PROGRAMS CRUD ==========
  app.get("/api/training-programs", async (req: Request, res: Response) => {
    try {
      const programs = await db.query.trainingPrograms.findMany({
        where: eq(trainingPrograms.isActive, true),
      });
      res.json(programs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch training programs" });
    }
  });

  app.get("/api/training-programs/:id", async (req: Request, res: Response) => {
    try {
      const program = await db.query.trainingPrograms.findFirst({
        where: eq(trainingPrograms.id, req.params.id),
      });
      if (!program) {
        return res.status(404).json({ error: "Training program not found" });
      }
      res.json(program);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch training program" });
    }
  });

  app.post("/api/training-programs", requireAdmin, async (req: Request, res: Response) => {
    try {
      const [program] = await db.insert(trainingPrograms).values(req.body).returning();
      res.json(program);
    } catch (error) {
      res.status(500).json({ error: "Failed to create training program" });
    }
  });

  app.put("/api/training-programs/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const [program] = await db.update(trainingPrograms)
        .set(req.body)
        .where(eq(trainingPrograms.id, req.params.id))
        .returning();
      res.json(program);
    } catch (error) {
      res.status(500).json({ error: "Failed to update training program" });
    }
  });

  app.delete("/api/training-programs/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(trainingPrograms).where(eq(trainingPrograms.id, req.params.id));
      res.json({ message: "Training program deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete training program" });
    }
  });

  // ========== ACADEMIC MODULES CRUD (Student-specific) ==========
  app.get("/api/academic-modules", requireAuth, async (req: Request, res: Response) => {
    try {
      const modules = await db.query.academicModules.findMany({
        where: eq(academicModules.userId, req.session.userId!),
      });
      res.json(modules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch academic modules" });
    }
  });

  app.post("/api/academic-modules", requireAuth, async (req: Request, res: Response) => {
    try {
      const [module] = await db.insert(academicModules).values({
        ...req.body,
        userId: req.session.userId,
      }).returning();
      res.json(module);
    } catch (error) {
      res.status(500).json({ error: "Failed to create academic module" });
    }
  });

  app.put("/api/academic-modules/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const [module] = await db.update(academicModules)
        .set(req.body)
        .where(and(
          eq(academicModules.id, req.params.id),
          eq(academicModules.userId, req.session.userId!)
        ))
        .returning();
      res.json(module);
    } catch (error) {
      res.status(500).json({ error: "Failed to update academic module" });
    }
  });

  app.delete("/api/academic-modules/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      await db.delete(academicModules).where(and(
        eq(academicModules.id, req.params.id),
        eq(academicModules.userId, req.session.userId!)
      ));
      res.json({ message: "Academic module deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete academic module" });
    }
  });

  // ========== GOALS CRUD (Student-specific) ==========
  app.get("/api/goals", requireAuth, async (req: Request, res: Response) => {
    try {
      const userGoals = await db.query.goals.findMany({
        where: eq(goals.userId, req.session.userId!),
        orderBy: desc(goals.createdAt),
      });
      res.json(userGoals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.get("/api/goals/recent", requireAuth, async (req: Request, res: Response) => {
    try {
      const recentGoals = await db.query.goals.findMany({
        where: eq(goals.userId, req.session.userId!),
        orderBy: desc(goals.createdAt),
        limit: 3,
      });
      res.json(recentGoals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", requireAuth, async (req: Request, res: Response) => {
    try {
      const [goal] = await db.insert(goals).values({
        ...req.body,
        userId: req.session.userId,
      }).returning();
      res.json(goal);
    } catch (error) {
      res.status(500).json({ error: "Failed to create goal" });
    }
  });

  app.put("/api/goals/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const [goal] = await db.update(goals)
        .set(req.body)
        .where(and(
          eq(goals.id, req.params.id),
          eq(goals.userId, req.session.userId!)
        ))
        .returning();
      res.json(goal);
    } catch (error) {
      res.status(500).json({ error: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      await db.delete(goals).where(and(
        eq(goals.id, req.params.id),
        eq(goals.userId, req.session.userId!)
      ));
      res.json({ message: "Goal deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete goal" });
    }
  });

  // ========== DASHBOARD STATS ==========
  app.get("/api/dashboard/stats", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.session.userId!),
      });

      if (user?.role === "admin") {
        const adminStats = await storage.getAdminStats();
        res.json({
          totalStudents: adminStats.totalUsers,
          totalCareers: adminStats.totalCareers,
          totalOpportunities: adminStats.totalOpportunities,
          totalResources: adminStats.totalResources,
        });
      } else {
        const stats = await storage.getDashboardStats(req.session.userId!);
        res.json(stats);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/students/ranking", requireAuth, async (req: Request, res: Response) => {
    try {
      const ranking = await storage.getStudentRanking(req.session.userId!);
      res.json(ranking);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch student ranking" });
    }
  });

  // ========== PROFILE ROUTES ==========
  app.get("/api/profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const userProfile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, req.session.userId!),
      });
      res.json(userProfile || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", requireAuth, async (req: Request, res: Response) => {
    try {
      // Update user name if provided
      if (req.body.name) {
        await db.update(users)
          .set({ name: req.body.name })
          .where(eq(users.id, req.session.userId!));
      }

      const existing = await db.query.profiles.findFirst({
        where: eq(profiles.userId, req.session.userId!),
      });

      // Convert GPA to number if it's a string
      const profileData = {
        ...req.body,
        gpa: req.body.gpa ? parseFloat(req.body.gpa) : undefined,
      };

      let result;
      if (existing) {
        const [updated] = await db.update(profiles)
          .set(profileData)
          .where(eq(profiles.userId, req.session.userId!))
          .returning();
        result = updated;
      } else {
        const [newProfile] = await db.insert(profiles).values({
          ...profileData,
          userId: req.session.userId,
        }).returning();
        result = newProfile;
      }

      // Auto-track new skills when added
      if (req.body.skills && Array.isArray(req.body.skills)) {
        const existingSkills = existing?.skills || [];
        const newSkills = req.body.skills.filter((s: string) => !existingSkills.includes(s));
        
        // Create initial progress records for new skills
        for (const skill of newSkills) {
          await db.insert(progressRecords).values({
            userId: req.session.userId,
            skillName: skill,
            level: 25, // Start at beginner level
          });
        }
      }

      res.json(result);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Get skill progress tracking
  app.get("/api/progress/skills", requireAuth, async (req: Request, res: Response) => {
    try {
      const records = await db.query.progressRecords.findMany({
        where: eq(progressRecords.userId, req.session.userId!),
        orderBy: desc(progressRecords.recordedAt),
      });
      
      // Get latest level for each skill
      const skillMap = new Map();
      records.forEach(record => {
        if (!skillMap.has(record.skillName)) {
          skillMap.set(record.skillName, record.level);
        }
      });
      
      res.json(Array.from(skillMap.entries()).map(([skillName, level]) => ({
        skillName,
        level
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch skill progress" });
    }
  });

  // Update skill level
  app.post("/api/progress/skills/:skillName", requireAuth, async (req: Request, res: Response) => {
    try {
      const { level } = req.body;
      await db.insert(progressRecords).values({
        userId: req.session.userId,
        skillName: req.params.skillName,
        level: parseInt(level),
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update skill level" });
    }
  });

  // ========== ADMIN STUDENT MANAGEMENT ==========
  // Get all students
  app.get("/api/admin/students", requireAdmin, async (req: Request, res: Response) => {
    try {
      const students = await db.query.users.findMany({
        where: eq(users.role, "student"),
      });
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  // Delete student (admin only)
  app.delete("/api/admin/students/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;

      // Check if student exists
      const student = await db.query.users.findFirst({
        where: eq(users.id, studentId),
      });

      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Delete related data in order of dependencies
      await db.delete(opportunityApplications).where(eq(opportunityApplications.userId, studentId));
      await db.delete(savedOpportunities).where(eq(savedOpportunities.userId, studentId));
      await db.delete(progressRecords).where(eq(progressRecords.userId, studentId));
      await db.delete(academicModules).where(eq(academicModules.userId, studentId));
      await db.delete(goals).where(eq(goals.userId, studentId));
      await db.delete(profiles).where(eq(profiles.userId, studentId));
      await db.delete(users).where(eq(users.id, studentId));

      res.json({ message: "Student deleted successfully" });
    } catch (error) {
      console.error("Failed to delete student:", error);
      res.status(500).json({ error: "Failed to delete student" });
    }
  });

  // Get specific student's profile (admin only)
  app.get("/api/admin/students/:id/profile", requireAdmin, async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;

      // Get user
      const user = await db.query.users.findFirst({
        where: eq(users.id, studentId),
      });

      if (!user) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Get profile
      const userProfile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, studentId),
      });

      // Include user info with profile
      res.json({
        ...userProfile,
        user: {
          name: user.name,
          email: user.email,
          yearLevel: user.yearLevel,
          course: user.course,
          avatarUrl: user.avatarUrl,
        }
      });
    } catch (error) {
      console.error("Failed to fetch student profile:", error);
      res.status(500).json({ error: "Failed to fetch student profile" });
    }
  });

  // Get student analytics
  app.get("/api/admin/students/:id/analytics", requireAdmin, async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;

      // Get user
      const user = await db.query.users.findFirst({
        where: eq(users.id, studentId),
      });

      if (!user) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Get profile
      const profile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, studentId),
      });

      // Get goals
      const studentGoals = await db.query.goals.findMany({
        where: eq(goals.userId, studentId),
        orderBy: [desc(goals.createdAt)],
      });

      // Get progress records
      const records = await db.query.progressRecords.findMany({
        where: eq(progressRecords.userId, studentId),
        orderBy: [desc(progressRecords.recordedAt)],
      });

      // Get latest level for each skill
      const skillMap = new Map();
      records.forEach(record => {
        if (!skillMap.has(record.skillName)) {
          skillMap.set(record.skillName, record);
        }
      });
      const latestRecords = Array.from(skillMap.values());

      // Calculate stats
      const totalGoals = studentGoals.length;
      const completedGoals = studentGoals.filter(g => g.status === "completed").length;
      const inProgressGoals = studentGoals.filter(g => g.status === "in-progress").length;
      const totalSkills = profile?.skills?.length || 0;
      const averageSkillLevel = latestRecords.length > 0
        ? latestRecords.reduce((sum, r) => sum + r.level, 0) / latestRecords.length
        : 0;

      res.json({
        user,
        profile,
        goals: studentGoals,
        progressRecords: latestRecords,
        stats: {
          totalGoals,
          completedGoals,
          inProgressGoals,
          totalSkills,
          averageSkillLevel,
        },
      });
    } catch (error) {
      console.error("Failed to fetch student analytics:", error);
      res.status(500).json({ error: "Failed to fetch student analytics" });
    }
  });
}

