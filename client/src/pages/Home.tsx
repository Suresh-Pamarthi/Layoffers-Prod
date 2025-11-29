import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { 
  Target, 
  Briefcase, 
  Building2, 
  ArrowRight,
  Star,
  DollarSign,
  TrendingUp,
  Clock,
  Users,
  Shield
} from "lucide-react";
import type { Project, Company } from "@shared/schema";

interface ProjectWithCompany extends Project {
  company?: Company;
}

export default function Home() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: featuredProjects, isLoading: projectsLoading } = useQuery<ProjectWithCompany[]>({
    queryKey: ["/api/projects/featured"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.role === "admin") {
        setLocation("/admin");
      } else if (user.role === "company") {
        setLocation("/company");
      }
    }
  }, [user, isAuthenticated, authLoading, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Welcome Section */}
      <section className="py-12 border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="text-welcome">
                Welcome back, {user?.firstName || "there"}!
              </h1>
              <p className="text-muted-foreground text-lg">
                {user?.role === "candidate" 
                  ? "Ready to showcase your skills? Browse projects and start earning."
                  : "Manage your profile and explore the platform."}
              </p>
            </div>
            {user?.role === "candidate" && (
              <div className="flex gap-4">
                <Button asChild data-testid="button-browse">
                  <Link href="/projects">
                    <Target className="mr-2 h-4 w-4" />
                    Browse Projects
                  </Link>
                </Button>
                <Button variant="outline" asChild data-testid="button-dashboard">
                  <Link href="/candidate">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    My Dashboard
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Quick Stats for Candidates */}
      {user?.role === "candidate" && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="hover-elevate" data-testid="card-quick-projects">
                <CardContent className="pt-6">
                  <Link href="/projects">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Target className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Browse Projects</p>
                        <p className="text-sm text-muted-foreground">Find your next challenge</p>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="hover-elevate" data-testid="card-quick-submissions">
                <CardContent className="pt-6">
                  <Link href="/candidate">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-chart-4" />
                      </div>
                      <div>
                        <p className="font-semibold">My Submissions</p>
                        <p className="text-sm text-muted-foreground">Track your progress</p>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="hover-elevate" data-testid="card-quick-earnings">
                <CardContent className="pt-6">
                  <Link href="/candidate">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-chart-2" />
                      </div>
                      <div>
                        <p className="font-semibold">Earnings</p>
                        <p className="text-sm text-muted-foreground">View your balance</p>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="hover-elevate" data-testid="card-quick-profile">
                <CardContent className="pt-6">
                  <Link href="/profile">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                        <Star className="h-6 w-6 text-chart-3" />
                      </div>
                      <div>
                        <p className="font-semibold">My Profile</p>
                        <p className="text-sm text-muted-foreground">Showcase your skills</p>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}
      
      {/* Featured Projects */}
      {user?.role === "candidate" && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" data-testid="text-featured">Featured Projects</h2>
              <Button variant="ghost" asChild>
                <Link href="/projects">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            {projectsLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
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
            ) : (featuredProjects?.length || 0) === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Featured Projects</h3>
                  <p className="text-muted-foreground mb-6">Check back soon for new opportunities!</p>
                  <Button asChild>
                    <Link href="/projects">Browse All Projects</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {featuredProjects?.slice(0, 6).map((project) => (
                  <Card key={project.id} className="flex flex-col hover-elevate" data-testid={`card-featured-${project.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{project.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Building2 className="h-3 w-3" />
                            {project.company?.name || "Company"}
                          </CardDescription>
                        </div>
                        <span className="font-bold text-primary flex-shrink-0">${project.payment}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{project.description}</p>
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
          </div>
        </section>
      )}
      
      {/* Info Cards for Non-Candidates */}
      {user?.role !== "candidate" && user?.role !== "admin" && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="hover-elevate">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">For Candidates</h3>
                  <p className="text-muted-foreground mb-6">
                    Browse projects, complete challenges, and get hired based on your skills.
                  </p>
                  <Button asChild>
                    <Link href="/projects">Explore Projects</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover-elevate">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-chart-2/10 flex items-center justify-center mx-auto mb-6">
                    <Building2 className="h-8 w-8 text-chart-2" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">For Companies</h3>
                  <p className="text-muted-foreground mb-6">
                    Post projects, review submissions, and hire top talent based on real work.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/company/setup">Create Company Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}
      
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
