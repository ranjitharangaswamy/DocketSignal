const PREVIEW_META = {
  theme_summary: {
    title: "Theme summary",
    blurb: "Frequency-ranked themes with share and mean Reddit score.",
    download: "outputs/theme_summary.csv",
  },
  processed_corpus: {
    title: "Processed corpus",
    blurb: "Cleaned rows with theme codes — filter by subreddit or theme.",
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
    blurb: "Interactive bar chart of theme frequency.",
    download: "outputs/top_themes.png",
  },
};

const THEME_COLORS = {
  accuracy_trust: "#7c2f2b",
  adoption_resistance: "#a9977e",
  ethics_regulation: "#28485f",
  efficiency_gains: "#4b7657",
  job_displacement: "#c28f37",
  tool_review: "#665f56",
  ediscovery_review: "#1e3a5f",
  cost_value: "#8b5a2b",
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
    paper_bgcolor: "#fffaf1",
    plot_bgcolor: "#fffaf1",
    font: { family: "Source Sans 3, sans-serif", color: "#181512", size: 13 },
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
    <p class="preview-lede">Click a bar to jump to that theme in the main dashboard.</p>
    <div id="preview-theme-chart" class="preview-chart"></div>
    <div id="preview-score-chart" class="preview-chart preview-chart--short"></div>
  `;

  const labels = rows.map((r) => r.theme_label);
  const counts = rows.map((r) => r.count);
  const colors = rows.map((r) => THEME_COLORS[r.theme] || "#28485f");

  Plotly.newPlot(
    "preview-theme-chart",
    [{
      type: "bar",
      orientation: "h",
      y: labels,
      x: counts,
      marker: { color: colors },
      text: rows.map((r) => `${r.percentage}%`),
      textposition: "outside",
      hovertemplate: "<b>%{y}</b><br>Count: %{x}<br>Share: %{text}<extra></extra>",
      customdata: rows.map((r) => r.theme),
    }],
    plotLayout("Theme frequency (count)", {
      xaxis: { title: "Posts / comments" },
      yaxis: { automargin: true },
      height: 360,
    }),
    { responsive: true, displayModeBar: false }
  );

  document.getElementById("preview-theme-chart").on("plotly_click", (event) => {
    const themeId = event.points[0]?.customdata;
    if (themeId) jumpToTheme(themeId);
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
    <div class="preview-split">
      <div id="preview-corpus-donut" class="preview-chart preview-chart--square"></div>
      <div id="preview-corpus-table-wrap" class="preview-table-wrap"></div>
    </div>
  `;

  const themeFilter = container.querySelector("#corpus-theme-filter");
  const subFilter = container.querySelector("#corpus-sub-filter");
  const tableWrap = container.querySelector("#preview-corpus-table-wrap");

  function filteredRows() {
    return rows.filter((row) => {
      if (themeFilter.value && row.primary_theme !== themeFilter.value) return false;
      if (subFilter.value && row.subreddit !== subFilter.value) return false;
      return true;
    });
  }

  function renderDonut(subset) {
    const counts = {};
    subset.forEach((row) => {
      counts[row.theme_label] = (counts[row.theme_label] || 0) + 1;
    });
    Plotly.newPlot(
      "preview-corpus-donut",
      [{
        type: "pie",
        labels: Object.keys(counts),
        values: Object.values(counts),
        hole: 0.45,
        textinfo: "label+percent",
        hovertemplate: "<b>%{label}</b><br>%{value} rows (%{percent})<extra></extra>",
      }],
      plotLayout("Theme mix", { height: 320, showlegend: false }),
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
              <td><span class="theme-chip" style="--chip:${THEME_COLORS[row.primary_theme] || "#28485f"}">${escapeHtml(row.theme_label)}</span></td>
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
        <div class="preview-score-bar" style="--w:${Math.round((row.score / maxScore) * 100)}%; --c:${THEME_COLORS[row.theme] || "#28485f"}"></div>
        <p>${escapeHtml(row.excerpt)}…</p>
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
    <p class="preview-lede">Same frequency data as the static PNG, rendered interactively. Hover for counts; click a bar to open that theme.</p>
    <div id="preview-main-chart" class="preview-chart"></div>
  `;
  const rows = [...data.themeSummary].sort((a, b) => a.count - b.count);
  Plotly.newPlot(
    "preview-main-chart",
    [{
      type: "bar",
      orientation: "h",
      y: rows.map((r) => r.theme_label),
      x: rows.map((r) => r.count),
      marker: { color: rows.map((r) => THEME_COLORS[r.theme] || "#28485f") },
      customdata: rows.map((r) => r.theme),
      hovertemplate: "<b>%{y}</b><br>%{x} items<extra></extra>",
    }],
    plotLayout("Top themes in Reddit legal-AI discourse", {
      xaxis: { title: "Number of posts/comments" },
      yaxis: { automargin: true },
      height: 400,
    }),
    { responsive: true, displayModeBar: false }
  );
  document.getElementById("preview-main-chart").on("plotly_click", (event) => {
    const themeId = event.points[0]?.customdata;
    if (themeId) jumpToTheme(themeId);
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
