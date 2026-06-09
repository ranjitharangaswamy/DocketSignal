# DocketSignal — Legal AI Public Discourse Analyzer

DocketSignal is a small research tool for reading public Reddit discourse about legal AI. It collects or loads Reddit posts and comments, cleans the text, assigns early qualitative themes, calculates frequency and sentiment signals, extracts illustrative excerpts, writes researcher memos, and publishes the results into a static showcase dashboard.

The tool is for UX researchers, legal-tech product teams, and HCDE collaborators who want a quick way to see what practitioners publicly argue about when legal AI comes up: hallucinated citations, trust, adoption resistance, workflow gains, billing pressure, governance, and tool comparisons. It is not a legal advice system and it does not replace human qualitative interpretation.

## Public URLs

- Live dashboard: https://ranjitharangaswamy.com/DocketSignal/
- GitHub Pages fallback: https://ranjitharangaswamy.github.io/DocketSignal/
- Published notebook: https://github.com/ranjitharangaswamy/DocketSignal/blob/main/notebooks/legal_ai_discourse_analysis.ipynb
- Code repository: https://github.com/ranjitharangaswamy/DocketSignal

Note: GitHub Pages paths are case-sensitive. The working deployed path is `/DocketSignal/`, not lowercase `/docketsignal/`.

## Preview directions

Use one of these options to preview the project:

1. **Public dashboard preview:** open https://ranjitharangaswamy.com/DocketSignal/.
2. **Notebook preview:** open the published notebook on GitHub at https://github.com/ranjitharangaswamy/DocketSignal/blob/main/notebooks/legal_ai_discourse_analysis.ipynb. GitHub renders the notebook without a server.
3. **Local static preview from this repo:**

```bash
cd MiniProject2
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

You can also open `MiniProject2/index.html` directly in a browser, but a local server is better for checking relative links and GitHub Pages-style behavior.

## Source of truth for final submission

This `hcde530/MiniProject2` folder is the most recent final-submission version. It includes the dashboard code, Python pipeline, notebook, data outputs, competency claims in `mp2.md`, and expanded reflection in `reflection.md`. The separate `ranjitharangaswamy/DocketSignal` GitHub repository is the deployed showcase/code mirror, but it may lag behind this folder until changes are pushed there.

## What the tool does

1. Collects public Reddit discourse with PRAW when Reddit API credentials are available.
2. Falls back to a curated sample corpus so the project runs without secrets.
3. Cleans and deduplicates text rows.
4. Codes themes with transparent keyword rules and a TF-IDF clustering fallback for uncoded text.
5. Adds lightweight sentiment, emotion, and rhetorical-frame tags.
6. Exports CSV artifacts, memos, a chart, and static JavaScript data for the dashboard.
7. Displays the results in `index.html` as a public-facing research showcase.

This tool supports early-stage qualitative analysis. It surfaces patterns for a researcher to inspect; it does not automate grounded theory or claim that frequency is the same as importance.

## How to run locally

```bash
git clone https://github.com/ranjitharangaswamy/DocketSignal.git
cd DocketSignal
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run_pipeline.py
```

Then open `index.html` in a browser. The command above uses the sample corpus and regenerates:

- `data/raw_reddit_posts.csv`
- `data/processed_corpus.csv`
- `data/qualitative_corpus.csv`
- `outputs/theme_summary.csv`
- `outputs/illustrative_excerpts.csv`
- `outputs/memos.md`
- `outputs/top_themes.png`
- `showcase-data.js`
- `provenance.js`

## Optional live Reddit collection

Live Reddit collection requires a free Reddit script app and local credentials. Create `MiniProject2/.env` or `.env` in the repository root using `.env.template`:

```bash
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USER_AGENT=hcde530_mp2_showcase/1.0
REDDIT_SEARCH_LIMIT=50
REDDIT_HOT_LIMIT=100
```

Then run:

```bash
python run_pipeline.py --live-reddit
```

or:

```bash
python live_reddit_pipeline.py
```

The live collector searches r/LawFirm, r/lawyers, r/LegalTech, r/artificial, and r/ChatGPT for legal-AI queries, plus hot-post sweeps on legal subreddits. If credentials are missing or the API returns too few rows, the project falls back to the sample corpus so the dashboard still works.

## Project files

| Path | Purpose |
| --- | --- |
| `index.html`, `styles.css`, `app.js` | Static dashboard interface |
| `showcase-data.js`, `provenance.js` | Generated data consumed by the dashboard |
| `run_pipeline.py` | Main sample/live pipeline entry point |
| `live_reddit_pipeline.py` | Convenience entry point for live Reddit refresh |
| `src/collect_reddit.py` | PRAW collector |
| `src/pipeline.py` | Cleaning, coding, summary, memo, chart, and export logic |
| `src/qualitative.py` | Sentiment, emotion, and rhetorical-frame tagging |
| `src/sample_reddit_corpus.py` | Offline sample corpus |
| `notebooks/legal_ai_discourse_analysis.ipynb` | Published analysis notebook |
| `data/` | Raw and processed CSV outputs |
| `outputs/` | Theme summaries, excerpts, memos, and chart |
| `mp2.md` | Competency claims |
| `competencies.html` | Browser-readable competency claims linked from the top nav |
| `reflection.md` | 500-word project reflection |
| `reflection.html` | Browser-readable reflection page linked from the top nav |

## Verification

After `python run_pipeline.py`, confirm:

1. `data/raw_reddit_posts.csv` exists and has rows.
2. `outputs/theme_summary.csv` lists ranked themes.
3. `outputs/memos.md` includes theme-level researcher memos.
4. `index.html` opens and shows DocketSignal with theme rankings, evidence, explorer, and downloads.
