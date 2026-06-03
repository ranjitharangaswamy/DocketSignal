"""Resolve Reddit source links for sample vs live corpus rows."""

from __future__ import annotations

from urllib.parse import quote_plus

import pandas as pd

PLACEHOLDER_MARKERS = ("/sample_", "/comments/sample")


def is_placeholder_reddit_url(url: str) -> bool:
    if not isinstance(url, str) or not url.strip():
        return True
    return any(marker in url for marker in PLACEHOLDER_MARKERS)


def reddit_search_url(subreddit: str, query: str) -> str:
    sub = str(subreddit).strip().removeprefix("r/").removeprefix("/")
    text = (query or "legal AI tools").strip()
    if len(text) > 100:
        text = text[:100]
    return (
        f"https://www.reddit.com/r/{sub}/search/"
        f"?q={quote_plus(text)}&restrict_sr=1&sort=relevance"
    )


def resolve_reddit_source_link(
    source_url: str,
    subreddit: str,
    *,
    title: str = "",
    body_text: str = "",
    provenance_mode: str | None = None,
) -> dict[str, str]:
    """Return working URL plus UI label for permalink vs subreddit search."""
    use_search = provenance_mode == "sample_corpus" or is_placeholder_reddit_url(source_url)

    if use_search:
        query = (title or "").strip() or (body_text or "").strip()[:80]
        sub_label = str(subreddit).strip().removeprefix("r/")
        return {
            "source_url": reddit_search_url(subreddit, query),
            "source_link_type": "subreddit_search",
            "source_link_label": f"Search r/{sub_label}",
        }

    return {
        "source_url": source_url,
        "source_link_type": "permalink",
        "source_link_label": "View thread",
    }


def apply_source_links(df, provenance_mode: str | None = None):
    """Add resolved source_url and link metadata columns to a corpus dataframe."""
    if df is None or len(df) == 0:
        return df

    resolved = df.apply(
        lambda row: pd.Series(
            resolve_reddit_source_link(
                row.get("source_url", ""),
                row.get("subreddit", ""),
                title=str(row.get("title", "") or ""),
                body_text=str(row.get("body_text", "") or ""),
                provenance_mode=provenance_mode,
            )
        ),
        axis=1,
    )
    out = df.copy()
    out["source_url"] = resolved["source_url"]
    out["source_link_type"] = resolved["source_link_type"]
    out["source_link_label"] = resolved["source_link_label"]
    return out
