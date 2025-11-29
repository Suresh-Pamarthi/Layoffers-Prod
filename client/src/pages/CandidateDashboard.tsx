import { useQuery } from "@tanstack/react-query";
import { Link, Redirect } from "wouter";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { 
  Target, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Star,
  Briefcase,
  TrendingUp,
  FileText,
  ArrowRight,
  ExternalLink,
  Building2
} from "lucide-react";
import type { Submission, Project, Rating, Payment } from "@shared/schema";

interface SubmissionWithDetails extends Submission {
  project?: Project & { company?: { name: string } };
  rating?: Rating;
  payment?: Payment;
}

interface CandidateStats {
  totalSubmissions: number;
  completedProjects: number;
  totalEarnings: string;
  averageRating: number;
}

export default function CandidateDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: submissions, isLoading: submissionsLoading } = useQuery<SubmissionWithDetails[]>({
    queryKey: ["/api/candidate/submissions"],
    enabled: isAuthenticated,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<CandidateStats>({
    queryKey: ["/api/candidate/stats"],
    enabled: isAuthenticated,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      case "rejected": return "bg-destructive/10 text-destructive border-destructive/20";
      case "under_review": return "bg-chart-4/10 text-chart-4 border-chart-4/20";
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

  const pendingSubmissions = submissions?.filter(s => s.status === "pending" || s.status === "under_review") || [];
  const completedSubmissions = submissions?.filter(s => s.status === "approved") || [];
  const rejectedSubmissions = submissions?.filter(s => s.status === "rejected") || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Header Section */}
      <section className="py-8 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-dashboard-title">
                Welcome back, {user?.firstName || "Candidate"}!
              </h1>
              <p className="text-muted-foreground">
                Track your projects, earnings, and grow your portfolio.
              </p>
            </div>
            <Button asChild data-testid="button-browse-projects">
              <Link href="/projects">
                <Target className="mr-2 h-4 w-4" />
                Browse Projects
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Stats Cards */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <Card data-testid="card-stat-submissions">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
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
            
            <Card data-testid="card-stat-completed">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-mono">
                      {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.completedProjects || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-stat-earnings">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-chart-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-mono">
                      {statsLoading ? <Skeleton className="h-8 w-16" /> : `$${stats?.totalEarnings || "0"}`}
                    </p>
                    <p className="text-sm text-muted-foreground">Earnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-stat-rating">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-mono">
                      {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.averageRating?.toFixed(1) || "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Submissions Tabs */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="active" data-testid="tab-active">
                Active ({pendingSubmissions.length})
              </TabsTrigger>
              <TabsTrigger value="completed" data-testid="tab-completed">
                Completed ({completedSubmissions.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" data-testid="tab-rejected">
                Rejected ({rejectedSubmissions.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              {submissionsLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-16 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : pendingSubmissions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2" data-testid="text-no-active">No Active Submissions</h3>
                    <p className="text-muted-foreground mb-6">
                      Start working on projects to build your portfolio!
                    </p>
                    <Button asChild>
                      <Link href="/projects">Browse Projects</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingSubmissions.map((submission) => (
                    <Card key={submission.id} className="hover-elevate" data-testid={`card-submission-${submission.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">
                              {submission.project?.title || "Project"}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Building2 className="h-3 w-3" />
                              {submission.project?.company?.name || "Company"}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status === "under_review" ? "In Review" : "Pending"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {submission.content}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Submitted {new Date(submission.createdAt!).toLocaleDateString()}
                          </span>
                          <span className="font-semibold text-primary">
                            ${submission.project?.payment}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/projects/${submission.projectId}`}>
                            View Project
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed">
              {completedSubmissions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2" data-testid="text-no-completed">No Completed Projects Yet</h3>
                    <p className="text-muted-foreground">
                      Complete projects to start earning and building your portfolio.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedSubmissions.map((submission) => (
                    <Card key={submission.id} className="hover-elevate" data-testid={`card-completed-${submission.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">
                              {submission.project?.title || "Project"}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Building2 className="h-3 w-3" />
                              {submission.project?.company?.name || "Company"}
                            </CardDescription>
                          </div>
                          <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                            Completed
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {submission.rating && (
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < submission.rating!.score
                                    ? "fill-chart-4 text-chart-4"
                                    : "text-muted"
                                }`}
                              />
                            ))}
                            <span className="text-sm ml-1">({submission.rating.score}/5)</span>
                          </div>
                        )}
                        {submission.feedback && (
                          <p className="text-sm text-muted-foreground italic line-clamp-2 mb-3">
                            "{submission.feedback}"
                          </p>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Earned
                          </span>
                          <span className="font-bold text-chart-2">
                            ${submission.project?.payment}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="rejected">
              {rejectedSubmissions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-chart-2/10 flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-chart-2" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2" data-testid="text-no-rejected">Great Work!</h3>
                    <p className="text-muted-foreground">
                      You have no rejected submissions. Keep up the good work!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rejectedSubmissions.map((submission) => (
                    <Card key={submission.id} className="opacity-75" data-testid={`card-rejected-${submission.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">
                              {submission.project?.title || "Project"}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Building2 className="h-3 w-3" />
                              {submission.project?.company?.name || "Company"}
                            </CardDescription>
                          </div>
                          <Badge variant="destructive">Rejected</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {submission.feedback && (
                          <div className="p-3 bg-destructive/5 rounded-lg mb-3">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Feedback:</span> {submission.feedback}
                            </p>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Submitted {new Date(submission.createdAt!).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
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
