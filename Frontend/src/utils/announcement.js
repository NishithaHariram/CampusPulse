// Category color mapping for badges
export const CATEGORY_STYLES = {
  Hackathon: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  Competition: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  Workshop: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    dot: "bg-teal-500",
  },
  Internship: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  Exam: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
  Assignment: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    dot: "bg-indigo-500",
  },
  Scholarship: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  Placement: {
    bg: "bg-brand-50",
    text: "text-brand-700",
    border: "border-brand-200",
    dot: "bg-brand-500",
  },
  Default: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
};

export const CATEGORIES = [
  "Hackathon",
  "Competition",
  "Workshop",
  "Internship",
  "Exam",
  "Assignment",
  "Scholarship",
  "Placement",
];

export function getCategoryStyle(category) {
  if (!category) return CATEGORY_STYLES.Default;
  return CATEGORY_STYLES[category] || CATEGORY_STYLES.Default;
}

export function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function isDeadlineUrgent(deadlineStr) {
  if (!deadlineStr) return false;
  try {
    const d = new Date(deadlineStr);
    const now = new Date();
    const diff = (d - now) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  } catch {
    return false;
  }
}

export function isDeadlinePassed(deadlineStr) {
  if (!deadlineStr) return false;
  try {
    const d = new Date(deadlineStr);
    return d.getTime() < Date.now();
  } catch {
    return false;
  }
}
