import { Link } from "react-router-dom";
import { Calendar, Clock, Bookmark, BookmarkCheck, ArrowRight, MapPin } from "lucide-react";
import AnnouncementBadge from "./AnnouncementBadge";
import { formatDate, isDeadlineUrgent, isDeadlinePassed } from "../utils/announcement";

export default function AnnouncementCard({
  announcement,
  isBookmarked = false,
  onBookmarkToggle,
  bookmarkLoading = false,
}) {
  const a = announcement;
  const eventDate = formatDate(a.event_date);
  const deadline = formatDate(a.deadline);
  const urgent = isDeadlineUrgent(a.deadline);
  const passed = isDeadlinePassed(a.deadline);

  return (
    <div className="card-base group flex flex-col p-5 hover:shadow-cardHover">
      <div className="mb-3 flex items-start justify-between gap-3">
        <AnnouncementBadge category={a.category} />
        <button
          onClick={() => onBookmarkToggle?.(a.A_ID)}
          disabled={bookmarkLoading}
          className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-brand-50 hover:text-brand-600 disabled:opacity-50"
          aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          {isBookmarked ? (
            <BookmarkCheck className="h-5 w-5 text-brand-600" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </button>
      </div>

      <Link to={`/announcements/${a.A_ID}`} className="flex-1">
        <h3 className="mb-1.5 text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-brand-700">
          {a.title}
        </h3>
        {a.topic && <p className="mb-3 text-sm text-slate-500 line-clamp-2">{a.topic}</p>}
      </Link>

      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
        {a.department && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {a.department}
          </span>
        )}
        {eventDate && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {eventDate}
          </span>
        )}
        {deadline && (
          <span
            className={`inline-flex items-center gap-1 font-medium ${
              passed ? "text-slate-400 line-through" : urgent ? "text-rose-600" : "text-slate-500"
            }`}
          >
            <Clock className="h-3.5 w-3.5" /> Due {deadline}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
        <Link
          to={`/announcements/${a.A_ID}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
        >
          View Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
