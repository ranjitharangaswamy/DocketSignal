/** Theme frequency — isotype matrix (one square per coded row). */
const P = window.DOCKET_PALETTE || {};
const THEME_VIZ_COLORS = P.themes || {
  accuracy_trust: "#7b3f32",
  adoption_resistance: "#b59a6d",
  ethics_regulation: "#4a5d68",
  efficiency_gains: "#5a6b57",
  job_displacement: "#b8935a",
  tool_review: "#6b6256",
  ediscovery_review: "#354650",
  cost_value: "#9a5538",
};

const ENGAGEMENT_ACCENT = P.gold || "#b8935a";
const CHART_MUTED = P.muted || "#6b6256";

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sortThemeRows(rows, ascending) {
  return [...rows].sort((a, b) => (ascending ? a.count - b.count : b.count - a.count));
}

function renderThemeFreqRow(row, maxCount, maxScore) {
  const color = THEME_VIZ_COLORS[row.theme] || P.slate || "#4a5d68";
  const scorePct = maxScore ? Math.round(((row.mean_reddit_score || 0) / maxScore) * 100) : 0;
  const railPct = maxCount ? Math.round((row.count / maxCount) * 100) : 0;
  const cells = Array.from({ length: row.count }, (_, index) => {
    const slot = index + 1;
    return `<span class="theme-freq-cell" style="--cell:${color}" title="Coded item ${slot} of ${row.count}"></span>`;
  }).join("");

  return `
    <li
      class="theme-freq-row"
      data-theme="${escapeHtml(row.theme)}"
      role="button"
      tabindex="0"
      aria-label="${escapeHtml(row.theme_label)}: ${row.count} coded rows, ${row.percentage}% of corpus, mean Reddit score ${Math.round(row.mean_reddit_score || 0)}"
    >
      <div class="theme-freq-row__label">${escapeHtml(row.theme_label)}</div>
      <div class="theme-freq-row__viz">
        <div class="theme-freq-row__cells" aria-hidden="true">${cells}</div>
        <div class="theme-freq-row__rail" aria-hidden="true">
          <span class="theme-freq-row__rail-fill" style="width:${railPct}%; background:${color}"></span>
        </div>
      </div>
      <div class="theme-freq-row__stats">
        <span class="theme-freq-stat"><strong>${row.count}</strong> rows</span>
        <span class="theme-freq-stat">${row.percentage}%</span>
        <span class="theme-freq-stat theme-freq-stat--score" title="Mean Reddit upvote score">
          <span class="theme-freq-score-bar" style="--score-w:${scorePct}%; --score-c:${color}"></span>
          ${Math.round(row.mean_reddit_score || 0)}
        </span>
      </div>
    </li>`;
}

/**
 * Ranked isotype matrix: each square = one coded post/comment.
 * Proportion rail and score bar encode count and engagement without overlapping labels.
 */
function renderThemeFrequencyChart(containerId, rows, options = {}) {
  const el = document.getElementById(containerId);
  if (!el || !rows?.length) return null;

  const ascending = options.ascending !== false;
  const sorted = sortThemeRows(rows, ascending);
  const maxCount = Math.max(...sorted.map((r) => r.count), 1);
  const maxScore = Math.max(...sorted.map((r) => r.mean_reddit_score || 0), 1);
  const title = options.title || "Top themes in Reddit legal-AI discourse";
  const hint = options.hint || "Each square = one coded post or comment · score = mean Reddit upvotes";

  el.className = `${el.className.replace(/\btheme-freq-matrix-wrap\b/g, "").trim()} theme-freq-matrix-wrap`.trim();
  el.innerHTML = `
    <header class="theme-freq-matrix__head">
      <h3 class="theme-freq-matrix__title">${escapeHtml(title)}</h3>
      <p class="theme-freq-matrix__hint">${escapeHtml(hint)}</p>
    </header>
    <ol class="theme-freq-matrix" role="list">
      ${sorted.map((row) => renderThemeFreqRow(row, maxCount, maxScore)).join("")}
    </ol>
    <footer class="theme-freq-matrix__foot">
      <span><span class="theme-freq-legend-swatch theme-freq-legend-swatch--cell"></span> one coded row</span>
      <span><span class="theme-freq-legend-swatch theme-freq-legend-swatch--rail"></span> relative count</span>
      <span><span class="theme-freq-legend-swatch theme-freq-legend-swatch--score"></span> mean score</span>
    </footer>`;

  el.querySelectorAll(".theme-freq-row").forEach((rowEl) => {
    const themeId = rowEl.dataset.theme;
    const activate = () => {
      if (typeof options.onThemeClick === "function") options.onThemeClick(themeId);
    };
    rowEl.addEventListener("click", activate);
    rowEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });

  return el;
}

window.renderThemeFrequencyChart = renderThemeFrequencyChart;
window.renderThemeSparkChart = renderThemeFrequencyChart;
