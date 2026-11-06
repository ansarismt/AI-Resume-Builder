"""Export a small, public snapshot of the trained model for the landing page.

Run after `manage.py train_model`:

    python scripts/export_model_preview.py

Writes shared/modelPreview.json with the evaluation metrics and each category's
top dataset keywords. No resume text is included.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ARTIFACTS = ROOT / "ai" / "ml" / "artifacts"


def main():
    metrics = json.loads((ARTIFACTS / "metrics.json").read_text(encoding="utf-8"))
    stats = json.loads((ARTIFACTS / "category_stats.json").read_text(encoding="utf-8"))
    labels = {
        c["value"]: c["label"]
        for c in json.loads((ROOT / "shared" / "categories.json").read_text(encoding="utf-8"))[
            "categories"
        ]
    }
    out = {
        "trainedAt": metrics["trained_at"][:10],
        "rows": metrics["dataset_rows_used"],
        "selected": metrics["selected_model"],
        "testAccuracy": round(metrics["test_accuracy"], 4),
        "testMacroF1": round(metrics["test_macro_f1"], 4),
        "testTop3": round(metrics["test_top3_accuracy"], 4),
        "cv": {
            name: {"accuracy": round(v["accuracy"], 4), "macroF1": round(v["macro_f1"], 4)}
            for name, v in metrics["cross_validation"].items()
        },
        "categories": [
            {
                "id": key,
                "label": labels.get(key, key),
                "keywords": value["top_keywords"][:30],
                "skills": value.get("common_skills", [])[:8],
            }
            for key, value in stats.items()
        ],
    }
    target = ROOT / "shared" / "modelPreview.json"
    target.write_text(json.dumps(out, indent=1), encoding="utf-8")
    print(f"Wrote {target}")


if __name__ == "__main__":
    main()
