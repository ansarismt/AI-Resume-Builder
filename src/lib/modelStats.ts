/**
 * Held-out test results of the bundled resume classifier, from
 * `python manage.py train_model` (ai/ml/artifacts/metrics.json).
 * Update these numbers whenever the model is retrained.
 */
export const MODEL_STATS = {
  top1Accuracy: 83,
  top3Accuracy: 94,
  categories: 24,
  resumesTrainedOn: 2483,
} as const;
