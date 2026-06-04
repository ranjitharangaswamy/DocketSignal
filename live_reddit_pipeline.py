#!/usr/bin/env python3
"""
Refresh the MiniProject2 showcase from the live Reddit API.

Collects via src/collect_reddit.py (week 9 collector), runs the existing
MiniProject2 analysis pipeline, and regenerates showcase-data.js,
provenance.js, and CSV outputs for index.html.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.pipeline import run_pipeline


def run_live_reddit_pipeline():
    return run_pipeline(use_api=True)


if __name__ == "__main__":
    try:
        run_live_reddit_pipeline()
    except Exception as exc:
        print(f"Live Reddit refresh failed: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc
