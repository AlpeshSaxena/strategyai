import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useCreateAnalysis } from "@workspace/api-client-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Zap, Search, TrendingUp, Globe, BarChart3, Users,
  Target, ArrowRight, Shield, Gauge, Layers, ChevronRight,
  Brain, KeyRound, LineChart
} from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Website Content Analysis",
    description: "Extract and analyze titles, headings, meta descriptions, CTAs, and site structure in seconds.",
  },
  {
    icon: Users,
    title: "Competitor Analysis",
    description: "Compare strengths, weaknesses, content quality, and UX patterns against your competitors.",
  },
  {
    icon: KeyRound,
    title: "Keyword Intelligence",
    description: "Discover primary keywords, long-tail opportunities, search intent, and SEO scoring.",
  },
  {
    icon: Brain,
    title: "Content Improvement",
    description: "AI-generated headline, CTA, and copy suggestions with expected conversion impact.",
  },
  {
    icon: Layers,
    title: "User Flow Analysis",
    description: "Map navigation clarity, conversion funnel friction points, and accessibility issues.",
  },
  {
    icon: LineChart,
    title: "Growth Dashboard",
    description: "Unified scores for SEO, UX, content, and growth with top 5 actionable recommendations.",
  },
];

const stats = [
  { value: "10K+", label: "Sites Analyzed" },
  { value: "4.9", label: "Avg Rating" },
  { value: "< 8s", label: "Analysis Time" },
  { value: "98%", label: "Accuracy Rate" },
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const createAnalysis = useCreateAnalysis();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!url.trim()) return;
    try {
      const result = await createAnalysis.mutateAsync({ data: { url: url.trim() } });
      navigate(`/analysis/${result.id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to connect to the analysis server.";
      setErrorMsg(message.includes("fetch") || message.includes("network") || message.includes("Failed")
        ? "Unable to reach the analysis API. Please check your connection or try the Demo."
        : message);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20"
            style={{
              background: "radial-gradient(ellipse, hsl(217, 95%, 60%) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-10"
            style={{
              background: "radial-gradient(ellipse, hsl(280, 80%, 65%) 0%, transparent 70%)",
            }}
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.08, 0.15, 0.08] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(hsl(217, 95%, 60%) 1px, transparent 1px), linear-gradient(90deg, hsl(217, 95%, 60%) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-primary/30 bg-primary/10 text-primary mb-6">
              <Zap className="w-3 h-3" />
              AI-Powered Website Intelligence
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.1]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Website Strategy &amp;{" "}
            <span className="text-primary">Growth Analyzer</span>
          </motion.h1>

          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Analyze any website's SEO, content, competitors, and user experience with
            AI-powered strategic insights. Get your growth roadmap in seconds.
          </motion.p>

          <motion.form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter website URL (e.g. stripe.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-9 h-11 bg-card border-border/60 focus:border-primary/60 text-sm"
                disabled={createAnalysis.isPending}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-11 gap-2 px-6 bg-primary hover:bg-primary/90 text-white font-semibold"
              disabled={createAnalysis.isPending || !url.trim()}
            >
              {createAnalysis.isPending ? (
                <>
                  <motion.div
                    className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                  Analyzing
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Analyze
                </>
              )}
            </Button>
          </motion.form>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto mb-4 px-4 py-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive text-center"
            >
              {errorMsg}
            </motion.div>
          )}

          <motion.div
            className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>No account required · Results in under 10 seconds</span>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold font-mono text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 block">About</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Strategic intelligence, instantly
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              StrategyAI combines web scraping, AI analysis, and competitive intelligence
              to give you a complete picture of any website's strengths, weaknesses,
              and growth opportunities — in one unified report.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Gauge, title: "Instant Analysis", desc: "Comprehensive website audit in under 10 seconds, not hours." },
              { icon: Target, title: "Actionable Insights", desc: "Every finding comes with specific, prioritized recommendations." },
              { icon: TrendingUp, title: "Growth-Focused", desc: "Insights tied to measurable outcomes: traffic, conversions, rankings." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="rounded-xl border border-border/60 bg-card/50 p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 border-t border-border/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 block">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Six modules. One complete picture.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every analysis runs all six intelligence modules simultaneously, giving you a complete strategy report.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="group rounded-xl border border-border/60 bg-card/50 p-6 hover:border-primary/40 hover:bg-card transition-all duration-200"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-4 sm:px-6 border-t border-border/30">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="rounded-2xl border border-primary/20 bg-primary/5 p-10 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
              background: "radial-gradient(ellipse at center, hsl(217, 95%, 60%) 0%, transparent 70%)"
            }} />
            <BarChart3 className="w-10 h-10 text-primary mx-auto mb-5" />
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Ready to grow your website?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Enter any URL and get a complete AI-powered strategy report with actionable recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto w-full">
                <Input
                  placeholder="yourwebsite.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-10 text-sm bg-background"
                />
                <Button type="submit" disabled={createAnalysis.isPending || !url.trim()} className="h-10 gap-1.5 whitespace-nowrap">
                  <Search className="w-3.5 h-3.5" />
                  Analyze
                </Button>
              </form>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Or{" "}
              <a href="/demo" className="text-primary underline underline-offset-2">
                view a demo analysis
              </a>{" "}
              first
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-4 sm:px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 block">Contact</span>
            <h2 className="text-3xl font-bold tracking-tight mb-4">Questions or feedback?</h2>
            <p className="text-muted-foreground mb-8">
              We're building this in the open. Reach out anytime.
            </p>
            <Button variant="outline" className="gap-2" size="lg">
              Get in touch
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
