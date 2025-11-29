import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Filter, 
  DollarSign, 
  Clock, 
  Building2, 
  Briefcase,
  ChevronRight,
  Target,
  Zap
} from "lucide-react";
import type { Project, Company } from "@shared/schema";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface ProjectWithCompany extends Project {
  company?: Company;
}

export default function Projects() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [skillFilter, setSkillFilter] = useState<string>("all");
  
  const { data: projects, isLoading } = useQuery<ProjectWithCompany[]>({
    queryKey: ["/api/projects"],
  });

  const filteredProjects = projects?.filter((project) => {
    if (project.status !== "active") return false;
    
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = 
      difficultyFilter === "all" || project.difficulty === difficultyFilter;
    
    const matchesSkill = 
      skillFilter === "all" || 
      project.skills?.some(s => s.toLowerCase().includes(skillFilter.toLowerCase()));
    
    return matchesSearch && matchesDifficulty && matchesSkill;
  }) || [];

  const allSkills = [...new Set(projects?.flatMap(p => p.skills || []) || [])];

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "beginner": return "bg-chart-2/10 text-chart-2";
      case "intermediate": return "bg-chart-4/10 text-chart-4";
      case "advanced": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="text-projects-title">
                Browse Projects
              </h1>
              <p className="text-muted-foreground">
                Find paid micro-projects that match your skills
              </p>
            </div>
            {isAuthenticated && (
              <Button asChild data-testid="button-my-submissions">
                <Link href="/candidate">
                  <Target className="mr-2 h-4 w-4" />
                  My Submissions
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
      
      {/* Filters */}
      <section className="py-6 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full md:w-[180px]" data-testid="select-difficulty">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger className="w-full md:w-[180px]" data-testid="select-skill">
                <Zap className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {allSkills.map((skill) => (
                  <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>
      
      {/* Projects Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2" data-testid="text-no-projects">No Projects Found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || difficultyFilter !== "all" || skillFilter !== "all"
                  ? "Try adjusting your filters to see more projects."
                  : "No active projects available right now. Check back soon!"}
              </p>
              {(searchQuery || difficultyFilter !== "all" || skillFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setDifficultyFilter("all");
                    setSkillFilter("all");
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <p className="text-muted-foreground mb-6" data-testid="text-project-count">
                {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""} available
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="flex flex-col hover-elevate" data-testid={`card-project-${project.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg mb-1 truncate">{project.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{project.company?.name || "Company"}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-1 text-xl font-bold text-primary">
                            <DollarSign className="h-5 w-5" />
                            {project.payment}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.skills?.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {(project.skills?.length || 0) > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(project.skills?.length || 0) - 3} more
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                          {project.difficulty || "Intermediate"}
                        </span>
                        {project.deadline && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(project.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      {isAuthenticated ? (
                        <Button className="w-full" asChild data-testid={`button-apply-${project.id}`}>
                          <Link href={`/projects/${project.id}`}>
                            View Details
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button className="w-full" asChild data-testid={`button-login-apply-${project.id}`}>
                          <a href="/api/login">
                            Log in to Apply
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}
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
