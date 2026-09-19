import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-400 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-brand-500" />
          <span className="font-semibold text-slate-500">
            Campus<span className="text-brand-500">Pulse</span>
          </span>
        </div>
        <p>Built for students. Stay informed, stay ahead.</p>
        <Link to="/dashboard" className="hover:text-brand-600">
          Dashboard
        </Link>
      </div>
    </footer>
  );
}
