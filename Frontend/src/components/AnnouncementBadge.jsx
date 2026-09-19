import { getCategoryStyle } from "../utils/announcement";

export default function AnnouncementBadge({ category, size = "md" }) {
  const style = getCategoryStyle(category);
  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${style.bg} ${style.text} ${style.border} ${sizes[size] || sizes.md}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {category || "General"}
    </span>
  );
}
