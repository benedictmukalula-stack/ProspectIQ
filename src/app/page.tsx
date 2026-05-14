import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProspectIQLogo } from "@/components/prospectiq/logo";
import {
  Search,
  Target,
  Zap,
  ArrowRight,
  BarChart3,
  Shield,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <ProspectIQLogo />
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Find your next{" "}
              <span className="text-primary">best customer</span>{" "}
              with AI
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
              ProspectIQ discovers, qualifies, and engages your ideal B2B
              prospects automatically. Turn cold data into warm conversations
              with intelligent lead intelligence.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required. 14-day free trial.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to close more deals
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              ProspectIQ combines AI-driven prospecting with actionable
              intelligence to help your sales team focus on what matters.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 bg-muted/50">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  Smart Discovery
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  AI scans thousands of sources to find prospects matching your
                  ideal customer profile. No more manual searching through
                  databases or social platforms.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-muted/50">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  Lead Scoring
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Machine learning models score and rank leads based on
                  engagement signals, firmographics, and behavioral data to
                  prioritize your outreach.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-muted/50">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  Automated Outreach
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Craft personalized email sequences and follow-ups that feel
                  human. Multi-channel touchpoints adapt based on prospect
                  engagement.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-muted/50">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  Real-time Analytics
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Track open rates, reply rates, and pipeline velocity across
                  all campaigns with live dashboards and conversion funnels.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-muted/50">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  GDPR Compliant
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Built-in compliance checks ensure every prospect interaction
                  respects data privacy regulations. Consent tracking and audit
                  logs included.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-muted/50">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  CRM Integrations
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sync seamlessly with Salesforce, HubSpot, and Pipedrive.
                  Two-way data sync keeps your pipeline up to date across all
                  tools.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-2xl bg-primary p-10 text-center text-primary-foreground sm:p-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to find better leads?
            </h2>
            <p className="mt-4 text-lg opacity-90">
              Join thousands of sales teams using ProspectIQ to build
              predictable pipelines and close more deals.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-8"
              asChild
            >
              <Link href="/auth/signup">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <ProspectIQLogo className="opacity-80" />
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ProspectIQ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
