# MP2 Competency Claims: DocketSignal

## Claim 1: I can build a computational research pipeline that transforms messy public text into structured qualitative artifacts.

DocketSignal demonstrates this through `src/pipeline.py`, which moves data through collection, cleaning, deduplication, theme coding, summary generation, excerpt selection, memo writing, chart creation, and static dashboard export. The pipeline produces reproducible artifacts in `data/` and `outputs/`, including `processed_corpus.csv`, `qualitative_corpus.csv`, `theme_summary.csv`, `illustrative_excerpts.csv`, and `memos.md`. This claim is about computational fluency: the tool is a repeatable pipeline that turns public discourse rows into analyzable research materials.

## Claim 2: I can make ethical scope decisions for public data collection.

The project limits collection to public Reddit posts and comments through the official Reddit API using PRAW in `src/collect_reddit.py`. It does not scrape private forums, bypass logins, collect client data, or represent its output as legal advice. The README documents the source scope, the optional live Reddit credential path, and the fallback sample corpus. The dashboard and memos emphasize that the tool supports early-stage qualitative analysis and that the human researcher must validate themes.

## Claim 3: I can use computational methods to support, not replace, qualitative interpretation.

The theme coding in `src/pipeline.py` uses transparent keyword dictionaries for known legal-AI discourse themes and a TF-IDF/KMeans fallback for uncoded rows. `src/qualitative.py` adds sentiment, emotion, and rhetorical-frame tags. These methods are intentionally lightweight and inspectable. The generated `outputs/memos.md` frames frequency as a prioritization signal. This connects to constructivist grounded theory by treating computational output as a prompt for constant comparison and researcher interpretation.

## Claim 4: I can design a public-facing interface that makes analysis legible to non-technical collaborators.

The static dashboard in `index.html`, `styles.css`, and supporting JavaScript files turns CSV-style outputs into a readable research showcase. It includes a hero narrative, corpus provenance, ranked themes, theme evidence, excerpts, memos, chart views, and data exploration. This demonstrates communication design: someone who was not in the course can understand what the tool does, what data it uses, and what claims it does and does not make.

## Claim 5: I can package a project so another person can run, inspect, and evaluate it.

The repository includes code, data outputs, a notebook, public URLs, setup instructions, `.env.template`, `requirements.txt`, `mp2.md`, and `reflection.md`. The README explains how to run sample mode, how to enable live Reddit collection, who the tool is for, and where to view the dashboard and notebook. This is a reproducibility and communication claim: the deliverable is a clear project package that another person can inspect and run.

## Claim 6: I can merge legal reasoning with UX research to frame a product-relevant research question.

DocketSignal shows how I connect my cross-disciplinary background in law and human-centered design. The legal side appears in the themes I chose to preserve: hallucinated citations, confidentiality, professional responsibility, billing incentives, sanctions risk, governance, and adoption inside firms. The UX research side appears in the way I turn public discourse into coded themes, evidence panels, stakeholder-readable memos, and product implications. The project frames practitioner discourse as user research for legal-tech product decisions. The design thinking page makes this explicit by connecting legal evidence habits with UX synthesis habits: keep claims traceable, keep user context visible, and make the analysis useful for someone deciding what to build or evaluate next.
