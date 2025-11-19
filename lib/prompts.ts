export type ResumeRewritePayload = {
  resumeText: string;
  jobDescription?: string;
  jobLink?: string;
  tone?: string;
  focusAreas?: string[];
};

export function buildResumePrompt({
  resumeText,
  jobDescription,
  jobLink,
  tone,
  focusAreas,
}: ResumeRewritePayload) {
  const focus = tone ? `Preferred tone: ${tone}.` : "";
  const focusAreasPrompt = focusAreas?.length
    ? `Focus areas from the user: ${focusAreas.join(", ")}.`
    : "";
  const jobContext = jobDescription
    ? `Job description provided by the user:\n${jobDescription}`
    : jobLink
      ? `The user shared this job link. Summarize or infer likely requirements from it if you are familiar with the brand: ${jobLink}`
      : "No job description was provided. Tailor the resume using general best practices for the stated focus areas.";

  return `You are an expert technical recruiter. Rewrite the candidate's resume to highlight the strengths that best align with the job opportunity. ${focus} ${focusAreasPrompt}
${jobContext}

Candidate resume:
${resumeText}

Return:
1. A short summary of the candidate's positioning.
2. The tailored resume in Markdown.
3. A bulleted list of key skill gaps or follow-up questions.`;
}
