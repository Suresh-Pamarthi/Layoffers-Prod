import {
  users,
  companies,
  projects,
  submissions,
  ratings,
  payments,
  type User,
  type UpsertUser,
  type Company,
  type InsertCompany,
  type Project,
  type InsertProject,
  type Submission,
  type InsertSubmission,
  type Rating,
  type InsertRating,
  type Payment,
  type InsertPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Company operations
  getCompany(id: string): Promise<Company | undefined>;
  getCompanyByUserId(userId: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, updates: Partial<Company>): Promise<Company | undefined>;
  getPendingCompanies(): Promise<Company[]>;
  getAllCompanies(): Promise<Company[]>;
  
  // Project operations
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByCompany(companyId: string): Promise<Project[]>;
  getActiveProjects(): Promise<Project[]>;
  getFeaturedProjects(): Promise<Project[]>;
  getPendingProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  
  // Submission operations
  getSubmission(id: string): Promise<Submission | undefined>;
  getSubmissionsByProject(projectId: string): Promise<Submission[]>;
  getSubmissionsByCandidate(candidateId: string): Promise<Submission[]>;
  getSubmissionByProjectAndCandidate(projectId: string, candidateId: string): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmission(id: string, updates: Partial<Submission>): Promise<Submission | undefined>;
  
  // Rating operations
  createRating(rating: InsertRating): Promise<Rating>;
  getRatingsByCandidate(candidateId: string): Promise<Rating[]>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByCandidate(candidateId: string): Promise<Payment[]>;
  getRecentPayments(limit: number): Promise<Payment[]>;
  
  // Stats
  getAdminStats(): Promise<{
    totalUsers: number;
    totalCompanies: number;
    totalProjects: number;
    pendingCompanies: number;
    pendingProjects: number;
    totalPayouts: string;
  }>;
  getCandidateStats(candidateId: string): Promise<{
    totalSubmissions: number;
    completedProjects: number;
    totalEarnings: string;
    averageRating: number;
  }>;
  getCompanyStats(companyId: string): Promise<{
    totalProjects: number;
    activeProjects: number;
    totalSubmissions: number;
    totalSpent: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Company operations
  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getCompanyByUserId(userId: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.userId, userId));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [created] = await db.insert(companies).values(company).returning();
    return created;
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company | undefined> {
    const [company] = await db
      .update(companies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  async getPendingCompanies(): Promise<Company[]> {
    return db.select().from(companies).where(eq(companies.status, "pending")).orderBy(desc(companies.createdAt));
  }

  async getAllCompanies(): Promise<Company[]> {
    return db.select().from(companies).orderBy(desc(companies.createdAt));
  }

  // Project operations
  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectsByCompany(companyId: string): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.companyId, companyId)).orderBy(desc(projects.createdAt));
  }

  async getActiveProjects(): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.status, "active")).orderBy(desc(projects.createdAt));
  }

  async getFeaturedProjects(): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.status, "active")).orderBy(desc(projects.createdAt)).limit(6);
  }

  async getPendingProjects(): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.status, "pending")).orderBy(desc(projects.createdAt));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [created] = await db.insert(projects).values(project).returning();
    return created;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  // Submission operations
  async getSubmission(id: string): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission;
  }

  async getSubmissionsByProject(projectId: string): Promise<Submission[]> {
    return db.select().from(submissions).where(eq(submissions.projectId, projectId)).orderBy(desc(submissions.createdAt));
  }

  async getSubmissionsByCandidate(candidateId: string): Promise<Submission[]> {
    return db.select().from(submissions).where(eq(submissions.candidateId, candidateId)).orderBy(desc(submissions.createdAt));
  }

  async getSubmissionByProjectAndCandidate(projectId: string, candidateId: string): Promise<Submission | undefined> {
    const [submission] = await db
      .select()
      .from(submissions)
      .where(and(eq(submissions.projectId, projectId), eq(submissions.candidateId, candidateId)));
    return submission;
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const [created] = await db.insert(submissions).values(submission).returning();
    return created;
  }

  async updateSubmission(id: string, updates: Partial<Submission>): Promise<Submission | undefined> {
    const [submission] = await db
      .update(submissions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(submissions.id, id))
      .returning();
    return submission;
  }

  // Rating operations
  async createRating(rating: InsertRating): Promise<Rating> {
    const [created] = await db.insert(ratings).values(rating).returning();
    return created;
  }

  async getRatingsByCandidate(candidateId: string): Promise<Rating[]> {
    return db.select().from(ratings).where(eq(ratings.candidateId, candidateId)).orderBy(desc(ratings.createdAt));
  }

  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [created] = await db.insert(payments).values(payment).returning();
    return created;
  }

  async getPaymentsByCandidate(candidateId: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.candidateId, candidateId)).orderBy(desc(payments.createdAt));
  }

  async getRecentPayments(limit: number): Promise<Payment[]> {
    return db.select().from(payments).orderBy(desc(payments.createdAt)).limit(limit);
  }

  // Stats
  async getAdminStats() {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [companyCount] = await db.select({ count: sql<number>`count(*)` }).from(companies);
    const [projectCount] = await db.select({ count: sql<number>`count(*)` }).from(projects);
    const [pendingCompanyCount] = await db.select({ count: sql<number>`count(*)` }).from(companies).where(eq(companies.status, "pending"));
    const [pendingProjectCount] = await db.select({ count: sql<number>`count(*)` }).from(projects).where(eq(projects.status, "pending"));
    const [payoutSum] = await db.select({ sum: sql<string>`COALESCE(SUM(amount), 0)` }).from(payments).where(eq(payments.status, "paid"));

    return {
      totalUsers: Number(userCount?.count || 0),
      totalCompanies: Number(companyCount?.count || 0),
      totalProjects: Number(projectCount?.count || 0),
      pendingCompanies: Number(pendingCompanyCount?.count || 0),
      pendingProjects: Number(pendingProjectCount?.count || 0),
      totalPayouts: payoutSum?.sum || "0",
    };
  }

  async getCandidateStats(candidateId: string) {
    const [submissionCount] = await db.select({ count: sql<number>`count(*)` }).from(submissions).where(eq(submissions.candidateId, candidateId));
    const [completedCount] = await db.select({ count: sql<number>`count(*)` }).from(submissions).where(and(eq(submissions.candidateId, candidateId), eq(submissions.status, "approved")));
    const [earningsSum] = await db.select({ sum: sql<string>`COALESCE(SUM(amount), 0)` }).from(payments).where(and(eq(payments.candidateId, candidateId), eq(payments.status, "paid")));
    const [avgRating] = await db.select({ avg: sql<number>`COALESCE(AVG(score), 0)` }).from(ratings).where(eq(ratings.candidateId, candidateId));

    return {
      totalSubmissions: Number(submissionCount?.count || 0),
      completedProjects: Number(completedCount?.count || 0),
      totalEarnings: earningsSum?.sum || "0",
      averageRating: Number(avgRating?.avg || 0),
    };
  }

  async getCompanyStats(companyId: string) {
    const [projectCount] = await db.select({ count: sql<number>`count(*)` }).from(projects).where(eq(projects.companyId, companyId));
    const [activeCount] = await db.select({ count: sql<number>`count(*)` }).from(projects).where(and(eq(projects.companyId, companyId), eq(projects.status, "active")));
    
    const companyProjects = await db.select({ id: projects.id }).from(projects).where(eq(projects.companyId, companyId));
    const projectIds = companyProjects.map(p => p.id);
    
    let submissionCount = 0;
    let spentSum = "0";
    
    if (projectIds.length > 0) {
      const [subCount] = await db.select({ count: sql<number>`count(*)` }).from(submissions).where(sql`${submissions.projectId} = ANY(${projectIds})`);
      submissionCount = Number(subCount?.count || 0);
      
      const [spentTotal] = await db.select({ sum: sql<string>`COALESCE(SUM(amount), 0)` }).from(payments).where(and(eq(payments.companyId, companyId), eq(payments.status, "paid")));
      spentSum = spentTotal?.sum || "0";
    }

    return {
      totalProjects: Number(projectCount?.count || 0),
      activeProjects: Number(activeCount?.count || 0),
      totalSubmissions: submissionCount,
      totalSpent: spentSum,
    };
  }
}

export const storage = new DatabaseStorage();
