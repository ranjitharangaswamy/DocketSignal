#!/usr/bin/env python3
"""Run the Reddit-only Legal AI discourse pipeline."""

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.pipeline import POSITIONING, run_pipeline


def main() -> None:
    parser = argparse.ArgumentParser(description="Legal AI Public Discourse Analyzer (Reddit-only)")
    parser.add_argument(
        "--live-reddit",
        action="store_true",
        help="Attempt live Reddit API collection when .env credentials exist",
    )
    args = parser.parse_args()

    print("Legal AI Public Discourse Analyzer — MP2 Showcase")
    print(POSITIONING)
    print()

    run_pipeline(use_api=args.live_reddit)


if __name__ == "__main__":
    main()
