import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnnouncementCard from "../components/AnnouncementCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import { getBookmarks, removeBookmark, friendlyErrorMessage } from "../services/api";

export default function BookmarksPage() {
  const { pid, isAuthenticated } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingIds, setRemovingIds] = useState(new Set());
  const [removeSuccess, setRemoveSuccess] = useState("");

  const fetchBookmarks = useCallback(async () => {
    if (!pid) {
      setError("User ID is missing. Please log in again.");
      setBookmarks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await getBookmarks(pid);
      const list = data?.bookmarks || data?.announcements || [];
      setBookmarks(list);
    } catch (err) {
      setBookmarks([]);
      setError(friendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [pid]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  function bookmarkErrorMessage(err) {
    if (!err) return "Something went wrong. Please try again.";
    if (err.status === 401) return "Your session has expired. Please log in again.";
    if (err.status === 404) return "Bookmark not found.";
    if (err.status === 500) return "Something went wrong. Please try again.";
    if (err.status === 0 || (err.message || "").toLowerCase().includes("failed to fetch"))
      return "Unable to connect to CampusPulse.";
    return friendlyErrorMessage(err);
  }

  async function handleRemove(announcementId) {
    if (removingIds.has(announcementId)) return;
    setRemovingIds((prev) => new Set(prev).add(announcementId));
    setError("");
    try {
      await removeBookmark(announcementId, pid);
      setBookmarks((prev) =>
        prev.filter((b) => (b.A_ID || b.announcement?.A_ID) !== announcementId)
      );
      setRemoveSuccess("Bookmark removed.");
      setTimeout(() => setRemoveSuccess(""), 3000);
    } catch (err) {
      if (err.status === 404) {
        setBookmarks((prev) =>
          prev.filter((b) => (b.A_ID || b.announcement?.A_ID) !== announcementId)
        );
        setRemoveSuccess("Bookmark not found.");
        setTimeout(() => setRemoveSuccess(""), 3000);
      } else {
        setError(bookmarkErrorMessage(err));
      }
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(announcementId);
        return next;
      });
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
            <Bookmark className="h-6 w-6 text-brand-600" /> Saved Opportunities
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Announcements you've bookmarked for later.
          </p>
        </div>

        {removeSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> {removeSuccess}
          </div>
        )}
        {error && <div className="mb-4"><ErrorMessage message={error} onRetry={fetchBookmarks} /></div>}

        {loading ? (
          <LoadingSpinner size="lg" label="Loading your bookmarks..." />
        ) : bookmarks.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No bookmarks yet"
            description="Save announcements from the dashboard to find them here later."
            action={<Link to="/dashboard" className="btn-primary">Browse Announcements</Link>}
          />
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-500">
              {bookmarks.length} saved {bookmarks.length === 1 ? "announcement" : "announcements"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bookmarks.map((b) => {
                const ann = b.announcement || b;
                const aid = ann.A_ID || b.A_ID;
                const isRemoving = removingIds.has(aid);
                return (
                  <div key={aid} className="relative">
                    <AnnouncementCard
                      announcement={ann}
                      isBookmarked={true}
                      onBookmarkToggle={handleRemove}
                      bookmarkLoading={isRemoving}
                    />
                    <button
                      onClick={() => handleRemove(aid)}
                      disabled={isRemoving}
                      className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isRemoving ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Removing...</>
                      ) : (
                        <><Trash2 className="h-4 w-4" /> Remove Bookmark</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
