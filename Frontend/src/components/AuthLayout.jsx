import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left brand panel */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-accent-700 px-8 py-10 text-white lg:w-[45%] lg:px-12">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -right-10 top-10 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -left-10 bottom-10 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        </div>

        <Link to="/dashboard" className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight">
            Campus<span className="text-white/80">Pulse</span>
          </span>
        </Link>

        <div className="relative">
          <h2 className="mb-3 text-3xl font-extrabold leading-tight lg:text-4xl">
            Never miss an opportunity on campus.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-white/70">
            Hackathons, internships, placements, scholarships, exams — all your
            college announcements in one calm, searchable place.
          </p>
        </div>

        <div className="relative hidden gap-6 text-xs text-white/60 lg:flex">
          <span>Search & Filter</span>
          <span>Bookmark</span>
          <span>AI Analyzer</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-10 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {children}
          {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
