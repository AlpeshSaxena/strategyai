import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileDown, ChevronDown } from "lucide-react";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from "docx";

interface DownloadReportProps {
  analysis: {
    url: string;
    title?: string | null;
    overallScore?: number | null;
    seoScore?: number | null;
    uxScore?: number | null;
    contentScore?: number | null;
    growthScore?: number | null;
  };
  scores?: any;
  keywords?: any;
  competitors?: any;
  content?: any;
  userFlow?: any;
  recommendations?: any[];
}

export function DownloadReport({
  analysis,
  scores,
  keywords,
  competitors,
  content,
  userFlow,
  recommendations,
}: DownloadReportProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<"pdf" | "word" | null>(null);

  const siteName = analysis.title ?? analysis.url;
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const downloadPDF = async () => {
    setLoading("pdf");
    setOpen(false);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 18;
      const contentW = pageW - margin * 2;
      let y = margin;

      const checkNewPage = (needed = 12) => {
        if (y + needed > pageH - margin) {
          doc.addPage();
          y = margin;
        }
      };

      const addSection = (title: string) => {
        checkNewPage(18);
        y += 4;
        doc.setFillColor(37, 99, 235);
        doc.rect(margin, y, contentW, 8, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(title.toUpperCase(), margin + 3, y + 5.5);
        doc.setTextColor(30, 30, 30);
        y += 12;
      };

      const addText = (text: string, size = 9, bold = false, color: [number, number, number] = [30, 30, 30]) => {
        checkNewPage(6);
        doc.setFontSize(size);
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, contentW);
        doc.text(lines, margin, y);
        y += lines.length * (size * 0.42) + 2;
      };

      const addBullet = (text: string, color: [number, number, number] = [60, 60, 60]) => {
        checkNewPage(6);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, contentW - 6);
        doc.text("•", margin, y);
        doc.text(lines, margin + 5, y);
        y += lines.length * 4 + 1.5;
      };

      const scoreBar = (label: string, score: number) => {
        checkNewPage(10);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        doc.text(`${label}:`, margin, y);
        doc.setFont("helvetica", "bold");
        const col: [number,number,number] = score >= 80 ? [34, 197, 94] : score >= 60 ? [37, 99, 235] : score >= 40 ? [234, 179, 8] : [239, 68, 68];
        doc.setTextColor(...col);
        doc.text(String(score), margin + 38, y);
        doc.setTextColor(200, 200, 200);
        doc.rect(margin + 45, y - 3.5, contentW - 45, 4, "F");
        doc.setFillColor(...col);
        doc.rect(margin + 45, y - 3.5, (contentW - 45) * (score / 100), 4, "F");
        doc.setTextColor(30, 30, 30);
        y += 7;
      };

      // ── Header ──
      doc.setFillColor(10, 15, 40);
      doc.rect(0, 0, pageW, 38, "F");
      doc.setFillColor(37, 99, 235);
      doc.rect(margin, 10, 7, 7, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("StrategyAI", margin + 10, 15.5);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("AI Website Strategy & Growth Analyzer", margin + 10, 21);
      doc.setFontSize(9);
      doc.setTextColor(150, 180, 255);
      doc.text("WEBSITE ANALYSIS REPORT", pageW - margin, 15, { align: "right" });
      doc.setTextColor(120, 140, 180);
      doc.text(dateStr, pageW - margin, 21, { align: "right" });

      y = 46;
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      const titleLines = doc.splitTextToSize(siteName, contentW);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 7 + 1;
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(analysis.url, margin, y);
      y += 8;
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y, pageW - margin, y);
      y += 6;

      // ── Scores ──
      addSection("Overall Performance Scores");
      if (scores) {
        scoreBar("Overall", scores.overallScore);
        scoreBar("SEO", scores.seoScore);
        scoreBar("UX / Design", scores.uxScore);
        scoreBar("Content", scores.contentScore);
        scoreBar("Growth", scores.growthScore);
        if (scores.estimatedGrowthImpact) {
          y += 2;
          doc.setFillColor(240, 253, 244);
          doc.roundedRect(margin, y, contentW, 9, 2, 2, "F");
          doc.setFontSize(8.5);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(22, 163, 74);
          doc.text(`🚀 Growth Potential: ${scores.estimatedGrowthImpact}`, margin + 3, y + 6);
          doc.setTextColor(30, 30, 30);
          y += 13;
        }
      }

      // ── Recommendations ──
      if (recommendations?.length) {
        addSection("Top 5 Actionable Recommendations");
        recommendations.forEach((rec: any) => {
          checkNewPage(22);
          doc.setFillColor(248, 249, 252);
          doc.roundedRect(margin, y, contentW, 20, 2, 2, "F");
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(37, 99, 235);
          doc.text(`#${rec.rank}`, margin + 3, y + 6);
          doc.setTextColor(30, 30, 30);
          const titleW = doc.splitTextToSize(rec.title, contentW - 16);
          doc.text(titleW, margin + 12, y + 6);
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          const descLines = doc.splitTextToSize(rec.description, contentW - 6);
          doc.text(descLines.slice(0, 2), margin + 3, y + 12);
          doc.setFontSize(7.5);
          const impactCol: [number,number,number] = rec.impact === "high" ? [22,163,74] : rec.impact === "medium" ? [202,138,4] : [100,100,100];
          doc.setTextColor(...impactCol);
          doc.text(`▲ ${rec.impact} impact`, margin + 3, y + 18);
          doc.setTextColor(37, 99, 235);
          doc.text(`⚡ ${rec.effort} effort`, margin + 40, y + 18);
          doc.setTextColor(30, 30, 30);
          y += 23;
        });
      }

      // ── Keywords ──
      if (keywords?.keywords?.length) {
        addSection("Keyword Intelligence");
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        doc.text(`SEO Score: ${keywords.seoScore}/100`, margin, y);
        y += 6;
        const kws = keywords.keywords.slice(0, 10);
        kws.forEach((kw: any) => {
          checkNewPage(6);
          const typeCol: [number,number,number] = kw.type === "primary" ? [37,99,235] : kw.type === "opportunity" ? [22,163,74] : [100,100,100];
          doc.setTextColor(...typeCol);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.text(`[${kw.type}]`, margin, y);
          doc.setTextColor(30, 30, 30);
          doc.setFont("helvetica", "normal");
          doc.text(`${kw.keyword}  —  Score: ${kw.score}  |  Intent: ${kw.intent}  |  Volume: ${kw.volume ?? "–"}`, margin + 22, y);
          y += 5.5;
        });
        if (keywords.opportunities?.length) {
          y += 2;
          addText("Opportunities:", 8.5, true);
          keywords.opportunities.slice(0, 4).forEach((o: string) => addBullet(o));
        }
      }

      // ── Content ──
      if (content?.suggestions?.length) {
        addSection("Content Improvement Suggestions");
        content.suggestions.slice(0, 4).forEach((s: any) => {
          checkNewPage(24);
          doc.setFillColor(248, 249, 252);
          doc.roundedRect(margin, y, contentW, 22, 2, 2, "F");
          const priCol: [number,number,number] = s.priority === "high" ? [239,68,68] : s.priority === "medium" ? [202,138,4] : [100,100,100];
          doc.setFontSize(7.5);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...priCol);
          doc.text(s.priority.toUpperCase(), margin + 3, y + 5);
          doc.setTextColor(30, 30, 30);
          doc.setFontSize(9);
          doc.text(s.area, margin + 22, y + 5);
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          const issue = doc.splitTextToSize(`Issue: ${s.currentIssue}`, contentW - 6);
          doc.text(issue.slice(0, 1), margin + 3, y + 11);
          const fix = doc.splitTextToSize(`Fix: ${s.suggestedImprovement}`, contentW - 6);
          doc.text(fix.slice(0, 1), margin + 3, y + 16);
          doc.setTextColor(22, 163, 74);
          const imp = doc.splitTextToSize(`Impact: ${s.expectedImpact}`, contentW - 6);
          doc.text(imp.slice(0, 1), margin + 3, y + 21);
          doc.setTextColor(30, 30, 30);
          y += 25;
        });
      }

      // ── Competitors ──
      if (competitors?.competitors?.length) {
        addSection("Competitor Analysis");
        competitors.competitors.slice(0, 2).forEach((c: any) => {
          checkNewPage(28);
          doc.setFillColor(248, 249, 252);
          doc.roundedRect(margin, y, contentW, 26, 2, 2, "F");
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(30, 30, 30);
          doc.text(c.name, margin + 3, y + 6);
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 100, 100);
          doc.text(c.url, margin + 3, y + 11);
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(37, 99, 235);
          doc.text(`CTA: ${c.ctaScore}  Content: ${c.contentScore}  UX: ${c.uxScore}`, pageW - margin - 3, y + 6, { align: "right" });
          doc.setFont("helvetica", "normal");
          doc.setTextColor(22, 163, 74);
          const strengths = c.strengths.slice(0, 2).join("  •  ");
          const sLines = doc.splitTextToSize(`✓ ${strengths}`, contentW - 6);
          doc.text(sLines.slice(0, 1), margin + 3, y + 17);
          doc.setTextColor(239, 68, 68);
          const weaknesses = c.weaknesses.slice(0, 2).join("  •  ");
          const wLines = doc.splitTextToSize(`✗ ${weaknesses}`, contentW - 6);
          doc.text(wLines.slice(0, 1), margin + 3, y + 22);
          doc.setTextColor(30, 30, 30);
          y += 29;
        });
      }

      // ── User Flow ──
      if (userFlow) {
        addSection("User Flow Analysis");
        scoreBar("UX Score", userFlow.uxScore);
        scoreBar("Mobile Score", userFlow.mobileScore);
        scoreBar("Accessibility", userFlow.accessibilityScore);
        if (userFlow.frictionPoints?.length) {
          y += 2;
          addText("Friction Points:", 8.5, true);
          userFlow.frictionPoints.slice(0, 4).forEach((fp: string) => addBullet(fp, [200, 60, 60]));
        }
        if (userFlow.improvements?.length) {
          y += 2;
          addText("Improvements:", 8.5, true);
          userFlow.improvements.slice(0, 4).forEach((im: string) => addBullet(im, [37, 99, 235]));
        }
      }

      // ── Footer on each page ──
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7.5);
        doc.setTextColor(160, 160, 160);
        doc.text(`StrategyAI Report — ${analysis.url} — Generated ${dateStr}`, margin, pageH - 8);
        doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 8, { align: "right" });
      }

      doc.save(`strategyai-report-${new URL(analysis.url).hostname}.pdf`);
    } finally {
      setLoading(null);
    }
  };

  const downloadWord = async () => {
    setLoading("word");
    setOpen(false);
    try {
      const noBorder = {
        top: { style: BorderStyle.NONE, size: 0 },
        bottom: { style: BorderStyle.NONE, size: 0 },
        left: { style: BorderStyle.NONE, size: 0 },
        right: { style: BorderStyle.NONE, size: 0 },
        insideH: { style: BorderStyle.NONE, size: 0 },
        insideV: { style: BorderStyle.NONE, size: 0 },
      };

      const h1 = (text: string) =>
        new Paragraph({
          text,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 320, after: 120 },
        });

      const h2 = (text: string) =>
        new Paragraph({
          text,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 80 },
        });

      const p = (text: string, bold = false, color?: string) =>
        new Paragraph({
          children: [new TextRun({ text, bold, color: color?.replace("#", "") })],
          spacing: { after: 60 },
        });

      const bullet = (text: string) =>
        new Paragraph({
          text,
          bullet: { level: 0 },
          spacing: { after: 40 },
        });

      const hr = () =>
        new Paragraph({
          text: "",
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" } },
          spacing: { before: 120, after: 120 },
        });

      const scoreRow = (label: string, score: number) => {
        const color = score >= 80 ? "16A34A" : score >= 60 ? "2563EB" : score >= 40 ? "CA8A04" : "DC2626";
        return new Paragraph({
          children: [
            new TextRun({ text: `${label}: `, bold: true }),
            new TextRun({ text: `${score}/100`, bold: true, color }),
          ],
          spacing: { after: 50 },
        });
      };

      const sections: Paragraph[] = [
        new Paragraph({
          children: [
            new TextRun({ text: "StrategyAI", bold: true, size: 36, color: "2563EB" }),
            new TextRun({ text: " — Website Analysis Report", size: 28 }),
          ],
          spacing: { after: 60 },
        }),
        p(`Website: ${analysis.url}`, false, "#374151"),
        p(`Generated: ${dateStr}`, false, "#6B7280"),
        p(`Title: ${siteName}`, false, "#374151"),
        hr(),
      ];

      // Scores
      if (scores) {
        sections.push(h1("Overall Performance Scores"));
        sections.push(scoreRow("Overall", scores.overallScore));
        sections.push(scoreRow("SEO", scores.seoScore));
        sections.push(scoreRow("UX / Design", scores.uxScore));
        sections.push(scoreRow("Content", scores.contentScore));
        sections.push(scoreRow("Growth", scores.growthScore));
        if (scores.estimatedGrowthImpact) {
          sections.push(p(`🚀 Growth Potential: ${scores.estimatedGrowthImpact}`, true, "#16A34A"));
        }
        sections.push(hr());
      }

      // Recommendations
      if (recommendations?.length) {
        sections.push(h1("Top 5 Actionable Recommendations"));
        recommendations.forEach((rec: any) => {
          sections.push(h2(`#${rec.rank} — ${rec.title}`));
          sections.push(p(rec.description));
          sections.push(p(`Impact: ${rec.impact.toUpperCase()}  |  Effort: ${rec.effort}  |  Category: ${rec.category}`, true));
          sections.push(hr());
        });
      }

      // Keywords
      if (keywords?.keywords?.length) {
        sections.push(h1("Keyword Intelligence"));
        sections.push(p(`SEO Score: ${keywords.seoScore}/100`, true));
        sections.push(h2("Keywords"));
        keywords.keywords.forEach((kw: any) => {
          sections.push(bullet(`[${kw.type.toUpperCase()}] ${kw.keyword} — Score: ${kw.score} | Intent: ${kw.intent} | Volume: ${kw.volume ?? "—"}`));
        });
        if (keywords.opportunities?.length) {
          sections.push(h2("Keyword Opportunities"));
          keywords.opportunities.forEach((o: string) => sections.push(bullet(o)));
        }
        sections.push(hr());
      }

      // Content
      if (content?.suggestions?.length) {
        sections.push(h1("Content Improvement Suggestions"));
        content.suggestions.forEach((s: any) => {
          sections.push(h2(`[${s.priority.toUpperCase()}] ${s.area}`));
          sections.push(p(`Issue: ${s.currentIssue}`, false, "#6B7280"));
          sections.push(p(`Suggestion: ${s.suggestedImprovement}`));
          sections.push(p(`Expected Impact: ${s.expectedImpact}`, true, "#16A34A"));
        });
        sections.push(hr());
      }

      // Competitors
      if (competitors?.competitors?.length) {
        sections.push(h1("Competitor Analysis"));
        competitors.competitors.forEach((c: any) => {
          sections.push(h2(c.name));
          sections.push(p(`URL: ${c.url}`, false, "#6B7280"));
          sections.push(p(`Scores — CTA: ${c.ctaScore} | Content: ${c.contentScore} | UX: ${c.uxScore}`, true));
          sections.push(p("Strengths:", true, "#16A34A"));
          c.strengths.forEach((s: string) => sections.push(bullet(s)));
          sections.push(p("Weaknesses:", true, "#DC2626"));
          c.weaknesses.forEach((w: string) => sections.push(bullet(w)));
        });
        if (competitors.yourAdvantages?.length) {
          sections.push(h2("Your Competitive Advantages"));
          competitors.yourAdvantages.forEach((a: string) => sections.push(bullet(a)));
        }
        if (competitors.yourWeaknesses?.length) {
          sections.push(h2("Your Competitive Weaknesses"));
          competitors.yourWeaknesses.forEach((w: string) => sections.push(bullet(w)));
        }
        sections.push(hr());
      }

      // User Flow
      if (userFlow) {
        sections.push(h1("User Flow Analysis"));
        sections.push(scoreRow("UX Score", userFlow.uxScore));
        sections.push(scoreRow("Mobile Score", userFlow.mobileScore));
        sections.push(scoreRow("Accessibility", userFlow.accessibilityScore));
        if (userFlow.flowSteps?.length) {
          sections.push(h2("Conversion Journey Steps"));
          userFlow.flowSteps.forEach((step: any) => {
            sections.push(p(`Step ${step.step} — ${step.label}  (Score: ${step.score})`, true));
            step.issues.forEach((issue: string) => sections.push(bullet(issue)));
          });
        }
        if (userFlow.frictionPoints?.length) {
          sections.push(h2("Friction Points"));
          userFlow.frictionPoints.forEach((fp: string) => sections.push(bullet(fp)));
        }
        if (userFlow.improvements?.length) {
          sections.push(h2("Recommended Improvements"));
          userFlow.improvements.forEach((im: string) => sections.push(bullet(im)));
        }
      }

      const doc = new Document({
        styles: {
          paragraphStyles: [
            {
              id: "Heading1",
              name: "Heading 1",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: { size: 28, bold: true, color: "2563EB" },
              paragraph: { spacing: { before: 320, after: 120 } },
            },
            {
              id: "Heading2",
              name: "Heading 2",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: { size: 22, bold: true, color: "374151" },
              paragraph: { spacing: { before: 200, after: 80 } },
            },
          ],
        },
        sections: [{ children: sections }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `strategyai-report-${new URL(analysis.url).hostname}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/60"
        onClick={() => setOpen((o) => !o)}
        disabled={!!loading}
      >
        {loading ? (
          <motion.div
            className="w-3.5 h-3.5 rounded-full border-2 border-primary/30 border-t-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        {loading === "pdf" ? "Generating PDF…" : loading === "word" ? "Generating Word…" : "Download Report"}
        {!loading && <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1.5 z-20 min-w-[180px] rounded-xl border border-border bg-card shadow-xl overflow-hidden"
            >
              <button
                onClick={downloadPDF}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/60 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <FileDown className="w-3.5 h-3.5 text-red-500" />
                </div>
                <div>
                  <div className="font-medium text-xs">PDF Report</div>
                  <div className="text-[10px] text-muted-foreground">Formatted .pdf file</div>
                </div>
              </button>
              <div className="h-px bg-border/60 mx-3" />
              <button
                onClick={downloadWord}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/60 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div>
                  <div className="font-medium text-xs">Word Document</div>
                  <div className="text-[10px] text-muted-foreground">Editable .docx file</div>
                </div>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
