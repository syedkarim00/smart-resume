import { NextRequest, NextResponse } from "next/server";
import { buildResumePrompt } from "@/lib/prompts";
import { buildHeadlinePrompt } from "@/lib/headline";
import { buildEmailPrompt } from "@/lib/emailTemplates";

const GPT_API_URL = process.env.GPT_API_URL ?? "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = process.env.GPT_MODEL ?? "gpt-4o-mini";

type RewriteRequest = {
  mode?: "resume" | "headline" | "email";
  resumeText?: string;
  jobDescription?: string;
  jobLink?: string;
  tone?: string;
  focusAreas?: string[];
  background?: string;
  targetRole?: string;
  scenario?: string;
  priorities?: string[];
  callToAction?: string;
  model?: string;
  temperature?: number;
};

export async function POST(request: NextRequest) {
  if (!process.env.GPT_API_KEY) {
    return NextResponse.json({ error: "Missing GPT_API_KEY environment variable" }, { status: 500 });
  }

  let body: RewriteRequest;
  try {
    body = (await request.json()) as RewriteRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const {
    mode = "resume",
    resumeText,
    jobDescription,
    jobLink,
    tone,
    focusAreas,
    background,
    targetRole,
    scenario,
    priorities,
    callToAction,
  } = body;

  if (mode === "resume" && !resumeText) {
    return NextResponse.json({ error: "resumeText is required for resume rewrites" }, { status: 400 });
  }
  if (mode === "headline" && !background) {
    return NextResponse.json({ error: "background is required for headline optimization" }, { status: 400 });
  }
  if (mode === "email" && !scenario) {
    return NextResponse.json({ error: "scenario is required for recruiter emails" }, { status: 400 });
  }

  let prompt: string;
  switch (mode) {
    case "headline":
      prompt = buildHeadlinePrompt({ background, targetRole, priorities });
      break;
    case "email":
      prompt = buildEmailPrompt({ scenario, tone, callToAction });
      break;
    default:
      prompt = buildResumePrompt({ resumeText, jobDescription, jobLink, tone, focusAreas });
  }

  try {
    const response = await fetch(GPT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GPT_API_KEY}`,
      },
      body: JSON.stringify({
        model: body.model ?? DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a helpful AI career copilot.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: body.temperature ?? 0.4,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Failed to reach the GPT API", details: errorText },
        { status: response.status },
      );
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Unexpected response from GPT API" }, { status: 502 });
    }

    return NextResponse.json({ result: content });
  } catch (error) {
    console.error("GPT API error", error);
    return NextResponse.json({ error: "Unhandled error calling GPT API" }, { status: 500 });
  }
}
