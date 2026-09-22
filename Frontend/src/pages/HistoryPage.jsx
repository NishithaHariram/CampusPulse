import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { History, Bookmark, BookmarkX } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnnouncementCard from "../components/AnnouncementCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import { getAnnouncements, getBookmarks, friendlyErrorMessage } from "../services/api";
import { isDeadlinePassed } from "../utils/announcement";

export default function HistoryPage() {
  const { pid } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("saved");

  const fetchAll = useCallback(async () => {
    if (!pid) {
      setError("User ID is missing. Please log in again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [annData, bmData] = await Promise.all([
        getAnnouncements({}),
        getBookmarks(pid),
      ]);
      const annList = annData?.announcements || [];
      setAnnouncements(annList);

      const bmList = bmData?.bookmarks || bmData?.announcements || [];
      const ids = new Set(
        bmList.map((b) => b.A_ID || b.announcement?.A_ID).filter(Boolean)
      );
      setBookmarkedIds(ids);
    } catch (err) {
      setError(friendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [pid]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const expiredAnnouncements = useMemo(
    () => announcements.filter((a) => isDeadlinePassed(a.deadline)),
    [announcements]
  );

  const savedHistory = useMemo(
    () => expiredAnnouncements.filter((a) => bookmarkedIds.has(a.A_ID)),
    [expiredAnnouncements, bookmarkedIds]
  );

  const missedHistory = useMemo(
    () => expiredAnnouncements.filter((a) => !bookmarkedIds.has(a.A_ID)),
    [expiredAnnouncements, bookmarkedIds]
  );

  const tabList = [
    { id: "saved", label: "Saved History", icon: Bookmark, count: savedHistory.length },
    { id: "missed", label: "Missed Opportunities", icon: BookmarkX, count: missedHistory.length },
  ];

  const activeList = activeTab === "saved" ? savedHistory : missedHistory;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
            <History className="h-6 w-6 text-brand-600" /> History
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Announcements whose deadlines have passed. A bookmark only means you saved it — not that you participated.
          </p>
        </div>

        {error && <div className="mb-4"><ErrorMessage message={error} onRetry={fetchAll} /></div>}

        {loading ? (
          <LoadingSpinner size="lg" label="Loading history..." />
        ) : (
          <>
            {/* Tabs */}
            <div className="mb-5 flex gap-2 border-b border-slate-200">
              {tabList.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                      isActive
                        ? "border-brand-600 text-brand-700"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      isActive ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Expired banner */}
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-100/60 px-4 py-2.5 text-xs text-slate-500">
              These announcements have passed their deadlines and are shown for reference only.
            </div>

            {activeList.length === 0 ? (
              <EmptyState
                icon={activeTab === "saved" ? Bookmark : BookmarkX}
                title={activeTab === "saved" ? "No saved history yet" : "No missed opportunities yet"}
                description={
                  activeTab === "saved"
                    ? "Your saved opportunities will appear here after their deadlines pass."
                    : "No missed opportunities yet."
                }
                action={<Link to="/dashboard" className="btn-primary">Browse Announcements</Link>}
              />
            ) : (
              <>
                <p className="mb-3 text-sm text-slate-500">
                  {activeList.length} {activeList.length === 1 ? "announcement" : "announcements"}
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-90">
                  {activeList.map((a) => (
                    <div key={a.A_ID} className="rounded-2xl border border-slate-200 bg-slate-50/40">
                      <AnnouncementCard
                        announcement={a}
                        isBookmarked={bookmarkedIds.has(a.A_ID)}
                        onBookmarkToggle={null}
                        bookmarkLoading={false}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
