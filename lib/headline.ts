export type HeadlinePayload = {
  background: string;
  targetRole?: string;
  priorities?: string[];
};

export function buildHeadlinePrompt({ background, targetRole, priorities }: HeadlinePayload) {
  const target = targetRole ? `Target role: ${targetRole}.` : "";
  const focus = priorities?.length ? `Priorities: ${priorities.join(", ")}.` : "";

  return `You are a LinkedIn branding expert. Review the candidate background and craft three LinkedIn headline options that use plain language, keywords, and quantified proof points when possible.
${target}
${focus}

Candidate background:
${background}

Return JSON with: {"options": ["headline 1", "headline 2", "headline 3"], "explanation": "short paragraph"}.`;
}

export const defaultHeadlinePriorities = [
  "Highlight leadership",
  "Mention top technical skills",
  "Call out industry experience",
];
