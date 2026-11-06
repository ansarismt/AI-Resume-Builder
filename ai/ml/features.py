"""Text features for the resume classifier.

A resume's first line is normally its job title, which is the strongest single clue to the
career category. The features therefore combine a TF-IDF over the whole text with a separate,
weighted TF-IDF over just the first line. The class lives in its own module so the saved
model can be loaded without importing the training code.
"""

import numpy as np
from scipy import sparse
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.feature_extraction.text import TfidfVectorizer

TITLE_MAX_CHARS = 120


def first_line(text):
    """The title line: everything before the first newline, kept short."""
    return str(text or "").split("\n", 1)[0][:TITLE_MAX_CHARS]


class ResumeFeatures(BaseEstimator, TransformerMixin):
    def __init__(self, title_weight=1.0, max_features=50000):
        self.title_weight = title_weight
        self.max_features = max_features

    def fit(self, texts, y=None):
        texts = list(texts)
        self.word_vectorizer_ = TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            max_features=self.max_features,
            stop_words="english",
        ).fit(texts)
        self.title_vectorizer_ = TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
        ).fit([first_line(text) for text in texts])
        return self

    def transform(self, texts):
        texts = list(texts)
        words = self.word_vectorizer_.transform(texts)
        titles = self.title_vectorizer_.transform([first_line(text) for text in texts])
        return sparse.hstack([words, titles * self.title_weight], format="csr")

    def get_feature_names_out(self, input_features=None):
        return np.concatenate(
            [
                self.word_vectorizer_.get_feature_names_out(),
                np.array(
                    [f"title:{name}" for name in self.title_vectorizer_.get_feature_names_out()]
                ),
            ]
        )
