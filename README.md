# DocketSignal — Legal AI Public Discourse Analyzer

**Repository:** [github.com/ranjitharangaswamy/DocketSignal](https://github.com/ranjitharangaswamy/DocketSignal)

**HCDE 530 — Mini Project 2 (Research Track)**

Reddit-only qualitative analysis pipeline for early-stage legal AI discourse research.

> This tool does not automate grounded theory. It supports early-stage qualitative analysis by surfacing recurring themes, frequency signals, illustrative excerpts, and short researcher memos. The human researcher still interprets and validates the findings.

## Quick start

```bash
git clone https://github.com/ranjitharangaswamy/DocketSignal.git
cd DocketSignal
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run_pipeline.py
```

Optional live Reddit collection (requires [Reddit API credentials](https://www.reddit.com/prefs/apps)):

```bash
cp .env.template .env   # fill in credentials (or copy from week 9/.env)
python run_pipeline.py --live-reddit
# or
python live_reddit_pipeline.py
```

The live collector uses the week 9 PRAW script (`src/collect_reddit.py`): search across r/LawFirm, r/lawyers, r/LegalTech, r/artificial, and r/ChatGPT, plus hot-post sweeps on legal subs. It regenerates `showcase-data.js` and `provenance.js` for the static frontend in `index.html`.

Open the analysis notebook:

```bash
jupyter notebook notebooks/legal_ai_discourse_analysis.ipynb
```

Static showcase dashboard: open `index.html` in a browser, or use the **live demo**:

**https://ranjitharangaswamy.github.io/DocketSignal/**

## Required artifacts

| Path | Description |
|------|-------------|
| `data/raw_reddit_posts.csv` | Raw Reddit posts/comments |
| `data/processed_corpus.csv` | Cleaned, theme-coded corpus |
| `outputs/theme_summary.csv` | Frequency-ranked themes |
| `outputs/illustrative_excerpts.csv` | Top excerpts per theme |
| `outputs/memos.md` | Short researcher memos |
| `outputs/top_themes.png` | Bar chart of top themes |
| `notebooks/legal_ai_discourse_analysis.ipynb` | Runnable analysis notebook |

## Pipeline steps

1. **Collect** — PRAW live collector (week 9) or curated Reddit sample corpus
2. **Clean** — lowercase, strip URLs/markup, dedupe short rows
3. **Code themes** — keyword coding + TF-IDF cluster fallback
4. **Summarize** — theme counts, percentages, mean Reddit score
5. **Excerpt** — highest-scored posts per theme
6. **Memo** — researcher notes with positioning disclaimer
7. **Chart** — horizontal bar chart of theme frequency

## Scope

**In scope:** Reddit public discourse, text cleaning, theme coding, frequency ranking, excerpts, memos, CSV outputs, one chart.

**Out of scope:** LinkedIn scraping, blog scraping, Teachable Machine, deposition prep tooling, production frontend.

## Project layout

```
DocketSignal/
  run_pipeline.py
  live_reddit_pipeline.py   # refresh showcase from live Reddit API
  requirements.txt
  notebooks/legal_ai_discourse_analysis.ipynb
  src/
    pipeline.py
    collect_reddit.py     # live PRAW collector (from week 9)
    sample_reddit_corpus.py
  data/
    raw_reddit_posts.csv
    processed_corpus.csv
  outputs/
    theme_summary.csv
    illustrative_excerpts.csv
    memos.md
    top_themes.png
  index.html          # optional static showcase
  app.js
  styles.css
```

## Verification

After `python run_pipeline.py`:

1. Confirm `data/raw_reddit_posts.csv` has 25 rows (sample mode).
2. Confirm `outputs/theme_summary.csv` lists 8 themes; top theme ~20% share.
3. Open `outputs/top_themes.png` and skim `outputs/memos.md` for excerpt traceability.
