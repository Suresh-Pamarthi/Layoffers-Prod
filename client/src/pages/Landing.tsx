import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { 
  Briefcase, 
  Star, 
  DollarSign, 
  CheckCircle, 
  Users, 
  Target, 
  Award,
  ArrowRight,
  Building2,
  FileCheck,
  Sparkles,
  TrendingUp,
  Shield
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="secondary" className="px-4 py-2" data-testid="badge-hero">
                <Sparkles className="w-4 h-4 mr-2" />
                Skill-First Hiring Platform
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold leading-tight" data-testid="text-hero-headline">
                Turn Your Layoff Into a{" "}
                <span className="text-primary">Launchpad</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg" data-testid="text-hero-description">
                Get hired based on your skills, not your resume. Complete paid micro-projects, 
                showcase your abilities, and connect directly with companies looking for talent like you.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8 py-6" asChild data-testid="button-hero-candidate">
                  <a href="/api/login">
                    Start a Project
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild data-testid="button-hero-company">
                  <a href="/api/login">
                    Post a Challenge
                    <Building2 className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="hidden lg:block relative">
              <div className="relative aspect-square max-w-lg mx-auto">
                {/* Abstract shapes */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
                
                {/* Cards preview */}
                <Card className="absolute top-8 left-0 w-64 shadow-lg hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Frontend Challenge</p>
                        <p className="text-xs text-muted-foreground">TechCorp Inc.</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">React</Badge>
                      <span className="font-bold text-primary">$250</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="absolute top-32 right-0 w-64 shadow-lg hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-chart-2/10 flex items-center justify-center">
                        <FileCheck className="w-5 h-5 text-chart-2" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Data Analysis</p>
                        <p className="text-xs text-muted-foreground">DataFlow Labs</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">Python</Badge>
                      <span className="font-bold text-primary">$400</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="absolute bottom-8 left-8 w-72 shadow-lg hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-chart-4/10 flex items-center justify-center">
                        <Award className="w-6 h-6 text-chart-4" />
                      </div>
                      <div>
                        <p className="font-semibold">Sarah M. hired!</p>
                        <p className="text-sm text-muted-foreground">After completing 3 projects</p>
                        <div className="flex mt-1">
                          {[1,2,3,4,5].map((i) => (
                            <Star key={i} className="w-4 h-4 fill-chart-4 text-chart-4" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Trust Bar */}
      <section className="border-y bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div data-testid="stat-projects">
              <p className="text-4xl font-bold font-mono text-primary">500+</p>
              <p className="text-sm text-muted-foreground mt-1">Projects Posted</p>
            </div>
            <div data-testid="stat-hired">
              <p className="text-4xl font-bold font-mono text-primary">200+</p>
              <p className="text-sm text-muted-foreground mt-1">Candidates Hired</p>
            </div>
            <div data-testid="stat-paid">
              <p className="text-4xl font-bold font-mono text-primary">$2M+</p>
              <p className="text-sm text-muted-foreground mt-1">Paid to Candidates</p>
            </div>
            <div data-testid="stat-success">
              <p className="text-4xl font-bold font-mono text-primary">95%</p>
              <p className="text-sm text-muted-foreground mt-1">Success Rate</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background" id="how-it-works">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold" data-testid="text-how-it-works-title">How LayOffers Works</h2>
            <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-how-it-works-description">
              LayOffers is a skills-based hiring platform that replaces resume screening with real-world challenges. Companies publish role-specific micro-tasks, candidates complete them, and our intelligent grading system automatically scores the submissions. This ranks applicants based on proven ability rather than CV keywords, reducing bias and identifying top talent faster.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button size="lg" className="text-lg px-8 py-6" asChild data-testid="button-candidate-cta">
                <a href="/api/login">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild data-testid="button-company-cta">
                <a href="/api/login">
                  Post Your First Challenge
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-testimonials-title">Success Stories</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real people who transformed their careers through skill-first hiring.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Mitchell",
                role: "Frontend Developer",
                company: "Now at TechCorp",
                quote: "After being laid off, I completed 5 projects and landed my dream job. The companies could see my actual skills, not just my resume.",
                rating: 5,
                avatar: "SM"
              },
              {
                name: "James Chen",
                role: "Data Scientist",
                company: "Now at DataFlow",
                quote: "LayOffers gave me a platform to prove myself. I went from unemployed to employed in 6 weeks through project-based hiring.",
                rating: 5,
                avatar: "JC"
              },
              {
                name: "Maria Garcia",
                role: "Product Manager",
                company: "Now at StartupX",
                quote: "The micro-project approach let me showcase my strategic thinking. I earned while I searched and found the perfect fit.",
                rating: 5,
                avatar: "MG"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="hover-elevate" data-testid={`card-testimonial-${index}`}>
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-chart-4 text-chart-4" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-primary">{testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="text-cta-title">
            Ready to Get Hired Based on Your Skills?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who've discovered a better way to find work. 
            Start your first project today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild data-testid="button-final-candidate">
              <a href="/api/login">
                I'm a Candidate
                <TrendingUp className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild data-testid="button-final-company">
              <a href="/api/login">
                I'm Hiring
                <Building2 className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
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
