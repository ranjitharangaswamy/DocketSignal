const SAMPLE_THEMES = [
  {
    id: "accuracy_trust",
    name: "Accuracy, trust, and verification",
    count: 5,
    percentage: 20.0,
    meanScore: 340.2,
    frame: "verification-first",
    statement: "Practitioners treat citation accuracy and hallucination risk as the gate for any legal AI workflow.",
    memo: "Verification is the recurring moral of Reddit legal-AI threads: Mata, fake cases, and Harvey pilots all converge on validate-before-client-use. Trust is earned through workflow checks, not vendor claims.",
    implication: "Surface linked authorities, confidence states, and explicit cannot-verify flags before export.",
    excerpts: [
      {
        text: "Lawyer here — stop using ChatGPT for case citations. LLMs are probabilistic text generators, not legal databases.",
        subreddit: "r/ChatGPT",
        score: 892,
        url: "https://www.reddit.com/r/ChatGPT/comments/sample_lawyer_warning/"
      },
      {
        text: "After Mata I feel like I need to verify every sentence. Curious what others use that is grounded in real citations.",
        subreddit: "r/lawyers",
        score: 412,
        url: "https://www.reddit.com/r/lawyers/comments/sample_chatgpt_trust/"
      },
      {
        text: "We piloted Harvey for contract review. I still catch wrong clause summaries weekly. You must validate everything.",
        subreddit: "r/lawyers",
        score: 156,
        url: "https://www.reddit.com/r/lawyers/comments/sample_chatgpt_trust/"
      }
    ]
  },
  {
    id: "adoption_resistance",
    name: "Adoption resistance and firm culture",
    count: 4,
    percentage: 16.0,
    meanScore: 176.2,
    frame: "organizational-barriers",
    statement: "Adoption stalls on partner skepticism, missing policies, billable-hour incentives, and black-box anxiety.",
    memo: "Resistance is not purely technophobia. Associates describe shadow AI use while partners cite malpractice and confidentiality. Billable-hour economics and opaque models keep pilots underground.",
    implication: "Design for governed adoption: policy templates, ethical-wall compatibility, and transparent reasoning paths.",
    excerpts: [
      {
        text: "Partners still refuse to adopt any AI tools. Younger associates use ChatGPT quietly. We have no firm AI policy.",
        subreddit: "r/LawFirm",
        score: 234,
        url: "https://www.reddit.com/r/LawFirm/comments/sample_adoption_resistance/"
      },
      {
        text: "The black box problem is real. Lawyers need to see sources and reasoning paths.",
        subreddit: "r/ChatGPT",
        score: 198,
        url: "https://www.reddit.com/r/lawyers/comments/sample_governance_board/"
      },
      {
        text: "Billable hour model is the real barrier. Until compensation changes, adoption will stay secret and uneven.",
        subreddit: "r/LawFirm",
        score: 189,
        url: "https://www.reddit.com/r/LawFirm/comments/sample_adoption_resistance/"
      }
    ]
  },
  {
    id: "ethics_regulation",
    name: "Ethics, confidentiality, and governance",
    count: 4,
    percentage: 16.0,
    meanScore: 97.5,
    frame: "professional-duty",
    statement: "Confidentiality, disclosure rules, sanctions examples, and governance committees frame responsible use.",
    memo: "Ethics discourse ties AI to competence duty and client data handling. Bar disclosure expectations and CLE examples on sanctions make governance concrete rather than abstract.",
    implication: "Include disclosure helpers, DPA checklists, and audit logs that map to bar guidance.",
    excerpts: [
      {
        text: "Client confidentiality keeps us on firm-approved tools only. Need vendors that promise no training on our data.",
        subreddit: "r/lawyers",
        score: 145,
        url: "https://www.reddit.com/r/LegalTech/comments/sample_review_vs_reasoning/"
      },
      {
        text: "Collecting sanctions examples for a CLE on competence. Human researcher still has to validate the list ironically.",
        subreddit: "r/lawyers",
        score: 95,
        url: "https://www.reddit.com/r/lawyers/comments/sample_sanctions_examples/"
      },
      {
        text: "Pennsylvania expects disclosure when AI drafts court submissions. We are building a red/yellow/green use policy.",
        subreddit: "r/LawFirm",
        score: 88,
        url: "https://www.reddit.com/r/LawFirm/comments/sample_bar_ai_policy/"
      }
    ]
  },
  {
    id: "efficiency_gains",
    name: "Efficiency and workflow gains",
    count: 3,
    percentage: 12.0,
    meanScore: 115.3,
    frame: "workflow-accelerator",
    statement: "AI is welcomed for sorting, drafting, and first-pass review when human oversight stays mandatory.",
    memo: "Efficiency claims succeed when bounded: document triage and contract redlines save time, but nuance and judgment remain human. Speed without review is framed as dangerous.",
    implication: "Position features as reviewable workbenches with diff, source links, and approval states.",
    excerpts: [
      {
        text: "AI excels at sorting and surfacing responsive documents. Treat it as a workflow accelerator with mandatory human oversight.",
        subreddit: "r/LegalTech",
        score: 203,
        url: "https://www.reddit.com/r/LegalTech/comments/sample_review_vs_reasoning/"
      },
      {
        text: "Used GPT for contract redlines — fast but missed indemnity nuance. Useful for speed, dangerous if you skip line-by-line review.",
        subreddit: "r/ChatGPT",
        score: 76,
        url: "https://www.reddit.com/r/ChatGPT/comments/sample_contract_redlines/"
      },
      {
        text: "ROI only works if partners actually change workflow and stop re-billing manual review hours.",
        subreddit: "r/LegalTech",
        score: 67,
        url: "https://www.reddit.com/r/LegalTech/comments/sample_harvey_cocounsel/"
      }
    ]
  },
  {
    id: "job_displacement",
    name: "Role change vs job displacement",
    count: 3,
    percentage: 12.0,
    meanScore: 154.3,
    frame: "augmentation",
    statement: "Roles shift toward QA and AI literacy rather than wholesale replacement of lawyers or paralegals.",
    memo: "Reddit threads reject naive replacement narratives. Paralegals QA outputs; associates who ignore AI lose ground to those who adopt it. Law students feel a skills gap between clinic and practice.",
    implication: "Training and UI should elevate human accountability roles, not promise autonomous lawyering.",
    excerpts: [
      {
        text: "Our paralegals manage AI outputs and QA them. Associates who ignore AI will be replaced by associates who don't.",
        subreddit: "r/lawyers",
        score: 178,
        url: "https://www.reddit.com/r/lawyers/comments/sample_paralegal_future/"
      },
      {
        text: "Law student — should I learn prompting or Westlaw first? Bar exam world and practice world are diverging.",
        subreddit: "r/lawyers",
        score: 167,
        url: "https://www.reddit.com/r/lawyers/comments/sample_law_student_ai/"
      },
      {
        text: "We redirected paralegals to verification workflows. AI handles volume; humans handle accountability.",
        subreddit: "r/LawFirm",
        score: 118,
        url: "https://www.reddit.com/r/LawFirm/comments/sample_paralegal_qa/"
      }
    ]
  },
  {
    id: "tool_review",
    name: "Tool comparisons and vendor selection",
    count: 2,
    percentage: 8.0,
    meanScore: 85.5,
    frame: "vendor-evaluation",
    statement: "Threads compare Harvey, CoCounsel, Spellbook, and generic GPT on guardrails, integration, and subscription stack cost.",
    memo: "Tool talk mixes demo excitement with integration and pricing skepticism. Guardrails beat raw chatbots, but outputs still need attorney review.",
    implication: "Comparison views should show integration surface, price stack, and verification features side by side.",
    excerpts: [
      {
        text: "Harvey vs CoCounsel: worried about subscription creep when you add research plus AI tiers.",
        subreddit: "r/LegalTech",
        score: 98,
        url: "https://www.reddit.com/r/LegalTech/comments/sample_harvey_cocounsel/"
      },
      {
        text: "Spellbook vs generic GPT: better guardrails but still not signing outputs without review.",
        subreddit: "r/LegalTech",
        score: 73,
        url: "https://www.reddit.com/r/LegalTech/comments/sample_spellbook/"
      }
    ]
  },
  {
    id: "ediscovery_review",
    name: "eDiscovery and document review",
    count: 2,
    percentage: 8.0,
    meanScore: 173.0,
    frame: "defensible-process",
    statement: "Discovery AI is acceptable when TAR workflows stay transparent, defensible, and human-supervised.",
    memo: "eDiscovery is the mature use case in this corpus: first-pass clustering saves hours, privilege calls stay human, courts care about documented process.",
    implication: "Discovery UX should foreground provenance, privilege controls, and defensibility reporting.",
    excerpts: [
      {
        text: "AI assist on a document review batch cut review time dramatically. Would not trust nuanced privilege without human eyes.",
        subreddit: "r/lawyers",
        score: 301,
        url: "https://www.reddit.com/r/lawyers/comments/sample_ediscovery_efficiency/"
      },
      {
        text: "Need transparent and defensible TAR workflows. Courts accept AI assisted review if you document the process.",
        subreddit: "r/LegalTech",
        score: 45,
        url: "https://www.reddit.com/r/LegalTech/comments/sample_relativity_air/"
      }
    ]
  },
  {
    id: "cost_value",
    name: "Cost, billing, and ROI",
    count: 2,
    percentage: 8.0,
    meanScore: 72.5,
    frame: "economics",
    statement: "Monthly stack costs, flat-fee migration, and small-firm ROI doubts shape value conversations.",
    memo: "Cost threads link tools to billing models. Flat fees appear when firms track time saved; small shops weigh subscription creep against drafting savings.",
    implication: "Show matter-level ROI calculators and billing-model impact, not list price alone.",
    excerpts: [
      {
        text: "Moved discovery-heavy matters to flat fees after AI assisted review cut hours. Margins improved because we repriced deliberately.",
        subreddit: "r/LawFirm",
        score: 91,
        url: "https://www.reddit.com/r/LawFirm/comments/sample_flat_fee_ai/"
      },
      {
        text: "Clio Work with Vincent AI: monthly cost adds up. Anyone compare it to Claude with firm templates?",
        subreddit: "r/lawyers",
        score: 54,
        url: "https://www.reddit.com/r/lawyers/comments/sample_clio_ai/"
      }
    ]
  }
];

function isFrameDetected(value) {
  return Boolean(value && value !== "none" && value !== "unframed");
}

function formatFrameLabel(value) {
  if (!isFrameDetected(value)) return "None detected";
  return String(value).replace(/_/g, " ");
}

/** Row IDs already quoted in the scroll narrative (index.html). */
const SCROLLY_ROW_IDS = new Set([
  "reddit_009",
  "reddit_001",
  "reddit_002",
  "reddit_005",
  "reddit_003",
]);

function formatQualChip(value) {
  if (!value || value === "none" || value === "unframed") return "";
  return String(value).replace(/_/g, " ");
}

function formatQualValue(value) {
  const text = formatQualChip(value);
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function renderExcerptContextHtml(item) {
  const chips = [];
  if (item.sentiment_label) {
    chips.push({ label: "Sentiment", value: item.sentiment_label });
  }
  const emotion = formatQualValue(item.dominant_emotion);
  if (emotion) chips.push({ label: "Emotion", value: emotion });
  const frame = formatQualValue(item.rhetorical_frame);
  if (frame) chips.push({ label: "Frame", value: frame });
  if (!chips.length) return "";

  const chipHtml = chips
    .map(
      (chip) =>
        `<span class="excerpt-context__chip"><span class="excerpt-context__label">${escapeHtml(chip.label)}</span><span class="excerpt-context__value">${escapeHtml(chip.value)}</span></span>`
    )
    .join("");

  return `<p class="excerpt-context">${chipHtml}</p>`;
}

function buildThemeExcerpts(themeId, data, maxCount = 5) {
  const excerptByRowId = Object.fromEntries(
    (data.excerpts || [])
      .filter((row) => row.row_id)
      .map((row) => [row.row_id, row])
  );
  const processedById = Object.fromEntries(
    (data.processedCorpus || []).map((row) => [row.id, row])
  );

  const items = (data.allItems || [])
    .filter((item) => item.primary_theme === themeId && !SCROLLY_ROW_IDS.has(item.id))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, maxCount);

  if (!items.length) {
    return (data.excerpts || [])
      .filter((row) => row.theme === themeId && !SCROLLY_ROW_IDS.has(row.row_id))
      .sort((a, b) => a.rank - b.rank)
      .slice(0, maxCount)
      .map(mapExcerptRecord);
  }

  return items.map((item) => {
    const ex = excerptByRowId[item.id];
    const processed = processedById[item.id];
    return mapExcerptRecord({
      ...ex,
      row_id: item.id,
      title: ex?.title ?? item.title ?? "",
      body_text: ex?.body_text ?? processed?.clean_text ?? item.clean_text ?? "",
      author: ex?.author ?? "",
      post_type: item.post_type || ex?.post_type || "post",
      subreddit: item.subreddit || ex?.subreddit,
      score: item.score ?? ex?.score ?? 0,
      source_url: item.source_url || ex?.source_url,
      source_link_label: item.source_link_label || ex?.source_link_label,
      source_link_type: item.source_link_type || ex?.source_link_type,
      excerpt: ex?.excerpt,
      sentiment_label: item.sentiment_label,
      dominant_emotion: item.dominant_emotion,
      rhetorical_frame: item.rhetorical_frame,
    });
  });
}

function mapExcerptRecord(ex) {
  const sub = ex.subreddit ? String(ex.subreddit).replace(/^r\//, "") : "unknown";
  return {
    row_id: ex.row_id,
    title: ex.title || "",
    body_text: ex.body_text || "",
    author: ex.author || "",
    post_type: ex.post_type || "post",
    text: ex.excerpt || ex.body_text || ex.title || "",
    subreddit: `r/${sub}`,
    score: ex.score ?? 0,
    url: ex.source_url,
    source_url: ex.source_url,
    source_link_label: ex.source_link_label,
    source_link_type: ex.source_link_type,
    sentiment_label: ex.sentiment_label,
    dominant_emotion: ex.dominant_emotion,
    rhetorical_frame: ex.rhetorical_frame,
  };
}

function hydrateThemesFromShowcase(fallbackThemes) {
  const data = window.showcaseData;
  if (!data?.themeSummary?.length) return [...fallbackThemes];

  const fallbackById = Object.fromEntries(fallbackThemes.map((theme) => [theme.id, theme]));

  return [...data.themeSummary]
    .sort((a, b) => b.count - a.count)
    .map((row) => {
      const existing = fallbackById[row.theme];
      const exRows = buildThemeExcerpts(row.theme, data);
      return {
        id: row.theme,
        name: row.theme_label || row.theme,
        count: row.count,
        percentage: row.percentage,
        meanScore: row.mean_reddit_score ?? 0,
        frameRaw: row.top_frame,
        frame: formatFrameLabel(row.top_frame),
        statement:
          existing?.statement ||
          `${row.theme_label} appears in ${row.count} coded items (${row.percentage}% of corpus).`,
        memo:
          existing?.memo ||
          `Sentiment split: ${row.sentiment_positive_pct ?? 0}% positive, ${row.sentiment_negative_pct ?? 0}% negative. Dominant emotion: ${row.top_emotion || "none"}. Subreddits: ${row.top_subreddits || "n/a"}.`,
        implication:
          existing?.implication ||
          "Treat frequency as a prioritization signal; validate themes with constant comparison.",
        excerpts: exRows.length ? exRows : existing?.excerpts || [],
      };
    });
}

const themes = hydrateThemesFromShowcase(SAMPLE_THEMES);

const corpusStats = {
  codedItems: window.showcaseData?.stats?.totalItems ?? 25,
  sourceTypes: window.showcaseData?.stats?.uniqueSubreddits ?? 1,
  themes: themes.length,
};

const themeList = document.querySelector("#theme-list");
const detailTitle = document.querySelector("#detail-title");
const detailStatement = document.querySelector("#detail-statement");
const detailPercent = document.querySelector("#detail-percent");
const detailCount = document.querySelector("#detail-count");
const detailSentiment = document.querySelector("#detail-sentiment");
const detailFrame = document.querySelector("#detail-frame");
const detailFrameTile = document.querySelector("#detail-frame-tile");
const signalGrid = document.querySelector(".signal-grid");
const evidenceList = document.querySelector("#evidence-list");
const memoText = document.querySelector("#memo-text");
const implicationText = document.querySelector("#implication-text");

document.querySelector("#stat-items").textContent = corpusStats.codedItems;
document.querySelector("#stat-themes").textContent = corpusStats.themes;
document.querySelector("#stat-sources").textContent = corpusStats.sourceTypes;

function applyProvenance(provenance) {
  const banner = document.querySelector("#provenance-banner");
  const label = document.querySelector("#provenance-label");
  const detail = document.querySelector("#provenance-detail");
  const collected = document.querySelector("#provenance-collected");

  if (!banner || !provenance) return;

  label.textContent = provenance.label || "Unknown source";
  detail.textContent = provenance.detail || "";
  collected.textContent = provenance.collected_at || "n/a";

  banner.classList.toggle("is-live", provenance.mode === "live_reddit_api");
  banner.classList.toggle("is-sample", provenance.mode === "sample_corpus");

  if (provenance.row_count) {
    document.querySelector("#stat-items").textContent = provenance.row_count;
  }
  if (provenance.theme_count) {
    document.querySelector("#stat-themes").textContent = provenance.theme_count;
  }

  const methodsNote = document.querySelector("#detail-methods-provenance");
  if (methodsNote) {
    if (provenance.mode === "live_reddit_api") {
      methodsNote.textContent =
        "Corpus: live Reddit API collection. Scores reflect current Reddit upvotes at collection time; theme coding still requires researcher validation.";
    } else if (provenance.mode === "sample_corpus") {
      methodsNote.textContent =
        "Corpus: curated sample (not live scrapes). Reddit scores are illustrative engagement values from the sample corpus; rerun with --live-reddit for live upvotes.";
    } else {
      methodsNote.textContent = provenance.detail || methodsNote.textContent;
    }
  }
}

if (window.corpusProvenance) {
  applyProvenance(window.corpusProvenance);
}

function renderThemeList(selectedId) {
  themeList.innerHTML = themes.map((theme, index) => `
    <button class="theme-button ${theme.id === selectedId ? "is-active" : ""}" data-theme-id="${theme.id}">
      <div>
        <strong>${index + 1}. ${theme.name}</strong>
        <small>${theme.count} items / mean score ${theme.meanScore}</small>
      </div>
      <span>${theme.percentage}%</span>
    </button>
  `).join("");
}

function renderTheme(theme) {
  detailTitle.textContent = theme.name;
  detailStatement.textContent = theme.statement;
  detailPercent.textContent = `${theme.percentage}%`;
  detailCount.textContent = theme.count;
  detailSentiment.textContent = `score ${theme.meanScore}`;
  const frameValue = theme.frameRaw ?? theme.frame;
  const showFrame = isFrameDetected(frameValue);
  if (detailFrameTile) detailFrameTile.hidden = !showFrame;
  if (signalGrid) signalGrid.classList.toggle("signal-grid--two-up", !showFrame);
  if (showFrame && detailFrame) {
    detailFrame.textContent = formatFrameLabel(frameValue);
  }
  memoText.textContent = theme.memo;
  implicationText.textContent = theme.implication;
  const evidenceNote = document.querySelector("#evidence-note");
  const evidenceMeta = getThemeEvidenceMeta(theme.id);
  if (evidenceNote) {
    evidenceNote.textContent = evidenceMeta.note;
  }

  evidenceList.innerHTML = theme.excerpts.length
    ? renderThemeEvidence(theme)
    : `<p class="excerpt-empty">No additional excerpts for this theme beyond the scroll narrative.</p>`;
  evidenceList.className = `evidence-list evidence-list--${evidenceMeta.layout}`;
  renderThemeList(theme.id);
}

themeList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-theme-id]");
  if (!button) return;

  const theme = themes.find((item) => item.id === button.dataset.themeId);
  renderTheme(theme);
});

renderTheme(themes[0]);

function renderDashboardThemeViz() {
  const summary = window.showcaseData?.themeSummary;
  if (!summary?.length || typeof window.renderThemeFrequencyChart !== "function") return;

  window.renderThemeFrequencyChart("dashboard-theme-viz", summary, {
    ascending: true,
    height: 440,
    title: "Top themes in Reddit legal-AI discourse",
    hint: "Click a row to open that theme",
    onThemeClick: (themeId) => {
      const theme = themes.find((item) => item.id === themeId);
      if (theme) renderTheme(theme);
    },
  });
}

renderDashboardThemeViz();

window.legalAIDashboard = { themes, renderTheme, renderDashboardThemeViz };
