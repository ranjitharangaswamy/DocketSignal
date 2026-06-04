function isPlaceholderRedditUrl(url) {
  return !url || /\/sample_|\/comments\/sample/i.test(url);
}

function redditSearchUrl(subreddit, query) {
  const sub = String(subreddit || "lawyers").replace(/^r\//i, "");
  const q = encodeURIComponent(String(query || "legal AI").trim().slice(0, 100));
  return `https://www.reddit.com/r/${sub}/search/?q=${q}&restrict_sr=1&sort=relevance`;
}

function resolveRedditSourceLink({ url, subreddit, title = "", body = "" }) {
  const mode = window.corpusProvenance?.mode;
  const useSearch = mode === "sample_corpus" || isPlaceholderRedditUrl(url);

  if (useSearch) {
    const query = String(title || "").trim() || String(body || "").trim().slice(0, 80);
    const subLabel = String(subreddit || "").replace(/^r\//i, "");
    return {
      href: redditSearchUrl(subreddit, query),
      label: `Search r/${subLabel}`,
      type: "subreddit_search",
    };
  }

  return {
    href: url,
    label: "View thread",
    type: "permalink",
  };
}

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Render a Reddit post/comment as a readable quote block. */
function redditQuoteHtml(row, options = {}) {
  const title = String(row?.title || "").trim();
  const body = String(
    row?.body_text || row?.body || (!title ? row?.text || row?.excerpt : "") || ""
  ).trim();
  const postType = row?.post_type || "post";
  const subreddit = String(row?.subreddit || "unknown").replace(/^r\//i, "");
  const score = row?.score ?? 0;
  const author = String(row?.author || "").replace(/^u\//i, "");

  let inner = "";
  if (title) {
    inner += `<p class="reddit-quote__title">${escapeHtml(title)}</p>`;
  }
  if (body) {
    inner += `<blockquote class="reddit-quote__body"><p>${escapeHtml(body)}</p></blockquote>`;
  } else if (!title) {
    const fallback = String(row?.text || row?.excerpt || "").trim();
    if (fallback) {
      inner += `<blockquote class="reddit-quote__body"><p>${escapeHtml(fallback)}</p></blockquote>`;
    }
  }

  const metaParts = [`r/${subreddit}`, postType, `score ${score}`];
  if (author) metaParts.push(`u/${author}`);

  const link = options.link;
  const linkHtml = link
    ? `<a class="reddit-quote__link" href="${escapeHtml(link.href)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`
    : "";

  return `<div class="reddit-quote">${inner}<footer class="reddit-quote__meta">${metaParts
    .map((part) => `<span>${escapeHtml(part)}</span>`)
    .join("")}${linkHtml}</footer></div>`;
}

window.escapeHtml = escapeHtml;
window.redditQuoteHtml = redditQuoteHtml;

window.resolveRedditSourceLink = resolveRedditSourceLink;

/** Prefer pipeline-resolved fields; fall back for older showcase-data.js. */
function redditLinkFromRow(row) {
  const href = row?.source_url || row?.url;
  const label = row?.source_link_label;
  if (href && label && (row.source_link_type === "subreddit_search" || !isPlaceholderRedditUrl(href))) {
    return { href, label };
  }
  return resolveRedditSourceLink({
    url: href,
    subreddit: row?.subreddit,
    title: row?.title || row?.text || row?.excerpt,
    body: row?.clean_text || row?.body_text,
  });
}

window.redditLinkFromRow = redditLinkFromRow;
