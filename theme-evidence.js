/** Per-theme illustrative excerpt layouts — each theme gets a distinct visual metaphor. */

const THEME_EVIDENCE_META = {
  accuracy_trust: {
    layout: "editorial",
    note: "Editorial citation layout — excerpts read like verified-source warnings and audit notes.",
  },
  adoption_resistance: {
    layout: "sticky-board",
    note: "Workshop board — excerpts pinned as sticky notes from a firm culture mapping session (FigJam-style).",
  },
  ethics_regulation: {
    layout: "governance",
    note: "Governance memos — threads framed as policy briefs and compliance review notes.",
  },
  efficiency_gains: {
    layout: "workflow",
    note: "Workflow pipeline — excerpts sequenced as handoffs in an AI-assisted matter flow.",
  },
  job_displacement: {
    layout: "roles",
    note: "Role personas — each excerpt is paired with a symbolic paralegal, student, or counsel avatar.",
  },
  tool_review: {
    layout: "comparison",
    note: "Vendor comparison — Reddit evaluation threads on the left, public Spellbook marketing site reference on the right (not in-product UI).",
  },
  ediscovery_review: {
    layout: "feelings-wheel",
    note: "Emotion wheel — sentiment and dominant emotion from each eDiscovery thread plotted on a feelings wheel, with excerpts alongside.",
  },
  cost_value: {
    layout: "billing",
    note: "Billing documents — flat-fee ROI threads as currency notes; SaaS cost threads as itemized invoices.",
  },
};

const STICKY_VARIANTS = ["yellow", "pink", "mint", "sky"];
const STICKY_ROTATIONS = [-2.5, 1.8, -1.2, 2.2, -0.8, 1.4];

function getThemeEvidenceMeta(themeId) {
  return THEME_EVIDENCE_META[themeId] || THEME_EVIDENCE_META.accuracy_trust;
}

function excerptLink(excerpt) {
  return redditLinkFromRow({
    source_url: excerpt.source_url || excerpt.url,
    source_link_label: excerpt.source_link_label,
    source_link_type: excerpt.source_link_type,
    subreddit: String(excerpt.subreddit || "").replace(/^r\//, ""),
    title: excerpt.title || excerpt.text,
    body_text: excerpt.body_text,
  });
}

function quoteSnippet(excerpt) {
  const title = String(excerpt.title || "").trim();
  const body = String(excerpt.body_text || excerpt.text || "").trim();
  return { title, body, primary: body || title };
}

function metaFooter(excerpt, link) {
  const sub = String(excerpt.subreddit || "").replace(/^r\//, "");
  const author = String(excerpt.author || "").replace(/^u\//, "");
  const parts = [`r/${sub}`, excerpt.post_type || "post", `score ${excerpt.score ?? 0}`];
  if (author) parts.push(`u/${author}`);
  const linkHtml = link
    ? `<a class="theme-evidence__link" href="${escapeHtml(link.href)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`
    : "";
  return `<footer class="theme-evidence__meta">${parts
    .map((part) => `<span>${escapeHtml(part)}</span>`)
    .join("")}${linkHtml}</footer>`;
}

function renderEditorialExcerpt(excerpt) {
  const link = excerptLink(excerpt);
  return `
    <article class="excerpt excerpt--editorial">
      ${renderExcerptContextHtml(excerpt)}
      ${redditQuoteHtml(excerpt, { link })}
    </article>`;
}

function renderStickyNote(excerpt, index) {
  const link = excerptLink(excerpt);
  const { title, primary } = quoteSnippet(excerpt);
  const variant = STICKY_VARIANTS[index % STICKY_VARIANTS.length];
  const rotate = STICKY_ROTATIONS[index % STICKY_ROTATIONS.length];
  const headline = title
    ? `<p class="sticky-note__title">${escapeHtml(title)}</p>`
    : "";
  return `
    <article class="sticky-note sticky-note--${variant}" style="--rotate: ${rotate}deg">
      <span class="sticky-note__pin" aria-hidden="true"></span>
      <div class="sticky-note__body">
        ${headline}
        <blockquote class="sticky-note__quote"><p>${escapeHtml(primary)}</p></blockquote>
      </div>
      ${metaFooter(excerpt, link)}
    </article>`;
}

function renderGovernanceMemo(excerpt, index) {
  const link = excerptLink(excerpt);
  const { title, body, primary } = quoteSnippet(excerpt);
  const headline = title || `Governance note ${index + 1}`;
  return `
    <article class="governance-memo">
      <header class="governance-memo__head">
        <span class="governance-memo__stamp">Review</span>
        <h4 class="governance-memo__title">${escapeHtml(headline)}</h4>
      </header>
      ${renderExcerptContextHtml(excerpt)}
      <p class="governance-memo__body">${escapeHtml(body || primary)}</p>
      ${metaFooter(excerpt, link)}
    </article>`;
}

function renderWorkflowNode(excerpt, index, total) {
  const link = excerptLink(excerpt);
  const { primary } = quoteSnippet(excerpt);
  const step = String(index + 1).padStart(2, "0");
  const connector = index < total - 1 ? `<span class="workflow-node__arrow" aria-hidden="true">→</span>` : "";
  return `
    <article class="workflow-node">
      <span class="workflow-node__step">Step ${step}</span>
      ${renderExcerptContextHtml(excerpt)}
      <p class="workflow-node__quote">${escapeHtml(primary)}</p>
      ${metaFooter(excerpt, link)}
    </article>${connector}`;
}

function inferRolePersona(excerpt) {
  const title = (excerpt.title || "").toLowerCase();
  const body = (excerpt.body_text || "").toLowerCase();
  const text = `${title} ${body}`;

  if (/law student|3l|prompting or westlaw|2026 associate/.test(text)) {
    return {
      slug: "student",
      role: "Law student",
      tagline: "Junior lawyer pipeline",
    };
  }
  if (/paralegal team|qa-ing all ai-generated|redirected them to verification/.test(text)) {
    return {
      slug: "paralegal",
      role: "Paralegal lead",
      tagline: "QA & verification workflows",
    };
  }
  if (/will ai replace paralegals|employment_lawyer/.test(`${title} ${excerpt.author || ""}`)) {
    return {
      slug: "attorney",
      role: "Senior counsel",
      tagline: "On paralegal & associate roles",
    };
  }
  if (/paralegal/.test(text)) {
    return {
      slug: "paralegal",
      role: "Paralegal",
      tagline: "Workflow & accountability shift",
    };
  }
  if (/associate/.test(text)) {
    return {
      slug: "associate",
      role: "Associate",
      tagline: "Early-career attorney",
    };
  }
  return {
    slug: "attorney",
    role: "Senior counsel",
    tagline: "Practice leadership voice",
  };
}

function renderRoleAvatar(slug) {
  const avatars = {
    paralegal: `
      <svg class="role-avatar" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="19" r="10" fill="#d4bc8a"/>
        <path d="M16 58c2-14 12-22 16-22s14 8 16 22" fill="#7b3f32"/>
        <rect x="22" y="34" width="20" height="16" rx="2" fill="#fdf8f1" stroke="#5e3228" stroke-width="1.5"/>
        <path d="M26 38h12M26 42h9M26 46h11" stroke="#b8935a" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M40 36l6-4v14l-6-3" fill="#b8935a"/>
      </svg>`,
    student: `
      <svg class="role-avatar" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="20" r="10" fill="#d4bc8a"/>
        <path d="M14 58c3-13 13-20 18-20s15 7 18 20" fill="#5e3228"/>
        <path d="M12 28l20-8 20 8-20 8z" fill="#7b3f32"/>
        <rect x="26" y="38" width="12" height="14" rx="1" fill="#fdf8f1" stroke="#7b3f32" stroke-width="1.5"/>
        <path d="M28 42h8M28 46h6" stroke="#b8935a" stroke-width="1.2" stroke-linecap="round"/>
      </svg>`,
    associate: `
      <svg class="role-avatar" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="19" r="10" fill="#d4bc8a"/>
        <path d="M15 58c2-14 12-22 17-22s15 8 17 22" fill="#2a1f18"/>
        <path d="M22 36h20v6c0 4-4 8-10 8s-10-4-10-8v-6z" fill="#fdf8f1" stroke="#7b3f32" stroke-width="1.5"/>
        <path d="M32 36v-4M26 32h12" stroke="#7b3f32" stroke-width="2" stroke-linecap="round"/>
        <rect x="28" y="42" width="8" height="5" rx="1" fill="#b8935a"/>
      </svg>`,
    attorney: `
      <svg class="role-avatar" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="18" r="10" fill="#d4bc8a"/>
        <path d="M14 58c2-14 13-22 18-22s16 8 18 22" fill="#7b3f32"/>
        <path d="M20 35h24l-2 18H22z" fill="#2a1f18"/>
        <path d="M24 35c0-4 3-7 8-7s8 3 8 7" fill="#fdf8f1" stroke="#7b3f32" stroke-width="1.5"/>
        <path d="M18 52h28" stroke="#b8935a" stroke-width="2"/>
      </svg>`,
  };
  return avatars[slug] || avatars.attorney;
}

function renderRoleCard(excerpt, index) {
  const link = excerptLink(excerpt);
  const { title, primary } = quoteSnippet(excerpt);
  const persona = inferRolePersona(excerpt);
  const variant = ["rose", "slate", "sand"][index % 3];
  return `
    <article class="role-card role-card--${variant}">
      <div class="role-card__figure">
        ${renderRoleAvatar(persona.slug)}
        <div class="role-card__persona">
          <span class="role-card__role">${escapeHtml(persona.role)}</span>
          <span class="role-card__tagline">${escapeHtml(persona.tagline)}</span>
        </div>
      </div>
      ${title ? `<h4 class="role-card__title">${escapeHtml(title)}</h4>` : ""}
      <blockquote class="role-card__quote"><p>${escapeHtml(primary)}</p></blockquote>
      ${renderExcerptContextHtml(excerpt)}
      ${metaFooter(excerpt, link)}
    </article>`;
}

function renderComparisonCard(excerpt, index) {
  const link = excerptLink(excerpt);
  const { title, primary } = quoteSnippet(excerpt);
  const headline = title || `Option ${String.fromCharCode(65 + index)}`;
  const isSpellbook = /spellbook/i.test(`${title} ${primary}`);
  return `
    <article class="comparison-card${isSpellbook ? " comparison-card--spellbook-thread" : ""}">
      <header class="comparison-card__head">
        <h4 class="comparison-card__title">${escapeHtml(headline)}</h4>
        <span class="comparison-card__score">${excerpt.score ?? 0} pts</span>
      </header>
      ${renderExcerptContextHtml(excerpt)}
      <p class="comparison-card__body">${escapeHtml(primary)}</p>
      ${metaFooter(excerpt, link)}
    </article>`;
}

function renderSpellbookVendorPreview() {
  const vendorUrl = "https://www.spellbook.legal/";
  return `
    <aside class="vendor-preview" aria-label="Spellbook public marketing site reference">
      <div class="vendor-preview__browser">
        <div class="vendor-preview__chrome">
          <span></span><span></span><span></span>
          <span class="vendor-preview__url">spellbook.legal</span>
        </div>
        <div class="vendor-preview__site">
          <p class="vendor-preview__ref-tag">Public vendor site · reference only</p>
          <h3 class="vendor-preview__headline">AI Contract Review &amp; Drafting</h3>
          <p class="vendor-preview__subhead">Contracts at the speed of commerce</p>
          <p class="vendor-preview__lede">Review contracts, draft with your standards, and search every deal you&rsquo;ve signed.</p>
          <ul class="vendor-preview__features" aria-label="Spellbook product areas listed on the public site">
            <li>Review</li>
            <li>Draft</li>
            <li>Ask</li>
            <li>Market</li>
            <li>Associate</li>
          </ul>
          <p class="vendor-preview__word-note">Works in Microsoft Word — not a standalone web draft editor.</p>
          <ul class="vendor-preview__trust">
            <li>SOC 2 Type II</li>
            <li>GDPR</li>
            <li>Zero data retention (per vendor site)</li>
          </ul>
          <a class="vendor-preview__cta" href="${vendorUrl}" target="_blank" rel="noopener noreferrer">Open spellbook.legal</a>
        </div>
      </div>
      <p class="vendor-preview__caption">This card summarizes Spellbook&rsquo;s public marketing page. The Reddit thread compares its guardrails to generic GPT for NDAs/MSAs; it does not reproduce Spellbook&rsquo;s in-app Word UI.</p>
    </aside>`;
}

function renderComparisonLayout(excerpts) {
  return `
    <div class="comparison-layout">
      <div class="comparison-layout__threads">
        <p class="comparison-layout__label">Reddit evaluation threads</p>
        ${excerpts.map((excerpt, i) => renderComparisonCard(excerpt, i)).join("")}
      </div>
      ${renderSpellbookVendorPreview()}
    </div>`;
}

const FEELINGS_WHEEL_SEGMENTS = [
  { slug: "pragmatism", label: "Pragmatism", angle: -90, color: "#8a9a7b" },
  { slug: "enthusiasm", label: "Enthusiasm", angle: -18, color: "#c9a227" },
  { slug: "skepticism", label: "Skepticism", angle: 54, color: "#6b7280" },
  { slug: "anxiety", label: "Anxiety", angle: 126, color: "#9b7bb8" },
  { slug: "frustration", label: "Frustration", angle: 198, color: "#b85c5c" },
];

function normalizeEmotionSlug(raw) {
  const slug = String(raw || "none").toLowerCase().trim();
  if (slug === "none" || slug === "neutral") return "none";
  return FEELINGS_WHEEL_SEGMENTS.some((seg) => seg.slug === slug) ? slug : "none";
}

function wheelPoint(cx, cy, radius, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function describeWedge(cx, cy, innerR, outerR, startDeg, endDeg) {
  const startOuter = wheelPoint(cx, cy, outerR, startDeg);
  const endOuter = wheelPoint(cx, cy, outerR, endDeg);
  const startInner = wheelPoint(cx, cy, innerR, endDeg);
  const endInner = wheelPoint(cx, cy, innerR, startDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}

function excerptWheelMarker(excerpt, index) {
  const emotion = normalizeEmotionSlug(excerpt.dominant_emotion);
  const segment = FEELINGS_WHEEL_SEGMENTS.find((seg) => seg.slug === emotion);
  const cx = 200;
  const cy = 200;
  const jitter = (index - 0.5) * 8;
  if (!segment || emotion === "none") {
    const pt = wheelPoint(cx, cy, 42 + jitter, -45 + index * 35);
    return { ...pt, emotion: "none", color: "#d4bc8a", label: "Neutral" };
  }
  const pt = wheelPoint(cx, cy, 118 + jitter, segment.angle + jitter * 0.4);
  return { ...pt, emotion, color: segment.color, label: segment.label };
}

function renderFeelingsWheelSvg(excerpts) {
  const cx = 200;
  const cy = 200;
  const innerR = 52;
  const outerR = 168;
  const slice = 360 / FEELINGS_WHEEL_SEGMENTS.length;

  const wedges = FEELINGS_WHEEL_SEGMENTS.map((seg, i) => {
    const start = seg.angle - slice / 2;
    const end = seg.angle + slice / 2;
    const mid = wheelPoint(cx, cy, (innerR + outerR) / 2, seg.angle);
    const counts = excerpts.filter((ex) => normalizeEmotionSlug(ex.dominant_emotion) === seg.slug).length;
    return `
      <path class="feelings-wheel__wedge" d="${describeWedge(cx, cy, innerR, outerR, start, end)}"
        fill="${seg.color}" fill-opacity="${counts ? 0.88 : 0.35}" stroke="#fdf8f1" stroke-width="2"/>
      <text class="feelings-wheel__label" x="${mid.x}" y="${mid.y}" text-anchor="middle" dominant-baseline="middle">${escapeHtml(seg.label)}</text>`;
  }).join("");

  const markers = excerpts
    .map((excerpt, i) => {
      const marker = excerptWheelMarker(excerpt, i);
      const sentiment = String(excerpt.sentiment_label || "neutral").toLowerCase();
      const ring =
        sentiment === "positive"
          ? "#6bc06b"
          : sentiment === "negative"
            ? "#e06c6c"
            : "#d4bc8a";
      return `
        <g class="feelings-wheel__marker" aria-label="Excerpt ${i + 1}: ${escapeHtml(marker.label)}, ${escapeHtml(sentiment)} sentiment">
          <circle cx="${marker.x}" cy="${marker.y}" r="11" fill="${marker.color}" stroke="${ring}" stroke-width="3"/>
          <text x="${marker.x}" y="${marker.y}" text-anchor="middle" dominant-baseline="middle" class="feelings-wheel__marker-num">${i + 1}</text>
        </g>`;
    })
    .join("");

  return `
    <svg class="feelings-wheel__svg" viewBox="0 0 400 400" role="img" aria-label="Feelings wheel showing dominant emotion and sentiment for each excerpt">
      <circle cx="${cx}" cy="${cy}" r="${innerR - 4}" fill="#fdf8f1" stroke="#b8935a" stroke-width="2"/>
      <text x="${cx}" y="${cy - 6}" text-anchor="middle" class="feelings-wheel__center-label">Neutral</text>
      <text x="${cx}" y="${cy + 12}" text-anchor="middle" class="feelings-wheel__center-sub">no dominant emotion</text>
      ${wedges}
      ${markers}
    </svg>`;
}

function renderFeelingsExcerptCard(excerpt, index) {
  const link = excerptLink(excerpt);
  const { title, primary } = quoteSnippet(excerpt);
  const marker = excerptWheelMarker(excerpt, index);
  const sentiment = String(excerpt.sentiment_label || "neutral").toLowerCase();
  return `
    <article class="feelings-card">
      <header class="feelings-card__head">
        <span class="feelings-card__badge" style="--badge-color: ${marker.color}">${index + 1}</span>
        <div>
          <h4 class="feelings-card__title">${escapeHtml(title || `Excerpt ${index + 1}`)}</h4>
          <p class="feelings-card__emotion">${escapeHtml(marker.label)} · ${escapeHtml(sentiment)} sentiment</p>
        </div>
      </header>
      <p class="feelings-card__body">${escapeHtml(primary)}</p>
      ${metaFooter(excerpt, link)}
    </article>`;
}

function renderFeelingsWheelLayout(excerpts) {
  const sentimentCounts = excerpts.reduce(
    (acc, ex) => {
      const key = String(ex.sentiment_label || "neutral").toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {}
  );
  const legend = ["positive", "neutral", "negative"]
    .filter((key) => sentimentCounts[key])
    .map(
      (key) =>
        `<span class="feelings-legend__item feelings-legend__item--${key}">${sentimentCounts[key]} ${key}</span>`
    )
    .join("");

  return `
    <div class="feelings-layout">
      <div class="feelings-layout__wheel-panel">
        <p class="feelings-layout__label">Dominant emotion · coded from excerpt text</p>
        ${renderFeelingsWheelSvg(excerpts)}
        <div class="feelings-legend" aria-label="Sentiment counts">${legend}</div>
        <p class="feelings-layout__hint">Ring color = sentiment (green positive, gold neutral, red negative). Numbered dots match excerpts.</p>
      </div>
      <div class="feelings-layout__excerpts">
        <p class="feelings-layout__label">Illustrative threads</p>
        ${excerpts.map((excerpt, i) => renderFeelingsExcerptCard(excerpt, i)).join("")}
      </div>
    </div>`;
}

function renderDocTab(excerpt, index, total) {
  const link = excerptLink(excerpt);
  const { title, primary } = quoteSnippet(excerpt);
  const sub = String(excerpt.subreddit || "").replace(/^r\//, "");
  const tabLabel = title ? title.slice(0, 28) + (title.length > 28 ? "…" : "") : `Doc ${index + 1}`;
  const offset = (total - 1 - index) * 12;
  const isRelativity = /relativity|air/i.test(`${title} ${primary}`);
  const progress = isRelativity ? 34 : 68;
  const tabIcon = isRelativity
    ? `<svg class="doc-stack__tab-svg" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1l7 4v6l-7 4-7-4V5z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`
    : `<svg class="doc-stack__tab-svg" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3h12v10H2z" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M2 6h12" stroke="currentColor" stroke-width="1.2"/></svg>`;
  return `
    <article class="doc-stack__item" style="--tab-offset: ${offset}px">
      <div class="doc-stack__tab" style="left: ${offset}px">
        <span class="doc-stack__tab-icon" aria-hidden="true">${tabIcon}</span>
        <span class="doc-stack__tab-label">${escapeHtml(tabLabel)}</span>
        <span class="doc-stack__tab-sub">r/${escapeHtml(sub)} · Bates batch</span>
      </div>
      <div class="doc-stack__page">
        <div class="doc-stack__stamps">
          <span class="doc-stack__stamp">PRIV REVIEW</span>
          <span class="doc-stack__stamp doc-stack__stamp--responsive">RESPONSIVE</span>
        </div>
        <div class="doc-stack__progress" aria-hidden="true">
          <span style="width: ${progress}%"></span>
        </div>
        <p class="doc-stack__progress-label">First-pass AI clustering · ${progress}% triaged</p>
        ${renderExcerptContextHtml(excerpt)}
        <p class="doc-stack__body">${escapeHtml(primary)}</p>
        ${metaFooter(excerpt, link)}
      </div>
    </article>`;
}

function inferBillingDocType(excerpt) {
  const text = `${excerpt.title || ""} ${excerpt.body_text || ""}`.toLowerCase();
  if (/flat fee|margin|repriced|hours saved|billable hour/.test(text)) return "currency-note";
  if (/clio|subscription|monthly|per user|saas|stack|cost adds up/.test(text)) return "invoice";
  return "invoice";
}

function renderCurrencyNote(excerpt, index) {
  const link = excerptLink(excerpt);
  const { title, primary } = quoteSnippet(excerpt);
  const rotate = [-1.5, 1.2][index % 2];
  const headline = title || "Flat fee value memo";
  return `
    <article class="billing-doc billing-doc--note" style="--doc-rotate: ${rotate}deg">
      <div class="currency-note">
        <div class="currency-note__border" aria-hidden="true"></div>
        <header class="currency-note__head">
          <span class="currency-note__seal">ROI</span>
          <div class="currency-note__head-text">
            <p class="currency-note__series">United States · Value memo</p>
            <p class="currency-note__subtitle">Efficiency &amp; repricing signal</p>
          </div>
        </header>
        <h4 class="currency-note__title">${escapeHtml(headline)}</h4>
        <blockquote class="currency-note__quote"><p>${escapeHtml(primary)}</p></blockquote>
        <div class="currency-note__denom" aria-label="Reddit engagement score">
          <span class="currency-note__denom-label">Engagement</span>
          <span class="currency-note__denom-value">${excerpt.score ?? 0}</span>
          <span class="currency-note__denom-unit">reddit score</span>
        </div>
        <div class="currency-note__serial" aria-hidden="true">DS-${String(index + 1).padStart(4, "0")} · COST/VALUE</div>
        ${renderExcerptContextHtml(excerpt)}
        ${metaFooter(excerpt, link)}
      </div>
    </article>`;
}

function renderInvoice(excerpt, index) {
  const link = excerptLink(excerpt);
  const { title, primary } = quoteSnippet(excerpt);
  const rotate = [1, -0.8][index % 2];
  const headline = title || "Vendor invoice";
  const isClio = /clio|vincent/i.test(`${title} ${primary}`);
  const lineItems = isClio
    ? [
        { desc: "Clio Work — base subscription", amt: "Monthly" },
        { desc: "Vincent AI add-on", amt: "Per seat" },
        { desc: "Drafting time saved (projected)", amt: "TBD ROI" },
      ]
    : [
        { desc: "Legal AI SaaS stack", amt: "Recurring" },
        { desc: "Workflow change required", amt: "Internal" },
      ];
  const linesHtml = lineItems
    .map(
      (row) => `
        <div class="invoice__row">
          <span class="invoice__desc">${escapeHtml(row.desc)}</span>
          <span class="invoice__amt">${escapeHtml(row.amt)}</span>
        </div>`
    )
    .join("");
  return `
    <article class="billing-doc billing-doc--invoice" style="--doc-rotate: ${rotate}deg">
      <div class="invoice">
        <div class="invoice__tear invoice__tear--top" aria-hidden="true"></div>
        <header class="invoice__head">
          <div>
            <p class="invoice__label">Invoice</p>
            <h4 class="invoice__title">${escapeHtml(headline)}</h4>
          </div>
          <div class="invoice__meta-block">
            <span>Inv #${String(index + 1).padStart(3, "0")}</span>
            <span>Due: ongoing</span>
          </div>
        </header>
        <p class="invoice__bill-to">Bill to · Small firm · ${escapeHtml(String(excerpt.subreddit || "r/lawyers").replace(/^r\//, "r/"))}</p>
        <div class="invoice__lines">${linesHtml}</div>
        <div class="invoice__total">
          <span>Total cost pressure</span>
          <strong>Monthly stack ↑</strong>
        </div>
        <blockquote class="invoice__note"><p>${escapeHtml(primary)}</p></blockquote>
        ${renderExcerptContextHtml(excerpt)}
        ${metaFooter(excerpt, link)}
        <div class="invoice__tear invoice__tear--bottom" aria-hidden="true"></div>
      </div>
    </article>`;
}

function renderBillingDocument(excerpt, index) {
  return inferBillingDocType(excerpt) === "currency-note"
    ? renderCurrencyNote(excerpt, index)
    : renderInvoice(excerpt, index);
}

function renderThemeEvidence(theme) {
  const meta = getThemeEvidenceMeta(theme.id);
  const excerpts = theme.excerpts || [];
  if (!excerpts.length) return "";

  switch (meta.layout) {
    case "sticky-board":
      return `<div class="theme-evidence theme-evidence--sticky-board">${excerpts
        .map((excerpt, i) => renderStickyNote(excerpt, i))
        .join("")}</div>`;
    case "governance":
      return `<div class="theme-evidence theme-evidence--governance">${excerpts
        .map((excerpt, i) => renderGovernanceMemo(excerpt, i))
        .join("")}</div>`;
    case "workflow":
      return `<div class="theme-evidence theme-evidence--workflow">${excerpts
        .map((excerpt, i) => renderWorkflowNode(excerpt, i, excerpts.length))
        .join("")}</div>`;
    case "roles":
      return `<div class="theme-evidence theme-evidence--roles">${excerpts
        .map((excerpt, i) => renderRoleCard(excerpt, i))
        .join("")}</div>`;
    case "comparison":
      return `<div class="theme-evidence theme-evidence--comparison">${renderComparisonLayout(excerpts)}</div>`;
    case "feelings-wheel":
      return `<div class="theme-evidence theme-evidence--feelings-wheel">${renderFeelingsWheelLayout(excerpts)}</div>`;
    case "doc-stack":
      return `<div class="theme-evidence theme-evidence--doc-stack">${excerpts
        .map((excerpt, i) => renderDocTab(excerpt, i, excerpts.length))
        .join("")}</div>`;
    case "billing":
      return `<div class="theme-evidence theme-evidence--billing">${excerpts
        .map((excerpt, i) => renderBillingDocument(excerpt, i))
        .join("")}</div>`;
    case "ledger":
      return `<div class="theme-evidence theme-evidence--billing">${excerpts
        .map((excerpt, i) => renderBillingDocument(excerpt, i))
        .join("")}</div>`;
    case "editorial":
    default:
      return `<div class="theme-evidence theme-evidence--editorial">${excerpts
        .map((excerpt) => renderEditorialExcerpt(excerpt))
        .join("")}</div>`;
  }
}

window.getThemeEvidenceMeta = getThemeEvidenceMeta;
window.renderThemeEvidence = renderThemeEvidence;
