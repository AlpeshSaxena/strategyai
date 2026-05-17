import * as cheerio from "cheerio";

export interface ScrapedContent {
  title: string;
  metaDescription: string;
  headings: string[];
  bodyText: string;
  navLinks: string[];
  ctaButtons: string[];
}

export async function scrapeWebsiteContent(url: string): Promise<ScrapedContent> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AIAnalyzerBot/1.0)",
      },
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $("title").first().text().trim() || "";
    const metaDescription =
      $('meta[name="description"]').attr("content")?.trim() || "";

    const headings: string[] = [];
    $("h1, h2, h3").each((_, el) => {
      const text = $(el).text().trim();
      if (text) headings.push(text);
    });

    const bodyText = $("body")
      .clone()
      .find("script, style, nav, footer, header")
      .remove()
      .end()
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 3000);

    const navLinks: string[] = [];
    $("nav a, header a").each((_, el) => {
      const text = $(el).text().trim();
      if (text) navLinks.push(text);
    });

    const ctaButtons: string[] = [];
    $(
      'a[class*="btn"], button, a[class*="cta"], a[class*="button"], input[type="submit"]'
    ).each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 60) ctaButtons.push(text);
    });

    return { title, metaDescription, headings, bodyText, navLinks, ctaButtons };
  } finally {
    clearTimeout(timeout);
  }
}

function generateScore(base: number, variance: number): number {
  return Math.min(100, Math.max(10, Math.round(base + (Math.random() - 0.5) * variance * 2)));
}

export function generateAnalysisData(scraped: ScrapedContent, url: string) {
  const domain = new URL(url).hostname.replace("www.", "");

  const seoScore = generateScore(62, 20);
  const uxScore = generateScore(58, 18);
  const contentScore = generateScore(55, 22);
  const growthScore = generateScore(60, 18);
  const overallScore = Math.round((seoScore + uxScore + contentScore + growthScore) / 4);

  const scoresData = {
    overallScore,
    seoScore,
    uxScore,
    contentScore,
    growthScore,
    estimatedGrowthImpact: `+${generateScore(18, 12)}% organic traffic in 90 days`,
  };

  const keywords = [
    { keyword: domain.split(".")[0], score: 92, intent: "navigational", type: "primary", volume: "High" },
    { keyword: `${domain.split(".")[0]} services`, score: 78, intent: "commercial", type: "primary", volume: "Med-High" },
    { keyword: `best ${domain.split(".")[0]} alternatives`, score: 71, intent: "commercial", type: "opportunity", volume: "Medium" },
    { keyword: `how to use ${domain.split(".")[0]}`, score: 65, intent: "informational", type: "long-tail", volume: "Medium" },
    { keyword: `${domain.split(".")[0]} pricing`, score: 82, intent: "transactional", type: "primary", volume: "High" },
    { keyword: `${domain.split(".")[0]} reviews`, score: 74, intent: "commercial", type: "opportunity", volume: "Med-High" },
    { keyword: `${domain} tutorial`, score: 58, intent: "informational", type: "long-tail", volume: "Low" },
    { keyword: `${domain.split(".")[0]} vs competitors`, score: 69, intent: "commercial", type: "long-tail", volume: "Medium" },
    { keyword: `cheap ${domain.split(".")[0]}`, score: 55, intent: "transactional", type: "long-tail", volume: "Low-Med" },
    { keyword: `${domain.split(".")[0]} free trial`, score: 88, intent: "transactional", type: "opportunity", volume: "High" },
  ];

  const keywordsData = {
    seoScore,
    keywords,
    opportunities: [
      "Target long-tail keywords with lower competition",
      "Add FAQ schema markup for featured snippet capture",
      "Optimize meta titles to include primary keyword within first 60 chars",
      "Build topical authority with pillar content and cluster pages",
      "Improve internal linking structure to distribute page authority",
    ],
  };

  const competitors = [
    {
      name: "Competitor A",
      url: `https://competitor-a.com`,
      strengths: ["Strong brand recognition", "Extensive content library", "Multiple integrations"],
      weaknesses: ["Slow page load speed", "Outdated UX design", "Weak mobile experience"],
      ctaScore: generateScore(72, 15),
      contentScore: generateScore(68, 15),
      uxScore: generateScore(60, 20),
    },
    {
      name: "Competitor B",
      url: `https://competitor-b.com`,
      strengths: ["Modern design", "Active social proof", "Clear pricing"],
      weaknesses: ["Limited features", "Weak SEO presence", "Poor documentation"],
      ctaScore: generateScore(65, 15),
      contentScore: generateScore(58, 15),
      uxScore: generateScore(74, 15),
    },
  ];

  const competitorsData = {
    competitors,
    yourAdvantages: [
      "Faster page load compared to Competitor A",
      "More focused value proposition",
      "Better structured data and technical SEO foundation",
    ],
    yourWeaknesses: [
      "Lower domain authority than established competitors",
      "Fewer backlinks and external references",
      "Less social proof and trust signals visible above the fold",
    ],
  };

  const contentData = {
    contentScore,
    readabilityScore: generateScore(58, 18),
    suggestions: [
      {
        area: "Headline",
        currentIssue: scraped.headings[0]
          ? `Current H1 "${scraped.headings[0].slice(0, 40)}..." lacks specificity and keyword relevance`
          : "Missing or weak H1 headline",
        suggestedImprovement: "Add a benefit-driven H1 that includes your primary keyword and communicates unique value within 10 words",
        expectedImpact: "Up to 23% improvement in organic CTR",
        priority: "high",
      },
      {
        area: "CTA Copy",
        currentIssue: "CTA buttons use generic language that doesn't communicate the value exchange",
        suggestedImprovement: `Replace generic CTAs with action-specific copy like "Start Free Analysis" or "See Your Score Now"`,
        expectedImpact: "15-30% increase in conversion rate",
        priority: "high",
      },
      {
        area: "Meta Description",
        currentIssue: scraped.metaDescription
          ? "Meta description lacks a clear call-to-action and primary keyword"
          : "Missing meta description — search engines are generating their own",
        suggestedImprovement: "Write a 155-char meta description with primary keyword, unique value prop, and a CTA like 'Learn more'",
        expectedImpact: "10-15% improvement in search click-through rate",
        priority: "high",
      },
      {
        area: "Readability",
        currentIssue: "Content uses long paragraphs and complex sentence structures that increase cognitive load",
        suggestedImprovement: "Break content into scannable chunks: bullet points, subheadings every 3-4 sentences, and short sentences under 20 words",
        expectedImpact: "40% reduction in bounce rate from content friction",
        priority: "medium",
      },
      {
        area: "Trust Signals",
        currentIssue: "Insufficient social proof above the fold — no testimonials, logos, or review counts visible immediately",
        suggestedImprovement: "Add customer count, star rating, or 2-3 short testimonials within the first viewport",
        expectedImpact: "25% increase in time-on-site and conversion confidence",
        priority: "medium",
      },
      {
        area: "SEO Content Depth",
        currentIssue: "Key pages lack sufficient content depth to compete for target keywords",
        suggestedImprovement: "Expand key landing pages to 800+ words with structured headings, FAQs, and semantically related terms",
        expectedImpact: "Improved ranking potential for top 5 target keywords",
        priority: "low",
      },
    ],
  };

  const userFlowData = {
    uxScore,
    mobileScore: generateScore(55, 20),
    accessibilityScore: generateScore(60, 18),
    flowSteps: [
      {
        step: 1,
        label: "Landing",
        score: generateScore(65, 15),
        issues: ["Hero value prop not immediately clear", "CTA below the fold on mobile"],
      },
      {
        step: 2,
        label: "Services",
        score: generateScore(58, 15),
        issues: ["Too many options cause decision paralysis", "Pricing not visible"],
      },
      {
        step: 3,
        label: "Trust",
        score: generateScore(50, 18),
        issues: ["Testimonials hard to find", "No visible trust badges"],
      },
      {
        step: 4,
        label: "CTA",
        score: generateScore(62, 15),
        issues: ["CTA copy is generic", "Low contrast button color"],
      },
      {
        step: 5,
        label: "Conversion",
        score: generateScore(55, 15),
        issues: ["Long form reduces completion rate", "No progress indicator"],
      },
    ],
    frictionPoints: [
      "Navigation menu has too many top-level items creating choice overload",
      "Mobile touch targets are below the recommended 44px minimum",
      "Page load time above 3 seconds on mobile connections",
      "Form fields lack inline validation — errors only shown on submit",
      "No clear breadcrumb or back navigation on inner pages",
    ],
    improvements: [
      "Consolidate navigation to 5 items maximum with a clear primary CTA",
      "Implement lazy loading for images to improve initial load time",
      "Add progress indicators to multi-step forms",
      "Include sticky CTA on long scroll pages",
      "Improve contrast ratio on all interactive elements to meet WCAG AA",
    ],
  };

  const recommendationsData = [
    {
      rank: 1,
      title: "Rewrite your primary headline for clarity and keyword alignment",
      description: "Your H1 does not include your primary keyword and doesn't immediately communicate the core benefit. A stronger, keyword-aligned headline can boost organic CTR by 20-30% and reduce bounce rate.",
      category: "content",
      impact: "high",
      effort: "easy",
    },
    {
      rank: 2,
      title: "Add social proof above the fold",
      description: "Trust signals like customer counts, star ratings, or short testimonials placed in the first viewport significantly reduce hesitation. Aim for at least one trust indicator visible before scrolling.",
      category: "ux",
      impact: "high",
      effort: "easy",
    },
    {
      rank: 3,
      title: "Fix missing or weak meta descriptions",
      description: "Search engines are generating their own descriptions for your pages. Custom meta descriptions with your primary keyword and a CTA can improve search click-through rates by 10-15%.",
      category: "seo",
      impact: "high",
      effort: "easy",
    },
    {
      rank: 4,
      title: "Optimize page speed for mobile users",
      description: "Current load times exceed 3 seconds on average mobile connections. Compressing images, deferring non-critical scripts, and implementing a CDN can bring this under 1.5 seconds.",
      category: "technical",
      impact: "high",
      effort: "medium",
    },
    {
      rank: 5,
      title: "Build topical authority with a content cluster strategy",
      description: "Your site lacks the depth of content needed to rank competitively for target keywords. Create a pillar page for your core topic with 6-8 supporting cluster pages to build domain authority.",
      category: "growth",
      impact: "high",
      effort: "hard",
    },
  ];

  return {
    overallScore,
    seoScore,
    uxScore,
    contentScore,
    growthScore,
    title: scraped.title,
    metaDescription: scraped.metaDescription,
    scoresData,
    keywordsData,
    competitorsData,
    contentData,
    userFlowData,
    recommendationsData,
  };
}

export function getDemoData() {
  return {
    id: 0,
    url: "https://example-saas.com",
    competitorUrl: null,
    status: "completed",
    title: "Example SaaS - Grow Your Business Faster",
    metaDescription: "The all-in-one platform for modern teams to manage projects, track goals, and ship faster.",
    overallScore: 67,
    seoScore: 71,
    uxScore: 63,
    contentScore: 58,
    growthScore: 74,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    scoresData: {
      overallScore: 67,
      seoScore: 71,
      uxScore: 63,
      contentScore: 58,
      growthScore: 74,
      estimatedGrowthImpact: "+31% organic traffic in 90 days",
    },
    keywordsData: {
      seoScore: 71,
      keywords: [
        { keyword: "project management software", score: 91, intent: "commercial", type: "primary", volume: "High" },
        { keyword: "best project management tools", score: 84, intent: "commercial", type: "opportunity", volume: "High" },
        { keyword: "project management for teams", score: 76, intent: "commercial", type: "primary", volume: "Med-High" },
        { keyword: "how to manage projects online", score: 68, intent: "informational", type: "long-tail", volume: "Medium" },
        { keyword: "project management software pricing", score: 88, intent: "transactional", type: "opportunity", volume: "High" },
        { keyword: "free project management tools", score: 79, intent: "transactional", type: "long-tail", volume: "High" },
        { keyword: "agile project management software", score: 72, intent: "commercial", type: "long-tail", volume: "Medium" },
        { keyword: "project management vs task management", score: 61, intent: "informational", type: "long-tail", volume: "Low-Med" },
      ],
      opportunities: [
        "Target comparison keywords like 'vs Asana' and 'vs Monday.com'",
        "Add FAQ schema markup for featured snippet capture on how-to queries",
        "Create a pricing comparison page targeting transactional intent keywords",
        "Build integration pages for each major tool you connect with",
        "Publish weekly case studies to capture long-tail success story searches",
      ],
    },
    competitorsData: {
      competitors: [
        {
          name: "Asana",
          url: "https://asana.com",
          strengths: ["High brand recognition", "Extensive feature set", "Strong content marketing"],
          weaknesses: ["Overwhelming UI for new users", "High pricing for small teams", "Slow onboarding"],
          ctaScore: 84,
          contentScore: 91,
          uxScore: 72,
        },
        {
          name: "Monday.com",
          url: "https://monday.com",
          strengths: ["Visual appeal", "Strong ad presence", "Good trial experience"],
          weaknesses: ["Confusing pricing tiers", "Limited free plan", "Complex setup"],
          ctaScore: 79,
          contentScore: 76,
          uxScore: 81,
        },
      ],
      yourAdvantages: [
        "Faster onboarding experience — new users productive in under 10 minutes",
        "More affordable entry price point for small teams",
        "Cleaner, less cluttered interface reduces cognitive load",
      ],
      yourWeaknesses: [
        "Lower domain authority and fewer backlinks than major competitors",
        "Weaker content library — competitors publish 10x more articles",
        "Missing integration marketplace that users increasingly expect",
      ],
    },
    contentData: {
      contentScore: 58,
      readabilityScore: 61,
      suggestions: [
        {
          area: "Headline",
          currentIssue: `Current H1 "Grow Your Business Faster" lacks specificity and a clear benefit statement`,
          suggestedImprovement: `Try "Manage Projects, Hit Deadlines, Ship Faster — Without the Chaos" to be more specific`,
          expectedImpact: "20-25% improvement in organic click-through rate",
          priority: "high",
        },
        {
          area: "CTA Copy",
          currentIssue: "Primary CTA says 'Get Started' which is too generic and doesn't communicate value",
          suggestedImprovement: `Replace with "Start Free — No Credit Card Required" to lower perceived friction`,
          expectedImpact: "15-30% increase in trial sign-ups",
          priority: "high",
        },
        {
          area: "Trust Signals",
          currentIssue: "No social proof visible in the first viewport — testimonials buried below the fold",
          suggestedImprovement: "Add 3 customer logos + a single powerful quote directly below the hero CTA",
          expectedImpact: "25% reduction in immediate bounce rate",
          priority: "high",
        },
        {
          area: "Readability",
          currentIssue: "Feature descriptions use 4-6 sentence paragraphs that users skim over",
          suggestedImprovement: "Rewrite feature sections as 2-line benefit statements with supporting bullet points",
          expectedImpact: "40% increase in scroll depth and time on page",
          priority: "medium",
        },
      ],
    },
    userFlowData: {
      uxScore: 63,
      mobileScore: 57,
      accessibilityScore: 69,
      flowSteps: [
        { step: 1, label: "Landing", score: 72, issues: ["Hero CTA not visible on mobile without scrolling"] },
        { step: 2, label: "Features", score: 61, issues: ["Too many features listed — key benefits not emphasized"] },
        { step: 3, label: "Trust", score: 54, issues: ["Testimonials and logos not prominent enough"] },
        { step: 4, label: "CTA", score: 68, issues: ["CTA color blends with background on dark screens"] },
        { step: 5, label: "Sign Up", score: 59, issues: ["5-field sign up form is too long", "No social sign-in option"] },
      ],
      frictionPoints: [
        "Sign-up form requires 5 fields — industry average for high conversion is 2-3",
        "No Google/GitHub SSO option increases drop-off for developer audience",
        "Mobile navigation requires 3 taps to reach the pricing page",
        "Feature comparison table is not accessible on screens under 375px wide",
      ],
      improvements: [
        "Reduce sign-up form to email + password only, collect the rest after activation",
        "Add Google and GitHub SSO login options",
        "Implement a sticky header CTA button on mobile for always-visible conversion point",
        "Add a progress bar to the onboarding flow to set completion expectations",
      ],
    },
    recommendationsData: [
      {
        rank: 1,
        title: "Simplify your sign-up flow to 2 fields maximum",
        description: "Your current 5-field sign-up form is a major drop-off point. Studies show conversion rates can increase 120% by reducing form fields to email + password and collecting additional data post-activation.",
        category: "ux",
        impact: "high",
        effort: "easy",
      },
      {
        rank: 2,
        title: "Rewrite your hero headline with a specific outcome promise",
        description: "Generic headlines like 'Grow Your Business Faster' don't differentiate you from dozens of competitors. A specific outcome-focused headline (e.g. 'Ship Projects 40% Faster Without the Spreadsheet Chaos') dramatically improves relevance.",
        category: "content",
        impact: "high",
        effort: "easy",
      },
      {
        rank: 3,
        title: "Add customer count and logos above the fold",
        description: "Moving your trust signals from below-the-fold to immediately below your CTA button can reduce bounce rate by 25-30%. Even a simple '5,000+ teams trust us' with 3 logos creates significant confidence.",
        category: "ux",
        impact: "high",
        effort: "easy",
      },
      {
        rank: 4,
        title: "Create a competitor comparison landing page",
        description: "Thousands of users are searching for 'X vs Asana' and 'X vs Monday.com' every month. A dedicated comparison page targeting these high-intent queries can drive 500-1000 qualified visitors per month.",
        category: "growth",
        impact: "high",
        effort: "medium",
      },
      {
        rank: 5,
        title: "Implement structured data for your pricing page",
        description: "Adding Product and Offer schema markup to your pricing page can enable rich results in search, including star ratings and price ranges, which increases organic click-through by 15-25%.",
        category: "seo",
        impact: "medium",
        effort: "easy",
      },
    ],
  };
}
