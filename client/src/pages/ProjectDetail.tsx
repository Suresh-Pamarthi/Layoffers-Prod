import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  ArrowLeft, 
  DollarSign, 
  Clock, 
  Building2, 
  Briefcase,
  Send,
  CheckCircle,
  FileText,
  Users,
  Target
} from "lucide-react";
import type { Project, Company, Submission } from "@shared/schema";
import { Link } from "wouter";

interface ProjectWithCompany extends Project {
  company?: Company;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [content, setContent] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  const { data: project, isLoading } = useQuery<ProjectWithCompany>({
    queryKey: ["/api/projects", id],
  });

  const { data: mySubmission } = useQuery<Submission>({
    queryKey: ["/api/projects", id, "my-submission"],
    enabled: isAuthenticated,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/projects/${id}/submissions`, {
        content,
        attachmentUrl: attachmentUrl || undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: "Submission Sent!",
        description: "Your work has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", id, "my-submission"] });
      setContent("");
      setAttachmentUrl("");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to submit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "beginner": return "bg-chart-2/10 text-chart-2";
      case "intermediate": return "bg-chart-4/10 text-chart-4";
      case "advanced": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">This project doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const hasSubmitted = !!mySubmission;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild data-testid="button-back">
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
        
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-project-title">{project.title}</h1>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span data-testid="text-company-name">{project.company?.name || "Company"}</span>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                  {project.difficulty || "Intermediate"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-3xl font-bold text-primary" data-testid="text-payment">
              <DollarSign className="h-8 w-8" />
              {project.payment}
            </div>
          </div>
          
          {/* Skills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.skills?.map((skill) => (
              <Badge key={skill} variant="secondary" data-testid={`badge-skill-${skill}`}>
                {skill}
              </Badge>
            ))}
          </div>
          
          {/* Meta Info */}
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            {project.deadline && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
              </div>
            )}
            {project.maxSubmissions && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Max {project.maxSubmissions} submissions</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Project Details */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            <Card data-testid="card-description">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Project Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{project.description}</p>
              </CardContent>
            </Card>
            
            {/* Requirements */}
            {project.requirements && (
              <Card data-testid="card-requirements">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{project.requirements}</p>
                </CardContent>
              </Card>
            )}
            
            {/* Submission Form */}
            {isAuthenticated && user?.role === "candidate" && !hasSubmitted && (
              <Card data-testid="card-submission">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Submit Your Work
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="content">Your Submission</Label>
                    <Textarea
                      id="content"
                      placeholder="Describe your work, approach, and deliverables..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="mt-2 min-h-[150px]"
                      data-testid="input-submission-content"
                    />
                  </div>
                  <div>
                    <Label htmlFor="attachment">Attachment URL (optional)</Label>
                    <Input
                      id="attachment"
                      type="url"
                      placeholder="https://github.com/yourusername/project or Google Drive link"
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      className="mt-2"
                      data-testid="input-attachment"
                    />
                  </div>
                  <Button
                    onClick={() => submitMutation.mutate()}
                    disabled={!content.trim() || submitMutation.isPending}
                    className="w-full"
                    data-testid="button-submit"
                  >
                    {submitMutation.isPending ? "Submitting..." : "Submit Project"}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* Already Submitted */}
            {hasSubmitted && (
              <Card className="border-chart-2" data-testid="card-submitted">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-chart-2/10 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-chart-2" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Submission Received!</h3>
                      <p className="text-sm text-muted-foreground">
                        Your work is being reviewed. You'll be notified once it's rated.
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Your submission:</p>
                    <p className="text-sm text-muted-foreground line-clamp-3">{mySubmission.content}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Not Logged In */}
            {!isAuthenticated && (
              <Card data-testid="card-login-prompt">
                <CardContent className="pt-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Ready to Apply?</h3>
                  <p className="text-muted-foreground mb-4">
                    Log in or create an account to submit your work for this project.
                  </p>
                  <Button asChild data-testid="button-login">
                    <a href="/api/login">
                      Log In to Apply
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            {project.company && (
              <Card data-testid="card-company">
                <CardHeader>
                  <CardTitle className="text-lg">About the Company</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{project.company.name}</p>
                      {project.company.industry && (
                        <p className="text-sm text-muted-foreground">{project.company.industry}</p>
                      )}
                    </div>
                  </div>
                  {project.company.description && (
                    <p className="text-sm text-muted-foreground">{project.company.description}</p>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Quick Stats */}
            <Card data-testid="card-stats">
              <CardHeader>
                <CardTitle className="text-lg">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="font-bold text-primary">${project.payment}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Difficulty</span>
                  <span className="capitalize">{project.difficulty || "Intermediate"}</span>
                </div>
                {project.deadline && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Deadline</span>
                    <span>{new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary" className="capitalize">{project.status}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
