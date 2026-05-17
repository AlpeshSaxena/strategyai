import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListAnalyses, useDeleteAnalysis, getListAnalysesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  History as HistoryIcon, Search, Trash2, ExternalLink, Globe,
  TrendingUp, CheckCircle2, Clock, AlertTriangle, ArrowRight, Zap,
  RefreshCw
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    completed: { icon: CheckCircle2, color: "text-green-400 bg-green-500/10 border-green-500/20", label: "Complete" },
    processing: { icon: RefreshCw, color: "text-primary bg-primary/10 border-primary/20", label: "Processing" },
    pending: { icon: Clock, color: "text-muted-foreground bg-muted/50 border-border", label: "Pending" },
    failed: { icon: AlertTriangle, color: "text-red-400 bg-red-500/10 border-red-500/20", label: "Failed" },
  };
  const cfg = configs[status] ?? configs.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.color}`}>
      <cfg.icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function ScorePill({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? "text-green-400" : score >= 60 ? "text-primary" : score >= 40 ? "text-yellow-400" : "text-red-400";
  return (
    <div className="text-center">
      <div className={`text-base font-bold font-mono ${color}`}>{score}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

export default function History() {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: analyses, isLoading } = useListAnalyses();
  const deleteAnalysis = useDeleteAnalysis();

  const filtered = (analyses ?? []).filter((a) =>
    a.url.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDeletingId(id);
    try {
      await deleteAnalysis.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListAnalysesQueryKey() });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <HistoryIcon className="w-5 h-5 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">Analysis History</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                All your previous website analyses
              </p>
            </div>
            <Link href="/">
              <Button size="sm" className="gap-2">
                <Zap className="w-3.5 h-3.5" />
                New Analysis
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-sm bg-card border-border/60"
            />
          </div>
        </motion.div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            className="text-center py-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {analyses?.length === 0 ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <HistoryIcon className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No analyses yet</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                  Enter a website URL on the home page to run your first analysis.
                </p>
                <Link href="/">
                  <Button className="gap-2">
                    Analyze a website
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No results for "{search}"</p>
              </>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((analysis, i) => (
                <motion.div
                  key={analysis.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                >
                  <Link href={analysis.status === "completed" ? `/analysis/${analysis.id}` : "#"}>
                    <div className={`group rounded-xl border border-border/60 bg-card/50 p-4 transition-all duration-200 ${analysis.status === "completed" ? "hover:border-primary/40 hover:bg-card cursor-pointer" : "cursor-default"}`}>
                      <div className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Globe className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className="text-sm font-semibold truncate max-w-xs">{analysis.url}</span>
                                <StatusBadge status={analysis.status} />
                              </div>
                              <span className="text-xs text-muted-foreground">{formatDate(analysis.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {analysis.status === "completed" && analysis.overallScore > 0 && (
                                <div className="hidden sm:flex items-center gap-4 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/40">
                                  <ScorePill score={analysis.overallScore} label="Score" />
                                </div>
                              )}
                              <button
                                onClick={(e) => handleDelete(analysis.id, e)}
                                disabled={deletingId === analysis.id}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400"
                              >
                                {deletingId === analysis.id ? (
                                  <motion.div
                                    className="w-4 h-4 rounded-full border-2 border-red-400/30 border-t-red-400"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                  />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                              {analysis.status === "completed" && (
                                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
