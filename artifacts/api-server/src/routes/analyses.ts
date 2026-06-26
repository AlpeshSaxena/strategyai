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

// ── In-memory fallback store (used when DATABASE_URL is not configured) ───────

interface MemRow {
  id: number;
  url: string;
  competitorUrl: string | null;
  status: string;
  title: string | null;
  metaDescription: string | null;
  overallScore: number | null;
  seoScore: number | null;
  uxScore: number | null;
  contentScore: number | null;
  growthScore: number | null;
  scoresData: unknown;
  keywordsData: unknown;
  competitorsData: unknown;
  contentData: unknown;
  userFlowData: unknown;
  recommendationsData: unknown;
  createdAt: Date;
  completedAt: Date | null;
}

const mem = new Map<number, MemRow>();
let memSeq = 1;

const USE_DB = !!process.env.DATABASE_URL;

function memRow(id: number): MemRow | undefined {
  return mem.get(id);
}

function formatRow(r: MemRow) {
  return {
    id: r.id,
    url: r.url,
    competitorUrl: r.competitorUrl,
    status: r.status,
    title: r.title,
    metaDescription: r.metaDescription,
    overallScore: r.overallScore,
    seoScore: r.seoScore,
    uxScore: r.uxScore,
    contentScore: r.contentScore,
    growthScore: r.growthScore,
    createdAt: r.createdAt.toISOString(),
    completedAt: r.completedAt?.toISOString() ?? null,
  };
}

// ── GET /analyses ─────────────────────────────────────────────────────────────

router.get("/analyses", async (req, res) => {
  try {
    if (!USE_DB) {
      const rows = [...mem.values()].sort((a, b) => a.id - b.id);
      res.json(rows.map((r) => ({
        id: r.id,
        url: r.url,
        status: r.status,
        overallScore: r.overallScore ?? 0,
        createdAt: r.createdAt.toISOString(),
      })));
      return;
    }

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

    res.json(rows.map((r) => ({
      ...r,
      overallScore: r.overallScore ?? 0,
      createdAt: r.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list analyses");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /analyses ────────────────────────────────────────────────────────────

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
    if (!USE_DB) {
      const id = memSeq++;
      const row: MemRow = {
        id,
        url: normalizedUrl,
        competitorUrl: competitorUrl ?? null,
        status: "pending",
        title: null,
        metaDescription: null,
        overallScore: null,
        seoScore: null,
        uxScore: null,
        contentScore: null,
        growthScore: null,
        scoresData: null,
        keywordsData: null,
        competitorsData: null,
        contentData: null,
        userFlowData: null,
        recommendationsData: null,
        createdAt: new Date(),
        completedAt: null,
      };
      mem.set(id, row);
      res.status(201).json(formatRow(row));
      runAnalysisMem(id, normalizedUrl).catch((err) => {
        req.log.error({ err, id }, "In-memory analysis failed");
      });
      return;
    }

    const [inserted] = await db
      .insert(analysesTable)
      .values({ url: normalizedUrl, competitorUrl: competitorUrl ?? null, status: "pending" })
      .returning();

    res.status(201).json({
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
    });

    runAnalysisDb(inserted.id, normalizedUrl).catch((err) => {
      req.log.error({ err, id: inserted.id }, "Analysis failed");
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create analysis");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /analyses/:id ─────────────────────────────────────────────────────────

router.get("/analyses/:id", async (req, res) => {
  const parsed = GetAnalysisParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    if (!USE_DB) {
      const row = memRow(parsed.data.id);
      if (!row) { res.status(404).json({ error: "Analysis not found" }); return; }
      res.json(formatRow(row));
      return;
    }

    const [row] = await db.select().from(analysesTable).where(eq(analysesTable.id, parsed.data.id));
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

// ── DELETE /analyses/:id ──────────────────────────────────────────────────────

router.delete("/analyses/:id", async (req, res) => {
  const parsed = DeleteAnalysisParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    if (!USE_DB) {
      if (!mem.has(parsed.data.id)) { res.status(404).json({ error: "Analysis not found" }); return; }
      mem.delete(parsed.data.id);
      res.status(204).send();
      return;
    }

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

// ── GET /analyses/:id/scores ──────────────────────────────────────────────────

router.get("/analyses/:id/scores", async (req, res) => {
  const parsed = GetAnalysisScoresParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    if (!USE_DB) {
      const row = memRow(parsed.data.id);
      if (!row) { res.status(404).json({ error: "Analysis not found" }); return; }
      res.json(row.scoresData ?? {});
      return;
    }

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

// ── GET /analyses/:id/keywords ────────────────────────────────────────────────

router.get("/analyses/:id/keywords", async (req, res) => {
  const parsed = GetAnalysisKeywordsParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    if (!USE_DB) {
      const row = memRow(parsed.data.id);
      if (!row) { res.status(404).json({ error: "Analysis not found" }); return; }
      res.json(row.keywordsData ?? {});
      return;
    }

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

// ── GET /analyses/:id/competitors ─────────────────────────────────────────────

router.get("/analyses/:id/competitors", async (req, res) => {
  const parsed = GetAnalysisCompetitorsParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    if (!USE_DB) {
      const row = memRow(parsed.data.id);
      if (!row) { res.status(404).json({ error: "Analysis not found" }); return; }
      res.json(row.competitorsData ?? {});
      return;
    }

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

// ── GET /analyses/:id/content ─────────────────────────────────────────────────

router.get("/analyses/:id/content", async (req, res) => {
  const parsed = GetAnalysisContentParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    if (!USE_DB) {
      const row = memRow(parsed.data.id);
      if (!row) { res.status(404).json({ error: "Analysis not found" }); return; }
      res.json(row.contentData ?? {});
      return;
    }

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

// ── GET /analyses/:id/userflow ────────────────────────────────────────────────

router.get("/analyses/:id/userflow", async (req, res) => {
  const parsed = GetAnalysisUserFlowParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    if (!USE_DB) {
      const row = memRow(parsed.data.id);
      if (!row) { res.status(404).json({ error: "Analysis not found" }); return; }
      res.json(row.userFlowData ?? {});
      return;
    }

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

// ── GET /analyses/:id/recommendations ────────────────────────────────────────

router.get("/analyses/:id/recommendations", async (req, res) => {
  const parsed = GetAnalysisRecommendationsParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    if (!USE_DB) {
      const row = memRow(parsed.data.id);
      if (!row) { res.status(404).json({ error: "Analysis not found" }); return; }
      res.json((row.recommendationsData as unknown[]) ?? []);
      return;
    }

    const [row] = await db
      .select({ recommendationsData: analysesTable.recommendationsData })
      .from(analysesTable)
      .where(eq(analysesTable.id, parsed.data.id));

    if (!row) { res.status(404).json({ error: "Analysis not found" }); return; }
    res.json((row.recommendationsData as unknown[]) ?? []);
  } catch (err) {
    req.log.error({ err }, "Failed to get recommendations");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /demo ─────────────────────────────────────────────────────────────────

router.get("/demo", async (req, res) => {
  try {
    res.json(getDemoData());
  } catch (err) {
    req.log.error({ err }, "Failed to get demo data");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Background analysis runners ───────────────────────────────────────────────

async function runAnalysisMem(id: number, url: string) {
  const row = mem.get(id);
  if (!row) return;
  row.status = "processing";

  await new Promise((r) => setTimeout(r, 4000));

  let scraped;
  try {
    scraped = await scrapeWebsiteContent(url);
  } catch {
    scraped = { title: "", metaDescription: "", headings: [], bodyText: "", navLinks: [], ctaButtons: [] };
  }

  const data = generateAnalysisData(scraped, url);
  Object.assign(row, {
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
  });
}

async function runAnalysisDb(id: number, url: string) {
  try {
    await db.update(analysesTable).set({ status: "processing" }).where(eq(analysesTable.id, id));

    await new Promise((r) => setTimeout(r, 4000));

    let scraped;
    try {
      scraped = await scrapeWebsiteContent(url);
    } catch {
      scraped = { title: "", metaDescription: "", headings: [], bodyText: "", navLinks: [], ctaButtons: [] };
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
    await db.update(analysesTable).set({ status: "failed" }).where(eq(analysesTable.id, id));
    throw err;
  }
}

export default router;
