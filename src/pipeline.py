"""Reddit-only legal AI discourse analysis pipeline for MP2 showcase."""

from __future__ import annotations

import json
import os
import re
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer

from src.qualitative import enrich_corpus
from src.sample_reddit_corpus import COLLECTED_AT, SAMPLE_REDDIT_POSTS
from src.source_links import apply_source_links, resolve_reddit_source_link

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
OUTPUT_DIR = ROOT / "outputs"

POSITIONING = (
    "This tool does not automate grounded theory. It supports early-stage "
    "qualitative analysis by surfacing recurring themes, frequency signals, "
    "illustrative excerpts, and short researcher memos. The human researcher "
    "still interprets and validates the findings."
)

THEME_KEYWORDS = {
    "accuracy_trust": [
        "hallucinate", "hallucination", "fabricat", "fake", "wrong",
        "inaccurate", "trust", "verify", "verification", "sanctions",
        "mistake", "error", "unreliable", "citation", "grounded",
    ],
    "adoption_resistance": [
        "adopt", "resist", "refuse", "policy", "hesitan", "barrier",
        "black box", "cautious", "pilot", "secret", "reluctan", "skeptic",
    ],
    "efficiency_gains": [
        "fast", "speed", "efficient", "save time", "hours", "workflow",
        "automate", "streamline", "productive", "triage", "accelerator",
    ],
    "job_displacement": [
        "replace", "job", "paralegal", "associate", "obsolete",
        "workforce", "headcount", "career", "eliminate",
    ],
    "cost_value": [
        "cost", "pricing", "subscription", "roi", "worth", "afford",
        "billable", "flat fee", "margin", "budget", "pay",
    ],
    "tool_review": [
        "harvey", "cocounsel", "chatgpt", "claude", "clio", "spellbook",
        "lexis", "westlaw", "relativity", "vincent", "gpt",
    ],
    "ethics_regulation": [
        "bar", "ethic", "compliance", "disclosure", "confidential",
        "governance", "competence", "malpractice", "regulat", "duty",
    ],
    "ediscovery_review": [
        "ediscovery", "discovery", "document review", "privilege", "tar",
        "relativity", "review batch", "responsive",
    ],
}

THEME_LABELS = {
    "accuracy_trust": "Accuracy, trust, and verification",
    "adoption_resistance": "Adoption resistance and firm culture",
    "efficiency_gains": "Efficiency and workflow gains",
    "job_displacement": "Role change vs job displacement",
    "cost_value": "Cost, billing, and ROI",
    "tool_review": "Tool comparisons and vendor selection",
    "ethics_regulation": "Ethics, confidentiality, and governance",
    "ediscovery_review": "eDiscovery and document review",
}


def ensure_dirs() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"[*~>#]+", "", text)
    text = re.sub(r"&[a-z]+;", " ", text)
    text = re.sub(r"[^a-z0-9\s.,!?'\"-]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def load_sample_reddit() -> pd.DataFrame:
    rows = []
    for item in SAMPLE_REDDIT_POSTS:
        link = resolve_reddit_source_link(
            item["source_url"],
            item["subreddit"],
            title=item.get("title", ""),
            body_text=item.get("body_text", ""),
            provenance_mode="sample_corpus",
        )
        rows.append(
            {
                "id": item["id"],
                "source": "reddit",
                "source_type": "post" if item["post_type"] == "post" else "comment",
                "collected_at": COLLECTED_AT,
                "subreddit": item["subreddit"],
                "title": item["title"],
                "body_text": item["body_text"],
                "author": item["author"],
                "score": item["score"],
                "num_comments": item["num_comments"],
                "created_date": item["created_date"],
                "source_url": link["source_url"],
                "source_link_type": link["source_link_type"],
                "source_link_label": link["source_link_label"],
                "post_type": item["post_type"],
            }
        )
    return pd.DataFrame(rows)


def try_collect_reddit_api() -> pd.DataFrame | None:
    """Optional live collection via PRAW when credentials exist."""
    env_path = ROOT / ".env"
    if not env_path.exists():
        return None

    try:
        import praw
        from dotenv import load_dotenv
    except ImportError:
        return None

    load_dotenv(env_path)
    client_id = os.getenv("REDDIT_CLIENT_ID")
    client_secret = os.getenv("REDDIT_CLIENT_SECRET")
    if not client_id or not client_secret:
        return None

    reddit = praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        user_agent=os.getenv("REDDIT_USER_AGENT", "hcde530_mp2_showcase/1.0"),
    )

    subreddits = ["LawFirm", "lawyers", "LegalTech", "ChatGPT"]
    queries = ["legal AI", "AI lawyer", "Harvey AI", "ChatGPT law", "AI ediscovery"]
    rows = []
    seen = set()

    for sub_name in subreddits:
        subreddit = reddit.subreddit(sub_name)
        for query in queries:
            for submission in subreddit.search(query, sort="relevance", time_filter="year", limit=15):
                if submission.id in seen:
                    continue
                seen.add(submission.id)
                rows.append(
                    {
                        "id": submission.id,
                        "source": "reddit",
                        "source_type": "post",
                        "collected_at": COLLECTED_AT,
                        "subreddit": sub_name,
                        "title": submission.title,
                        "body_text": submission.selftext or "",
                        "author": str(submission.author) if submission.author else "",
                        "score": submission.score,
                        "num_comments": submission.num_comments,
                        "created_date": pd.to_datetime(submission.created_utc, unit="s").strftime("%Y-%m-%d"),
                        "source_url": f"https://www.reddit.com{submission.permalink}",
                        "post_type": "post",
                    }
                )
                submission.comments.replace_more(limit=0)
                for idx, comment in enumerate(submission.comments[:5]):
                    body = getattr(comment, "body", "")
                    if len(body) < 40:
                        continue
                    rows.append(
                        {
                            "id": f"{submission.id}_c{idx}",
                            "source": "reddit",
                            "source_type": "comment",
                            "collected_at": COLLECTED_AT,
                            "subreddit": sub_name,
                            "title": "",
                            "body_text": body,
                            "author": str(comment.author) if comment.author else "",
                            "score": comment.score,
                            "num_comments": 0,
                            "created_date": pd.to_datetime(comment.created_utc, unit="s").strftime("%Y-%m-%d"),
                            "source_url": f"https://www.reddit.com{submission.permalink}",
                            "post_type": "comment",
                        }
                    )
    return pd.DataFrame(rows) if rows else None


def build_provenance(mode: str, label: str, detail: str, row_count: int, collected_at: str) -> dict:
    return {
        "mode": mode,
        "label": label,
        "detail": detail,
        "collected_at": collected_at,
        "row_count": row_count,
        "raw_file": "data/raw_reddit_posts.csv",
    }


def collect_reddit(use_api: bool = True) -> tuple[pd.DataFrame, dict]:
    if use_api:
        live = try_collect_reddit_api()
        if live is not None and len(live) >= 10:
            print(f"Collected {len(live)} rows via Reddit API")
            collected_at = live["collected_at"].iloc[0] if "collected_at" in live.columns else COLLECTED_AT
            return live, build_provenance(
                mode="live_reddit_api",
                label="Live Reddit API",
                detail=(
                    "Collected via PRAW from r/LawFirm, r/lawyers, r/LegalTech, and r/ChatGPT. "
                    "Each row links to a real Reddit permalink."
                ),
                row_count=len(live),
                collected_at=str(collected_at),
            )

    print(f"Using curated sample corpus ({len(SAMPLE_REDDIT_POSTS)} rows)")
    df = load_sample_reddit()
    fallback_note = ""
    if use_api:
        fallback_note = " Reddit API was unavailable or returned too few rows; showing curated sample instead."
    return df, build_provenance(
        mode="sample_corpus",
        label="Sample corpus",
        detail=(
            "Offline curated sample in src/sample_reddit_corpus.py — paraphrased Reddit-style "
            "discourse for showcase runs, not live thread scrapes. Source links open "
            "subreddit searches (not individual threads) because rows are illustrative."
            + fallback_note
        ),
        row_count=len(df),
        collected_at=COLLECTED_AT,
    )


def write_provenance_js(provenance: dict, processed_df: pd.DataFrame) -> Path:
    """Write provenance.js for the static showcase (works with file://)."""
    if "created_date" in processed_df.columns:
        dates = pd.to_datetime(processed_df["created_date"], errors="coerce").dropna()
        if len(dates):
            provenance = {
                **provenance,
                "date_range": f"{dates.min().year}-{dates.max().year}",
            }
    provenance = {**provenance, "theme_count": int(processed_df["primary_theme"].nunique())}

    lines = [
        "// Generated by run_pipeline.py — do not edit by hand.",
        "window.corpusProvenance = " + json.dumps(provenance, indent=2) + ";",
    ]
    out_path = ROOT / "provenance.js"
    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return out_path


def process_corpus(raw_df: pd.DataFrame) -> pd.DataFrame:
    df = raw_df.copy()
    df["body_text"] = df["body_text"].fillna("")
    df["title"] = df["title"].fillna("")

    posts = df["post_type"] == "post"
    df.loc[posts, "full_text"] = (df.loc[posts, "title"] + " " + df.loc[posts, "body_text"]).str.strip()
    df.loc[~posts, "full_text"] = df.loc[~posts, "body_text"]
    df["clean_text"] = df["full_text"].apply(clean_text)

    before = len(df)
    df = df[df["clean_text"].str.len() >= 20]
    df = df.drop_duplicates(subset=["clean_text"])
    print(f"Processed corpus: {before} -> {len(df)} rows after cleaning")

    def assign_theme(text: str) -> tuple[str | None, str | None, int, str]:
        scores = {theme: sum(1 for kw in kws if kw in text) for theme, kws in THEME_KEYWORDS.items()}
        ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
        if ranked[0][1] == 0:
            return None, None, 0, "none"
        primary = ranked[0][0]
        secondary = ranked[1][0] if len(ranked) > 1 and ranked[1][1] >= 2 else None
        return primary, secondary, ranked[0][1], "keyword"

    coded = df.apply(
        lambda row: pd.Series(
            assign_theme(row["clean_text"]),
            index=["primary_theme", "secondary_theme", "primary_hits", "theme_confidence"],
        ),
        axis=1,
    )
    df = pd.concat([df.reset_index(drop=True), coded], axis=1)

    uncoded = df[df["primary_theme"].isna()].copy()
    coded_rows = df[df["primary_theme"].notna()].copy()

    if len(uncoded) > 4:
        vectorizer = TfidfVectorizer(max_features=200, stop_words="english")
        tfidf = vectorizer.fit_transform(uncoded["clean_text"])
        n_clusters = min(3, len(uncoded))
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(tfidf)
        names = vectorizer.get_feature_names_out()
        cluster_map = {}
        for i in range(n_clusters):
            top = [names[j] for j in kmeans.cluster_centers_[i].argsort()[-3:][::-1]]
            cluster_map[i] = f"emergent_{'_'.join(top)}"
        uncoded["primary_theme"] = [cluster_map[label] for label in labels]
        uncoded["theme_confidence"] = "cluster"
        df = pd.concat([coded_rows, uncoded], ignore_index=True)
    elif len(uncoded) > 0:
        uncoded["primary_theme"] = "uncategorized"
        uncoded["theme_confidence"] = "cluster"
        df = pd.concat([coded_rows, uncoded], ignore_index=True)

    return df


def build_theme_summary(processed_df: pd.DataFrame) -> pd.DataFrame:
    total = len(processed_df)
    rows = []
    for theme, count in processed_df["primary_theme"].value_counts().items():
        subset = processed_df[processed_df["primary_theme"] == theme]
        pct = round(count / total * 100, 1)
        mean_score = round(pd.to_numeric(subset["score"], errors="coerce").mean(), 1)
        label = THEME_LABELS.get(theme, theme.replace("_", " ").title())
        sentiment_dist = subset["sentiment_label"].value_counts(normalize=True) if "sentiment_label" in subset else pd.Series()
        pos_pct = round(sentiment_dist.get("positive", 0) * 100) if len(sentiment_dist) else 0
        neg_pct = round(sentiment_dist.get("negative", 0) * 100) if len(sentiment_dist) else 0
        top_emotion = (
            subset["dominant_emotion"].value_counts().index[0]
            if "dominant_emotion" in subset.columns and len(subset)
            else "none"
        )
        top_frame = (
            subset["rhetorical_frame"].value_counts().index[0]
            if "rhetorical_frame" in subset.columns and len(subset)
            else "unframed"
        )
        rows.append(
            {
                "theme": theme,
                "theme_label": label,
                "count": count,
                "percentage": pct,
                "mean_reddit_score": mean_score,
                "top_subreddits": ", ".join(subset["subreddit"].value_counts().head(3).index.tolist()),
                "sentiment_positive_pct": pos_pct,
                "sentiment_negative_pct": neg_pct,
                "top_emotion": top_emotion,
                "top_frame": top_frame,
            }
        )
    return pd.DataFrame(rows).sort_values("count", ascending=False)


def build_excerpts(processed_df: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for theme in processed_df["primary_theme"].dropna().unique():
        subset = processed_df[processed_df["primary_theme"] == theme].copy()
        subset["score"] = pd.to_numeric(subset["score"], errors="coerce").fillna(0)
        for rank, (_, row) in enumerate(subset.nlargest(3, "score").iterrows(), start=1):
            rows.append(
                {
                    "theme": theme,
                    "theme_label": THEME_LABELS.get(theme, theme),
                    "rank": rank,
                    "excerpt": str(row["clean_text"])[:400],
                    "subreddit": row["subreddit"],
                    "post_type": row["post_type"],
                    "score": row["score"],
                    "source_url": row["source_url"],
                    "source_link_label": row.get("source_link_label", "View thread"),
                    "source_link_type": row.get("source_link_type", "permalink"),
                    "row_id": row["id"],
                }
            )
    return pd.DataFrame(rows)


def build_memos(theme_summary: pd.DataFrame, excerpts: pd.DataFrame) -> str:
    lines = [
        "# Legal AI Public Discourse — Researcher Memos",
        "",
        POSITIONING,
        "",
        f"Corpus: Reddit-only public discourse ({int(theme_summary['count'].sum())} coded rows).",
        "",
    ]

    for _, theme_row in theme_summary.iterrows():
        theme = theme_row["theme"]
        label = theme_row["theme_label"]
        lines.extend(
            [
                f"## {label}",
                "",
                f"**Frequency:** {theme_row['count']} posts/comments ({theme_row['percentage']}% of corpus).",
                f"**Engagement signal:** mean Reddit score {theme_row['mean_reddit_score']}.",
                f"**Subreddits:** {theme_row['top_subreddits']}.",
                "",
            ]
        )
        theme_excerpts = excerpts[excerpts["theme"] == theme].sort_values("rank")
        if len(theme_excerpts):
            lines.append("**Illustrative excerpts:**")
            lines.append("")
            for _, ex in theme_excerpts.iterrows():
                lines.append(f"- (r/{ex['subreddit']}, score {ex['score']}) \"{ex['excerpt'][:220]}...\"")
                lines.append(f"  Source: {ex['source_url']}")
            lines.append("")

        memo_body = (
            f"Researcher memo: `{theme}` recurs across practitioner-facing threads. "
            f"The pattern is visible in {theme_row['count']} items, concentrated in "
            f"{theme_row['top_subreddits']}. Treat frequency as a prioritization signal, "
            "not proof of causal impact. Next step: constant comparison against new posts "
            "and manual validation of whether the theme holds outside this sample window."
        )
        lines.extend([memo_body, ""])

    return "\n".join(lines)


def plot_top_themes(theme_summary: pd.DataFrame, output_path: Path) -> None:
    top = theme_summary.head(8).sort_values("count")
    labels = top["theme_label"].tolist()
    counts = top["count"].tolist()

    fig, ax = plt.subplots(figsize=(9, 5))
    bars = ax.barh(labels, counts, color="#1e3a5f")
    ax.set_xlabel("Number of posts/comments")
    ax.set_title("Top themes in Reddit legal-AI discourse (frequency-ranked)")
    ax.bar_label(bars, padding=3)
    fig.tight_layout()
    fig.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close(fig)


def write_showcase_data_js(
    theme_summary: pd.DataFrame,
    processed_df: pd.DataFrame,
    excerpts: pd.DataFrame,
    memos_md: str,
) -> Path:
    """Embed CSV artifacts as JSON for static interactive previews."""
    corpus_cols = [
        "id",
        "subreddit",
        "post_type",
        "score",
        "created_date",
        "primary_theme",
        "theme_confidence",
        "clean_text",
        "source_url",
        "source_link_label",
        "source_link_type",
    ]
    corpus = processed_df[corpus_cols].copy()
    corpus["theme_label"] = corpus["primary_theme"].map(THEME_LABELS).fillna(corpus["primary_theme"])
    corpus["clean_text"] = corpus["clean_text"].str.slice(0, 220)
    corpus["score"] = pd.to_numeric(corpus["score"], errors="coerce").fillna(0).astype(int)

    item_cols = [
        "id",
        "title",
        "subreddit",
        "post_type",
        "score",
        "primary_theme",
        "theme_label",
        "sentiment_label",
        "sentiment_compound",
        "dominant_emotion",
        "rhetorical_frame",
        "clean_text",
        "source_url",
        "source_link_label",
        "source_link_type",
    ]
    items = processed_df.copy()
    items["theme_label"] = items["primary_theme"].map(THEME_LABELS).fillna(items["primary_theme"])
    items["title"] = items.apply(
        lambda row: str(row["title"]).strip()
        if str(row.get("title", "")).strip()
        else str(row["clean_text"])[:72],
        axis=1,
    )
    items["clean_text"] = items["clean_text"].str.slice(0, 180)
    items = items[item_cols]

    pos_pct = 0
    if "sentiment_label" in processed_df.columns and len(processed_df):
        pos_pct = round((processed_df["sentiment_label"] == "positive").mean() * 100)

    payload = {
        "stats": {
            "totalItems": int(len(processed_df)),
            "totalThemes": int(processed_df["primary_theme"].nunique()),
            "uniqueSubreddits": int(processed_df["subreddit"].nunique()),
            "sentimentPositivePct": pos_pct,
        },
        "themeSummary": theme_summary.to_dict(orient="records"),
        "allItems": items.to_dict(orient="records"),
        "processedCorpus": corpus.to_dict(orient="records"),
        "excerpts": excerpts.to_dict(orient="records"),
        "memosMarkdown": memos_md,
    }

    lines = [
        "// Generated by run_pipeline.py — do not edit by hand.",
        "window.showcaseData = " + json.dumps(payload, indent=2) + ";",
    ]
    out_path = ROOT / "showcase-data.js"
    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return out_path


def run_pipeline(use_api: bool = False) -> dict[str, Path]:
    ensure_dirs()

    raw_df, provenance = collect_reddit(use_api=use_api)
    raw_path = DATA_DIR / "raw_reddit_posts.csv"
    raw_df.to_csv(raw_path, index=False)

    processed_df = process_corpus(raw_df)
    processed_df = enrich_corpus(processed_df)
    processed_df = apply_source_links(processed_df, provenance.get("mode"))
    processed_path = DATA_DIR / "processed_corpus.csv"
    processed_df.to_csv(processed_path, index=False)

    qual_path = DATA_DIR / "qualitative_corpus.csv"
    qual_cols = [
        "id",
        "title",
        "subreddit",
        "primary_theme",
        "sentiment_label",
        "sentiment_compound",
        "dominant_emotion",
        "rhetorical_frame",
        "clean_text",
        "source_url",
    ]
    processed_df[qual_cols].to_csv(qual_path, index=False)

    provenance_path = write_provenance_js(provenance, processed_df)

    theme_summary = build_theme_summary(processed_df)
    theme_path = OUTPUT_DIR / "theme_summary.csv"
    theme_summary.to_csv(theme_path, index=False)

    excerpts = build_excerpts(processed_df)
    excerpts_path = OUTPUT_DIR / "illustrative_excerpts.csv"
    excerpts.to_csv(excerpts_path, index=False)

    memos_md = build_memos(theme_summary, excerpts)
    memos_path = OUTPUT_DIR / "memos.md"
    memos_path.write_text(memos_md, encoding="utf-8")

    chart_path = OUTPUT_DIR / "top_themes.png"
    plot_top_themes(theme_summary, chart_path)

    showcase_data_path = write_showcase_data_js(theme_summary, processed_df, excerpts, memos_md)

    print(f"\nData source: {provenance['label']} ({provenance['mode']})")
    print("\nPipeline complete:")
    for path in [
        raw_path,
        processed_path,
        qual_path,
        provenance_path,
        showcase_data_path,
        theme_path,
        excerpts_path,
        memos_path,
        chart_path,
    ]:
        print(f"  {path.relative_to(ROOT)}")

    return {
        "raw": raw_path,
        "processed": processed_path,
        "qualitative": qual_path,
        "provenance": provenance_path,
        "showcase_data": showcase_data_path,
        "theme_summary": theme_path,
        "excerpts": excerpts_path,
        "memos": memos_path,
        "chart": chart_path,
    }
