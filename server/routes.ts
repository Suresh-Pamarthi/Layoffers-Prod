import type { Express, RequestHandler } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

// Role-based authorization middleware
const requireRole = (allowedRoles: string[]): RequestHandler => {
  return async (req: any, res, next) => {
    try {
      if (!req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      if (!allowedRoles.includes(user.role || "candidate")) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      // Attach user to request for downstream use
      req.dbUser = user;
      next();
    } catch (error) {
      console.error("Authorization error:", error);
      res.status(500).json({ message: "Authorization error" });
    }
  };
};

export async function registerRoutes(server: Server, app: Express): Promise<void> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes - safe for unauthenticated access
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (!req.isAuthenticated?.() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, bio, skills, experience, portfolioUrl } = req.body;
      
      const user = await storage.updateUserProfile(userId, {
        firstName,
        lastName,
        bio,
        skills,
        experience,
        portfolioUrl,
      });
      
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // ============ PROJECT ROUTES ============

  // Get all active projects (public)
  app.get('/api/projects', async (req, res) => {
    try {
      const projectList = await storage.getActiveProjects();
      
      // Add company info to each project
      const projectsWithCompany = await Promise.all(
        projectList.map(async (project) => {
          const company = await storage.getCompany(project.companyId);
          return { ...project, company };
        })
      );
      
      res.json(projectsWithCompany);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Get featured projects (for logged in users)
  app.get('/api/projects/featured', isAuthenticated, async (req, res) => {
    try {
      const projectList = await storage.getFeaturedProjects();
      
      const projectsWithCompany = await Promise.all(
        projectList.map(async (project) => {
          const company = await storage.getCompany(project.companyId);
          return { ...project, company };
        })
      );
      
      res.json(projectsWithCompany);
    } catch (error) {
      console.error("Error fetching featured projects:", error);
      res.status(500).json({ message: "Failed to fetch featured projects" });
    }
  });

  // Get single project
  app.get('/api/projects/:id', async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const company = await storage.getCompany(project.companyId);
      res.json({ ...project, company });
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Get user's submission for a project
  app.get('/api/projects/:id/my-submission', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submission = await storage.getSubmissionByProjectAndCandidate(req.params.id, userId);
      
      if (!submission) {
        return res.status(404).json({ message: "No submission found" });
      }
      
      res.json(submission);
    } catch (error) {
      console.error("Error fetching submission:", error);
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  });

  // Submit to a project
  app.post('/api/projects/:id/submissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectId = req.params.id;
      const { content, attachmentUrl } = req.body;
      
      // Check if project exists and is active
      const project = await storage.getProject(projectId);
      if (!project || project.status !== "active") {
        return res.status(400).json({ message: "Project not available for submissions" });
      }
      
      // Check if user already submitted
      const existingSubmission = await storage.getSubmissionByProjectAndCandidate(projectId, userId);
      if (existingSubmission) {
        return res.status(400).json({ message: "You have already submitted to this project" });
      }
      
      const submission = await storage.createSubmission({
        projectId,
        candidateId: userId,
        content,
        attachmentUrl,
        status: "pending",
      });
      
      res.json(submission);
    } catch (error) {
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  // ============ CANDIDATE ROUTES ============

  // Get candidate's submissions
  app.get('/api/candidate/submissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submissionList = await storage.getSubmissionsByCandidate(userId);
      
      // Add project and rating info
      const submissionsWithDetails = await Promise.all(
        submissionList.map(async (submission) => {
          const project = await storage.getProject(submission.projectId);
          const company = project ? await storage.getCompany(project.companyId) : null;
          return {
            ...submission,
            project: project ? { ...project, company: company ? { name: company.name } : null } : null,
          };
        })
      );
      
      res.json(submissionsWithDetails);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // Get completed submissions (for portfolio)
  app.get('/api/candidate/submissions/completed', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const allSubmissions = await storage.getSubmissionsByCandidate(userId);
      const completedSubmissions = allSubmissions.filter(s => s.status === "approved");
      
      const submissionsWithDetails = await Promise.all(
        completedSubmissions.map(async (submission) => {
          const project = await storage.getProject(submission.projectId);
          const company = project ? await storage.getCompany(project.companyId) : null;
          const ratings = await storage.getRatingsByCandidate(userId);
          const rating = ratings.find(r => r.submissionId === submission.id);
          return {
            ...submission,
            project: project ? { ...project, company: company ? { name: company.name } : null } : null,
            rating,
          };
        })
      );
      
      res.json(submissionsWithDetails);
    } catch (error) {
      console.error("Error fetching completed submissions:", error);
      res.status(500).json({ message: "Failed to fetch completed submissions" });
    }
  });

  // Get candidate stats
  app.get('/api/candidate/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getCandidateStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // ============ COMPANY ROUTES ============

  // Get company profile
  app.get('/api/company/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const company = await storage.getCompanyByUserId(userId);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  // Create company profile
  app.post('/api/company/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, description, website, industry, size } = req.body;
      
      // Check if user already has a company
      const existingCompany = await storage.getCompanyByUserId(userId);
      if (existingCompany) {
        return res.status(400).json({ message: "You already have a company profile" });
      }
      
      // Update user role to company
      await storage.updateUserProfile(userId, { role: "company" });
      
      const company = await storage.createCompany({
        userId,
        name,
        description,
        website,
        industry,
        size,
        status: "pending",
      });
      
      res.json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  // Get company's projects
  app.get('/api/company/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const company = await storage.getCompanyByUserId(userId);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      const projectList = await storage.getProjectsByCompany(company.id);
      
      // Add submissions to each project
      const projectsWithSubmissions = await Promise.all(
        projectList.map(async (project) => {
          const submissions = await storage.getSubmissionsByProject(project.id);
          
          // Add candidate info to each submission
          const submissionsWithCandidates = await Promise.all(
            submissions.map(async (submission) => {
              const candidate = await storage.getUser(submission.candidateId);
              return { ...submission, candidate };
            })
          );
          
          return { ...project, submissions: submissionsWithCandidates };
        })
      );
      
      res.json(projectsWithSubmissions);
    } catch (error) {
      console.error("Error fetching company projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Create a project
  app.post('/api/company/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const company = await storage.getCompanyByUserId(userId);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      if (company.status !== "approved") {
        return res.status(403).json({ message: "Company must be approved to post projects" });
      }
      
      const { title, description, requirements, skills, payment, difficulty, deadline, maxSubmissions } = req.body;
      
      const project = await storage.createProject({
        companyId: company.id,
        title,
        description,
        requirements,
        skills,
        payment,
        difficulty,
        deadline: deadline ? new Date(deadline) : null,
        maxSubmissions,
        status: "pending",
      });
      
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Review a submission
  app.post('/api/company/submissions/:id/review', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submissionId = req.params.id;
      const { approved, rating: ratingScore, feedback } = req.body;
      
      const company = await storage.getCompanyByUserId(userId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      const submission = await storage.getSubmission(submissionId);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      const project = await storage.getProject(submission.projectId);
      if (!project || project.companyId !== company.id) {
        return res.status(403).json({ message: "Not authorized to review this submission" });
      }
      
      // Update submission status
      await storage.updateSubmission(submissionId, {
        status: approved ? "approved" : "rejected",
        feedback,
      });
      
      if (approved) {
        // Create rating
        if (ratingScore) {
          await storage.createRating({
            submissionId,
            candidateId: submission.candidateId,
            companyId: company.id,
            score: ratingScore,
            review: feedback,
          });
        }
        
        // Create payment
        await storage.createPayment({
          submissionId,
          candidateId: submission.candidateId,
          companyId: company.id,
          amount: project.payment,
          status: "paid",
          paidAt: new Date(),
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error reviewing submission:", error);
      res.status(500).json({ message: "Failed to review submission" });
    }
  });

  // Get company stats
  app.get('/api/company/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const company = await storage.getCompanyByUserId(userId);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      const stats = await storage.getCompanyStats(company.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // ============ ADMIN ROUTES ============

  // Get admin stats
  app.get('/api/admin/stats', isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get pending companies
  app.get('/api/admin/companies/pending', isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const companiesList = await storage.getPendingCompanies();
      
      // Add user info
      const companiesWithUsers = await Promise.all(
        companiesList.map(async (company) => {
          const user = await storage.getUser(company.userId);
          return { ...company, user };
        })
      );
      
      res.json(companiesWithUsers);
    } catch (error) {
      console.error("Error fetching pending companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  // Review a company
  app.post('/api/admin/companies/:id/review', isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const companyId = req.params.id;
      const { approved } = req.body;
      
      await storage.updateCompany(companyId, {
        status: approved ? "approved" : "rejected",
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error reviewing company:", error);
      res.status(500).json({ message: "Failed to review company" });
    }
  });

  // Get pending projects
  app.get('/api/admin/projects/pending', isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const projectList = await storage.getPendingProjects();
      
      // Add company info
      const projectsWithCompany = await Promise.all(
        projectList.map(async (project) => {
          const company = await storage.getCompany(project.companyId);
          return { ...project, company };
        })
      );
      
      res.json(projectsWithCompany);
    } catch (error) {
      console.error("Error fetching pending projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Review a project
  app.post('/api/admin/projects/:id/review', isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const projectId = req.params.id;
      const { approved } = req.body;
      
      await storage.updateProject(projectId, {
        status: approved ? "active" : "cancelled",
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error reviewing project:", error);
      res.status(500).json({ message: "Failed to review project" });
    }
  });

  // Get recent payments
  app.get('/api/admin/payments/recent', isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const paymentsList = await storage.getRecentPayments(20);
      
      // Add candidate and company info
      const paymentsWithDetails = await Promise.all(
        paymentsList.map(async (payment) => {
          const candidate = await storage.getUser(payment.candidateId);
          const company = await storage.getCompany(payment.companyId);
          return { ...payment, candidate, company };
        })
      );
      
      res.json(paymentsWithDetails);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

}
