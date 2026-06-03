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
