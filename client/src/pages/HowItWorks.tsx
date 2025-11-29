import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowRight, 
  Target, 
  DollarSign, 
  Award, 
  Briefcase,
  Building2,
  FileCheck,
  CheckCircle,
  Star,
  Shield,
  Users,
  Zap,
  TrendingUp,
  Clock
} from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-hiw-title">
            How LayOffers Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A transparent, skill-first approach to hiring that benefits both candidates and companies.
          </p>
        </div>
      </section>
      
      {/* For Candidates Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold" data-testid="text-candidates-section">For Candidates</h2>
              <p className="text-muted-foreground">Your path from layoff to new opportunity</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                icon: Target,
                title: "Choose a Project",
                description: "Browse available micro-projects that match your skills. Each project is a real challenge from a company looking to hire.",
                details: ["Filter by skill, industry, payment", "See project requirements upfront", "Apply with one click"]
              },
              {
                step: 2,
                icon: Zap,
                title: "Complete the Work",
                description: "Tackle the project using your expertise. Show what you can really do with real-world deliverables.",
                details: ["Work on your schedule", "Submit when ready", "Receive feedback"]
              },
              {
                step: 3,
                icon: DollarSign,
                title: "Get Paid & Rated",
                description: "Receive payment upon approval. Earn ratings that build your professional reputation.",
                details: ["Quick payment processing", "Build rating history", "Grow your portfolio"]
              },
              {
                step: 4,
                icon: Briefcase,
                title: "Get Hired",
                description: "Connect with companies impressed by your work. Let your skills speak louder than your resume.",
                details: ["Direct recruiter access", "Interview invitations", "Full-time offers"]
              }
            ].map((item) => (
              <Card key={item.step} className="relative overflow-hidden hover-elevate" data-testid={`card-candidate-step-${item.step}`}>
                <div className="absolute top-0 left-0 w-12 h-12 bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {item.step}
                </div>
                <CardHeader className="pt-16">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                  <ul className="space-y-2">
                    {item.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-chart-2 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" asChild data-testid="button-candidate-start">
              <a href="/api/login">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-px bg-border" />
      </div>
      
      {/* For Companies Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-14 w-14 rounded-full bg-chart-2/10 flex items-center justify-center">
              <Building2 className="h-7 w-7 text-chart-2" />
            </div>
            <div>
              <h2 className="text-3xl font-bold" data-testid="text-companies-section">For Companies</h2>
              <p className="text-muted-foreground">Hire based on performance, not promises</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                icon: FileCheck,
                title: "Post a Challenge",
                description: "Create a real-world micro-project that tests the skills you need. Define scope, requirements, and compensation.",
                details: ["Define clear deliverables", "Set fair compensation", "Reach qualified candidates"]
              },
              {
                step: 2,
                icon: Clock,
                title: "Review Submissions",
                description: "Receive completed projects from candidates. Evaluate real work, not interview answers.",
                details: ["See actual deliverables", "Compare multiple candidates", "No resume bias"]
              },
              {
                step: 3,
                icon: Star,
                title: "Rate & Provide Feedback",
                description: "Score candidates on their work quality. Your ratings help build the talent ecosystem.",
                details: ["1-5 star rating system", "Written feedback option", "Build hiring pipeline"]
              },
              {
                step: 4,
                icon: Shield,
                title: "Hire with Confidence",
                description: "Make offers to candidates who've proven their abilities. Reduce hiring risk dramatically.",
                details: ["Verified skills", "Work samples on file", "Reduced time-to-hire"]
              }
            ].map((item) => (
              <Card key={item.step} className="relative overflow-hidden hover-elevate" data-testid={`card-company-step-${item.step}`}>
                <div className="absolute top-0 left-0 w-12 h-12 bg-chart-2 flex items-center justify-center text-white font-bold text-lg">
                  {item.step}
                </div>
                <CardHeader className="pt-16">
                  <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-chart-2" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                  <ul className="space-y-2">
                    {item.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-chart-2 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild data-testid="button-company-start">
              <a href="/api/login">
                Post Your First Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Benefits Grid */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-benefits-title">Why Skill-First Hiring?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Higher Success Rate",
                description: "95% of placements made through LayOffers result in successful long-term hires."
              },
              {
                icon: Clock,
                title: "Faster Hiring",
                description: "Average time from project post to hire is just 3 weeks compared to 6+ weeks traditionally."
              },
              {
                icon: Shield,
                title: "Reduced Risk",
                description: "See candidates perform before you hire. No more costly bad hires based on interviews alone."
              }
            ].map((benefit, index) => (
              <Card key={index} className="text-center hover-elevate" data-testid={`card-benefit-${index}`}>
                <CardContent className="pt-8 pb-6">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <benefit.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6" data-testid="text-final-cta">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join LayOffers today and experience skill-first hiring.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/api/login">
                I'm Looking for Work
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/api/login">
                I'm Looking to Hire
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
