const REVIEW_STORAGE_KEYS = [
  "chinese-reviewer-review-draft-v1",
  "chinese-reviewer-review-saved-v1",
  "chinese-reviewer-seen-questions-v1",
] as const;

export function clearAllReviewProgress(): void {
  for (const key of REVIEW_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
}
