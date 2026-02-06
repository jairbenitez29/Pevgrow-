'use client';

interface SearchHistoryProps {
  history: string[];
  selectedIndex: number;
  onSelect: (term: string) => void;
  onClear: () => void;
}

export default function SearchHistory({
  history,
  selectedIndex,
  onSelect,
  onClear
}: SearchHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-4 pb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Búsquedas recientes
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-purple-700 hover:text-purple-900 font-medium"
        >
          Borrar
        </button>
      </div>

      <ul>
        {history.map((term, index) => (
          <li key={term}>
            <button
              type="button"
              onClick={() => onSelect(term)}
              className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-purple-50 transition text-left ${
                index === selectedIndex ? 'bg-purple-50' : ''
              }`}
            >
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-gray-700 truncate">{term}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
