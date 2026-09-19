import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, User as UserIcon, Loader2 } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import ErrorMessage from "../components/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import { loginUser, friendlyErrorMessage } from "../services/api";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const e = {};
    if (!username.trim()) e.username = "Username is required";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setApiError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setApiError(friendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to stay on top of every campus opportunity."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {apiError && <ErrorMessage message={apiError} />}

        <div>
          <label htmlFor="username" className="label-base">Username</label>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              className={`input-field pl-10 ${errors.username ? "border-rose-300 focus:border-rose-400 focus:ring-rose-200" : ""}`}
              autoComplete="username"
            />
          </div>
          {errors.username && <p className="mt-1 text-xs text-rose-600">{errors.username}</p>}
        </div>

        <div>
          <label htmlFor="password" className="label-base">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`input-field pl-10 ${errors.password ? "border-rose-300 focus:border-rose-400 focus:ring-rose-200" : ""}`}
              autoComplete="current-password"
            />
          </div>
          {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Logging in...
            </>
          ) : (
            "Log in"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
