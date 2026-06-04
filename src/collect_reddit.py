"""Live Reddit collection via PRAW (ported from week 9/01_collect_reddit.py)."""

from __future__ import annotations

import os
import sys
import time
from datetime import datetime
from pathlib import Path

try:
    import pandas as pd
    import praw
    from dotenv import load_dotenv
except ImportError as exc:
    print(
        f"Missing Python package: {exc.name}\n\n"
        "Install dependencies with:\n"
        "python3 -m pip install -r requirements.txt\n",
        file=sys.stderr,
    )
    raise

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
ENV_PATH = ROOT / ".env"

SUBREDDITS = ["LawFirm", "lawyers", "LegalTech", "artificial", "ChatGPT"]
LEGAL_SUBS = ["LawFirm", "lawyers", "LegalTech"]

SEARCH_QUERIES = [
    "legal AI",
    "AI lawyer",
    "AI contract",
    "Harvey AI",
    "Legora",
    "AI legal research",
    "ChatGPT law",
    "AI deposition",
]

COMMENTS_PER_POST = 10
SEARCH_LIMIT = int(os.getenv("REDDIT_SEARCH_LIMIT", "50"))
HOT_LIMIT = int(os.getenv("REDDIT_HOT_LIMIT", "100"))

OUTPUT_COLUMNS = [
    "id",
    "source",
    "source_type",
    "collected_at",
    "subreddit",
    "title",
    "body_text",
    "author",
    "score",
    "num_comments",
    "created_date",
    "source_url",
    "post_type",
    "parent_id",
]


def validate_credentials() -> None:
    missing = [
        key for key in ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET"]
        if not os.getenv(key)
    ]
    if missing:
        missing_list = ", ".join(missing)
        print(
            f"Missing Reddit API credentials: {missing_list}\n\n"
            "Create a free Reddit script app at:\n"
            "https://www.reddit.com/prefs/apps?screen_view=1\n\n"
            "Then create MiniProject2/.env with:\n"
            "REDDIT_CLIENT_ID=your_client_id\n"
            "REDDIT_CLIENT_SECRET=your_client_secret\n"
            "REDDIT_USER_AGENT=hcde530_mp2_showcase/1.0\n",
            file=sys.stderr,
        )
        raise RuntimeError("Missing Reddit API credentials")


def init_reddit():
    validate_credentials()
    return praw.Reddit(
        client_id=os.getenv("REDDIT_CLIENT_ID"),
        client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
        user_agent=os.getenv("REDDIT_USER_AGENT", "hcde530_mp2_showcase/1.0"),
    )


def _normalize_url(url: str) -> str:
    return url.replace("https://reddit.com", "https://www.reddit.com")


def submission_to_row(submission, collected_at: str):
    return {
        "id": submission.id,
        "source": "reddit",
        "source_type": "post",
        "collected_at": collected_at,
        "subreddit": submission.subreddit.display_name,
        "title": submission.title,
        "body_text": submission.selftext or "",
        "author": str(submission.author) if submission.author else "[deleted]",
        "score": submission.score,
        "num_comments": submission.num_comments,
        "created_date": datetime.utcfromtimestamp(submission.created_utc).strftime("%Y-%m-%d"),
        "source_url": _normalize_url(f"https://www.reddit.com{submission.permalink}"),
        "post_type": "post",
        "parent_id": None,
    }


def comment_to_row(comment, subreddit_name: str, collected_at: str):
    return {
        "id": comment.id,
        "source": "reddit",
        "source_type": "comment",
        "collected_at": collected_at,
        "subreddit": subreddit_name,
        "title": "",
        "body_text": comment.body or "",
        "author": str(comment.author) if comment.author else "[deleted]",
        "score": comment.score,
        "num_comments": 0,
        "created_date": datetime.utcfromtimestamp(comment.created_utc).strftime("%Y-%m-%d"),
        "source_url": _normalize_url(f"https://www.reddit.com{comment.permalink}"),
        "post_type": "comment",
        "parent_id": comment.parent_id,
    }


def collect() -> pd.DataFrame:
    """Collect public Reddit posts and comments; write raw_reddit_posts.csv."""
    load_dotenv(ENV_PATH)
    reddit = init_reddit()
    collected_at = datetime.now().strftime("%Y-%m-%d")
    seen_ids: set[str] = set()
    rows = []

    for sub_name in SUBREDDITS:
        subreddit = reddit.subreddit(sub_name)
        print(f"\n--- r/{sub_name} ---")

        for query in SEARCH_QUERIES:
            print(f"  Searching: {query}")
            try:
                for submission in subreddit.search(
                    query, sort="relevance", time_filter="year", limit=SEARCH_LIMIT
                ):
                    if submission.id in seen_ids:
                        continue
                    seen_ids.add(submission.id)
                    rows.append(submission_to_row(submission, collected_at))

                    submission.comment_sort = "top"
                    submission.comments.replace_more(limit=0)
                    for comment in submission.comments[:COMMENTS_PER_POST]:
                        if comment.id not in seen_ids:
                            seen_ids.add(comment.id)
                            rows.append(comment_to_row(comment, sub_name, collected_at))
            except Exception as exc:
                print(f"    Error searching r/{sub_name} for '{query}': {exc}")

            time.sleep(0.5)

        if sub_name in LEGAL_SUBS:
            print(f"  Fetching hot posts from r/{sub_name}")
            try:
                for submission in subreddit.hot(limit=HOT_LIMIT):
                    if submission.id in seen_ids:
                        continue
                    seen_ids.add(submission.id)
                    rows.append(submission_to_row(submission, collected_at))

                    submission.comment_sort = "top"
                    submission.comments.replace_more(limit=0)
                    for comment in submission.comments[:COMMENTS_PER_POST]:
                        if comment.id not in seen_ids:
                            seen_ids.add(comment.id)
                            rows.append(comment_to_row(comment, sub_name, collected_at))
            except Exception as exc:
                print(f"    Error fetching hot from r/{sub_name}: {exc}")

        time.sleep(0.5)

    df = pd.DataFrame(rows, columns=OUTPUT_COLUMNS)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    output_path = DATA_DIR / "raw_reddit_posts.csv"
    df.to_csv(output_path, index=False)

    posts = df[df["post_type"] == "post"]
    comments = df[df["post_type"] == "comment"]
    print("\n=== Reddit Collection Complete ===")
    print(f"Total rows: {len(df)}")
    print(f"Posts: {len(posts)}, Comments: {len(comments)}")
    if len(posts):
        print("Posts per subreddit:")
        print(posts["subreddit"].value_counts().to_string())
    print(f"Saved to {output_path}")
    return df


if __name__ == "__main__":
    try:
        collect()
    except Exception as exc:
        print(f"Reddit collection failed: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc
