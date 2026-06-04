const EXPLORER_TABS = {
  themes: { label: "Themes", render: renderExplorerThemes },
  items: { label: "All Items", render: renderExplorerItems },
  sentiment: { label: "Sentiment", render: renderExplorerSentiment },
};

let activeExplorerTab = "themes";

function formatLabel(value) {
  if (!value || value === "none" || value === "unframed") return "None";
  return String(value).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function sentimentPill(label) {
  const cls = label === "positive" ? "pos" : label === "negative" ? "neg" : "neu";
  return `<span class="sent-pill sent-pill--${cls}">${label}</span>`;
}

function initExplorer() {
  const data = window.showcaseData;
  const root = document.querySelector("#discourse-explorer");
  if (!root || !data?.allItems) return;

  const tabs = root.querySelector(".explorer-tabs");
  const panel = root.querySelector("#explorer-panel");
  const stats = data.stats || {};

  root.querySelector("#explorer-stat-items").textContent = stats.totalItems ?? "…";
  root.querySelector("#explorer-stat-themes").textContent = stats.totalThemes ?? "…";
  root.querySelector("#explorer-stat-sources").textContent = stats.uniqueSubreddits ?? "…";
  root.querySelector("#explorer-stat-sentiment").textContent =
    stats.sentimentPositivePct != null ? `${stats.sentimentPositivePct}%` : "…";

  tabs.innerHTML = Object.entries(EXPLORER_TABS)
    .map(
      ([key, meta]) =>
        `<button type="button" class="explorer-tab ${key === activeExplorerTab ? "is-active" : ""}" data-tab="${key}">${meta.label}</button>`
    )
    .join("");

  tabs.addEventListener("click", (event) => {
    const button = event.target.closest(".explorer-tab");
    if (!button) return;
    activeExplorerTab = button.dataset.tab;
    tabs.querySelectorAll(".explorer-tab").forEach((el) => el.classList.toggle("is-active", el === button));
    EXPLORER_TABS[activeExplorerTab].render(data, panel);
  });

  EXPLORER_TABS[activeExplorerTab].render(data, panel);
}

function renderExplorerThemes(data, panel) {
  const themes = data.themeSummary || [];
  panel.innerHTML = themes
    .map((theme) => {
      const neuPct = Math.max(0, 100 - theme.sentiment_positive_pct - theme.sentiment_negative_pct);
      return `
        <article class="explorer-theme-card">
          <header class="explorer-theme-card__head">
            <h3>${theme.theme_label}</h3>
            <div class="explorer-theme-card__meta">
              <span class="explorer-badge">${theme.count} items</span>
              <span class="explorer-badge explorer-badge--muted">${theme.percentage}%</span>
            </div>
          </header>
          <div class="explorer-qual-row">
            <span><i class="dot dot-pos"></i>${theme.sentiment_positive_pct ?? 0}% positive</span>
            <span><i class="dot dot-neg"></i>${theme.sentiment_negative_pct ?? 0}% negative</span>
            <span><i class="dot dot-emo"></i>Emotion: ${formatLabel(theme.top_emotion)}</span>
            <span><i class="dot dot-frame"></i>Frame: ${formatLabel(theme.top_frame)}</span>
          </div>
          <div class="explorer-sent-bar" aria-hidden="true">
            <span style="width:${theme.sentiment_positive_pct ?? 0}%"></span>
            <span class="neg" style="width:${theme.sentiment_negative_pct ?? 0}%"></span>
            <span class="neu" style="width:${neuPct}%"></span>
          </div>
          <button type="button" class="explorer-link-btn" data-theme="${theme.theme}">Open in theme dashboard</button>
        </article>
      `;
    })
    .join("");

  panel.querySelectorAll("[data-theme]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dashboard = window.legalAIDashboard;
      const theme = dashboard?.themes?.find((item) => item.id === btn.dataset.theme);
      if (theme) {
        dashboard.renderTheme(theme);
        document.querySelector("#themes")?.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

function renderExplorerItems(data, panel) {
  const items = data.allItems || [];
  panel.innerHTML = `
    <div class="explorer-table-wrap">
      <table class="explorer-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Theme</th>
            <th>Sentiment</th>
            <th>Emotion</th>
            <th>Frame</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map((item) => {
              const link = redditLinkFromRow(item);
              return `
            <tr data-theme="${item.primary_theme}">
              <td>${escapeExplorerHtml(item.title)}</td>
              <td>${escapeExplorerHtml(item.theme_label || formatLabel(item.primary_theme))}</td>
              <td>${sentimentPill(item.sentiment_label || "neutral")}</td>
              <td>${formatLabel(item.dominant_emotion)}</td>
              <td>${formatLabel(item.rhetorical_frame)}</td>
              <td><a href="${link.href}" target="_blank" rel="noreferrer">${link.label}</a></td>
            </tr>
          `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  panel.querySelectorAll("tbody tr").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      const dashboard = window.legalAIDashboard;
      const theme = dashboard?.themes?.find((item) => item.id === row.dataset.theme);
      if (theme) {
        dashboard.renderTheme(theme);
        document.querySelector("#themes")?.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

function renderExplorerSentiment(data, panel) {
  const items = data.allItems || [];
  const themes = data.themeSummary || [];
  const counts = { positive: 0, neutral: 0, negative: 0 };
  items.forEach((item) => {
    const key = item.sentiment_label || "neutral";
    counts[key] = (counts[key] || 0) + 1;
  });

  panel.innerHTML = `
    <p class="preview-lede">VADER polarity on cleaned Reddit text: a plain read on tone, not a substitute for qualitative interpretation.</p>
    <div class="explorer-sent-split">
      <div id="explorer-overall-sentiment" class="preview-chart preview-chart--square"></div>
      <div id="explorer-theme-sentiment" class="preview-chart"></div>
    </div>
    <div class="explorer-sent-legend">
      <span><i class="dot dot-pos"></i>Positive: optimistic or approving tone</span>
      <span><i class="dot dot-neu"></i>Neutral: descriptive or mixed</span>
      <span><i class="dot dot-neg"></i>Negative: critical or warning tone</span>
    </div>
  `;

  const sent = window.DOCKET_PALETTE?.sentiment || {
    positive: "#5a6b57",
    neutral: "#b59a6d",
    negative: "#7b3f32",
  };
  const chartPaper = window.DOCKET_PALETTE?.paperStrong || "#fffdf8";
  const chartInk = window.DOCKET_PALETTE?.ink || "#1a1612";

  Plotly.newPlot(
    "explorer-overall-sentiment",
    [{
      type: "pie",
      labels: ["Positive", "Neutral", "Negative"],
      values: [counts.positive, counts.neutral, counts.negative],
      marker: { colors: [sent.positive, sent.neutral, sent.negative] },
      hole: 0.42,
      textinfo: "label+percent",
    }],
    {
      paper_bgcolor: chartPaper,
      plot_bgcolor: chartPaper,
      font: { family: "Source Sans 3, sans-serif", color: chartInk },
      margin: { l: 10, r: 10, t: 30, b: 10 },
      height: 320,
      showlegend: false,
    },
    { responsive: true, displayModeBar: false }
  );

  const sorted = [...themes].sort((a, b) => b.count - a.count);
  Plotly.newPlot(
    "explorer-theme-sentiment",
    [
      {
        name: "Positive",
        type: "bar",
        orientation: "h",
        y: sorted.map((t) => t.theme_label),
        x: sorted.map((t) => t.sentiment_positive_pct || 0),
        marker: { color: sent.positive },
      },
      {
        name: "Negative",
        type: "bar",
        orientation: "h",
        y: sorted.map((t) => t.theme_label),
        x: sorted.map((t) => t.sentiment_negative_pct || 0),
        marker: { color: sent.negative },
      },
    ],
    {
      barmode: "stack",
      paper_bgcolor: chartPaper,
      plot_bgcolor: chartPaper,
      font: { family: "Source Sans 3, sans-serif", color: chartInk },
      margin: { l: 20, r: 20, t: 30, b: 20 },
      height: Math.max(320, sorted.length * 42),
      xaxis: { title: "Share of theme (%)", range: [0, 100] },
      yaxis: { automargin: true },
      legend: { orientation: "h", y: 1.12 },
    },
    { responsive: true, displayModeBar: false }
  );
}

function escapeExplorerHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initExplorer);
} else {
  initExplorer();
}
