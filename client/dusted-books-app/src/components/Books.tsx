import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type BookItem = {
  _id: string;
  title: string;
  price: number;
  category?: string[];
  description?: string;
  condition?: string;
  imgUrl?: string;
};

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
      />
    </svg>
  );
}

const Books = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<BookItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(3);

  useEffect(() => {
    let rafId = 0;
    const handleResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (window.innerWidth < 640) setItemsToShow(1);
        else if (window.innerWidth < 1024) setItemsToShow(2);
        else setItemsToShow(3);
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/books");
        if (!response.ok) throw new Error("Failed to fetch books");

        const data = await response.json();
        setBooks(data.slice(0, 5));
      } catch (error) {
        console.error("Failed to load books:", error);
        setBooks([]);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    if (books.length === 0 || isPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % books.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [books.length, isPaused]);

  const visibleBooks =
    books.length > 0
      ? Array.from({ length: Math.min(itemsToShow, books.length) }).map(
          (_, offset) => books[(activeIndex + offset) % books.length],
        )
      : [];

  return (
    <section
      id="books"
      className="w-full px-5 py-12 sm:px-6 sm:py-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col items-start gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[13px] font-medium tracking-[0.12em] text-amber-700/80 uppercase dark:text-amber-400/80">
              Preloved Book Shelf
            </p>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-amber-950 dark:text-amber-50 sm:text-3xl md:text-4xl">
              Simple picks for every reader
            </h2>
          </div>
          <div className="flex gap-2">
            {books.map((book, index) => (
              <button
                key={book._id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${index === activeIndex ? "w-8 bg-amber-600 dark:bg-amber-500" : "w-2.5 bg-stone-300 dark:bg-gray-600"}`}
                aria-label={`Show ${book.title}`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 dark:border-gray-700 bg-stone-50 dark:bg-gray-800/50 p-3 sm:p-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleBooks.map((book) => (
              <article
                key={book._id}
                onClick={() => navigate(`/books/${book._id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/books/${book._id}`);
                  }
                }}
                tabIndex={0}
                role="button"
                className="group cursor-pointer rounded-xl border border-amber-900/10 bg-paper-elevated p-2.5 shadow-sm shadow-amber-950/5 transition-all hover:-translate-y-1 hover:border-amber-900/20 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:shadow-black/20 dark:hover:border-gray-500"
              >
                <div className="mb-2.5 flex items-center justify-between text-xs px-0.5">
                  <span className="rounded-md bg-amber-100/80 dark:bg-amber-900/40 px-2 py-0.5 font-medium tracking-wide text-amber-800 dark:text-amber-300">
                    {book.category?.[0] || "Featured"}
                  </span>
                </div>

                <div className="flex h-60 w-full items-center justify-center rounded-lg bg-paper-muted dark:bg-gray-700/50 p-3 transition-colors group-hover:bg-amber-50 dark:group-hover:bg-gray-700/80">
                  <img
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    src={book.imgUrl}
                    alt={book.title}
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <div className="mt-3 px-1 pb-0.5">
                  <h3 className="font-serif text-lg font-medium leading-tight text-amber-950 dark:text-amber-50 line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-amber-900/60 dark:text-amber-200/50 line-clamp-2">
                    {book.description ||
                      book.condition ||
                      "A wonderful pre-loved edition in great condition."}
                  </p>
                  <div className="mt-3.5 flex items-center justify-between">
                    <span className="font-serif text-[17px] font-semibold text-amber-800 dark:text-amber-300">
                      Rs. {book.price.toLocaleString("en-IN")}
                    </span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/books/${book._id}`);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100/60 text-amber-900 transition-colors group-hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-100 dark:group-hover:bg-amber-800/60"
                      aria-label="View book details"
                    >
                      <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Books;
