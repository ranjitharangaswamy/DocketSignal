"""Lightweight sentiment, emotion, and frame tagging for the showcase explorer."""

from __future__ import annotations

import re

import pandas as pd

try:
    import nltk
    from nltk.sentiment.vader import SentimentIntensityAnalyzer

    try:
        nltk.data.find("sentiment/vader_lexicon.zip")
    except LookupError:
        nltk.download("vader_lexicon", quiet=True)
except ImportError as exc:
    raise ImportError("Install nltk: pip install nltk") from exc

EMOTION_LEXICON = {
    "frustration": [
        "frustrat", "annoying", "useless", "terrible", "awful", "sucks", "disappointed",
    ],
    "enthusiasm": [
        "amazing", "love", "game changer", "excited", "impressive", "fantastic", "great",
    ],
    "anxiety": [
        "worried", "scary", "concern", "afraid", "threat", "nervous", "uncertain", "alarming",
    ],
    "skepticism": [
        "doubt", "skeptic", "overhyp", "hype", "gimmick", "marketing", "not ready",
    ],
    "pragmatism": [
        "practical", "useful", "helpful", "works well", "workflow", "actually", "real world",
    ],
}

FRAME_PATTERNS = {
    "lived_experience": [
        r"\bi (tried|used|tested|experimented)\b",
        r"\bin my experience\b",
        r"\bi've been using\b",
    ],
    "fear_warning": [
        r"\bdangerous\b",
        r"\breckless\b",
        r"\bwatch out\b",
        r"\bmark my words\b",
    ],
    "hype_promotion": [
        r"\bgame changer\b",
        r"\bthe future of\b",
        r"\brevolution\b",
        r"\btransform(ing|ative)\b",
    ],
    "measured_evaluation": [
        r"\bpros and cons\b",
        r"\bit depends\b",
        r"\bnuanc\b",
        r"\btrade-?off\b",
    ],
    "question_seeking": [
        r"\bhas anyone (tried|used|tested)\b",
        r"\bwhat do you think\b",
        r"\bshould i\b",
        r"\bcurious what others\b",
    ],
    "authority_citation": [
        r"\baccording to\b",
        r"\bstudy (shows|found)\b",
        r"\bresearch (shows|indicates)\b",
    ],
    "data_driven": [
        r"\bdata shows\b",
        r"\bmetrics\b",
        r"\broi\b",
        r"\bhours saved\b",
        r"\btime saved\b",
    ],
}


def get_sentiment(text: str, analyzer: SentimentIntensityAnalyzer) -> pd.Series:
    scores = analyzer.polarity_scores(text)
    if scores["compound"] >= 0.05:
        label = "positive"
    elif scores["compound"] <= -0.05:
        label = "negative"
    else:
        label = "neutral"
    return pd.Series(
        {
            "sentiment_compound": round(scores["compound"], 3),
            "sentiment_label": label,
        }
    )


def detect_emotion(text: str) -> str:
    hits = {}
    for emotion, keywords in EMOTION_LEXICON.items():
        count = sum(1 for kw in keywords if kw in text)
        if count:
            hits[emotion] = count
    if not hits:
        return "none"
    return max(hits.items(), key=lambda item: item[1])[0]


def classify_frame(text: str) -> str:
    hits = {}
    for frame, patterns in FRAME_PATTERNS.items():
        count = sum(1 for pattern in patterns if re.search(pattern, text))
        if count:
            hits[frame] = count
    if not hits:
        return "unframed"
    return max(hits.items(), key=lambda item: item[1])[0]


def enrich_corpus(df: pd.DataFrame) -> pd.DataFrame:
    """Add sentiment_label, dominant_emotion, and rhetorical_frame columns."""
    enriched = df.copy()
    analyzer = SentimentIntensityAnalyzer()
    sentiment = enriched["clean_text"].apply(lambda text: get_sentiment(str(text), analyzer))
    enriched["sentiment_compound"] = sentiment["sentiment_compound"]
    enriched["sentiment_label"] = sentiment["sentiment_label"]
    enriched["dominant_emotion"] = enriched["clean_text"].apply(lambda text: detect_emotion(str(text)))
    enriched["rhetorical_frame"] = enriched["clean_text"].apply(lambda text: classify_frame(str(text)))
    return enriched
