import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, Redirect } from "wouter";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Plus, 
  FileText, 
  Users, 
  DollarSign, 
  Star,
  Briefcase,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  ArrowRight,
  Send
} from "lucide-react";
import type { Project, Submission, Company, User } from "@shared/schema";

interface SubmissionWithCandidate extends Submission {
  candidate?: User;
}

interface ProjectWithSubmissions extends Project {
  submissions?: SubmissionWithCandidate[];
}

interface CompanyStats {
  totalProjects: number;
  activeProjects: number;
  totalSubmissions: number;
  totalSpent: string;
}

const projectFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  requirements: z.string().optional(),
  skills: z.string().optional(),
  payment: z.string().optional(),
  difficulty: z.string().default("intermediate"),
  deadline: z.string().optional(),
  maxSubmissions: z.string().default("10"),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

export default function CompanyDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithCandidate | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      skills: "",
      payment: "0",
      difficulty: "intermediate",
      deadline: "",
      maxSubmissions: "10",
    },
  });

  const { data: company, isLoading: companyLoading } = useQuery<Company>({
    queryKey: ["/api/company/profile"],
    enabled: isAuthenticated,
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<ProjectWithSubmissions[]>({
    queryKey: ["/api/company/projects"],
    enabled: isAuthenticated && !!company,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<CompanyStats>({
    queryKey: ["/api/company/stats"],
    enabled: isAuthenticated && !!company,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      return await apiRequest("POST", "/api/company/projects", {
        ...data,
        payment: data.payment,
        skills: data.skills?.split(",").map(s => s.trim()).filter(Boolean),
        maxSubmissions: parseInt(data.maxSubmissions) || 10,
        deadline: data.deadline || null,
      });
    },
    onSuccess: () => {
      toast({ title: "Success!", description: "Project created and pending admin approval." });
      queryClient.invalidateQueries({ queryKey: ["/api/company/projects"] });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const reviewSubmissionMutation = useMutation({
    mutationFn: async ({ submissionId, approved }: { submissionId: string; approved: boolean }) => {
      return await apiRequest("POST", `/api/company/submissions/${submissionId}/review`, {
        approved,
        rating: approved ? rating : undefined,
        feedback,
      });
    },
    onSuccess: () => {
      toast({ title: "Submission reviewed!" });
      queryClient.invalidateQueries({ queryKey: ["/api/company/projects"] });
      setReviewDialogOpen(false);
      setSelectedSubmission(null);
      setFeedback("");
      setRating(5);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-chart-2/10 text-chart-2";
      case "pending": return "bg-chart-4/10 text-chart-4";
      case "completed": return "bg-primary/10 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Redirect to landing if not authenticated
  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  if (!company && !companyLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Set Up Your Company Profile</h1>
          <p className="text-muted-foreground mb-8">
            Before posting projects, you need to create your company profile. This will be reviewed by our team.
          </p>
          <Button asChild>
            <Link href="/company/setup">Create Company Profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  const activeProjects = projects?.filter(p => p.status === "active") || [];
  const pendingProjects = projects?.filter(p => p.status === "pending") || [];
  const allSubmissions = projects?.flatMap(p => p.submissions || []) || [];
  const pendingSubmissions = allSubmissions.filter(s => s.status === "pending" || s.status === "under_review");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Header Section */}
      <section className="py-8 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-company-dashboard">
                {company?.name || "Company"} Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your projects and review candidate submissions.
              </p>
              {company?.status === "pending" && (
                <Badge className="mt-2 bg-chart-4/10 text-chart-4">Pending Approval</Badge>
              )}
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-project" disabled={company?.status !== "approved"}>
                  <Plus className="mr-2 h-4 w-4" />
                  Post New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => createProjectMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Build a Landing Page" {...field} data-testid="input-project-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe what candidates need to build..." 
                              className="min-h-[100px]"
                              {...field} 
                              data-testid="input-project-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="requirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Requirements (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List specific requirements or deliverables..." 
                              {...field} 
                              data-testid="input-project-requirements"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="payment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment (USD, Optional)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} data-testid="input-project-payment" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Difficulty</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-project-difficulty">
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Required Skills (comma-separated)</FormLabel>
                          <FormControl>
                            <Input placeholder="React, TypeScript, Tailwind" {...field} data-testid="input-project-skills" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="deadline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deadline (Optional)</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-project-deadline" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maxSubmissions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Submissions</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="10" {...field} data-testid="input-project-max" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createProjectMutation.isPending} data-testid="button-submit-project">
                        {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>
      
      {/* Stats Cards */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <Card data-testid="card-stat-projects">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-mono">
                      {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalProjects || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-stat-active">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-mono">
                      {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.activeProjects || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-stat-submissions">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-chart-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-mono">
                      {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalSubmissions || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Submissions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-stat-spent">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-mono">
                      {statsLoading ? <Skeleton className="h-8 w-16" /> : `$${stats?.totalSpent || "0"}`}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Pending Submissions Alert */}
      {pendingSubmissions.length > 0 && (
        <section className="pb-4">
          <div className="max-w-7xl mx-auto px-4">
            <Card className="border-chart-4 bg-chart-4/5">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-chart-4/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-chart-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">You have {pendingSubmissions.length} submission(s) pending review</p>
                    <p className="text-sm text-muted-foreground">Review and rate candidates to complete their projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
      
      {/* Projects Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="active" data-testid="tab-active-projects">
                Active ({activeProjects.length})
              </TabsTrigger>
              <TabsTrigger value="pending" data-testid="tab-pending-projects">
                Pending Approval ({pendingProjects.length})
              </TabsTrigger>
              <TabsTrigger value="submissions" data-testid="tab-submissions">
                Review Submissions ({pendingSubmissions.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              {projectsLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader></Card>
                  ))}
                </div>
              ) : activeProjects.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Active Projects</h3>
                    <p className="text-muted-foreground mb-6">Create a project to start receiving submissions from candidates.</p>
                    <Button onClick={() => setIsCreateOpen(true)} disabled={company?.status !== "approved"}>
                      <Plus className="mr-2 h-4 w-4" />
                      Post New Project
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeProjects.map((project) => (
                    <Card key={project.id} className="hover-elevate" data-testid={`card-project-${project.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg truncate flex-1">{project.title}</CardTitle>
                          <Badge className={getStatusColor(project.status)}>Active</Badge>
                        </div>
                        <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm mb-4">
                          <span className="text-muted-foreground">
                            {project.submissions?.length || 0} submissions
                          </span>
                          <span className="font-semibold text-primary">${project.payment}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {project.skills?.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pending">
              {pendingProjects.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-chart-2/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-chart-2" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">All Projects Approved</h3>
                    <p className="text-muted-foreground">You have no projects pending approval.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingProjects.map((project) => (
                    <Card key={project.id} className="opacity-75" data-testid={`card-pending-${project.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg truncate flex-1">{project.title}</CardTitle>
                          <Badge className="bg-chart-4/10 text-chart-4">Pending</Badge>
                        </div>
                        <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Awaiting admin approval. You'll be notified once it's live.
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="submissions">
              {pendingSubmissions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Pending Submissions</h3>
                    <p className="text-muted-foreground">All submissions have been reviewed.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {pendingSubmissions.map((submission) => {
                    const project = projects?.find(p => p.id === submission.projectId);
                    return (
                      <Card key={submission.id} className="hover-elevate" data-testid={`card-submission-${submission.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <CardTitle className="text-lg">{project?.title || "Project"}</CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                From: {submission.candidate?.firstName} {submission.candidate?.lastName || submission.candidate?.email}
                              </CardDescription>
                            </div>
                            <Badge className="bg-chart-4/10 text-chart-4">Review</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{submission.content}</p>
                          {submission.attachmentUrl && (
                            <a 
                              href={submission.attachmentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              View Attachment <ArrowRight className="h-3 w-3" />
                            </a>
                          )}
                        </CardContent>
                        <CardFooter className="gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setReviewDialogOpen(true);
                            }}
                            data-testid={`button-review-${submission.id}`}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Review
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Candidate</Label>
              <p className="text-sm text-muted-foreground">
                {selectedSubmission?.candidate?.firstName} {selectedSubmission?.candidate?.lastName}
              </p>
            </div>
            <div>
              <Label>Submission</Label>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedSubmission?.content}</p>
            </div>
            <div>
              <Label>Rating (1-5 stars)</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star className={`h-6 w-6 ${star <= rating ? "fill-chart-4 text-chart-4" : "text-muted"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Feedback</Label>
              <Textarea
                placeholder="Provide feedback for the candidate..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => selectedSubmission && reviewSubmissionMutation.mutate({ submissionId: selectedSubmission.id, approved: false })}
              disabled={reviewSubmissionMutation.isPending}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={() => selectedSubmission && reviewSubmissionMutation.mutate({ submissionId: selectedSubmission.id, approved: true })}
              disabled={reviewSubmissionMutation.isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve & Pay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">LayOffers</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} LayOffers. Skill-First Hiring.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
