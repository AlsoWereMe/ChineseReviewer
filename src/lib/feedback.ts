export type FeedbackType = "bug" | "improvement";
const DEFAULT_FORMSPREE_ENDPOINT = "https://formspree.io/f/xqegjbve";

type FeedbackPayload = {
  feedbackTime: string;
  feedbackType: FeedbackType;
  feedbackText: string;
};

type FormspreePayload = {
  feedbackTime: string;
  feedbackType: string;
  feedbackText: string;
};

function getFeedbackTypeLabel(type: FeedbackType): string {
  return type === "bug" ? "Bug" : "改进意见";
}

function getFormspreeEndpoint(): string {
  const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT?.trim();
  return endpoint || DEFAULT_FORMSPREE_ENDPOINT;
}

export async function submitFeedback(payload: FeedbackPayload): Promise<void> {
  const endpoint = getFormspreeEndpoint();
  const requestBody: FormspreePayload = {
    feedbackTime: payload.feedbackTime,
    feedbackType: getFeedbackTypeLabel(payload.feedbackType),
    feedbackText: payload.feedbackText,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Feedback submit failed: ${response.status}`);
  }
}
