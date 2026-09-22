import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, AtSign, GraduationCap, BookOpen, Tag, Edit3, Save, X, Loader2, CheckCircle2, Trash2, AlertTriangle } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import { getUserProfile, updateUserProfile, deleteUser, friendlyErrorMessage } from "../services/api";
import { mockProfile } from "../services/mockData";

const YEARS = [
  { label: "First Year", value: 1 },
  { label: "Second Year", value: 2 },
  { label: "Third Year", value: 3 },
  { label: "Fourth Year", value: 4 },
];

const YEAR_LABELS = YEARS.reduce((acc, y) => { acc[y.value] = y.label; return acc; }, {});

export default function ProfilePage() {
  const navigate = useNavigate();
  const { pid, token, username, setProfile, loadProfile, logout } = useAuth();
  const [profile, setLocalProfile] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [usedMock, setUsedMock] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchProfile = useCallback(async () => {
    if (!pid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await getUserProfile(pid);
      setLocalProfile(data);
      setProfile(data);
      setUsedMock(false);
    } catch (err) {
      // Fall back to mock for visual demo
      setLocalProfile({ ...mockProfile, P_ID: pid, username: username || mockProfile.username });
      setUsedMock(true);
      setError(friendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [pid, username, setProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  function startEdit() {
    setEditForm({
      name: profile?.name || "",
      email: profile?.email || "",
      year: profile?.year || "",
      college: profile?.college || "",
      stream: profile?.stream || "",
      preferences: profile?.preferences || "",
    });
    setSuccess(false);
    setError("");
  }

  function cancelEdit() {
    setEditForm(null);
  }

  async function handleSave(ev) {
    ev.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const payload = {
        ...editForm,
        year: editForm.year ? Number(editForm.year) : null,
      };
      const data = await updateUserProfile(pid, payload);
      const updated = data?.user || data || editForm;
      const merged = { ...profile, ...updated, P_ID: pid, username: profile?.username };
      setLocalProfile(merged);
      setProfile(merged);
      setEditForm(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(friendlyErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!pid) {
      setDeleteError("User ID is missing. Please log in again.");
      return;
    }
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteUser(pid);
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setDeleteError(friendlyErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  const displayProfile = editForm || profile;

  const fields = [
    { key: "name", label: "Full Name", icon: User, editable: true },
    { key: "email", label: "Email", icon: Mail, editable: true },
    { key: "username", label: "Username", icon: AtSign, editable: false },
    { key: "year", label: "Year", icon: GraduationCap, editable: true, type: "select" },
    { key: "college", label: "College", icon: GraduationCap, editable: true },
    { key: "stream", label: "Stream", icon: BookOpen, editable: true },
    { key: "preferences", label: "Preferences", icon: Tag, editable: true },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner size="lg" label="Loading profile..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!displayProfile) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
          <EmptyState
            icon={User}
            title="No profile data"
            description="We couldn't load your profile information."
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header card */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-accent-600 px-6 py-8 text-white shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-2xl font-extrabold backdrop-blur">
              {(displayProfile.name || displayProfile.username || "S").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{displayProfile.name || "Student"}</h1>
              <p className="text-sm text-white/70">@{displayProfile.username}</p>
            </div>
          </div>
        </div>

        {usedMock && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
            Showing sample profile. Start your FastAPI backend to load your real data.
          </div>
        )}
        {error && <div className="mb-4"><ErrorMessage message={error} /></div>}
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-5 w-5" /> Profile updated successfully!
          </div>
        )}

        <div className="card-base p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {editForm ? "Edit Profile" : "Profile Details"}
            </h2>
            {!editForm && (
              <button onClick={startEdit} className="btn-secondary">
                <Edit3 className="h-4 w-4" /> Edit
              </button>
            )}
          </div>

          {editForm ? (
            <form onSubmit={handleSave} className="space-y-4">
              {fields.map((field) => {
                const isEditable = field.editable;
                if (!isEditable) return null;
                return (
                  <div key={field.key}>
                    <label htmlFor={field.key} className="label-base">{field.label}</label>
                    <div className="relative">
                      <field.icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      {field.type === "select" ? (
                        <select
                          id={field.key}
                          value={editForm[field.key]}
                          onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                          className="input-field pl-10"
                        >
                          <option value="">Select year</option>
                          {YEARS.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
                        </select>
                      ) : (
                        <input
                          id={field.key}
                          type="text"
                          value={editForm[field.key]}
                          onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                          className="input-field pl-10"
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Username (read-only note) */}
              <div>
                <label className="label-base">Username</label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={profile?.username || ""}
                    disabled
                    className="input-field cursor-not-allowed bg-slate-50 pl-10 text-slate-400"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">Username cannot be changed.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Changes</>}
                </button>
                <button type="button" onClick={cancelEdit} className="btn-secondary">
                  <X className="h-4 w-4" /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => {
                const value = displayProfile[field.key];
                return (
                  <div key={field.key} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                      <field.icon className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{field.label}</p>
                      <p className="mt-0.5 truncate text-sm font-medium text-slate-800">
                        {field.key === "year" && value ? (YEAR_LABELS[Number(value)] || value) : (value || <span className="text-slate-300">Not set</span>)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Danger zone — Delete Account */}
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/50 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-rose-100">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-rose-900">Danger Zone</h2>
              <p className="mt-1 text-sm text-rose-700">
                Deleting your account permanently removes your profile and all associated data. This action cannot be undone.
              </p>
            </div>
          </div>
          <button
            onClick={() => { setShowDeleteConfirm(true); setDeleteError(""); }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-600 hover:text-white"
          >
            <Trash2 className="h-4 w-4" /> Delete Account
          </button>
        </div>
      </main>
      <Footer />

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={() => !deleting && setShowDeleteConfirm(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Delete Account?</h3>
            </div>
            <p className="mb-5 text-sm text-slate-600">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            {deleteError && <div className="mb-4"><ErrorMessage message={deleteError} /></div>}
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</> : <><Trash2 className="h-4 w-4" /> Yes, Delete My Account</>}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
