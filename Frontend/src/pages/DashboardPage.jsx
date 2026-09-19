import { useState, useEffect, useCallback, useMemo } from "react";
import { Calendar, Filter, X, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import AnnouncementCard from "../components/AnnouncementCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import { Link } from "react-router-dom";
import { getAnnouncements, getBookmarks, addBookmark, removeBookmark, friendlyErrorMessage } from "../services/api";
import { mockAnnouncements } from "../services/mockData";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { pid, isAuthenticated, username } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usedMock, setUsedMock] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [bookmarkLoadingIds, setBookmarkLoadingIds] = useState(new Set());

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const filters = {};
      if (debouncedSearch) filters.search = debouncedSearch;
      if (category) filters.category = category;
      if (eventDate) filters.event_date = eventDate;
      if (deadline) filters.deadline = deadline;
      const data = await getAnnouncements(filters);
      const list = data?.announcements || [];
      setAnnouncements(list);
      setUsedMock(false);
    } catch (err) {
      // Fall back to mock data for visual presentation
      let filtered = [...mockAnnouncements];
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.title?.toLowerCase().includes(q) ||
            a.topic?.toLowerCase().includes(q) ||
            a.department?.toLowerCase().includes(q)
        );
      }
      if (category) filtered = filtered.filter((a) => a.category === category);
      if (eventDate) filtered = filtered.filter((a) => a.event_date === eventDate);
      if (deadline) filtered = filtered.filter((a) => a.deadline === deadline);
      setAnnouncements(filtered);
      setUsedMock(true);
      setError(friendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, eventDate, deadline]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Fetch existing bookmarks to show bookmark state
  const fetchBookmarks = useCallback(async () => {
    if (!isAuthenticated || !pid) return;
    try {
      const data = await getBookmarks(pid);
      const list = data?.announcements || data?.bookmarks || [];
      const ids = new Set(
        list.map((b) => b.A_ID || b.announcement?.A_ID).filter(Boolean)
      );
      setBookmarkedIds(ids);
    } catch {
      // Silently ignore — bookmark toggling still works
    }
  }, [isAuthenticated, pid]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  async function handleBookmarkToggle(announcementId) {
    if (!pid) return;
    const isBookmarked = bookmarkedIds.has(announcementId);
    setBookmarkLoadingIds((prev) => new Set(prev).add(announcementId));
    try {
      if (isBookmarked) {
        await removeBookmark(announcementId, pid);
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(announcementId);
          return next;
        });
      } else {
        await addBookmark(announcementId, pid);
        setBookmarkedIds((prev) => new Set(prev).add(announcementId));
      }
    } catch (err) {
      setError(friendlyErrorMessage(err));
    } finally {
      setBookmarkLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(announcementId);
        return next;
      });
    }
  }

  function clearFilters() {
    setCategory("");
    setEventDate("");
    setDeadline("");
    setSearch("");
  }

  const hasActiveFilters = useMemo(
    () => Boolean(category || eventDate || deadline || search),
    [category, eventDate, deadline, search]
  );

  const greeting = username ? `Welcome back, ${username}` : "Welcome to CampusPulse";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Hero header */}
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-600 px-6 py-7 text-white shadow-sm">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{greeting}</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-white/80">
            Discover hackathons, internships, placements, and more — all your campus
            opportunities in one place.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/ai-analyzer" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/25">
              <Sparkles className="h-4 w-4" /> Try AI Analyzer
            </Link>
            <Link to="/bookmarks" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/25">
              View Saved
            </Link>
          </div>
        </div>

        {/* Search + filters row */}
        <div className="mb-5 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                showFilters || hasActiveFilters
                  ? "border-brand-200 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Filter className="h-4 w-4" /> Filters
              {hasActiveFilters && (
                <span className="ml-1 rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">!</span>
              )}
            </button>
          </div>

          {/* Category filter always visible */}
          <CategoryFilter selected={category || "All"} onChange={setCategory} />

          {/* Collapsible date filters */}
          {showFilters && (
            <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor="eventDate" className="label-base">Event Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input id="eventDate" type="date" value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)} className="input-field pl-9" />
                </div>
              </div>
              <div className="flex-1">
                <label htmlFor="deadline" className="label-base">Deadline</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input id="deadline" type="date" value={deadline}
                    onChange={(e) => setDeadline(e.target.value)} className="input-field pl-9" />
                </div>
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn-secondary">
                  <X className="h-4 w-4" /> Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mock data notice */}
        {usedMock && !loading && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
            Showing sample announcements. Start your FastAPI backend at <code className="font-mono">http://127.0.0.1:8000</code> to see live data.
          </div>
        )}

        {/* Error (non-blocking, since mock data may be shown) */}
        {error && !usedMock && <ErrorMessage message={error} onRetry={fetchAnnouncements} />}

        {/* Content */}
        {loading ? (
          <LoadingSpinner size="lg" label="Loading announcements..." />
        ) : announcements.length === 0 ? (
          <EmptyState
            title="No opportunities found"
            description="Try changing your search terms or category filter."
            action={hasActiveFilters ? <button onClick={clearFilters} className="btn-secondary">Clear all filters</button> : null}
          />
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-500">
              {announcements.length} {announcements.length === 1 ? "announcement" : "announcements"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {announcements.map((a) => (
                <AnnouncementCard
                  key={a.A_ID}
                  announcement={a}
                  isBookmarked={bookmarkedIds.has(a.A_ID)}
                  onBookmarkToggle={handleBookmarkToggle}
                  bookmarkLoading={bookmarkLoadingIds.has(a.A_ID)}
                />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
