import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, Clock, MapPin, Tag, FileText, Link2,
  Bookmark, BookmarkCheck, Loader2, AlertCircle, ExternalLink,
  StickyNote, Edit3, Save, X, CheckCircle2, Info
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnnouncementBadge from "../components/AnnouncementBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import {
  getAnnouncement, addBookmark, removeBookmark,
  getPersonalNote, updatePersonalNote, deletePersonalNote,
  friendlyErrorMessage,
} from "../services/api";
import { findMockAnnouncement } from "../services/mockData";
import { formatDate, isDeadlineUrgent, isDeadlinePassed } from "../utils/announcement";

export default function AnnouncementDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pid } = useAuth();

  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usedMock, setUsedMock] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const [personalNote, setPersonalNote] = useState("");
  const [noteEditing, setNoteEditing] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [noteError, setNoteError] = useState("");

  const fetchAnnouncement = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAnnouncement(id);
      setAnnouncement(data);
      setUsedMock(false);
    } catch (err) {
      const mock = findMockAnnouncement(id);
      if (mock) {
        setAnnouncement(mock);
        setUsedMock(true);
        setError(friendlyErrorMessage(err));
      } else {
        setAnnouncement(null);
        setError(friendlyErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnnouncement();
  }, [fetchAnnouncement]);

  const fetchPersonalNote = useCallback(async () => {
    if (!pid || !id) {
      setPersonalNote("");
      return;
    }
    setNoteError("");
    try {
      const data = await getPersonalNote(id);
      const noteText = data?.note ?? "";
      setPersonalNote(noteText);
    } catch (err) {
      if (err.status === 404) {
        setPersonalNote("");
      } else {
        setNoteError(friendlyErrorMessage(err));
        setPersonalNote("");
      }
    }
  }, [pid, id]);

  useEffect(() => {
    if (pid && id) {
      fetchPersonalNote();
      setNoteEditing(false);
      setNoteSaved(false);
    } else {
      setPersonalNote("");
      setNoteEditing(false);
    }
  }, [pid, id, fetchPersonalNote]);

  function handleNoteEdit() {
    setNoteDraft(personalNote);
    setNoteEditing(true);
    setNoteSaved(false);
    setNoteError("");
  }

  function handleNoteCancel() {
    setNoteEditing(false);
    setNoteDraft("");
    setNoteError("");
  }

  async function handleNoteSave() {
    const trimmed = noteDraft.trim();
    setNoteSaving(true);
    setNoteError("");
    try {
      await updatePersonalNote(id, trimmed);
      setPersonalNote(trimmed);
      setNoteEditing(false);
      setNoteDraft("");
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 3000);
    } catch (err) {
      setNoteError(friendlyErrorMessage(err));
    } finally {
      setNoteSaving(false);
    }
  }

  async function handleBookmarkToggle() {
    if (!pid || !announcement) return;
    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await removeBookmark(announcement.A_ID, pid);
        setIsBookmarked(false);
      } else {
        await addBookmark(announcement.A_ID, pid);
        setIsBookmarked(true);
      }
    } catch (err) {
      setError(friendlyErrorMessage(err));
    } finally {
      setBookmarkLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner size="lg" label="Loading announcement..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
          <EmptyState
            icon={AlertCircle}
            title="Announcement not found"
            description="This opportunity may have been removed or the ID is incorrect."
            action={<Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>}
          />
        </main>
        <Footer />
      </div>
    );
  }

  const a = announcement;
  const eventDate = formatDate(a.event_date);
  const deadline = formatDate(a.deadline);
  const urgent = isDeadlineUrgent(a.deadline);
  const passed = isDeadlinePassed(a.deadline);

  const detailFields = [
    { label: "Department", value: a.department, icon: MapPin },
    { label: "Topic", value: a.topic, icon: Tag },
    { label: "Source", value: a.source, icon: FileText },
    { label: "Requirements", value: a.requirements, icon: FileText },
    { label: "Notes", value: a.notes, icon: FileText },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {usedMock && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
            Showing sample data. Start your FastAPI backend to see live announcement details.
          </div>
        )}
        {error && !usedMock && <div className="mb-4"><ErrorMessage message={error} /></div>}

        {/* Main card */}
        <div className="card-base overflow-hidden p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <AnnouncementBadge category={a.category} size="lg" />
            {pid && (
              <button
                onClick={handleBookmarkToggle}
                disabled={bookmarkLoading}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all disabled:opacity-60 ${
                  isBookmarked
                    ? "border-brand-200 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {bookmarkLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isBookmarked ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                {isBookmarked ? "Saved" : "Save"}
              </button>
            )}
          </div>

          <h1 className="mb-2 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
            {a.title}
          </h1>
          {a.topic && <p className="mb-6 text-base text-slate-500">{a.topic}</p>}

          {/* Date grid */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            {eventDate && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <Calendar className="h-4 w-4" /> Event Date
                </div>
                <p className="mt-1.5 text-lg font-bold text-slate-800">{eventDate}</p>
              </div>
            )}
            {deadline && (
              <div className={`rounded-xl border p-4 ${urgent ? "border-rose-200 bg-rose-50" : "border-slate-100 bg-slate-50"}`}>
                <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${urgent ? "text-rose-500" : "text-slate-400"}`}>
                  <Clock className="h-4 w-4" /> Deadline
                </div>
                <p className={`mt-1.5 text-lg font-bold ${passed ? "text-slate-400 line-through" : urgent ? "text-rose-700" : "text-slate-800"}`}>
                  {deadline}
                </p>
              </div>
            )}
          </div>

          {/* Detail fields */}
          <div className="space-y-4 border-t border-slate-100 pt-6">
            {detailFields.map((field) => {
              if (!field.value) return null;
              return (
                <div key={field.label} className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <field.icon className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{field.label}</p>
                    <p className="mt-0.5 text-sm text-slate-700 whitespace-pre-line">{field.value}</p>
                  </div>
                </div>
              );
            })}

            {/* Important link */}
            {a.important_link && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100">
                  <Link2 className="h-4 w-4 text-brand-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Important Link</p>
                  <a
                    href={a.important_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    {a.important_link} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Link to="/dashboard" className="btn-secondary">
            <ArrowLeft className="h-4 w-4" /> All Announcements
          </Link>
          <Link to="/bookmarks" className="btn-secondary">
            <Bookmark className="h-4 w-4" /> View Saved
          </Link>
        </div>

        {/* My Notes section */}
        {pid && (
          <div className="mt-6 card-base p-6 sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-brand-600" />
                <h2 className="text-lg font-bold text-slate-900">My Notes</h2>
              </div>
              {!noteEditing && (
                <button
                  onClick={handleNoteEdit}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50"
                >
                  <Edit3 className="h-4 w-4" /> {personalNote ? "Edit" : "Add Note"}
                </button>
              )}
            </div>

            {noteError && (
              <div className="mb-3"><ErrorMessage message={noteError} /></div>
            )}

            {noteSaved && (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Note saved.
              </div>
            )}

            {noteEditing ? (
              <div>
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={5}
                  placeholder="Write your personal note for this announcement..."
                  className="input-field w-full resize-none"
                  autoFocus
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleNoteSave}
                    disabled={noteSaving}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
                  >
                    {noteSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
                  </button>
                  <button
                    onClick={handleNoteCancel}
                    disabled={noteSaving}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : personalNote ? (
              <p className="whitespace-pre-line rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{personalNote}</p>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-sm text-slate-400">
                <Info className="h-4 w-4 flex-shrink-0" />
                You haven't added a personal note for this announcement yet.
              </div>
            )}

            <p className="mt-3 text-xs text-slate-400">
              Your notes are private and visible only to you.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
