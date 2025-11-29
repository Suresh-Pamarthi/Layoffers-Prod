import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { 
  User, 
  Mail, 
  Briefcase, 
  Link as LinkIcon,
  Star,
  Edit,
  Save,
  X,
  CheckCircle,
  FileText,
  Building2
} from "lucide-react";
import type { Submission, Project, Rating } from "@shared/schema";

interface SubmissionWithDetails extends Submission {
  project?: Project & { company?: { name: string } };
  rating?: Rating;
}

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  bio: z.string().optional(),
  skills: z.string().optional(),
  experience: z.string().optional(),
  portfolioUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      bio: "",
      skills: "",
      experience: "",
      portfolioUrl: "",
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
        skills: user.skills?.join(", ") || "",
        experience: user.experience || "",
        portfolioUrl: user.portfolioUrl || "",
      });
    }
  }, [user, form]);

  const { data: completedSubmissions, isLoading: submissionsLoading } = useQuery<SubmissionWithDetails[]>({
    queryKey: ["/api/candidate/submissions/completed"],
    enabled: isAuthenticated && user?.role === "candidate",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return await apiRequest("PATCH", "/api/profile", {
        ...data,
        skills: data.skills?.split(",").map(s => s.trim()).filter(Boolean),
      });
    },
    onSuccess: () => {
      toast({ title: "Profile Updated!" });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const averageRating = completedSubmissions?.reduce((acc, sub) => {
    if (sub.rating) return acc + sub.rating.score;
    return acc;
  }, 0) || 0;
  const ratingCount = completedSubmissions?.filter(s => s.rating).length || 0;
  const avgRating = ratingCount > 0 ? (averageRating / ratingCount).toFixed(1) : "N/A";

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Skeleton className="h-48 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8" data-testid="card-profile-header">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} className="object-cover" />
                <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                  <h1 className="text-2xl font-bold" data-testid="text-profile-name">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <Badge variant="secondary" className="w-fit capitalize">{user?.role}</Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Mail className="h-4 w-4" />
                  <span data-testid="text-profile-email">{user?.email}</span>
                </div>
                {user?.role === "candidate" && (
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{completedSubmissions?.length || 0} completed projects</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-chart-4" />
                      <span className="text-sm">{avgRating} average rating</span>
                    </div>
                  </div>
                )}
              </div>
              <Button 
                variant={isEditing ? "ghost" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
                data-testid="button-edit-profile"
              >
                {isEditing ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Edit Form or Display */}
        {isEditing ? (
          <Card data-testid="card-edit-form">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your personal information and skills.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-firstname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-lastname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about yourself..."
                            className="min-h-[100px]"
                            {...field} 
                            data-testid="input-bio"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills (comma-separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="React, TypeScript, Node.js" {...field} data-testid="input-skills" />
                        </FormControl>
                        <FormDescription>List your key skills separated by commas.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your professional experience..."
                            {...field} 
                            data-testid="input-experience"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="portfolioUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Portfolio URL</FormLabel>
                        <FormControl>
                          <Input type="url" placeholder="https://yourportfolio.com" {...field} data-testid="input-portfolio" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    <Save className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="about" data-testid="tab-about">About</TabsTrigger>
              {user?.role === "candidate" && (
                <TabsTrigger value="portfolio" data-testid="tab-portfolio">Portfolio</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="about">
              <Card data-testid="card-about">
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {user?.bio && (
                    <div>
                      <Label className="text-muted-foreground">Bio</Label>
                      <p className="mt-1">{user.bio}</p>
                    </div>
                  )}
                  
                  {user?.skills && user.skills.length > 0 && (
                    <div>
                      <Label className="text-muted-foreground">Skills</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {user?.experience && (
                    <div>
                      <Label className="text-muted-foreground">Experience</Label>
                      <p className="mt-1 whitespace-pre-wrap">{user.experience}</p>
                    </div>
                  )}
                  
                  {user?.portfolioUrl && (
                    <div>
                      <Label className="text-muted-foreground">Portfolio</Label>
                      <a 
                        href={user.portfolioUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 mt-1 text-primary hover:underline"
                      >
                        <LinkIcon className="h-4 w-4" />
                        {user.portfolioUrl}
                      </a>
                    </div>
                  )}
                  
                  {!user?.bio && (!user?.skills || user.skills.length === 0) && !user?.experience && (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">Your profile is looking empty!</p>
                      <Button onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Add Your Info
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {user?.role === "candidate" && (
              <TabsContent value="portfolio">
                <Card data-testid="card-portfolio">
                  <CardHeader>
                    <CardTitle>Completed Projects</CardTitle>
                    <CardDescription>Projects you've successfully completed on LayOffers.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {submissionsLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-24 w-full" />
                        ))}
                      </div>
                    ) : (completedSubmissions?.length || 0) === 0 ? (
                      <div className="text-center py-8">
                        <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No completed projects yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {completedSubmissions?.map((submission) => (
                          <div 
                            key={submission.id} 
                            className="flex items-start gap-4 p-4 border rounded-lg"
                            data-testid={`portfolio-item-${submission.id}`}
                          >
                            <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="h-6 w-6 text-chart-2" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold">{submission.project?.title}</h4>
                              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <Building2 className="h-3 w-3" />
                                {submission.project?.company?.name || "Company"}
                              </p>
                              {submission.rating && (
                                <div className="flex items-center gap-1 mt-2">
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
                                </div>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-chart-2">${submission.project?.payment}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(submission.createdAt!).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
      
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
