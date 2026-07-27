import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiFetch } from "../service/apiClient";
import BookCard from "../components/Bookcard";
import Nav from "../components/Nav";

type Book = {
  _id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  imgUrl: string;
  category?: string[];
};

type SortOption = "default" | "price-asc" | "price-desc" | "title-asc";

const categories = [
  "All",
  "Fiction",
  "Non-Fiction",
  "Mystery",
  "Self Help",
  "Romance",
  "Science",
  "History",
  "Biography",
  "Kids",
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "default", label: "Featured" },
  { value: "title-asc", label: "Title A–Z" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
];

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function SortIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7h18M6 12h12M10 17h4"
      />
    </svg>
  );
}

function Browse() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(() => {
    const fromUrl = searchParams.get("category");
    return fromUrl && categories.includes(fromUrl) ? fromUrl : "All";
  });
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await apiFetch<Book[]>("/books");
        setBooks(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load books right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredBooks = useMemo(() => {
    const query = searchTerm.toLowerCase();
    let result = books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.description.toLowerCase().includes(query);
      const matchesCategory =
        activeCategory === "All" ||
        book.category?.some(
          (cat) => cat.toLowerCase() === activeCategory.toLowerCase(),
        );
      return matchesSearch && matchesCategory;
    });

    if (sortBy === "title-asc")
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === "price-asc")
      result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc")
      result = [...result].sort((a, b) => b.price - a.price);

    return result;
  }, [books, searchTerm, activeCategory, sortBy]);

  const hasActiveFilters = searchTerm !== "" || activeCategory !== "All";
  const activeSortLabel =
    sortOptions.find((o) => o.value === sortBy)?.label ?? "Featured";

  return (
    <div className="min-h-screen bg-paper dark:bg-gray-950 text-amber-950 dark:text-amber-100 font-sans selection:bg-amber-900 selection:text-white overflow-x-hidden w-full max-w-full">
      <Nav />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        {/* ── Hero Banner ── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-800 via-shelf to-shelf-deep dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 p-8 text-white shadow-2xl shadow-amber-900/20 dark:shadow-black/40 sm:p-12 lg:p-16 isolate">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl mix-blend-screen pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-600/10 blur-3xl mix-blend-screen pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-4 inline-flex items-center rounded-full border border-amber-300/20 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-200 backdrop-blur-md">
                Discover your next favorite read
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-amber-50 to-amber-200">
                Browse Books
              </h1>
              <p className="mt-4 text-base text-amber-200/70 sm:text-lg max-w-xl leading-relaxed">
                Explore a curated collection of inspiring stories, practical
                guides, and timeless classics handpicked for you.
              </p>
            </div>
          </div>
        </section>

        {/* ── Search & Filter Panel ── */}
        <section className="mt-6 space-y-4">
          {/* Search Row */}
          <div
            className={`group relative flex items-center gap-3 rounded-2xl border bg-paper-elevated dark:bg-gray-900 px-5 py-1 shadow-sm transition-all duration-300 ${
              searchFocused
                ? "border-amber-500/60 dark:border-amber-500/50 shadow-lg shadow-amber-500/10 dark:shadow-amber-500/5 ring-4 ring-amber-500/10 dark:ring-amber-500/10"
                : "border-amber-900/10 dark:border-gray-700 hover:border-amber-900/20 dark:hover:border-gray-600 hover:shadow-md"
            }`}
          >
            {/* Search icon */}
            <SearchIcon
              className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                searchFocused
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-amber-900/30 dark:text-gray-500"
              }`}
            />

            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search by title, author, or topic…"
              className="flex-1 bg-transparent py-3.5 text-sm text-amber-950 dark:text-amber-100 placeholder:text-amber-900/35 dark:placeholder:text-gray-500 focus:outline-none sm:text-base"
            />

            {/* Clear button */}
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  inputRef.current?.focus();
                }}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-gray-700 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-gray-600 transition-all duration-150 hover:scale-110 active:scale-95"
                aria-label="Clear search"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Keyboard hint */}
            {!searchTerm && !searchFocused && (
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-amber-900/10 dark:border-gray-700 bg-amber-50 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-amber-900/40 dark:text-gray-500 select-none flex-shrink-0">
                ⌘K
              </kbd>
            )}
          </div>

          {/* Category Pills + Sort Row */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Wrapped Categories (No overflow issues) */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`group relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 select-none ${
                      isActive
                        ? "bg-gradient-to-r from-amber-700 to-amber-600 dark:from-amber-600 dark:to-amber-500 text-white shadow-md shadow-amber-700/25 dark:shadow-amber-500/20 scale-105"
                        : "bg-paper-elevated dark:bg-gray-900 border border-amber-900/10 dark:border-gray-700 text-amber-800 dark:text-amber-200 hover:border-amber-400/50 dark:hover:border-amber-500/50 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-50/80 dark:hover:bg-gray-800 hover:scale-[1.03] active:scale-100"
                    }`}
                  >
                    {category}
                    {isActive && (
                      <span className="absolute inset-0 rounded-full bg-white/10 pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sort dropdown */}
            <div
              ref={sortRef}
              className="relative flex-shrink-0 self-end lg:self-auto"
            >
              <button
                type="button"
                onClick={() => setSortOpen((o) => !o)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  sortOpen
                    ? "border-amber-500/60 dark:border-amber-500/50 bg-amber-50 dark:bg-gray-800 text-amber-800 dark:text-amber-200 shadow-md"
                    : "border-amber-900/10 dark:border-gray-700 bg-paper-elevated dark:bg-gray-900 text-amber-800 dark:text-amber-200 hover:border-amber-400/50 dark:hover:border-gray-600 hover:bg-amber-50/50 dark:hover:bg-gray-800"
                }`}
              >
                <SortIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">{activeSortLabel}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown menu */}
              <div
                className={`absolute right-0 top-full mt-2 w-52 rounded-2xl border border-amber-900/10 dark:border-gray-700 bg-paper-elevated/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-xl shadow-amber-900/10 dark:shadow-black/40 z-50 overflow-hidden origin-top-right transition-all duration-200 ${
                  sortOpen
                    ? "scale-100 opacity-100 translate-y-0"
                    : "scale-95 opacity-0 pointer-events-none -translate-y-2"
                }`}
              >
                <div className="py-1.5">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.value);
                        setSortOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${
                        sortBy === opt.value
                          ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 font-semibold"
                          : "text-amber-900/70 dark:text-gray-300 hover:bg-amber-50/80 dark:hover:bg-gray-800 font-medium"
                      }`}
                    >
                      {sortBy === opt.value && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      {sortBy !== opt.value && (
                        <span className="w-4 flex-shrink-0" />
                      )}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results meta bar */}
          {!loading && !error && (
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-amber-900/50 dark:text-gray-400">
                {filteredBooks.length === 0 ? (
                  "No results found"
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-amber-800 dark:text-amber-300">
                      {filteredBooks.length}
                    </span>{" "}
                    {filteredBooks.length === 1 ? "book" : "books"}
                    {activeCategory !== "All" && (
                      <>
                        {" "}
                        in{" "}
                        <span className="font-semibold text-amber-800 dark:text-amber-300">
                          {activeCategory}
                        </span>
                      </>
                    )}
                  </>
                )}
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveCategory("All");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all duration-150 hover:scale-105 active:scale-95"
                >
                  <XIcon className="h-3 w-3" />
                  Clear filters
                </button>
              )}
            </div>
          )}
        </section>

        {/* ── Results Section ── */}
        <section className="mt-8">
          {loading && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative h-12 w-12 mb-5">
                <div className="absolute inset-0 rounded-full border-4 border-amber-200/40 dark:border-gray-700" />
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-amber-600 dark:border-t-amber-400" />
              </div>
              <p className="text-amber-800/60 dark:text-amber-300/60 font-medium text-sm">
                Curating your library…
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 p-8 text-center border border-red-100 dark:border-red-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto h-12 w-12 text-red-400 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-red-800 dark:text-red-300">
                Oops!
              </h3>
              <p className="mt-2 text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && filteredBooks.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-amber-200 dark:border-gray-700 bg-paper-elevated dark:bg-gray-900 p-14 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-amber-400 dark:text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-amber-950 dark:text-amber-100">
                No books found
              </h3>
              <p className="mt-2 max-w-xs mx-auto text-sm text-amber-700/70 dark:text-amber-300/60">
                We couldn't find any books matching your search. Try another
                keyword or category.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("All");
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-all duration-150 hover:scale-105 active:scale-95 shadow-md shadow-amber-700/20"
              >
                <XIcon className="h-3.5 w-3.5" />
                Clear filters
              </button>
            </div>
          )}

          {!loading && !error && filteredBooks.length > 0 && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {filteredBooks.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Utility: hide scrollbar for category pills */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default Browse;
