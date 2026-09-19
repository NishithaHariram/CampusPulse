import { CATEGORIES } from "../utils/announcement";

export default function CategoryFilter({ selected, onChange }) {
  const allCategories = ["All", ...CATEGORIES];

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      {allCategories.map((cat) => {
        const isActive = (selected || "All") === cat;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat === "All" ? "" : cat)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              isActive
                ? "bg-brand-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
