import { ResumeWorkbench } from "@/components/ResumeWorkbench";
import { SubscriptionPanel } from "@/components/SubscriptionPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-8">
        <header className="space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">Smart Resume Copilot</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
            Upload your resume, paste a job, and let AI tailor everything in minutes
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-600">
            Purpose-built workflows for job seekers: resume rewriting, LinkedIn headline optimization, recruiter outreach, and
            billing-ready subscriptions.
          </p>
        </header>
        <ResumeWorkbench />
        <SubscriptionPanel />
      </div>
    </div>
  );
}
