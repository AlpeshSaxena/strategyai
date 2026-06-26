import { motion } from "framer-motion";
import { useGetDemoAnalysis } from "@workspace/api-client-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ScoreRing } from "@/components/score-ring";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  TrendingUp, Target, Search, Users, Brain, Layers,
  ExternalLink, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Globe,
  ArrowRight, Zap
} from "lucide-react";
import { useState, lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";

const DownloadReport = lazy(() =>
  import("@/components/download-report").then((m) => ({ default: m.DownloadReport }))
);

function SectionCard({ title, icon: Icon, children, delay = 0 }: {
  title: string; icon: React.ElementType; children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div
      className="rounded-xl border border-border/60 bg-card/50 overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

function ImpactBadge({ impact }: { impact: string }) {
  const colors: Record<string, string> = {
    high: "bg-green-500/10 text-green-400 border-green-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    low: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${colors[impact] ?? colors.low}`}>
      {impact} impact
    </span>
  );
}

function EffortBadge({ effort }: { effort: string }) {
  const colors: Record<string, string> = {
    easy: "bg-primary/10 text-primary border-primary/20",
    medium: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    hard: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${colors[effort] ?? colors.medium}`}>
      {effort} effort
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    high: "bg-red-500/10 text-red-400 border-red-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    low: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${colors[priority] ?? colors.low}`}>
      {priority}
    </span>
  );
}

export default function Demo() {
  const { data: demo, isLoading } = useGetDemoAnalysis();
  const [expandedSuggestions, setExpandedSuggestions] = useState<number[]>([0]);

  const toggleSuggestion = (i: number) => {
    setExpandedSuggestions((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  const scores = (demo as any)?.scoresData;
  const keywords = (demo as any)?.keywordsData;
  const competitors = (demo as any)?.competitorsData;
  const content = (demo as any)?.contentData;
  const userFlow = (demo as any)?.userFlowData;
  const recommendations = (demo as any)?.recommendationsData;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-primary/30 bg-primary/10 text-primary mb-4">
            <Zap className="w-3 h-3" />
            Demo Analysis
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">example-saas.com</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                {demo?.title ?? "Example SaaS — Grow Your Business Faster"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {demo?.metaDescription}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {scores && (
                <Suspense fallback={null}>
                  <DownloadReport
                    analysis={{
                      url: "https://example-saas.com",
                      title: demo?.title ?? "Example SaaS",
                      overallScore: scores?.overallScore,
                      seoScore: scores?.seoScore,
                      uxScore: scores?.uxScore,
                      contentScore: scores?.contentScore,
                      growthScore: scores?.growthScore,
                    }}
                    scores={scores}
                    keywords={keywords}
                    competitors={competitors}
                    content={content}
                    userFlow={userFlow}
                    recommendations={recommendations}
                  />
                </Suspense>
              )}
              <Link href="/">
                <Button className="gap-2" size="sm">
                  Analyze your site
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Scores */}
        <SectionCard title="Overall Scores" icon={TrendingUp} delay={0.05}>
          {isLoading || !scores ? (
            <div className="flex gap-8 flex-wrap">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="w-24 h-24 rounded-full" />
                  <Skeleton className="w-16 h-3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-8 justify-center sm:justify-start">
                <ScoreRing score={scores.overallScore} label="Overall" size={104} strokeWidth={9} />
                <ScoreRing score={scores.seoScore} label="SEO" />
                <ScoreRing score={scores.uxScore} label="UX" />
                <ScoreRing score={scores.contentScore} label="Content" />
                <ScoreRing score={scores.growthScore} label="Growth" />
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm">
                <TrendingUp className="w-4 h-4 text-green-400 shrink-0" />
                <span className="text-green-400 font-semibold">{scores.estimatedGrowthImpact}</span>
                <span className="text-muted-foreground">if top recommendations are implemented</span>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Recommendations */}
        {recommendations && (
          <div className="mt-5">
            <SectionCard title="Top 5 Actionable Recommendations" icon={Target} delay={0.1}>
              <div className="space-y-3">
                {recommendations.map((rec: any) => (
                  <div key={rec.rank} className="rounded-lg border border-border/60 bg-background/50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">{rec.rank}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm mb-1">{rec.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-2">{rec.description}</p>
                        <div className="flex gap-2 flex-wrap">
                          <ImpactBadge impact={rec.impact} />
                          <EffortBadge effort={rec.effort} />
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-muted/50 text-muted-foreground capitalize">{rec.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* Keywords */}
        {keywords && (
          <div className="mt-5">
            <SectionCard title="Keyword Intelligence" icon={Search} delay={0.15}>
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">SEO Score</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${keywords.seoScore}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-primary w-8 text-right">{keywords.seoScore}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keywords.keywords.map((kw: any) => {
                    const typeColors: Record<string, string> = {
                      primary: "border-primary/40 bg-primary/10 text-primary",
                      "long-tail": "border-border/60 bg-muted/50 text-muted-foreground",
                      opportunity: "border-green-500/30 bg-green-500/10 text-green-400",
                    };
                    return (
                      <span
                        key={kw.keyword}
                        className={`text-xs px-3 py-1 rounded-full border font-medium ${typeColors[kw.type] ?? typeColors["long-tail"]}`}
                      >
                        {kw.keyword}
                        <span className="ml-1.5 opacity-60 font-mono text-[10px]">{kw.score}</span>
                      </span>
                    );
                  })}
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Opportunities</p>
                  <ul className="space-y-1.5">
                    {keywords.opportunities.map((opp: string) => (
                      <li key={opp} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        {opp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* Content Suggestions */}
        {content && (
          <div className="mt-5">
            <SectionCard title="Content Improvement Suggestions" icon={Brain} delay={0.2}>
              <div className="space-y-3">
                {content.suggestions.map((sug: any, i: number) => {
                  const expanded = expandedSuggestions.includes(i);
                  return (
                    <div key={i} className="rounded-lg border border-border/60 overflow-hidden">
                      <button
                        onClick={() => toggleSuggestion(i)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <PriorityBadge priority={sug.priority} />
                          <span className="text-sm font-medium">{sug.area}</span>
                        </div>
                        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </button>
                      <AnimatePresence>
                        {expanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3">
                              <div>
                                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">Current Issue</p>
                                <p className="text-xs text-muted-foreground">{sug.currentIssue}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wide text-primary font-semibold mb-1">Suggested Improvement</p>
                                <p className="text-xs">{sug.suggestedImprovement}</p>
                              </div>
                              <div className="flex items-center gap-2 rounded-md bg-green-500/5 border border-green-500/20 px-3 py-2">
                                <TrendingUp className="w-3.5 h-3.5 text-green-400 shrink-0" />
                                <p className="text-xs text-green-400">{sug.expectedImpact}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        )}

        {/* Competitors */}
        {competitors && (
          <div className="mt-5">
            <SectionCard title="Competitor Analysis" icon={Users} delay={0.25}>
              <div className="space-y-5">
                {competitors.competitors.map((comp: any) => (
                  <div key={comp.name} className="rounded-lg border border-border/60 bg-background/50 p-4">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="font-semibold text-sm">{comp.name}</p>
                        <a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                          {comp.url} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <div className="flex gap-4 text-center shrink-0">
                        {[{ label: "CTA", val: comp.ctaScore }, { label: "Content", val: comp.contentScore }, { label: "UX", val: comp.uxScore }].map((s) => (
                          <div key={s.label}>
                            <div className="text-lg font-bold font-mono text-primary">{s.val}</div>
                            <div className="text-[10px] text-muted-foreground">{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-green-400 font-semibold mb-1.5">Strengths</p>
                        <ul className="space-y-1">
                          {comp.strengths.map((s: string) => (
                            <li key={s} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-green-400 shrink-0">+</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-red-400 font-semibold mb-1.5">Weaknesses</p>
                        <ul className="space-y-1">
                          {comp.weaknesses.map((s: string) => (
                            <li key={s} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-red-400 shrink-0">−</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* User Flow */}
        {userFlow && (
          <div className="mt-5">
            <SectionCard title="User Flow Analysis" icon={Layers} delay={0.3}>
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: "UX Score", val: userFlow.uxScore },
                    { label: "Mobile", val: userFlow.mobileScore },
                    { label: "Accessibility", val: userFlow.accessibilityScore },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border border-border/60 bg-background/50 p-3">
                      <div className="text-2xl font-bold font-mono text-primary">{s.val}</div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Conversion Journey</p>
                  <div className="flex items-center gap-1 flex-wrap">
                    {userFlow.flowSteps.map((step: any, i: number) => (
                      <div key={step.step} className="flex items-center gap-1">
                        <div className="rounded-lg px-3 py-2 text-xs font-medium border border-primary/20 bg-primary/5 text-primary">
                          <div>{step.label}</div>
                          <div className="font-mono font-bold text-center">{step.score}</div>
                        </div>
                        {i < userFlow.flowSteps.length - 1 && (
                          <div className="text-muted-foreground text-xs">→</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-red-400 font-semibold mb-2">Friction Points</p>
                    <ul className="space-y-1.5">
                      {userFlow.frictionPoints.map((fp: string) => (
                        <li key={fp} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" /> {fp}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-primary font-semibold mb-2">Improvements</p>
                    <ul className="space-y-1.5">
                      {userFlow.improvements.map((imp: string) => (
                        <li key={imp} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-primary shrink-0 mt-0.5" /> {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* CTA */}
        <motion.div
          className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-8 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-bold mb-2">Ready to analyze your own website?</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
            Enter your URL and get a complete strategy report like this one in under 10 seconds.
          </p>
          <Link href="/">
            <Button size="lg" className="gap-2">
              Analyze my website
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
