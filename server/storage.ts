import { eq, desc, and, ilike, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users, profiles, goals, careers, opportunities, savedOpportunities,
  resources, progressRecords, academicModules, trainingPrograms,
  type User, type InsertUser,
  type Profile, type InsertProfile,
  type Goal, type InsertGoal,
  type Career, type InsertCareer,
  type Opportunity, type InsertOpportunity,
  type SavedOpportunity, type InsertSavedOpportunity,
  type Resource, type InsertResource,
  type ProgressRecord, type InsertProgressRecord,
  type AcademicModule, type InsertAcademicModule,
  type TrainingProgram, type InsertTrainingProgram,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // Profiles
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, data: Partial<InsertProfile>): Promise<Profile | undefined>;
  
  // Goals
  getGoals(userId: string): Promise<Goal[]>;
  getGoal(id: string): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, data: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<void>;
  getRecentGoals(userId: string, limit?: number): Promise<Goal[]>;
  
  // Careers
  getCareers(): Promise<Career[]>;
  getCareer(id: string): Promise<Career | undefined>;
  createCareer(career: InsertCareer): Promise<Career>;
  updateCareer(id: string, data: Partial<InsertCareer>): Promise<Career | undefined>;
  deleteCareer(id: string): Promise<void>;
  getRecommendedCareers(skills: string[], limit?: number): Promise<Career[]>;
  
  // Opportunities
  getOpportunities(filters?: { type?: string; industry?: string }): Promise<Opportunity[]>;
  getOpportunity(id: string): Promise<Opportunity | undefined>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  updateOpportunity(id: string, data: Partial<InsertOpportunity>): Promise<Opportunity | undefined>;
  deleteOpportunity(id: string): Promise<void>;
  getLatestOpportunities(limit?: number): Promise<Opportunity[]>;
  
  // Saved Opportunities
  getSavedOpportunities(userId: string): Promise<(SavedOpportunity & { opportunity: Opportunity })[]>;
  saveOpportunity(data: InsertSavedOpportunity): Promise<SavedOpportunity>;
  unsaveOpportunity(userId: string, opportunityId: string): Promise<void>;
  isOpportunitySaved(userId: string, opportunityId: string): Promise<boolean>;
  
  // Resources
  getResources(filters?: { type?: string; category?: string }): Promise<Resource[]>;
  getResource(id: string): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: string, data: Partial<InsertResource>): Promise<Resource | undefined>;
  deleteResource(id: string): Promise<void>;
  incrementResourceDownload(id: string): Promise<void>;
  
  // Progress Records
  getProgressRecords(userId: string): Promise<ProgressRecord[]>;
  createProgressRecord(record: InsertProgressRecord): Promise<ProgressRecord>;
  updateProgressRecord(id: string, data: Partial<InsertProgressRecord>): Promise<ProgressRecord | undefined>;
  
  // Academic Modules
  getAcademicModules(userId: string): Promise<AcademicModule[]>;
  createAcademicModule(module: InsertAcademicModule): Promise<AcademicModule>;
  updateAcademicModule(id: string, data: Partial<InsertAcademicModule>): Promise<AcademicModule | undefined>;
  deleteAcademicModule(id: string): Promise<void>;
  
  // Training Programs
  getTrainingPrograms(): Promise<TrainingProgram[]>;
  getTrainingProgram(id: string): Promise<TrainingProgram | undefined>;
  createTrainingProgram(program: InsertTrainingProgram): Promise<TrainingProgram>;
  
  // Dashboard Stats
  getDashboardStats(userId: string): Promise<{
    goalsCount: number;
    completedGoals: number;
    skillsCount: number;
    careersCount: number;
    overallProgress: number;
  }>;

  // Student Ranking
  getStudentRanking(viewerId: string): Promise<{
    leaderboard: Array<{
      userId: string;
      name: string;
      score: number;
      skillsCount: number;
      completedGoals: number;
      overallProgress: number;
      gpa: number | null;
      rank: number;
    }>;
    currentUser: {
      userId: string;
      name: string;
      score: number;
      skillsCount: number;
      completedGoals: number;
      overallProgress: number;
      gpa: number | null;
      rank: number;
    } | null;
    total: number;
  }>;
  
  // Admin Stats
  getAdminStats(): Promise<{
    totalUsers: number;
    totalGoals: number;
    totalOpportunities: number;
    totalResources: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  // Profiles
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async updateProfile(userId: string, data: Partial<InsertProfile>): Promise<Profile | undefined> {
    const [updated] = await db.update(profiles).set(data).where(eq(profiles.userId, userId)).returning();
    return updated;
  }

  // Goals
  async getGoals(userId: string): Promise<Goal[]> {
    return db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.createdAt));
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal;
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }

  async updateGoal(id: string, data: Partial<InsertGoal>): Promise<Goal | undefined> {
    const [updated] = await db.update(goals).set(data).where(eq(goals.id, id)).returning();
    return updated;
  }

  async deleteGoal(id: string): Promise<void> {
    await db.delete(goals).where(eq(goals.id, id));
  }

  async getRecentGoals(userId: string, limit = 5): Promise<Goal[]> {
    return db.select().from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt))
      .limit(limit);
  }

  // Careers
  async getCareers(): Promise<Career[]> {
    return db.select().from(careers);
  }

  async getCareer(id: string): Promise<Career | undefined> {
    const [career] = await db.select().from(careers).where(eq(careers.id, id));
    return career;
  }

  async createCareer(career: InsertCareer): Promise<Career> {
    const [newCareer] = await db.insert(careers).values(career).returning();
    return newCareer;
  }

  async updateCareer(id: string, data: Partial<InsertCareer>): Promise<Career | undefined> {
    const [updated] = await db.update(careers).set(data).where(eq(careers.id, id)).returning();
    return updated;
  }

  async deleteCareer(id: string): Promise<void> {
    await db.delete(careers).where(eq(careers.id, id));
  }

  async getRecommendedCareers(skills: string[], limit = 5): Promise<Career[]> {
    // Get all careers and score them based on skill match
    const allCareers = await db.select().from(careers);
    
    const scored = allCareers.map(career => {
      const requiredSkills = career.requiredSkills || [];
      const matchCount = skills.filter(skill => 
        requiredSkills.some(rs => rs.toLowerCase().includes(skill.toLowerCase()))
      ).length;
      return { career, score: matchCount };
    });
    
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.career);
  }

  // Opportunities
  async getOpportunities(filters?: { type?: string; industry?: string }): Promise<Opportunity[]> {
    let query = db.select().from(opportunities).where(eq(opportunities.isActive, true));
    
    if (filters?.type) {
      query = db.select().from(opportunities)
        .where(and(eq(opportunities.isActive, true), eq(opportunities.type, filters.type)));
    }
    
    return query.orderBy(desc(opportunities.createdAt));
  }

  async getOpportunity(id: string): Promise<Opportunity | undefined> {
    const [opportunity] = await db.select().from(opportunities).where(eq(opportunities.id, id));
    return opportunity;
  }

  async createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity> {
    const [newOpportunity] = await db.insert(opportunities).values(opportunity).returning();
    return newOpportunity;
  }

  async updateOpportunity(id: string, data: Partial<InsertOpportunity>): Promise<Opportunity | undefined> {
    const [updated] = await db.update(opportunities).set(data).where(eq(opportunities.id, id)).returning();
    return updated;
  }

  async deleteOpportunity(id: string): Promise<void> {
    await db.delete(opportunities).where(eq(opportunities.id, id));
  }

  async getLatestOpportunities(limit = 6): Promise<Opportunity[]> {
    return db.select().from(opportunities)
      .where(eq(opportunities.isActive, true))
      .orderBy(desc(opportunities.createdAt))
      .limit(limit);
  }

  // Saved Opportunities
  async getSavedOpportunities(userId: string): Promise<(SavedOpportunity & { opportunity: Opportunity })[]> {
    const saved = await db.select().from(savedOpportunities)
      .where(eq(savedOpportunities.userId, userId))
      .innerJoin(opportunities, eq(savedOpportunities.opportunityId, opportunities.id));
    
    return saved.map(s => ({
      ...s.saved_opportunities,
      opportunity: s.opportunities,
    }));
  }

  async saveOpportunity(data: InsertSavedOpportunity): Promise<SavedOpportunity> {
    const [saved] = await db.insert(savedOpportunities).values(data).returning();
    return saved;
  }

  async unsaveOpportunity(userId: string, opportunityId: string): Promise<void> {
    await db.delete(savedOpportunities)
      .where(and(
        eq(savedOpportunities.userId, userId),
        eq(savedOpportunities.opportunityId, opportunityId)
      ));
  }

  async isOpportunitySaved(userId: string, opportunityId: string): Promise<boolean> {
    const [saved] = await db.select().from(savedOpportunities)
      .where(and(
        eq(savedOpportunities.userId, userId),
        eq(savedOpportunities.opportunityId, opportunityId)
      ));
    return !!saved;
  }

  // Resources
  async getResources(filters?: { type?: string; category?: string }): Promise<Resource[]> {
    if (filters?.type && filters?.category) {
      return db.select().from(resources)
        .where(and(eq(resources.type, filters.type), eq(resources.category, filters.category)))
        .orderBy(desc(resources.createdAt));
    }
    if (filters?.type) {
      return db.select().from(resources)
        .where(eq(resources.type, filters.type))
        .orderBy(desc(resources.createdAt));
    }
    if (filters?.category) {
      return db.select().from(resources)
        .where(eq(resources.category, filters.category))
        .orderBy(desc(resources.createdAt));
    }
    return db.select().from(resources).orderBy(desc(resources.createdAt));
  }

  async getResource(id: string): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource;
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db.insert(resources).values(resource).returning();
    return newResource;
  }

  async updateResource(id: string, data: Partial<InsertResource>): Promise<Resource | undefined> {
    const [updated] = await db.update(resources).set(data).where(eq(resources.id, id)).returning();
    return updated;
  }

  async deleteResource(id: string): Promise<void> {
    await db.delete(resources).where(eq(resources.id, id));
  }

  async incrementResourceDownload(id: string): Promise<void> {
    await db.update(resources)
      .set({ downloadCount: sql`${resources.downloadCount} + 1` })
      .where(eq(resources.id, id));
  }

  // Progress Records
  async getProgressRecords(userId: string): Promise<ProgressRecord[]> {
    return db.select().from(progressRecords)
      .where(eq(progressRecords.userId, userId))
      .orderBy(desc(progressRecords.recordedAt));
  }

  async createProgressRecord(record: InsertProgressRecord): Promise<ProgressRecord> {
    const [newRecord] = await db.insert(progressRecords).values(record).returning();
    return newRecord;
  }

  async updateProgressRecord(id: string, data: Partial<InsertProgressRecord>): Promise<ProgressRecord | undefined> {
    const [updated] = await db.update(progressRecords).set(data).where(eq(progressRecords.id, id)).returning();
    return updated;
  }

  // Academic Modules
  async getAcademicModules(userId: string): Promise<AcademicModule[]> {
    return db.select().from(academicModules).where(eq(academicModules.userId, userId));
  }

  async createAcademicModule(module: InsertAcademicModule): Promise<AcademicModule> {
    const [newModule] = await db.insert(academicModules).values(module).returning();
    return newModule;
  }

  async updateAcademicModule(id: string, data: Partial<InsertAcademicModule>): Promise<AcademicModule | undefined> {
    const [updated] = await db.update(academicModules).set(data).where(eq(academicModules.id, id)).returning();
    return updated;
  }

  async deleteAcademicModule(id: string): Promise<void> {
    await db.delete(academicModules).where(eq(academicModules.id, id));
  }

  // Training Programs
  async getTrainingPrograms(): Promise<TrainingProgram[]> {
    return db.select().from(trainingPrograms).where(eq(trainingPrograms.isActive, true));
  }

  async getTrainingProgram(id: string): Promise<TrainingProgram | undefined> {
    const [program] = await db.select().from(trainingPrograms).where(eq(trainingPrograms.id, id));
    return program;
  }

  async createTrainingProgram(program: InsertTrainingProgram): Promise<TrainingProgram> {
    const [newProgram] = await db.insert(trainingPrograms).values(program).returning();
    return newProgram;
  }

  // Dashboard Stats
  async getDashboardStats(userId: string): Promise<{
    goalsCount: number;
    completedGoals: number;
    skillsCount: number;
    careersCount: number;
    overallProgress: number;
  }> {
    const userGoals = await db.select().from(goals).where(eq(goals.userId, userId));
    const profile = await this.getProfile(userId);
    const allCareers = await db.select().from(careers);

    const completedGoals = userGoals.filter(g => g.status === "completed").length;
    const activeGoals = userGoals.filter(g => g.status !== "completed");
    const totalProgress = userGoals.reduce((sum, g) => sum + (g.progress || 0), 0);
    const overallProgress = userGoals.length > 0 ? Math.round(totalProgress / userGoals.length) : 0;

    const skills = profile?.skills || [];
    const recommendedCareers = skills.length
      ? await this.getRecommendedCareers(skills, 5)
      : allCareers.slice(0, 5);

    return {
      goalsCount: activeGoals.length,
      completedGoals,
      skillsCount: skills.length,
      careersCount: recommendedCareers.length,
      overallProgress,
    };
  }

  async getStudentRanking(viewerId: string): Promise<{
    leaderboard: Array<{
      userId: string;
      name: string;
      score: number;
      skillsCount: number;
      completedGoals: number;
      overallProgress: number;
      gpa: number | null;
      rank: number;
    }>;
    currentUser: {
      userId: string;
      name: string;
      score: number;
      skillsCount: number;
      completedGoals: number;
      overallProgress: number;
      gpa: number | null;
      rank: number;
    } | null;
    total: number;
  }> {
    const students = await db.select().from(users).where(eq(users.role, "student"));
    const allProfiles = await db.select().from(profiles);
    const allGoals = await db.select().from(goals);

    const profilesByUser = new Map(allProfiles.map(profile => [profile.userId, profile]));
    const goalsByUser = new Map<string, Goal[]>();

    allGoals.forEach(goal => {
      const list = goalsByUser.get(goal.userId) || [];
      list.push(goal);
      goalsByUser.set(goal.userId, list);
    });

    const leaderboard = students
      .map(student => {
        const profile = profilesByUser.get(student.id);
        const userGoals = goalsByUser.get(student.id) || [];

        const skillsCount = profile?.skills?.length || 0;
        const completedGoals = userGoals.filter(g => g.status === "completed").length;
        const totalProgress = userGoals.reduce((sum, g) => sum + (g.progress || 0), 0);
        const overallProgress = userGoals.length ? Math.round(totalProgress / userGoals.length) : 0;
        const gpa = profile?.gpa ?? null;

        // Composite score blending skills, completions, progress, and GPA (normalized to 20 pts)
        const gpaScore = gpa ? (gpa / 4) * 20 : 0;
        const score = skillsCount * 2 + completedGoals * 5 + overallProgress * 0.4 + gpaScore;

        return {
          userId: student.id,
          name: student.name,
          score: Math.round(score * 100) / 100,
          skillsCount,
          completedGoals,
          overallProgress,
          gpa,
          rank: 0,
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    const currentUser = leaderboard.find(item => item.userId === viewerId) || null;

    return {
      leaderboard,
      currentUser,
      total: leaderboard.length,
    };
  }

  // Admin Stats
  async getAdminStats(): Promise<{
    totalUsers: number;
    totalGoals: number;
    totalOpportunities: number;
    totalResources: number;
  }> {
    const [usersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "student"));
    const [goalsResult] = await db.select({ count: sql<number>`count(*)` }).from(goals);
    const [opportunitiesResult] = await db.select({ count: sql<number>`count(*)` }).from(opportunities);
    const [resourcesResult] = await db.select({ count: sql<number>`count(*)` }).from(resources);
    
    return {
      totalUsers: Number(usersResult.count),
      totalGoals: Number(goalsResult.count),
      totalOpportunities: Number(opportunitiesResult.count),
      totalResources: Number(resourcesResult.count),
    };
  }
}

export const storage = new DatabaseStorage();
