import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Sparkles, LayoutGrid } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b p-4 flex justify-between items-center max-w-7xl mx-auto">
        <div className="font-bold text-2xl flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            L
          </div>
          Laya
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Master your life, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            one habit at a time.
          </span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          The all-in-one productivity suite that combines Excel-like tracking,
          AI-powered planning, and goal management.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="h-12 px-8 text-lg">
              Start For Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 text-left">
          <FeatureCard
            icon={<LayoutGrid className="w-6 h-6 text-blue-500" />}
            title="Excel-like Grid"
            desc="Visualise your entire year in a single, satisfying view. Track completion with one click."
          />
          <FeatureCard
            icon={<Sparkles className="w-6 h-6 text-purple-500" />}
            title="AI Coach"
            desc="Laya analyzes your habits and automatically schedules your day for maximum productivity."
          />
          <FeatureCard
            icon={<CheckCircle className="w-6 h-6 text-green-500" />}
            title="Goal Tracker"
            desc="Break down big dreams into actionable steps. Track progress bars and milestones."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-all">
      <div className="mb-4 bg-muted/50 w-12 h-12 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground">{desc}</p>
    </div>
  );
}
