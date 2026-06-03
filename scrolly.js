const SCROLLY_KEYWORDS = [
  "hallucinated citations",
  "Mata sanctions",
  "shadow ChatGPT",
  "Harvey pilot",
  "verify everything",
  "no firm policy",
  "billable hours",
  "black box",
  "eDiscovery TAR",
  "client confidentiality",
  "partner skepticism",
  "fake cases",
];

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function formatPct(value) {
  return value == null ? "—" : `${Math.round(value)}%`;
}

function bindScrollyData() {
  const data = window.showcaseData;
  if (!data) return;

  const stats = data.stats || {};
  const topTheme = [...(data.themeSummary || [])].sort((a, b) => b.count - a.count)[0];
  const byTheme = Object.fromEntries((data.themeSummary || []).map((row) => [row.theme, row]));

  const map = {
    "data-items": stats.totalItems,
    "data-themes": stats.totalThemes,
    "data-sentiment": stats.sentimentPositivePct,
    "data-top-theme-pct": topTheme?.percentage,
    "data-top-theme-label": topTheme?.theme_label,
    "data-top-theme-count": topTheme?.count,
    "path-accuracy-pct": byTheme.accuracy_trust?.percentage,
    "path-adoption-pct": byTheme.adoption_resistance?.percentage,
  };

  Object.entries(map).forEach(([id, value]) => {
    const el = document.querySelector(`[data-scrolly="${id}"]`);
    if (!el || value == null) return;
    if (id.includes("label")) {
      el.textContent = value;
    } else if (id.includes("pct") || id === "data-sentiment" || id.startsWith("path-")) {
      el.textContent = formatPct(value);
      if (id === "data-sentiment" && el.dataset.countTo != null) {
        el.dataset.countTo = String(Math.round(value));
      }
    } else {
      el.textContent = String(value);
      if (el.dataset.countTo != null) {
        el.dataset.countTo = String(Math.round(value));
      }
    }
  });

  const grid = document.querySelector("#scrolly-theme-grid");
  if (grid && topTheme) {
    const filled = Math.min(10, Math.max(1, Math.round(topTheme.count)));
    grid.innerHTML = Array.from({ length: 10 }, (_, i) => {
      const on = i < filled;
      return `<span class="scrolly-grid-cell ${on ? "is-on" : ""}" aria-hidden="true"></span>`;
    }).join("");
    grid.setAttribute(
      "aria-label",
      `${filled} of 10 cells represent roughly ${topTheme.percentage}% of corpus in top theme`
    );
  }

  const sentBar = document.querySelector(".scrolly-sent-bar");
  if (sentBar && data.allItems?.length) {
    const total = data.allItems.length;
    const pos = data.allItems.filter((i) => i.sentiment_label === "positive").length;
    const neg = data.allItems.filter((i) => i.sentiment_label === "negative").length;
    const neu = total - pos - neg;
    const posEl = sentBar.querySelector(".pos");
    const neuEl = sentBar.querySelector(".neu");
    const negEl = sentBar.querySelector(".neg");
    if (posEl) posEl.style.width = `${(pos / total) * 100}%`;
    if (neuEl) neuEl.style.width = `${(neu / total) * 100}%`;
    if (negEl) negEl.style.width = `${(neg / total) * 100}%`;
  }
}

function initMarquee() {
  const track = document.querySelector(".scrolly-marquee__track");
  if (!track || prefersReducedMotion()) return;

  const items = [...SCROLLY_KEYWORDS, ...SCROLLY_KEYWORDS];
  track.innerHTML = items.map((word) => `<span>${word}</span>`).join("");
}

function initReveal() {
  const nodes = document.querySelectorAll(".scrolly-reveal");
  if (!nodes.length) return;

  if (prefersReducedMotion()) {
    nodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );

  nodes.forEach((node) => observer.observe(node));
}

function initHeroParallax() {
  const heroImage = document.querySelector(".hero__image");
  if (!heroImage || prefersReducedMotion()) return;

  window.addEventListener(
    "scroll",
    () => {
      const y = Math.min(window.scrollY, window.innerHeight);
      heroImage.style.transform = `scale(1.04) translateY(${y * 0.18}px)`;
    },
    { passive: true }
  );
}

function initCounterReveal() {
  const counters = document.querySelectorAll("[data-count-to]");
  if (!counters.length || prefersReducedMotion()) return;

  const animate = (el) => {
    const target = Number(el.dataset.countTo);
    const suffix = el.dataset.countSuffix || "";
    const duration = 900;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      const value = Math.round(target * eased);
      el.textContent = `${value}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => observer.observe(el));
}

function initScrolly() {
  bindScrollyData();
  initMarquee();
  initReveal();
  initHeroParallax();
  initCounterReveal();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initScrolly);
} else {
  initScrolly();
}
