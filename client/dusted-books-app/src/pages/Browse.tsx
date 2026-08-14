import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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

type SortOption = "default" | "price-asc" | "price-desc" | "title-asc" | "title-desc";

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
  "Action & Adventure",
  "Science Fiction & Fantasy",
  "Thriller & Suspense",
  "Historical Fiction",
  "Horror",
  "Literary Fiction",
  "Graphic Novels & Comics",
  "Humor & Satire",
  "Poetry",
  "Business & Economics",
  "Cookbooks, Food & Wine",
  "Art & Photography",
  "Travel & Adventure",
  "Religion & Spirituality",
  "True Crime",
  "Crafts, Hobbies & Home",
  "Philosophy & Psychology",
  "Health & Fitness",
  "Children's Books",
] as const;

// Categorized clusters for the genre drawer/modal
const genreClusters = [
  {
    name: "Fiction & Literature",
    genres: [
      "Fiction",
      "Literary Fiction",
      "Historical Fiction",
      "Romance",
      "Horror",
      "Humor & Satire",
      "Poetry",
    ],
  },
  {
    name: "Mystery, Sci-Fi & Action",
    genres: [
      "Mystery",
      "Thriller & Suspense",
      "Science Fiction & Fantasy",
      "Action & Adventure",
      "True Crime",
    ],
  },
  {
    name: "Knowledge & Society",
    genres: [
      "Non-Fiction",
      "History",
      "Biography",
      "Philosophy & Psychology",
      "Science",
      "Religion & Spirituality",
    ],
  },
  {
    name: "Lifestyle & Well-being",
    genres: [
      "Self Help",
      "Health & Fitness",
      "Business & Economics",
      "Cookbooks, Food & Wine",
      "Art & Photography",
      "Crafts, Hobbies & Home",
      "Travel & Adventure",
    ],
  },
  {
    name: "Kids & Comics",
    genres: [
      "Children's Books",
      "Kids",
      "Graphic Novels & Comics",
    ],
  },
];

// Curated quick-access categories for the top bar
const quickCategories = [
  "All",
  "Fiction",
  "Mystery",
  "Non-Fiction",
  "Science Fiction & Fantasy",
  "Self Help",
  "Romance",
  "History",
  "Thriller & Suspense",
  "Biography",
  "Children's Books",
  "Business & Economics",
  "Cookbooks, Food & Wine",
  "Art & Photography",
  "Graphic Novels & Comics",
  "Poetry",
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "default", label: "Featured" },
  { value: "title-asc", label: "Title: A → Z" },
  { value: "title-desc", label: "Title: Z → A" },
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

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function FilterGridIcon({ className }: { className?: string }) {
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
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );
}

function BookOpenIcon({ className }: { className?: string }) {
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
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[22px] border border-amber-900/10 bg-paper-elevated p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/80 animate-pulse">
      <div className="relative mb-4 flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-amber-900/5 dark:bg-gray-800" />
      <div className="flex flex-1 flex-col space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2 flex-1">
            <div className="h-5 w-3/4 rounded-md bg-amber-900/10 dark:bg-gray-700" />
            <div className="h-3.5 w-1/2 rounded bg-amber-900/5 dark:bg-gray-800" />
          </div>
          <div className="h-6 w-16 rounded-full bg-amber-900/10 dark:bg-gray-700" />
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-3 w-full rounded bg-amber-900/5 dark:bg-gray-800" />
          <div className="h-3 w-5/6 rounded bg-amber-900/5 dark:bg-gray-800" />
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <div className="h-9 w-20 rounded-full bg-amber-900/10 dark:bg-gray-700" />
        <div className="h-9 w-28 rounded-full bg-amber-900/10 dark:bg-gray-700" />
      </div>
    </div>
  );
}

function Browse() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activeCategory, setActiveCategory] = useState(() => {
    const fromUrl = searchParams.get("category");
    return fromUrl && (categories as readonly string[]).includes(fromUrl) ? fromUrl : "All";
  });

  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [genreModalOpen, setGenreModalOpen] = useState(false);
  const [genreFilterSearch, setGenreFilterSearch] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Sync category changes with URL search params
  const handleCategorySelect = useCallback((category: string) => {
    setActiveCategory(category);
    if (category === "All") {
      searchParams.delete("category");
      setSearchParams(searchParams, { replace: true });
    } else {
      searchParams.set("category", category);
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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

  // Keyboard shortcut '/' or 'Cmd+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) &&
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        if (genreModalOpen) setGenreModalOpen(false);
        if (sortOpen) setSortOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [genreModalOpen, sortOpen]);

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

  // Scroll checking for categories container
  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scrollCategories = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 320;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Compute live count for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: books.length };
    for (const cat of categories) {
      if (cat === "All") continue;
      counts[cat] = books.filter((b) =>
        b.category?.some((c) => c.toLowerCase() === cat.toLowerCase())
      ).length;
    }
    return counts;
  }, [books]);

  // Filtered & sorted book collection
  const filteredBooks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    let result = books.filter((book) => {
      const matchesSearch =
        !query ||
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.description.toLowerCase().includes(query) ||
        book.category?.some((cat) => cat.toLowerCase().includes(query));

      const matchesCategory =
        activeCategory === "All" ||
        book.category?.some(
          (cat) => cat.toLowerCase() === activeCategory.toLowerCase()
        );

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "title-asc") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "title-desc") {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [books, searchTerm, activeCategory, sortBy]);

  // Filtered genres inside the "All Genres" popup drawer
  const filteredModalClusters = useMemo(() => {
    const q = genreFilterSearch.trim().toLowerCase();
    if (!q) return genreClusters;

    return genreClusters
      .map((cluster) => ({
        ...cluster,
        genres: cluster.genres.filter((g) => g.toLowerCase().includes(q)),
      }))
      .filter((cluster) => cluster.genres.length > 0);
  }, [genreFilterSearch]);

  const hasActiveFilters = searchTerm !== "" || activeCategory !== "All";
  const activeSortLabel =
    sortOptions.find((o) => o.value === sortBy)?.label ?? "Featured";

  return (
    <div className="min-h-screen bg-paper dark:bg-gray-950 text-amber-950 dark:text-amber-100 font-sans selection:bg-amber-900 selection:text-white overflow-x-hidden w-full max-w-full">
      <Nav />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        {/* ── Editorial Header ── */}
        <section className="relative overflow-hidden rounded-2xl border border-amber-900/10 bg-paper-elevated px-6 py-10 dark:border-gray-800 dark:bg-gray-900/60 sm:px-10 sm:py-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-[13px] font-medium tracking-[0.12em] text-amber-700/80 uppercase dark:text-amber-400/80">
                The collection
              </p>
              <h1 className="font-serif text-3xl font-medium tracking-tight text-amber-950 dark:text-amber-50 sm:text-4xl md:text-5xl">
                Browse our shelves
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-amber-900/70 dark:text-amber-200/60 sm:text-base">
                Discover pre-loved treasures with history and character. Every book is inspected and graded with honest care.
              </p>
            </div>

            {!loading && (
              <div className="flex items-center gap-4 shrink-0 rounded-2xl border border-amber-900/10 bg-paper-elevated/80 px-5 py-3.5 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/70 shadow-xs">
                <div>
                  <p className="font-serif text-2xl sm:text-3xl font-semibold text-amber-900 dark:text-amber-300">
                    {books.length}
                  </p>
                  <p className="text-xs font-medium text-amber-900/50 dark:text-amber-200/50">
                    Books available
                  </p>
                </div>
                <div className="h-8 w-px bg-amber-900/10 dark:bg-gray-800" />
                <div>
                  <p className="font-serif text-2xl sm:text-3xl font-semibold text-amber-900 dark:text-amber-300">
                    {categories.length - 1}
                  </p>
                  <p className="text-xs font-medium text-amber-900/50 dark:text-amber-200/50">
                    Genres cataloged
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Search Bar & Controls Row ── */}
        <section className="mt-8 space-y-4">
          <div className="flex flex-row gap-2 sm:gap-3 items-center w-full">
            {/* Search Input Box */}
            <div
              className={`group relative flex flex-1 items-center gap-2 sm:gap-3 rounded-2xl border bg-paper-elevated dark:bg-gray-900 px-3 sm:px-4 py-0.5 sm:py-1 shadow-sm transition-all duration-300 ${
                searchFocused
                  ? "border-amber-500/80 dark:border-amber-500/60 shadow-lg shadow-amber-500/10 ring-4 ring-amber-500/10"
                  : "border-amber-900/15 dark:border-gray-700 hover:border-amber-900/30 dark:hover:border-gray-600 hover:shadow-md"
              }`}
            >
              <SearchIcon
                className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                  searchFocused
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-amber-900/40 dark:text-gray-500"
                }`}
              />

              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search books..."
                className="flex-1 bg-transparent py-2.5 sm:py-3 text-sm text-amber-950 dark:text-amber-100 placeholder:text-amber-900/40 dark:placeholder:text-gray-500 focus:outline-none sm:text-base w-full min-w-0"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    inputRef.current?.focus();
                  }}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-gray-800 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-gray-700 transition-all duration-150 hover:scale-110 active:scale-95"
                  aria-label="Clear search"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              )}

              {!searchTerm && (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-amber-900/10 dark:border-gray-700 bg-amber-50/80 dark:bg-gray-800/80 px-2 py-0.5 text-xs font-medium text-amber-900/40 dark:text-gray-400 select-none flex-shrink-0">
                  /
                </kbd>
              )}
            </div>

            {/* Sort Dropdown */}
            <div ref={sortRef} className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setSortOpen((o) => !o)}
                className={`inline-flex w-auto items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 rounded-2xl border px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold transition-all duration-200 ${
                  sortOpen
                    ? "border-amber-600/70 dark:border-amber-500/70 bg-amber-50 dark:bg-gray-800 text-amber-900 dark:text-amber-100 shadow-md ring-2 ring-amber-500/15"
                    : "border-amber-900/15 dark:border-gray-700 bg-paper-elevated dark:bg-gray-900 text-amber-900 dark:text-amber-200 hover:border-amber-500/40 hover:bg-amber-50/50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <SortIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="hidden sm:inline text-xs text-amber-900/50 dark:text-gray-400 font-normal">Sort:</span>
                  <span className="text-xs sm:text-sm whitespace-nowrap">{activeSortLabel}</span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div
                className={`absolute right-0 top-full mt-2 w-56 rounded-2xl border border-amber-900/10 dark:border-gray-700 bg-paper-elevated/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-xl shadow-amber-950/10 dark:shadow-black/50 z-50 overflow-hidden origin-top-right transition-all duration-200 ${
                  sortOpen
                    ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
                    : "scale-95 opacity-0 pointer-events-none -translate-y-2"
                }`}
              >
                <div className="py-2">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800/50 dark:text-gray-400">
                    Sort books by
                  </div>
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.value);
                        setSortOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-3.5 py-2.5 text-sm transition-colors duration-150 ${
                        sortBy === opt.value
                          ? "bg-amber-100/70 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-semibold"
                          : "text-amber-900/80 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-gray-800 font-medium"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.value && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-amber-700 dark:text-amber-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Redesigned Category Section ── */}
          <div className="rounded-2xl border border-amber-900/10 bg-paper-elevated p-2 sm:p-3 dark:border-gray-800 dark:bg-gray-900/80 shadow-xs">
            <div className="flex items-center gap-2">
              {/* "All Genres" Modal Trigger Button */}
              <button
                type="button"
                onClick={() => {
                  setGenreFilterSearch("");
                  setGenreModalOpen(true);
                }}
                className={`relative inline-flex flex-shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                  activeCategory !== "All" && !quickCategories.includes(activeCategory)
                    ? "border-amber-600 bg-amber-600 text-white shadow-md shadow-amber-600/20"
                    : "border-amber-900/15 bg-amber-50/80 text-amber-900 hover:border-amber-500/50 hover:bg-amber-100/60 dark:border-gray-700 dark:bg-gray-800 dark:text-amber-200 dark:hover:bg-gray-700"
                }`}
                title="Browse all categories"
              >
                <FilterGridIcon className="h-4 w-4" />
                <span className="whitespace-nowrap">All Genres</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[11px] font-bold ${
                  activeCategory !== "All" && !quickCategories.includes(activeCategory)
                    ? "bg-white/20 text-white"
                    : "bg-amber-200/70 text-amber-900 dark:bg-gray-700 dark:text-amber-300"
                }`}>
                  {categories.length - 1}
                </span>
              </button>

              <div className="h-6 w-px bg-amber-900/10 dark:bg-gray-700 flex-shrink-0 hidden sm:block" />

              {/* Quick-Scroll Category Track */}
              <div className="relative flex-1 min-w-0 overflow-hidden">
                {/* Left gradient scroll button */}
                {canScrollLeft && (
                  <button
                    type="button"
                    onClick={() => scrollCategories("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-paper-elevated/95 dark:bg-gray-800/95 border border-amber-900/10 dark:border-gray-700 text-amber-900 dark:text-amber-200 shadow-md hover:scale-110 active:scale-95 transition-all"
                    aria-label="Scroll categories left"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                )}

                {/* Right gradient scroll button */}
                {canScrollRight && (
                  <button
                    type="button"
                    onClick={() => scrollCategories("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-paper-elevated/95 dark:bg-gray-800/95 border border-amber-900/10 dark:border-gray-700 text-amber-900 dark:text-amber-200 shadow-md hover:scale-110 active:scale-95 transition-all"
                    aria-label="Scroll categories right"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                )}

                {/* Horizontal Scroll Area */}
                <div
                  ref={scrollContainerRef}
                  className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 px-1"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {quickCategories.map((categoryName) => {
                    const isActive = activeCategory === categoryName;
                    const count = categoryCounts[categoryName] ?? 0;
                    return (
                      <button
                        key={categoryName}
                        type="button"
                        onClick={() => handleCategorySelect(categoryName)}
                        className={`group relative inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 select-none ${
                          isActive
                            ? "bg-gradient-to-r from-amber-700 to-amber-600 dark:from-amber-600 dark:to-amber-500 text-white shadow-md shadow-amber-700/25 dark:shadow-amber-500/20 scale-[1.02]"
                            : "bg-amber-50/50 dark:bg-gray-800/60 border border-amber-900/10 dark:border-gray-700/80 text-amber-900/80 dark:text-amber-200/90 hover:border-amber-400/50 dark:hover:border-amber-500/40 hover:bg-amber-100/50 dark:hover:bg-gray-700/80 hover:text-amber-950 dark:hover:text-amber-100 hover:scale-[1.02] active:scale-100"
                        }`}
                      >
                        <span>{categoryName}</span>
                        {!loading && count > 0 && (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-amber-900/5 dark:bg-gray-700 text-amber-900/60 dark:text-gray-400 group-hover:bg-amber-900/10"
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* If selected category is NOT in quick list, show active indicator */}
            {activeCategory !== "All" && !quickCategories.includes(activeCategory) && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-100/50 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-800/40 px-3.5 py-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-amber-900/70 dark:text-amber-300/70">Selected Genre:</span>
                  <span className="font-bold text-amber-950 dark:text-amber-100">{activeCategory}</span>
                  {!loading && (
                    <span className="rounded-full bg-amber-200 dark:bg-amber-900/60 px-2 py-0.5 text-[11px] font-semibold text-amber-900 dark:text-amber-200">
                      {categoryCounts[activeCategory] ?? 0} books
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleCategorySelect("All")}
                  className="inline-flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-300 hover:underline"
                >
                  <XIcon className="h-3 w-3" />
                  Reset to All
                </button>
              </div>
            )}
          </div>

          {/* ── Active Filters & Meta Summary Bar ── */}
          {!loading && !error && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-amber-900/60 dark:text-gray-400">
                  Showing{" "}
                  <strong className="font-semibold text-amber-950 dark:text-amber-100">
                    {filteredBooks.length}
                  </strong>{" "}
                  {filteredBooks.length === 1 ? "book" : "books"}
                </span>

                {/* Active category pill */}
                {activeCategory !== "All" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800/50 px-2.5 py-0.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
                    {activeCategory}
                    <button
                      type="button"
                      onClick={() => handleCategorySelect("All")}
                      className="hover:text-amber-700 dark:hover:text-amber-100"
                      aria-label="Remove category filter"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {/* Active search pill */}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800/50 px-2.5 py-0.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
                    <SearchIcon className="h-3 w-3" />
                    "{searchTerm}"
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="hover:text-amber-700 dark:hover:text-amber-100"
                      aria-label="Remove search filter"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    handleCategorySelect("All");
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 hover:underline"
                >
                  <XIcon className="h-3 w-3" />
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </section>

        {/* ── Results / Book Shelves Grid ── */}
        <section className="mt-8">
          {/* Loading Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-3xl bg-red-50 dark:bg-red-950/20 p-10 text-center border border-red-200 dark:border-red-800/50">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-600 dark:text-red-400"
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
              </div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">
                Unable to load shelves
              </h3>
              <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Empty Results State */}
          {!loading && !error && filteredBooks.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-amber-900/15 dark:border-gray-800 bg-paper-elevated dark:bg-gray-900/60 p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-900/10 dark:border-gray-700">
                <BookOpenIcon className="h-8 w-8 text-amber-700 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-amber-950 dark:text-amber-100">
                No matching books found
              </h3>
              <p className="mt-2 max-w-md mx-auto text-sm text-amber-900/60 dark:text-amber-200/50">
                {hasActiveFilters
                  ? "We couldn't find any titles matching your current filter. Try clearing filters or selecting another genre."
                  : "Our shelves are being restocked. Please check back shortly."}
              </p>

              {/* Suggestions chips */}
              <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                <span className="text-xs text-amber-900/40 dark:text-gray-500 self-center">Try:</span>
                {["Fiction", "Mystery", "Self Help", "Science Fiction & Fantasy"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      handleCategorySelect(cat);
                    }}
                    className="inline-flex items-center rounded-full border border-amber-900/10 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100 dark:border-gray-700 dark:bg-gray-800 dark:text-amber-300 transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    handleCategorySelect("All");
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-all duration-150 hover:scale-105 active:scale-95 shadow-md shadow-amber-700/20"
                >
                  <XIcon className="h-3.5 w-3.5" />
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Book Cards Grid */}
          {!loading && !error && filteredBooks.length > 0 && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {filteredBooks.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ── "All 30 Genres" Department Modal / Drawer ── */}
      {genreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-amber-950/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setGenreModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-4xl rounded-3xl border border-amber-900/15 bg-paper-elevated dark:bg-gray-900 p-6 sm:p-8 shadow-2xl shadow-amber-950/20 dark:shadow-black/60 z-10 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-amber-900/10 dark:border-gray-800 pb-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-amber-950 dark:text-amber-50">
                  All Book Categories
                </h2>
                <p className="mt-1 text-sm text-amber-900/60 dark:text-amber-200/50">
                  Select a department to filter our pre-loved shelves ({categories.length - 1} categories available)
                </p>
              </div>

              <button
                type="button"
                onClick={() => setGenreModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 dark:bg-gray-800 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close modal"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Instant Filter Search Inside Modal */}
            <div className="py-4 border-b border-amber-900/10 dark:border-gray-800">
              <div className="relative flex items-center gap-2 rounded-xl border border-amber-900/15 dark:border-gray-700 bg-paper dark:bg-gray-800 px-3.5 py-2">
                <SearchIcon className="h-4 w-4 text-amber-900/40 dark:text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={genreFilterSearch}
                  onChange={(e) => setGenreFilterSearch(e.target.value)}
                  placeholder="Filter categories (e.g. History, Cooking, Fiction, Psychology)..."
                  className="flex-1 bg-transparent text-sm text-amber-950 dark:text-amber-100 placeholder:text-amber-900/40 dark:placeholder:text-gray-500 focus:outline-none"
                  autoFocus
                />
                {genreFilterSearch && (
                  <button
                    type="button"
                    onClick={() => setGenreFilterSearch("")}
                    className="text-amber-800 dark:text-amber-400 hover:text-amber-950"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body: Organized Genre Groups */}
            <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
              {/* Quick All Reset in Modal */}
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => {
                    handleCategorySelect("All");
                    setGenreModalOpen(false);
                  }}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    activeCategory === "All"
                      ? "bg-amber-700 text-white shadow-md"
                      : "bg-amber-100/80 dark:bg-gray-800 text-amber-900 dark:text-amber-200 hover:bg-amber-200"
                  }`}
                >
                  <span>All Categories</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                    activeCategory === "All" ? "bg-white/20 text-white" : "bg-amber-900/10 text-amber-900 dark:text-gray-300"
                  }`}>
                    {books.length}
                  </span>
                </button>
              </div>

              {filteredModalClusters.length === 0 ? (
                <div className="py-10 text-center text-sm text-amber-900/50 dark:text-gray-400">
                  No categories found matching "{genreFilterSearch}".
                </div>
              ) : (
                filteredModalClusters.map((cluster) => (
                  <div key={cluster.name} className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                      {cluster.name}
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                      {cluster.genres.map((genre) => {
                        const isActive = activeCategory === genre;
                        const count = categoryCounts[genre] ?? 0;

                        return (
                          <button
                            key={genre}
                            type="button"
                            onClick={() => {
                              handleCategorySelect(genre);
                              setGenreModalOpen(false);
                            }}
                            className={`group flex items-center justify-between rounded-xl border p-3 text-left transition-all duration-150 ${
                              isActive
                                ? "border-amber-600 bg-amber-700 text-white shadow-md scale-[1.02]"
                                : "border-amber-900/10 dark:border-gray-800 bg-paper dark:bg-gray-800/70 text-amber-950 dark:text-amber-100 hover:border-amber-500/40 hover:bg-amber-50 dark:hover:bg-gray-800 hover:scale-[1.01]"
                            }`}
                          >
                            <span className="text-sm font-medium truncate min-w-0 pr-2">{genre}</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-bold flex-shrink-0 ${
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-amber-100 dark:bg-gray-700 text-amber-800 dark:text-amber-300 group-hover:bg-amber-200"
                              }`}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-amber-900/10 dark:border-gray-800 pt-4 flex items-center justify-between">
              <span className="text-xs text-amber-900/50 dark:text-gray-400">
                Tip: Press <kbd className="font-mono bg-amber-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[10px]">Esc</kbd> to close
              </span>
              <button
                type="button"
                onClick={() => setGenreModalOpen(false)}
                className="rounded-xl bg-amber-800 dark:bg-amber-700 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Utility styling */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default Browse;
