import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Trash2, Loader2 } from "lucide-react";
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

  async function handleRemove(announcementId) {
    setRemovingIds((prev) => new Set(prev).add(announcementId));
    try {
      await removeBookmark(announcementId, pid);
      setBookmarks((prev) =>
        prev.filter((b) => (b.A_ID || b.announcement?.A_ID) !== announcementId)
      );
    } catch (err) {
      setError(friendlyErrorMessage(err));
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
                return (
                  <div key={aid} className="relative">
                    <AnnouncementCard
                      announcement={ann}
                      isBookmarked={true}
                      onBookmarkToggle={handleRemove}
                      bookmarkLoading={removingIds.has(aid)}
                    />
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
