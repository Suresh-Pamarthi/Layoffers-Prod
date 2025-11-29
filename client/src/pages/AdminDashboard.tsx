import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Building2, 
  FileText, 
  Users, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  Shield,
  TrendingUp,
  AlertCircle,
  Eye
} from "lucide-react";
import type { Company, Project, User, Payment } from "@shared/schema";

interface AdminStats {
  totalUsers: number;
  totalCompanies: number;
  totalProjects: number;
  pendingCompanies: number;
  pendingProjects: number;
  totalPayouts: string;
}

interface CompanyWithUser extends Company {
  user?: User;
}

interface ProjectWithCompany extends Project {
  company?: Company;
}

interface PaymentWithDetails extends Payment {
  candidate?: User;
  company?: Company;
}

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithUser | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectWithCompany | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: pendingCompanies, isLoading: companiesLoading } = useQuery<CompanyWithUser[]>({
    queryKey: ["/api/admin/companies/pending"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: pendingProjects, isLoading: projectsLoading } = useQuery<ProjectWithCompany[]>({
    queryKey: ["/api/admin/projects/pending"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: recentPayments, isLoading: paymentsLoading } = useQuery<PaymentWithDetails[]>({
    queryKey: ["/api/admin/payments/recent"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const approveCompanyMutation = useMutation({
    mutationFn: async ({ companyId, approved }: { companyId: string; approved: boolean }) => {
      return await apiRequest("POST", `/api/admin/companies/${companyId}/review`, { approved });
    },
    onSuccess: () => {
      toast({ title: "Company reviewed!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedCompany(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const approveProjectMutation = useMutation({
    mutationFn: async ({ projectId, approved }: { projectId: string; approved: boolean }) => {
      return await apiRequest("POST", `/api/admin/projects/${projectId}/review`, { approved });
    },
    onSuccess: () => {
      toast({ title: "Project reviewed!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedProject(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid md:grid-cols-4 gap-6">
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

  // Show access denied for non-admin users
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You don't have permission to access the admin dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Header Section */}
      <section className="py-8 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-admin-dashboard">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage companies, projects, and platform activity.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Cards */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card data-testid="card-stat-users">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold font-mono">
                    {statsLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : stats?.totalUsers || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-stat-companies">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Building2 className="h-8 w-8 text-chart-2 mx-auto mb-2" />
                  <p className="text-2xl font-bold font-mono">
                    {statsLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : stats?.totalCompanies || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Companies</p>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-stat-projects">
              <CardContent className="pt-6">
                <div className="text-center">
                  <FileText className="h-8 w-8 text-chart-3 mx-auto mb-2" />
                  <p className="text-2xl font-bold font-mono">
                    {statsLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : stats?.totalProjects || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-chart-4" data-testid="card-stat-pending-companies">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-chart-4 mx-auto mb-2" />
                  <p className="text-2xl font-bold font-mono text-chart-4">
                    {statsLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : stats?.pendingCompanies || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending Companies</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-chart-4" data-testid="card-stat-pending-projects">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Clock className="h-8 w-8 text-chart-4 mx-auto mb-2" />
                  <p className="text-2xl font-bold font-mono text-chart-4">
                    {statsLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : stats?.pendingProjects || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending Projects</p>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-stat-payouts">
              <CardContent className="pt-6">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 text-chart-2 mx-auto mb-2" />
                  <p className="text-2xl font-bold font-mono">
                    {statsLoading ? <Skeleton className="h-8 w-16 mx-auto" /> : `$${stats?.totalPayouts || "0"}`}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Payouts</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs defaultValue="companies" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="companies" data-testid="tab-companies">
                Pending Companies ({pendingCompanies?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="projects" data-testid="tab-projects">
                Pending Projects ({pendingProjects?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="payments" data-testid="tab-payments">
                Recent Payments
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="companies">
              {companiesLoading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader></Card>
                  ))}
                </div>
              ) : (pendingCompanies?.length || 0) === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-chart-2/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-chart-2" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
                    <p className="text-muted-foreground">No companies pending approval.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {pendingCompanies?.map((company) => (
                    <Card key={company.id} className="hover-elevate" data-testid={`card-company-${company.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{company.name}</CardTitle>
                              <CardDescription>{company.industry} • {company.size}</CardDescription>
                            </div>
                          </div>
                          <Badge className="bg-chart-4/10 text-chart-4">Pending</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{company.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <span>Created by: {company.user?.email || "Unknown"}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setSelectedCompany(company)}
                            data-testid={`button-review-company-${company.id}`}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Review
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="projects">
              {projectsLoading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader></Card>
                  ))}
                </div>
              ) : (pendingProjects?.length || 0) === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-chart-2/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-chart-2" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
                    <p className="text-muted-foreground">No projects pending approval.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {pendingProjects?.map((project) => (
                    <Card key={project.id} className="hover-elevate" data-testid={`card-project-${project.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-lg">{project.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Building2 className="h-3 w-3" />
                              {project.company?.name || "Company"}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">${project.payment}</p>
                            <Badge className="bg-chart-4/10 text-chart-4 mt-1">Pending</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.skills?.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setSelectedProject(project)}
                          data-testid={`button-review-project-${project.id}`}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Review
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="payments">
              {paymentsLoading ? (
                <Card>
                  <CardContent className="py-8">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ) : (recentPayments?.length || 0) === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Payments Yet</h3>
                    <p className="text-muted-foreground">Payment history will appear here.</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentPayments?.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`row-payment-${payment.id}`}>
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-chart-2/10 flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-chart-2" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {payment.candidate?.firstName} {payment.candidate?.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                From: {payment.company?.name || "Company"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-chart-2">${payment.amount}</p>
                            <p className="text-xs text-muted-foreground">
                              {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : "Pending"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* Company Review Dialog */}
      <Dialog open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Company: {selectedCompany?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Industry</Label>
              <p className="text-sm text-muted-foreground">{selectedCompany?.industry}</p>
            </div>
            <div>
              <Label>Size</Label>
              <p className="text-sm text-muted-foreground">{selectedCompany?.size}</p>
            </div>
            <div>
              <Label>Description</Label>
              <p className="text-sm text-muted-foreground">{selectedCompany?.description}</p>
            </div>
            {selectedCompany?.website && (
              <div>
                <Label>Website</Label>
                <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline block">
                  {selectedCompany.website}
                </a>
              </div>
            )}
            <div>
              <Label>Created By</Label>
              <p className="text-sm text-muted-foreground">{selectedCompany?.user?.email}</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => selectedCompany && approveCompanyMutation.mutate({ companyId: selectedCompany.id, approved: false })}
              disabled={approveCompanyMutation.isPending}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={() => selectedCompany && approveCompanyMutation.mutate({ companyId: selectedCompany.id, approved: true })}
              disabled={approveCompanyMutation.isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Project Review Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Project: {selectedProject?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Company</Label>
              <p className="text-sm text-muted-foreground">{selectedProject?.company?.name}</p>
            </div>
            <div>
              <Label>Payment</Label>
              <p className="text-sm font-semibold text-primary">${selectedProject?.payment}</p>
            </div>
            <div>
              <Label>Difficulty</Label>
              <p className="text-sm text-muted-foreground capitalize">{selectedProject?.difficulty}</p>
            </div>
            <div>
              <Label>Description</Label>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedProject?.description}</p>
            </div>
            {selectedProject?.requirements && (
              <div>
                <Label>Requirements</Label>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedProject.requirements}</p>
              </div>
            )}
            <div>
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedProject?.skills?.map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => selectedProject && approveProjectMutation.mutate({ projectId: selectedProject.id, approved: false })}
              disabled={approveProjectMutation.isPending}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={() => selectedProject && approveProjectMutation.mutate({ projectId: selectedProject.id, approved: true })}
              disabled={approveProjectMutation.isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
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
