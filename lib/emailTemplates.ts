export type EmailTemplatePayload = {
  scenario: string;
  tone?: "friendly" | "formal" | "direct" | "enthusiastic";
  callToAction?: string;
};

export function buildEmailPrompt({ scenario, tone = "friendly", callToAction }: EmailTemplatePayload) {
  const cta = callToAction ? `The candidate wants the recruiter to ${callToAction}.` : "";

  return `You are an expert recruiter outreach coach. Draft two concise recruiter email templates for the scenario below.
Preferred tone: ${tone}.
${cta}

Scenario:
${scenario}

Each template should include:
- subject line
- greeting
- 2-3 short sentences tying the resume to the role
- a clear call to action.`;
}

export const templateTones: EmailTemplatePayload["tone"][] = [
  "friendly",
  "formal",
  "direct",
  "enthusiastic",
];
