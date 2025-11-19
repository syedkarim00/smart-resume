"use client";

import { useState } from "react";
import { defaultHeadlinePriorities } from "@/lib/headline";
import { templateTones } from "@/lib/emailTemplates";

type ApiMode = "resume" | "headline" | "email";

type PendingState = "idle" | "loading" | "error";

async function callRewriteEndpoint(mode: ApiMode, payload: Record<string, unknown>) {
  const response = await fetch("/api/rewrite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, ...payload }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error ?? "Unable to contact the AI service");
  }
  const data = await response.json();
  return data.result as string;
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unexpected error. Check the browser console for details.";
}

export function ResumeWorkbench() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [resumeResult, setResumeResult] = useState("");
  const [resumeState, setResumeState] = useState<PendingState>("idle");

  const [background, setBackground] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [headlineResult, setHeadlineResult] = useState("");
  const [headlineState, setHeadlineState] = useState<PendingState>("idle");

  const [scenario, setScenario] = useState("I just applied to a Staff Product Manager role and want to follow up with the recruiter.");
  const [tone, setTone] = useState<(typeof templateTones)[number]>("friendly");
  const [cta, setCta] = useState("schedule an interview");
  const [emailResult, setEmailResult] = useState("");
  const [emailState, setEmailState] = useState<PendingState>("idle");

  const [focusAreas, setFocusAreas] = useState<string[]>(["Highlight AI experience", "Quantify impact"]);

  const handleResumeSubmit = async () => {
    try {
      setResumeState("loading");
      const result = await callRewriteEndpoint("resume", {
        resumeText,
        jobDescription,
        jobLink,
        focusAreas,
      });
      setResumeResult(result);
      setResumeState("idle");
    } catch (error) {
      setResumeResult(getErrorMessage(error));
      setResumeState("error");
    }
  };

  const handleHeadlineSubmit = async () => {
    try {
      setHeadlineState("loading");
      const result = await callRewriteEndpoint("headline", {
        background,
        targetRole,
        priorities: defaultHeadlinePriorities,
      });
      setHeadlineResult(result);
      setHeadlineState("idle");
    } catch (error) {
      setHeadlineResult(getErrorMessage(error));
      setHeadlineState("error");
    }
  };

  const handleEmailSubmit = async () => {
    try {
      setEmailState("loading");
      const result = await callRewriteEndpoint("email", {
        scenario,
        tone,
        callToAction: cta,
      });
      setEmailResult(result);
      setEmailState("idle");
    } catch (error) {
      setEmailResult(getErrorMessage(error));
      setEmailState("error");
    }
  };

  const handleFileUpload = async (file?: File) => {
    if (!file) return;
    const text = await readFile(file);
    setResumeText(text);
  };

  return (
    <div className="space-y-12">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-blue-600">Tailored Resume</p>
            <h2 className="text-2xl font-bold text-zinc-900">Upload your resume or paste the text</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Drop your PDF/Word export or paste your resume to generate a role-specific rewrite. Add a job link or paste the job
              description for even better targeting.
            </p>
          </div>
          <label className="inline-flex cursor-pointer flex-col items-center rounded-lg border border-dashed border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:border-blue-500 hover:text-blue-600">
            Upload file
            <input
              type="file"
              accept=".txt,.md,.rtf,.doc,.docx,.pdf"
              className="hidden"
              onChange={(event) => handleFileUpload(event.target.files?.[0])}
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <textarea
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
            rows={12}
            placeholder="Paste your resume text here..."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none"
          />
          <div className="space-y-4">
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              rows={6}
              placeholder="Paste the job description"
              className="w-full rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none"
            />
            <input
              type="url"
              value={jobLink}
              onChange={(event) => setJobLink(event.target.value)}
              placeholder="...or share the job link"
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none"
            />
            <textarea
              value={focusAreas.join("\n")}
              onChange={(event) => setFocusAreas(event.target.value.split("\n").filter(Boolean))}
              rows={4}
              placeholder="Focus areas (one per line)"
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={handleResumeSubmit}
              disabled={!resumeText || resumeState === "loading"}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resumeState === "loading" ? "Tailoring..." : "Rewrite resume"}
            </button>
          </div>
        </div>
        {resumeResult && (
          <div className="mt-6 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-900">
            <p className="mb-2 font-semibold text-zinc-700">AI output</p>
            <pre className="whitespace-pre-wrap text-xs text-zinc-800">{resumeResult}</pre>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-emerald-600">LinkedIn branding</p>
        <h2 className="text-2xl font-bold text-zinc-900">Generate LinkedIn headline options</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Share a short summary of your experience and the role you want. We will produce multiple SEO-friendly headline options
          plus positioning notes.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <textarea
            value={background}
            onChange={(event) => setBackground(event.target.value)}
            rows={8}
            placeholder="Experience summary, accomplishments, target industries..."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none"
          />
          <div className="space-y-3">
            <input
              type="text"
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
              placeholder="Target role title"
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none"
            />
            <div className="rounded-xl border border-dashed border-emerald-200 p-3 text-sm text-zinc-700">
              <p className="font-semibold">What we optimize for:</p>
              <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-600">
                {defaultHeadlinePriorities.map((priority) => (
                  <li key={priority}>{priority}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={handleHeadlineSubmit}
              disabled={!background || headlineState === "loading"}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {headlineState === "loading" ? "Brainstorming..." : "Optimize headline"}
            </button>
          </div>
        </div>
        {headlineResult && (
          <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
            <p className="mb-2 font-semibold">Headline ideas</p>
            <pre className="whitespace-pre-wrap text-xs">{headlineResult}</pre>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-purple-600">Recruiter outreach</p>
        <h2 className="text-2xl font-bold text-zinc-900">Personalized email templates</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Translate your resume into high-converting recruiter outreach emails. Use the templates as-is or keep iterating with the
          AI copilot.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <textarea
            value={scenario}
            onChange={(event) => setScenario(event.target.value)}
            rows={6}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 text-sm text-zinc-900 focus:border-purple-500 focus:outline-none"
          />
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-zinc-500">Tone</label>
            <div className="flex flex-wrap gap-2">
              {templateTones.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTone(option)}
                  className={`rounded-full border px-4 py-1 text-xs font-medium transition ${tone === option ? "border-purple-600 bg-purple-600 text-white" : "border-zinc-300 text-zinc-700"}`}
                >
                  {option}
                </button>
              ))}
            </div>
            <input
              value={cta}
              onChange={(event) => setCta(event.target.value)}
              placeholder="Call to action (e.g., 'schedule an interview')"
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 focus:border-purple-500 focus:outline-none"
            />
            <button
              onClick={handleEmailSubmit}
              disabled={!scenario || emailState === "loading"}
              className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {emailState === "loading" ? "Drafting..." : "Generate emails"}
            </button>
          </div>
        </div>
        {emailResult && (
          <div className="mt-6 rounded-xl bg-purple-50 p-4 text-sm text-purple-900">
            <p className="mb-2 font-semibold">Suggested templates</p>
            <pre className="whitespace-pre-wrap text-xs">{emailResult}</pre>
          </div>
        )}
      </section>
    </div>
  );
}
