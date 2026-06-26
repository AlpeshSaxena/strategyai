import { scrapeWebsite, buildAnalysisData, getDemoData } from "../../api/handler.js";

// ── In-memory store (persists across warm invocations) ────────────────────────

interface Rec {
  id: number; url: string; competitorUrl: string | null; status: string;
  title: string | null; metaDescription: string | null;
  overallScore: number | null; seoScore: number | null; uxScore: number | null;
  contentScore: number | null; growthScore: number | null;
  scoresData: unknown; keywordsData: unknown; competitorsData: unknown;
  contentData: unknown; userFlowData: unknown; recommendationsData: unknown;
  createdAt: string; completedAt: string | null;
}

const store = new Map<number, Rec>();
let seq = 1;

// ── Helpers ───────────────────────────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

function json(status: number, body: unknown) {
  return { statusCode: status, headers: { "Content-Type": "application/json", ...CORS }, body: JSON.stringify(body) };
}

function parseBody(event: Record<string, unknown>): Record<string, unknown> {
  const raw = event.body;
  if (!raw || typeof raw !== "string") return {};
  const text = event.isBase64Encoded ? Buffer.from(raw, "base64").toString("utf-8") : raw;
  try { return JSON.parse(text) as Record<string, unknown>; } catch { return {}; }
}

// ── Handler ───────────────────────────────────────────────────────────────────

export const handler = async (event: Record<string, unknown>) => {
  const method = (event.httpMethod as string | undefined)?.toUpperCase() ?? "GET";
  const path = (event.path as string | undefined) ?? "/";

  // CORS preflight
  if (method === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  // GET /api/healthz
  if (method === "GET" && path === "/api/healthz") {
    return json(200, { status: "ok" });
  }

  // GET /api/demo
  if (method === "GET" && path === "/api/demo") {
    return json(200, getDemoData());
  }

  // GET /api/analyses
  if (method === "GET" && path === "/api/analyses") {
    const rows = [...store.values()].map((r) => ({
      id: r.id, url: r.url, status: r.status,
      overallScore: r.overallScore ?? 0, createdAt: r.createdAt,
    }));
    return json(200, rows);
  }

  // POST /api/analyses  ← THE KEY ROUTE — reads body directly, no middleware
  if (method === "POST" && path === "/api/analyses") {
    const body = parseBody(event);
    const url = body.url;
    if (!url || typeof url !== "string" || !url.trim()) {
      return json(400, { error: "Invalid input: url is required" });
    }
    let u = url.trim();
    if (!u.startsWith("http://") && !u.startsWith("https://")) u = "https://" + u;

    const id = seq++;
    const now = new Date().toISOString();

    let scraped;
    try { scraped = await scrapeWebsite(u); } catch {
      scraped = { title: "", metaDescription: "", headings: [], bodyText: "", navLinks: [], ctaButtons: [] };
    }
    const data = buildAnalysisData(scraped, u);

    const rec: Rec = {
      id, url: u, competitorUrl: (body.competitorUrl as string | undefined) ?? null,
      status: "completed",
      title: data.title || null, metaDescription: data.metaDescription || null,
      overallScore: data.overallScore, seoScore: data.seoScore, uxScore: data.uxScore,
      contentScore: data.contentScore, growthScore: data.growthScore,
      scoresData: data.scoresData, keywordsData: data.keywordsData,
      competitorsData: data.competitorsData, contentData: data.contentData,
      userFlowData: data.userFlowData, recommendationsData: data.recommendationsData,
      createdAt: now, completedAt: new Date().toISOString(),
    };
    store.set(id, rec);

    return json(201, {
      id: rec.id, url: rec.url, competitorUrl: rec.competitorUrl, status: rec.status,
      title: rec.title, metaDescription: rec.metaDescription,
      overallScore: rec.overallScore, seoScore: rec.seoScore, uxScore: rec.uxScore,
      contentScore: rec.contentScore, growthScore: rec.growthScore,
      createdAt: rec.createdAt, completedAt: rec.completedAt,
    });
  }

  // GET /api/analyses/:id
  const idMatch = path.match(/^\/api\/analyses\/(\d+)$/);
  if (idMatch) {
    const id = Number(idMatch[1]);
    if (method === "DELETE") {
      if (!store.has(id)) return json(404, { error: "Analysis not found" });
      store.delete(id);
      return { statusCode: 204, headers: CORS, body: "" };
    }
    if (method === "GET") {
      const r = store.get(id);
      if (!r) return json(404, { error: "Analysis not found" });
      return json(200, {
        id: r.id, url: r.url, competitorUrl: r.competitorUrl, status: r.status,
        title: r.title, metaDescription: r.metaDescription,
        overallScore: r.overallScore, seoScore: r.seoScore, uxScore: r.uxScore,
        contentScore: r.contentScore, growthScore: r.growthScore,
        createdAt: r.createdAt, completedAt: r.completedAt,
      });
    }
  }

  // GET /api/analyses/:id/(scores|keywords|competitors|content|userflow|recommendations)
  const subMatch = path.match(/^\/api\/analyses\/(\d+)\/(scores|keywords|competitors|content|userflow|recommendations)$/);
  if (method === "GET" && subMatch) {
    const id = Number(subMatch[1]);
    const sub = subMatch[2];
    const r = store.get(id);
    if (!r) return json(404, { error: "Analysis not found" });
    const map: Record<string, unknown> = {
      scores: r.scoresData, keywords: r.keywordsData, competitors: r.competitorsData,
      content: r.contentData, userflow: r.userFlowData, recommendations: r.recommendationsData,
    };
    const d = map[sub];
    return json(200, sub === "recommendations" ? (Array.isArray(d) ? d : []) : (d ?? {}));
  }

  return json(404, { error: "Not found" });
};
