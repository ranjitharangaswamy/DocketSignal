const PREVIEW_META = {
  theme_summary: {
    title: "Theme summary",
    blurb: "Frequency-ranked themes with share and mean Reddit score.",
    download: "outputs/theme_summary.csv",
  },
  processed_corpus: {
    title: "Processed corpus",
    blurb: "Cleaned rows with theme codes. Filter by subreddit or theme.",
    download: "data/processed_corpus.csv",
  },
  illustrative_excerpts: {
    title: "Illustrative excerpts",
    blurb: "Top engagement excerpts per theme with source links.",
    download: "outputs/illustrative_excerpts.csv",
  },
  memos: {
    title: "Researcher memos",
    blurb: "Short interpretive notes tied to excerpt evidence.",
    download: "outputs/memos.md",
  },
  chart: {
    title: "Top themes chart",
    blurb: "Unit tally chart: one dot per coded row. Click to open a theme.",
    download: "outputs/top_themes.png",
  },
};

const THEME_COLORS = window.DOCKET_PALETTE?.themes || {
  accuracy_trust: "#7b3f32",
  adoption_resistance: "#b59a6d",
  ethics_regulation: "#4a5d68",
  efficiency_gains: "#5a6b57",
  job_displacement: "#b8935a",
  tool_review: "#6b6256",
  ediscovery_review: "#354650",
  cost_value: "#9a5538",
};

const CHART_UI = window.DOCKET_PALETTE || {
  paperStrong: "#fffdf8",
  ink: "#1a1612",
};

const modal = document.querySelector("#preview-modal");
const modalTitle = document.querySelector("#preview-modal-title");
const modalBody = document.querySelector("#preview-modal-body");
const modalDownload = document.querySelector("#preview-modal-download");
const modalClose = document.querySelector("#preview-modal-close");

function getData() {
  return window.showcaseData || null;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function plotLayout(title, extra = {}) {
  return {
    paper_bgcolor: CHART_UI.paperStrong || "#fffdf8",
    plot_bgcolor: CHART_UI.paperStrong || "#fffdf8",
    font: { family: "Source Sans 3, sans-serif", color: CHART_UI.ink || "#1a1612", size: 13 },
    margin: { l: 20, r: 20, t: 44, b: 20 },
    title: { text: title, font: { family: "IBM Plex Serif, serif", size: 18 } },
    ...extra,
  };
}

function openPreview(key) {
  const meta = PREVIEW_META[key];
  const data = getData();
  if (!meta) return;
  if (!data) {
    modalTitle.textContent = "Data not loaded";
    modalBody.innerHTML = '<p class="preview-lede">Run <code>python run_pipeline.py</code> in MiniProject2 to generate <code>showcase-data.js</code>, then reload this page.</p>';
    modalDownload.hidden = true;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    return;
  }

  modalDownload.hidden = false;
  modalTitle.textContent = meta.title;
  modalDownload.href = meta.download;
  modalDownload.textContent = `Download ${meta.download.split("/").pop()}`;
  modalBody.innerHTML = '<div class="preview-loading">Loading visualization…</div>';
  modal.hidden = false;
  document.body.classList.add("modal-open");

  requestAnimationFrame(() => {
    modalBody.innerHTML = "";
    if (key === "theme_summary") renderThemeSummary(data, modalBody);
    else if (key === "processed_corpus") renderCorpusPreview(data, modalBody);
    else if (key === "illustrative_excerpts") renderExcerptsPreview(data, modalBody);
    else if (key === "memos") renderMemosPreview(data, modalBody);
    else if (key === "chart") renderChartPreview(data, modalBody);
  });
}

function closePreview() {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  modalBody.innerHTML = "";
}

function jumpToTheme(themeId) {
  const dashboard = window.legalAIDashboard;
  const theme = dashboard?.themes?.find((item) => item.id === themeId);
  if (!theme || !dashboard?.renderTheme) return;
  closePreview();
  dashboard.renderTheme(theme);
  document.querySelector("#themes")?.scrollIntoView({ behavior: "smooth" });
}

function renderThemeSummary(data, container) {
  const rows = [...data.themeSummary].sort((a, b) => b.count - a.count);
  container.innerHTML = `
    <p class="preview-lede">Isotype matrix: one square per coded row. Click a row to jump to that theme.</p>
    <div id="preview-theme-chart" class="theme-freq-chart"></div>
    <div id="preview-score-chart" class="preview-chart preview-chart--short"></div>
  `;

  const labels = rows.map((r) => r.theme_label);
  const colors = rows.map((r) => THEME_COLORS[r.theme] || "#4a5d68");

  renderThemeFrequencyChart("preview-theme-chart", rows, {
    ascending: false,
    title: "Theme frequency (isotype matrix)",
    onThemeClick: jumpToTheme,
  });

  Plotly.newPlot(
    "preview-score-chart",
    [{
      type: "bar",
      x: labels,
      y: rows.map((r) => r.mean_reddit_score),
      marker: { color: colors },
      hovertemplate: "<b>%{x}</b><br>Mean score: %{y}<extra></extra>",
    }],
    plotLayout("Mean Reddit score by theme", {
      xaxis: { tickangle: -28 },
      yaxis: { title: "Score" },
      height: 280,
    }),
    { responsive: true, displayModeBar: false }
  );
}

function renderCorpusPreview(data, container) {
  const rows = data.processedCorpus;
  const themes = [...new Set(rows.map((r) => r.primary_theme))];

  container.innerHTML = `
    <div class="preview-controls">
      <label>Filter by theme
        <select id="corpus-theme-filter">
          <option value="">All themes</option>
          ${themes.map((t) => {
            const label = rows.find((r) => r.primary_theme === t)?.theme_label || t;
            return `<option value="${t}">${escapeHtml(label)}</option>`;
          }).join("")}
        </select>
      </label>
      <label>Subreddit
        <select id="corpus-sub-filter">
          <option value="">All subreddits</option>
          ${[...new Set(rows.map((r) => r.subreddit))].map((s) => `<option value="${s}">r/${s}</option>`).join("")}
        </select>
      </label>
    </div>
    <div class="preview-corpus-viz">
      <div id="preview-corpus-donut" class="preview-chart preview-chart--donut"></div>
      <div id="preview-corpus-legend" class="preview-corpus-legend" aria-label="Theme legend"></div>
    </div>
    <div id="preview-corpus-table-wrap" class="preview-table-wrap"></div>
  `;

  const themeFilter = container.querySelector("#corpus-theme-filter");
  const subFilter = container.querySelector("#corpus-sub-filter");
  const tableWrap = container.querySelector("#preview-corpus-table-wrap");
  const legendEl = container.querySelector("#preview-corpus-legend");

  function filteredRows() {
    return rows.filter((row) => {
      if (themeFilter.value && row.primary_theme !== themeFilter.value) return false;
      if (subFilter.value && row.subreddit !== subFilter.value) return false;
      return true;
    });
  }

  function renderDonut(subset) {
    const counts = {};
    const labelToTheme = {};
    subset.forEach((row) => {
      counts[row.theme_label] = (counts[row.theme_label] || 0) + 1;
      labelToTheme[row.theme_label] = row.primary_theme;
    });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    const labels = entries.map(([label]) => label);
    const values = entries.map(([, count]) => count);
    const colors = labels.map((label) => THEME_COLORS[labelToTheme[label]] || "#4a5d68");

    if (legendEl) {
      legendEl.innerHTML = entries
        .map(([label, count]) => {
          const pct = total ? Math.round((count / total) * 100) : 0;
          const color = THEME_COLORS[labelToTheme[label]] || "#4a5d68";
          return `
            <div class="corpus-legend-item">
              <span class="corpus-legend-swatch" style="background:${color}"></span>
              <span class="corpus-legend-text">${escapeHtml(label)}</span>
              <span class="corpus-legend-pct">${pct}%</span>
            </div>`;
        })
        .join("");
    }

    Plotly.newPlot(
      "preview-corpus-donut",
      [{
        type: "pie",
        labels,
        values,
        hole: 0.48,
        textinfo: "none",
        marker: { colors, line: { color: CHART_UI.paperStrong || "#fffdf8", width: 2 } },
        hovertemplate: "<b>%{label}</b><br>%{value} rows (%{percent})<extra></extra>",
      }],
      plotLayout("Theme mix", {
        height: 280,
        showlegend: false,
        margin: { l: 12, r: 12, t: 44, b: 12 },
      }),
      { responsive: true, displayModeBar: false }
    );
  }

  function renderTable(subset) {
    tableWrap.innerHTML = `
      <table class="preview-table">
        <thead>
          <tr>
            <th>Theme</th>
            <th>Subreddit</th>
            <th>Type</th>
            <th>Score</th>
            <th>Excerpt</th>
          </tr>
        </thead>
        <tbody>
          ${subset.map((row) => `
            <tr data-theme="${row.primary_theme}">
              <td><span class="theme-chip" style="--chip:${THEME_COLORS[row.primary_theme] || "#4a5d68"}">${escapeHtml(row.theme_label)}</span></td>
              <td>r/${escapeHtml(row.subreddit)}</td>
              <td>${escapeHtml(row.post_type)}</td>
              <td>${row.score}</td>
              <td class="preview-table-excerpt">${escapeHtml(row.clean_text)}…</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    tableWrap.querySelectorAll("tbody tr").forEach((tr) => {
      tr.addEventListener("click", () => jumpToTheme(tr.dataset.theme));
    });
  }

  function refresh() {
    const subset = filteredRows();
    renderDonut(subset);
    renderTable(subset);
  }

  themeFilter.addEventListener("change", refresh);
  subFilter.addEventListener("change", refresh);
  refresh();
}

function renderExcerptsPreview(data, container) {
  const rows = data.excerpts;
  const themes = [...new Set(rows.map((r) => r.theme))];
  const maxScore = Math.max(...rows.map((r) => r.score));

  container.innerHTML = `
    <div class="preview-pills" id="excerpt-pills">
      <button type="button" class="preview-pill is-active" data-theme="">All</button>
      ${themes.map((t) => {
        const label = rows.find((r) => r.theme === t)?.theme_label || t;
        return `<button type="button" class="preview-pill" data-theme="${t}">${escapeHtml(label)}</button>`;
      }).join("")}
    </div>
    <div id="excerpt-cards" class="preview-excerpt-grid"></div>
  `;

  const cards = container.querySelector("#excerpt-cards");
  const pills = container.querySelector("#excerpt-pills");

  function renderCards(themeId) {
    const subset = themeId ? rows.filter((r) => r.theme === themeId) : rows;
    cards.innerHTML = subset.map((row) => {
      const link = redditLinkFromRow(row);
      return `
      <article class="preview-excerpt-card">
        <div class="preview-excerpt-head">
          <strong>${escapeHtml(row.theme_label)}</strong>
          <span>r/${escapeHtml(row.subreddit)} · score ${row.score}</span>
        </div>
        <div class="preview-score-bar" style="--w:${Math.round((row.score / maxScore) * 100)}%; --c:${THEME_COLORS[row.theme] || "#4a5d68"}"></div>
        ${redditQuoteHtml({
          title: row.title,
          body_text: row.body_text,
          author: row.author,
          post_type: row.post_type,
          subreddit: row.subreddit,
          score: row.score,
          excerpt: row.excerpt,
        })}
        <button type="button" class="preview-link-btn" data-theme="${row.theme}">Inspect in dashboard</button>
        <a href="${link.href}" target="_blank" rel="noreferrer">${link.label}</a>
      </article>
    `;
    }).join("");

    cards.querySelectorAll(".preview-link-btn").forEach((btn) => {
      btn.addEventListener("click", () => jumpToTheme(btn.dataset.theme));
    });
  }

  pills.addEventListener("click", (event) => {
    const pill = event.target.closest(".preview-pill");
    if (!pill) return;
    pills.querySelectorAll(".preview-pill").forEach((el) => el.classList.remove("is-active"));
    pill.classList.add("is-active");
    renderCards(pill.dataset.theme);
  });

  renderCards("");
}

function renderMemosPreview(data, container) {
  const sections = data.memosMarkdown.split(/\n(?=## )/).filter(Boolean);
  container.innerHTML = `<div class="preview-memos">${sections.map((section) => {
    const lines = section.trim().split("\n");
    const heading = lines[0].replace(/^## /, "");
    const body = lines.slice(1).join("\n")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
    return `<section class="preview-memo-block"><h3>${escapeHtml(heading)}</h3><div>${body}</div></section>`;
  }).join("")}</div>`;
}

function renderChartPreview(data, container) {
  container.innerHTML = `
    <p class="preview-lede">Isotype matrix: each square is one coded post. Click a row to explore that theme.</p>
    <div id="preview-main-chart" class="theme-freq-chart"></div>
  `;
  const rows = [...data.themeSummary];
  renderThemeFrequencyChart("preview-main-chart", rows, {
    ascending: true,
    title: "Top themes in Reddit legal-AI discourse",
    onThemeClick: jumpToTheme,
  });
}

document.querySelectorAll("[data-preview]").forEach((card) => {
  card.addEventListener("click", () => openPreview(card.dataset.preview));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPreview(card.dataset.preview);
    }
  });
});

modalClose?.addEventListener("click", closePreview);
modal?.addEventListener("click", (event) => {
  if (event.target === modal) closePreview();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closePreview();
});
