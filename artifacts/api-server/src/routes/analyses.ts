import { Router } from "express";
import { db } from "@workspace/db";
import { analysesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateAnalysisBody,
  GetAnalysisParams,
  DeleteAnalysisParams,
  GetAnalysisScoresParams,
  GetAnalysisKeywordsParams,
  GetAnalysisCompetitorsParams,
  GetAnalysisContentParams,
  GetAnalysisUserFlowParams,
  GetAnalysisRecommendationsParams,
} from "@workspace/api-zod";
import { scrapeWebsiteContent, generateAnalysisData, getDemoData } from "../services/analyzer";

const router = Router();

router.get("/analyses", async (req, res) => {
  try {
    const rows = await db
      .select({
        id: analysesTable.id,
        url: analysesTable.url,
        status: analysesTable.status,
        overallScore: analysesTable.overallScore,
        createdAt: analysesTable.createdAt,
      })
      .from(analysesTable)
      .orderBy(analysesTable.id);

    const result = rows.map((r) => ({
      ...r,
      overallScore: r.overallScore ?? 0,
      createdAt: r.createdAt.toISOString(),
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list analyses");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/analyses", async (req, res) => {
  const parsed = CreateAnalysisBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input: url is required" });
    return;
  }

  const { url, competitorUrl } = parsed.data;

  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
    normalizedUrl = "https://" + normalizedUrl;
  }

  try {
    const [inserted] = await db
      .insert(analysesTable)
      .values({ url: normalizedUrl, competitorUrl: competitorUrl ?? null, status: "pending" })
      .returning();

    const response = {
      id: inserted.id,
      url: inserted.url,
      competitorUrl: inserted.competitorUrl ?? null,
      status: inserted.status,
      title: null,
      metaDescription: null,
      overallScore: null,
      seoScore: null,
      uxScore: null,
      contentScore: null,
      growthScore: null,
      createdAt: inserted.createdAt.toISOString(),
      completedAt: null,
    };

    res.status(201).json(response);

    // Run analysis asynchronously
    runAnalysis(inserted.id, normalizedUrl).catch((err) => {
      req.log.error({ err, id: inserted.id }, "Analysis failed");
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create analysis");
    res.status(500).json({ error: "Internal server error" });
  }
});

async function runAnalysis(id: number, url: string) {
  try {
    await db
      .update(analysesTable)
      .set({ status: "processing" })
      .where(eq(analysesTable.id, id));

    // Simulate processing time for realistic feel
    await new Promise((r) => setTimeout(r, 4000));

    let scraped;
    try {
      scraped = await scrapeWebsiteContent(url);
    } catch {
      scraped = {
        title: "",
        metaDescription: "",
        headings: [],
        bodyText: "",
        navLinks: [],
        ctaButtons: [],
      };
    }

    const data = generateAnalysisData(scraped, url);

    await db
      .update(analysesTable)
      .set({
        status: "completed",
        title: data.title || null,
        metaDescription: data.metaDescription || null,
        overallScore: data.overallScore,
        seoScore: data.seoScore,
        uxScore: data.uxScore,
        contentScore: data.contentScore,
        growthScore: data.growthScore,
        scoresData: data.scoresData,
        keywordsData: data.keywordsData,
        competitorsData: data.competitorsData,
        contentData: data.contentData,
        userFlowData: data.userFlowData,
        recommendationsData: data.recommendationsData,
        completedAt: new Date(),
      })
      .where(eq(analysesTable.id, id));
  } catch (err) {
    await db
      .update(analysesTable)
      .set({ status: "failed" })
      .where(eq(analysesTable.id, id));
    throw err;
  }
}

router.get("/analyses/:id", async (req, res) => {
  const parsed = GetAnalysisParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const [row] = await db
      .select()
      .from(analysesTable)
      .where(eq(analysesTable.id, parsed.data.id));

    if (!row) { res.status(404).json({ error: "Analysis not found" }); return; }

    res.json({
      id: row.id,
      url: row.url,
      competitorUrl: row.competitorUrl ?? null,
      status: row.status,
      title: row.title ?? null,
      metaDescription: row.metaDescription ?? null,
      overallScore: row.overallScore ?? null,
      seoScore: row.seoScore ?? null,
      uxScore: row.uxScore ?? null,
      contentScore: row.contentScore ?? null,
      growthScore: row.growthScore ?? null,
      createdAt: row.createdAt.toISOString(),
      completedAt: row.completedAt?.toISOString() ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get analysis");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/analyses/:id", async (req, res) => {
  const parsed = DeleteAnalysisParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const [deleted] = await db
      .delete(analysesTable)
      .where(eq(analysesTable.id, parsed.data.id))
      .returning({ id: analysesTable.id });

    if (!deleted) { res.status(404).json({ error: "Analysis not found" }); return; }

    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete analysis");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analyses/:id/scores", async (req, res) => {
  const parsed = GetAnalysisScoresParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    const [row] = await db
      .select({ scoresData: analysesTable.scoresData, status: analysesTable.status })
      .from(analysesTable)
      .where(eq(analysesTable.id, parsed.data.id));

    if (!row) { res.status(404).json({ error: "Analysis not found" }); return; }

    res.json(row.scoresData ?? {});
  } catch (err) {
    req.log.error({ err }, "Failed to get scores");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analyses/:id/keywords", async (req, res) => {
  const parsed = GetAnalysisKeywordsParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    const [row] = await db
      .select({ keywordsData: analysesTable.keywordsData })
      .from(analysesTable)
      .where(eq(analysesTable.id, parsed.data.id));

    if (!row) { res.status(404).json({ error: "Analysis not found" }); return; }

    res.json(row.keywordsData ?? {});
  } catch (err) {
    req.log.error({ err }, "Failed to get keywords");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analyses/:id/competitors", async (req, res) => {
  const parsed = GetAnalysisCompetitorsParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    const [row] = await db
      .select({ competitorsData: analysesTable.competitorsData })
      .from(analysesTable)
      .where(eq(analysesTable.id, parsed.data.id));

    if (!row) { res.status(404).json({ error: "Analysis not found" }); return; }

    res.json(row.competitorsData ?? {});
  } catch (err) {
    req.log.error({ err }, "Failed to get competitors");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analyses/:id/content", async (req, res) => {
  const parsed = GetAnalysisContentParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    const [row] = await db
      .select({ contentData: analysesTable.contentData })
      .from(analysesTable)
      .where(eq(analysesTable.id, parsed.data.id));

    if (!row) { res.status(404).json({ error: "Analysis not found" }); return; }

    res.json(row.contentData ?? {});
  } catch (err) {
    req.log.error({ err }, "Failed to get content analysis");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analyses/:id/userflow", async (req, res) => {
  const parsed = GetAnalysisUserFlowParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    const [row] = await db
      .select({ userFlowData: analysesTable.userFlowData })
      .from(analysesTable)
      .where(eq(analysesTable.id, parsed.data.id));

    if (!row) { res.status(404).json({ error: "Analysis not found" }); return; }

    res.json(row.userFlowData ?? {});
  } catch (err) {
    req.log.error({ err }, "Failed to get user flow");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analyses/:id/recommendations", async (req, res) => {
  const parsed = GetAnalysisRecommendationsParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    const [row] = await db
      .select({ recommendationsData: analysesTable.recommendationsData })
      .from(analysesTable)
      .where(eq(analysesTable.id, parsed.data.id));

    if (!row) { res.status(404).json({ error: "Analysis not found" }); return; }

    const data = (row.recommendationsData as any[]) ?? [];
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to get recommendations");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/demo", async (req, res) => {
  try {
    res.json(getDemoData());
  } catch (err) {
    req.log.error({ err }, "Failed to get demo data");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
