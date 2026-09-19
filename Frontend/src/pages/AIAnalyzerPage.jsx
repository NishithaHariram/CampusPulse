import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Loader2, Wand2, CheckCircle2, RotateCcw, ArrowRight, FileText } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnnouncementBadge from "../components/AnnouncementBadge";
import ErrorMessage from "../components/ErrorMessage";
import { analyzeAnnouncement, friendlyErrorMessage } from "../services/api";
import { formatDate } from "../utils/announcement";

const MIN_TEXT_LENGTH = 20;

export default function AIAnalyzerPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [validationError, setValidationError] = useState("");

  async function handleAnalyze(ev) {
    ev.preventDefault();
    setError("");
    setValidationError("");

    if (!text.trim()) {
      setValidationError("Please paste an announcement to analyze.");
      return;
    }
    if (text.trim().length < MIN_TEXT_LENGTH) {
      setValidationError(`Please provide at least ${MIN_TEXT_LENGTH} characters of announcement text.`);
      return;
    }

    setLoading(true);
    try {
      const data = await analyzeAnnouncement(text.trim());
      setResult(data);
    } catch (err) {
      setError(friendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setText("");
    setResult(null);
    setError("");
    setValidationError("");
  }

  const announcement = result?.announcement;
  const aId = result?.A_ID;

  const resultFields = [
    { label: "Department", key: "department" },
    { label: "Topic", key: "topic" },
    { label: "Source", key: "source" },
    { label: "Requirements", key: "requirements" },
    { label: "Notes", key: "notes" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
            <Sparkles className="h-3.5 w-3.5" /> Powered by AI
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            AI Announcement Analyzer
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
            Paste a raw college announcement — from a WhatsApp message, email, PDF, or
            notice board — and CampusPulse will extract structured details automatically.
          </p>
        </div>

        {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

        {!result ? (
          /* Input form */
          <div className="card-base p-6 sm:p-8">
            <form onSubmit={handleAnalyze}>
              <label htmlFor="announcementText" className="label-base">
                Paste your announcement
              </label>
              <textarea
                id="announcementText"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste a college announcement here... e.g. 'CodeSprint 2026 registration is open. Deadline September 24. Event on September 28. Open to all CS students. Register at example.com/codesprint'"
                rows={10}
                className={`w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:outline-none focus:ring-2 ${
                  validationError
                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-200"
                    : "border-slate-200 focus:border-brand-500 focus:ring-brand-500/20"
                }`}
              />
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {text.trim().length} characters · minimum {MIN_TEXT_LENGTH}
                </p>
                {validationError && (
                  <p className="text-xs text-rose-600">{validationError}</p>
                )}
              </div>

              <button type="submit" disabled={loading} className="btn-primary mt-5 w-full sm:w-auto">
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
                ) : (
                  <><Wand2 className="h-4 w-4" /> Analyze with AI</>
                )}
              </button>
            </form>

            {/* Loading overlay info */}
            {loading && (
              <div className="mt-6 rounded-xl border border-accent-100 bg-accent-50 p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-accent-600" />
                  <div>
                    <p className="text-sm font-semibold text-accent-800">AI is reading your announcement...</p>
                    <p className="text-xs text-accent-600">Extracting title, category, dates, and details. This may take a few seconds.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Results */
          <div className="space-y-4 animate-fade-in">
            {/* Success banner */}
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-emerald-500" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-emerald-800">Analyzed and stored successfully!</h3>
                <p className="text-xs text-emerald-600">
                  {result.message || "The announcement has been extracted and saved to CampusPulse."}
                </p>
              </div>
              {aId && (
                <Link
                  to={`/announcements/${aId}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  View <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            {/* Structured result card */}
            {announcement && (
              <div className="card-base p-6 sm:p-8">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <AnnouncementBadge category={announcement.category} size="lg" />
                  {aId && (
                    <span className="text-xs font-medium text-slate-400">ID: #{aId}</span>
                  )}
                </div>

                <h2 className="mb-2 text-xl font-extrabold leading-tight text-slate-900">
                  {announcement.title || "Untitled Announcement"}
                </h2>
                {announcement.topic && (
                  <p className="mb-5 text-sm text-slate-500">{announcement.topic}</p>
                )}

                {/* Dates */}
                <div className="mb-5 grid gap-4 sm:grid-cols-2">
                  {announcement.event_date && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Event Date</p>
                      <p className="mt-1 text-base font-bold text-slate-800">{formatDate(announcement.event_date)}</p>
                    </div>
                  )}
                  {announcement.deadline && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Deadline</p>
                      <p className="mt-1 text-base font-bold text-slate-800">{formatDate(announcement.deadline)}</p>
                    </div>
                  )}
                </div>

                {/* Fields */}
                <div className="space-y-3 border-t border-slate-100 pt-5">
                  {resultFields.map((field) => {
                    if (!announcement[field.key]) return null;
                    return (
                      <div key={field.key} className="flex gap-3">
                        <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{field.label}</p>
                          <p className="mt-0.5 text-sm text-slate-700 whitespace-pre-line">{announcement[field.key]}</p>
                        </div>
                      </div>
                    );
                  })}
                  {announcement.important_link && (
                    <div className="flex gap-3">
                      <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Important Link</p>
                        <a href={announcement.important_link} target="_blank" rel="noopener noreferrer"
                          className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
                          {announcement.important_link} <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleReset} className="btn-primary">
                <RotateCcw className="h-4 w-4" /> Analyze Another
              </button>
              <Link to="/dashboard" className="btn-secondary">
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
