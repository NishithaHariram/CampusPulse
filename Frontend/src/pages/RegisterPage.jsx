import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, GraduationCap, BookOpen, Tag, Loader2, CheckCircle2 } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import ErrorMessage from "../components/ErrorMessage";
import { registerUser, setUserPid, friendlyErrorMessage } from "../services/api";

const YEARS = [
  { label: "First Year", value: 1 },
  { label: "Second Year", value: 2 },
  { label: "Third Year", value: 3 },
  { label: "Fourth Year", value: 4 },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    year: "",
    college: "",
    stream: "",
    preferences: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.username.trim()) e.username = "Username is required";
    else if (form.username.trim().length < 3) e.username = "Username must be at least 3 characters";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setApiError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        year: form.year ? Number(form.year) : null,
        preferences: form.preferences
          ? form.preferences.split(",").map((s) => s.trim()).filter(Boolean).join(", ")
          : null,
        college: form.college || null,
        stream: form.stream || null,
      };
      const data = await registerUser(payload);
      if (data?.P_ID) {
        setUserPid(data.P_ID);
      }
      setSuccess(true);
    } catch (err) {
      setApiError(friendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <AuthLayout title="Account created" subtitle="You're all set.">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
          <h3 className="text-lg font-bold text-emerald-800">Registration successful!</h3>
          <p className="mt-1.5 text-sm text-emerald-700">
            Your CampusPulse account is ready. Log in to start exploring opportunities.
          </p>
          <button onClick={() => navigate("/login")} className="btn-primary mt-5 w-full">
            Continue to Login
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join CampusPulse and never miss a campus opportunity."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {apiError && <ErrorMessage message={apiError} />}

        <div>
          <label htmlFor="name" className="label-base">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="name" type="text" value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Aarav Patel"
              className={`input-field pl-10 ${errors.name ? "border-rose-300" : ""}`} />
          </div>
          {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="label-base">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input id="email" type="email" value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="you@college.edu"
                className={`input-field pl-10 ${errors.email ? "border-rose-300" : ""}`} />
            </div>
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="username" className="label-base">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input id="username" type="text" value={form.username}
                onChange={(e) => setField("username", e.target.value)}
                placeholder="aarav_p"
                className={`input-field pl-10 ${errors.username ? "border-rose-300" : ""}`} />
            </div>
            {errors.username && <p className="mt-1 text-xs text-rose-600">{errors.username}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="password" className="label-base">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="password" type="password" value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              placeholder="At least 8 characters"
              className={`input-field pl-10 ${errors.password ? "border-rose-300" : ""}`} />
          </div>
          {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="year" className="label-base">Year</label>
            <select id="year" value={form.year}
              onChange={(e) => setField("year", e.target.value)}
              className="input-field">
              <option value="">Select year</option>
              {YEARS.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="stream" className="label-base">Stream</label>
            <div className="relative">
              <BookOpen className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input id="stream" type="text" value={form.stream}
                onChange={(e) => setField("stream", e.target.value)}
                placeholder="Computer Science"
                className="input-field pl-10" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="college" className="label-base">College</label>
          <div className="relative">
            <GraduationCap className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="college" type="text" value={form.college}
              onChange={(e) => setField("college", e.target.value)}
              placeholder="Your college name"
              className="input-field pl-10" />
          </div>
        </div>

        <div>
          <label htmlFor="preferences" className="label-base">Preferences</label>
          <div className="relative">
            <Tag className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="preferences" type="text" value={form.preferences}
              onChange={(e) => setField("preferences", e.target.value)}
              placeholder="Hackathon, Internship, Placement (comma separated)"
              className="input-field pl-10" />
          </div>
          <p className="mt-1 text-xs text-slate-400">Comma-separated categories you're interested in.</p>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</>
          ) : (
            "Create account"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
