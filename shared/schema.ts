import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with role-based access
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

// Student profiles with academic and personal info
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

// Goals with SMART framework support
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

// Career pathways
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

// Opportunities (internships/jobs)
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

// Saved opportunities (bookmarks)
export const savedOpportunities = pgTable("saved_opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  opportunityId: varchar("opportunity_id").notNull().references(() => opportunities.id),
  savedAt: timestamp("saved_at").defaultNow(),
});

// Resources library
export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'pdf' | 'video' | 'article' | 'template'
  category: text("category").notNull(), // 'programming' | 'networking' | 'vlsi' | 'career' | etc.
  url: text("url"),
  tags: text("tags").array(),
  downloadCount: integer("download_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Progress tracking
export const progressRecords = pgTable("progress_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  skillName: text("skill_name").notNull(),
  level: integer("level").default(0), // 0-100
  recordedAt: timestamp("recorded_at").defaultNow(),
});

// Academic modules/courses completed
export const academicModules = pgTable("academic_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  moduleName: text("module_name").notNull(),
  grade: text("grade"),
  units: integer("units"),
  semester: text("semester"),
  completed: boolean("completed").default(false),
});

// Training programs
export const trainingPrograms = pgTable("training_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  provider: text("provider"),
  duration: text("duration"),
  skills: text("skills").array(),
  certificationOffered: boolean("certification_offered").default(false),
  url: text("url"),
  isActive: boolean("is_active").default(true),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  goals: many(goals),
  savedOpportunities: many(savedOpportunities),
  progressRecords: many(progressRecords),
  academicModules: many(academicModules),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, { fields: [goals.userId], references: [users.id] }),
}));

export const savedOpportunitiesRelations = relations(savedOpportunities, ({ one }) => ({
  user: one(users, { fields: [savedOpportunities.userId], references: [users.id] }),
  opportunity: one(opportunities, { fields: [savedOpportunities.opportunityId], references: [opportunities.id] }),
}));

export const progressRecordsRelations = relations(progressRecords, ({ one }) => ({
  user: one(users, { fields: [progressRecords.userId], references: [users.id] }),
}));

export const academicModulesRelations = relations(academicModules, ({ one }) => ({
  user: one(users, { fields: [academicModules.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true });
export const insertGoalSchema = createInsertSchema(goals).omit({ id: true, createdAt: true });
export const insertCareerSchema = createInsertSchema(careers).omit({ id: true });
export const insertOpportunitySchema = createInsertSchema(opportunities).omit({ id: true, createdAt: true });
export const insertSavedOpportunitySchema = createInsertSchema(savedOpportunities).omit({ id: true, savedAt: true });
export const insertResourceSchema = createInsertSchema(resources).omit({ id: true, createdAt: true, downloadCount: true });
export const insertProgressRecordSchema = createInsertSchema(progressRecords).omit({ id: true, recordedAt: true });
export const insertAcademicModuleSchema = createInsertSchema(academicModules).omit({ id: true });
export const insertTrainingProgramSchema = createInsertSchema(trainingPrograms).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Career = typeof careers.$inferSelect;
export type InsertCareer = z.infer<typeof insertCareerSchema>;
export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type SavedOpportunity = typeof savedOpportunities.$inferSelect;
export type InsertSavedOpportunity = z.infer<typeof insertSavedOpportunitySchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type ProgressRecord = typeof progressRecords.$inferSelect;
export type InsertProgressRecord = z.infer<typeof insertProgressRecordSchema>;
export type AcademicModule = typeof academicModules.$inferSelect;
export type InsertAcademicModule = z.infer<typeof insertAcademicModuleSchema>;
export type TrainingProgram = typeof trainingPrograms.$inferSelect;
export type InsertTrainingProgram = z.infer<typeof insertTrainingProgramSchema>;

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  yearLevel: z.number().min(1).max(5).optional(),
  course: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
