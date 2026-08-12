import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/themeContext";
import { apiFetch } from "../service/apiClient";
import Footer from "../components/Footer";
import logoImage from "../assets/db logo.png";
import HeroImgSpines from "../assets/hero-imgs-optimized/hero-img2.webp";
import HeroImgShelves from "../assets/hero-imgs-optimized/hero-shelves.webp";
import HeroImgStack from "../assets/hero-imgs-optimized/hero-stack.webp";
import HeroImgOpen from "../assets/hero-imgs-optimized/hero-open.webp";
import HeroImgBrowse from "../assets/hero-imgs-optimized/hero-browse.webp";
import HeroImgReading from "../assets/hero-imgs-optimized/hero-reading.webp";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Hero story (second-hand book journey):
 * 1. Discover shelves → 2. Browse collection → 3. Choose a stack
 * → 4. Feel the worn spines → 5. Open the pages → 6. Read & enjoy
 */
const HERO_SLIDES = [
  {
    src: HeroImgShelves,
    alt: "Discover — shelves full of pre-loved books waiting to be found",
    kenBurns: "scale(1.15) translate(2%, -1%)",
  },
  {
    src: HeroImgBrowse,
    alt: "Browse — colorful used bookstore collection to explore",
    kenBurns: "scale(1.12) translate(-2%, -1%)",
  },
  {
    src: HeroImgStack,
    alt: "Choose — stack of second-hand paperbacks ready for a new home",
    kenBurns: "scale(1.1) translate(-1%, -2%)",
  },
  {
    src: HeroImgSpines,
    alt: "Preloved — worn spines that show every book has a past",
    kenBurns: "scale(1.12) translate(-2%, 1%)",
  },
  {
    src: HeroImgOpen,
    alt: "Open — yellowed pages of a book starting its second life",
    kenBurns: "scale(1.14) translate(1%, 2%)",
  },
  {
    src: HeroImgReading,
    alt: "Enjoy — someone reading a pre-loved book in a quiet moment",
    kenBurns: "scale(1.12) translate(1%, -1%)",
  },
] as const;

const HERO_SLIDE_MS = 6500;

type BookItem = {
  _id: string;
  title: string;
  author: string;
  price: number;
  imgUrl?: string;
  category?: string[];
};

// ── Icons ──
function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
      />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7Z"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
      />
    </svg>
  );
}

const steps = [
  {
    title: "Browse & Discover",
    desc: "Explore hundreds of pre-loved books across Fiction, Non-Fiction, Science, History, and more.",
  },
  {
    title: "Buy or Request",
    desc: "Found what you love? Add to cart. Can't find it? Submit a book request and we'll source it.",
  },
  {
    title: "Sell via Contact Us",
    desc: "Have books gathering dust? Contact us via Call/WhatsApp or Email to sell your pre-loved books.",
  },
];

const browseCategories = [
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

const perks = [
  {
    title: "Condition Checked",
    desc: "Every book is inspected and honestly graded before it reaches the shelf, so you know exactly what you're getting.",
  },
  {
    title: "Fair Prices",
    desc: "Pre-loved means a fraction of retail. Build your library without emptying your wallet.",
  },
  {
    title: "Read Sustainably",
    desc: "Every second-hand book you buy keeps paper out of landfills and gives a good story another reader.",
  },
  {
    title: "Contact to Sell",
    desc: "Want to sell? Reach us directly on Call/WhatsApp (0774965624 / 0783907616) or Email to arrange pickup.",
  },
];

export default function Landing() {
  const { isDark, toggleTheme } = useTheme();
  const [books, setBooks] = useState<BookItem[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [totalBooks, setTotalBooks] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const booksRef = useRef<HTMLDivElement>(null);
  const perksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<BookItem[] | { books?: BookItem[] }>(
          "/books",
        );
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.books)
            ? data.books
            : [];
        if (cancelled) return;
        setTotalBooks(list.length);
        setBooks(list.slice(0, 6));
      } catch {
        if (!cancelled) setBooks([]);
      } finally {
        if (!cancelled) setBooksLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    setIsMounted(true); // Trigger initial hero slide animation
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Rotate second-hand book hero backgrounds
  useEffect(() => {
    const id = window.setTimeout(() => {
      setHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, HERO_SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [heroSlide]);

  // Hero entrance — run once; do not re-run when books load
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".landing-hero-text > *", {
        y: 40,
        opacity: 0,
        duration: 0.85,
        stagger: 0.12,
        ease: "power3.out",
        clearProps: "all",
      });
    });
    return () => ctx.revert();
  }, []);

  // Scroll motion only (no opacity) so content never gets stuck invisible.
  // Previous gsap.from({ opacity: 0 }) + ScrollTrigger hid category chips
  // and book cards when triggers did not fire (e.g. after books re-render).
  useEffect(() => {
    // Wait until books fetch settles so the featured grid exists in the DOM
    if (booksLoading) return;

    const ctx = gsap.context(() => {
      const reveals: Array<[HTMLDivElement | null, string, number]> = [
        [stepsRef.current, ".step-card", 24],
        [categoriesRef.current, ".category-chip", 12],
        [booksRef.current, ".book-card", 20],
        [perksRef.current, ".perk-card", 20],
      ];

      reveals.forEach(([container, selector, distance]) => {
        if (!container) return;
        const items = container.querySelectorAll(selector);
        if (!items.length) return;

        // Ensure visible before animating (guards against leftover inline styles)
        gsap.set(items, { clearProps: "opacity,visibility,transform" });

        gsap.from(items, {
          y: distance,
          duration: 0.45,
          stagger: 0.04,
          ease: "power3.out",
          immediateRender: false,
          clearProps: "transform",
          scrollTrigger: {
            trigger: container,
            start: "top 92%",
            toggleActions: "play none none none",
            once: true,
          },
        });
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    });

    return () => ctx.revert();
  }, [books, booksLoading]);

  const stats = [
    {
      value: totalBooks > 0 ? `${totalBooks}+` : "100s",
      label: "Books in stock",
      hint: "Ready to browse",
    },
    {
      value: String(browseCategories.length),
      label: "Categories",
      hint: "Genres covered",
    },
    {
      value: "100%",
      label: "Condition checked",
      hint: "Honest grading",
    },
    {
      value: "Free",
      label: "Contact to Sell",
      hint: "Direct assistance",
    },
  ];

  return (
    <div className="min-h-screen bg-paper dark:bg-gray-950 text-amber-950 dark:text-amber-100 font-sans selection:bg-amber-900 selection:text-white overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav
        className={`fixed top-0 left-0 z-[999] transition-all duration-300 ${
          scrolled
            ? "bg-paper-elevated/95 dark:bg-gray-900/95 backdrop-blur-2xl border-b border-amber-900/15 dark:border-gray-700/60 shadow-md py-2.5"
            : "bg-paper/20 dark:bg-gray-900/20 backdrop-blur-sm border-b-0 shadow-none py-4 dark"
        }`}
        style={{ right: "var(--scrollbar-width, 0px)" }}
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex w-full items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold tracking-wider transition-transform hover:scale-[1.02] active:scale-95 sm:gap-2.5 sm:text-2xl"
            >
              <img
                src={logoImage}
                alt="DustedBooks logo"
                className="h-9 w-9 object-contain sm:h-11 sm:w-11"
              />
              <span className="font-brand bg-clip-text text-transparent bg-gradient-to-r from-amber-900 to-amber-700 dark:from-amber-400 dark:to-amber-300">
                DustedBooks
              </span>
            </Link>

            <div className="flex items-center gap-1 sm:gap-3">
              <Link
                to="/browse"
                className="hidden rounded-md px-3.5 py-2 text-sm font-medium text-amber-900/80 transition-colors hover:bg-amber-900/5 hover:text-amber-950 dark:text-amber-200/80 dark:hover:bg-white/10 dark:hover:text-amber-100 md:inline-flex"
              >
                Browse
              </Link>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  isDark ? "Switch to light mode" : "Switch to dark mode"
                }
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-amber-950/75 dark:text-amber-200/75 transition-colors hover:bg-amber-900/10 dark:hover:bg-white/10"
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>

              <Link
                to="/signup"
                className="hidden rounded-md border border-amber-900/15 px-4 py-2 text-sm font-medium text-amber-950 transition-colors hover:bg-amber-900/5 dark:border-amber-300/20 dark:text-amber-100 dark:hover:bg-gray-800 sm:inline-flex"
              >
                Sign up
              </Link>

              <Link
                to="/login"
                className="rounded-md bg-amber-600 px-3 py-1.5 sm:px-5 sm:py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-amber-500 hover:shadow-md hover:shadow-amber-600/20 active:scale-95"
              >
                Sign in
              </Link>

              <button
                type="button"
                className="md:hidden relative h-9 w-9 sm:h-10 sm:w-10 select-none rounded-full text-center align-middle transition-colors hover:bg-amber-900/5 dark:hover:bg-white/10 active:bg-amber-900/10 flex items-center justify-center border border-transparent text-amber-950/75 dark:text-amber-200/75"
                aria-label="Toggle navigation"
                aria-expanded={isNavOpen}
                aria-controls="mobile-landing-nav"
                onClick={() => setIsNavOpen((prev) => !prev)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={
                      isNavOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>
            </div>
          </div>

          <div
            id="mobile-landing-nav"
            className={`w-full overflow-hidden md:hidden transition-all duration-300 ease-in-out ${
              isNavOpen ? "max-h-64 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
            }`}
            aria-hidden={!isNavOpen}
          >
            <ul className="flex flex-col gap-2 pb-3">
              <li>
                <Link
                  to="/browse"
                  className="block rounded-md px-4 py-2.5 text-sm font-medium text-amber-900/80 transition-colors hover:bg-amber-900/5 hover:text-amber-950 dark:text-amber-200/80 dark:hover:bg-white/10 dark:hover:text-amber-100"
                >
                  Browse
                </Link>
              </li>
              <li className="sm:hidden">
                <Link
                  to="/signup"
                  className="block rounded-md px-4 py-2.5 text-sm font-medium text-amber-900/80 transition-colors hover:bg-amber-900/5 hover:text-amber-950 dark:text-amber-200/80 dark:hover:bg-white/10 dark:hover:text-amber-100"
                >
                  Sign up
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-20 sm:pt-24"
      >
        {/* Dynamic second-hand book slideshow + Ken Burns zoom */}
        <div className="absolute inset-0" aria-hidden="true">
          {HERO_SLIDES.map((slide, index) => {
            const isActive = index === heroSlide;
            return (
              <div
                key={slide.src}
                className="absolute inset-0 transition-opacity duration-[1400ms] ease-in-out"
                style={{
                  opacity: isActive ? 1 : 0,
                  zIndex: isActive ? 1 : 0,
                }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
                  style={{
                    backgroundImage: `url(${slide.src})`,
                    transform:
                      isActive && isMounted ? slide.kenBurns : "scale(1)",
                    transition: isActive
                      ? `transform ${HERO_SLIDE_MS + 400}ms ease-out`
                      : "transform 0ms 1400ms",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Warm paper / amber overlays for second-hand book mood */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-b from-shelf-deep/75 via-shelf/55 to-shelf-deep/80" />
        <div className="absolute inset-0 z-[2] bg-gradient-to-tr from-amber-900/25 via-transparent to-orange-900/15" />
        <div className="absolute inset-x-0 bottom-0 z-[2] h-32 bg-gradient-to-t from-shelf-deep/70 to-transparent" />

        {/* Soft floating dust motes */}
        <div
          className="pointer-events-none absolute inset-0 z-[3] overflow-hidden"
          aria-hidden="true"
        >
          <span className="absolute left-[12%] top-[28%] h-1 w-1 animate-pulse rounded-full bg-amber-200/40" />
          <span className="absolute left-[78%] top-[22%] h-1.5 w-1.5 animate-pulse rounded-full bg-amber-100/30 [animation-delay:700ms]" />
          <span className="absolute left-[55%] top-[65%] h-1 w-1 animate-pulse rounded-full bg-orange-200/35 [animation-delay:1200ms]" />
          <span className="absolute left-[30%] top-[72%] h-0.5 w-0.5 animate-pulse rounded-full bg-amber-50/40 [animation-delay:400ms]" />
          <span className="absolute left-[88%] top-[48%] h-1 w-1 animate-pulse rounded-full bg-amber-200/25 [animation-delay:900ms]" />
        </div>

        <div className="landing-hero-text relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-16 text-center sm:px-6 sm:py-20">
          <p className="mb-5 text-[13px] font-medium tracking-[0.14em] text-amber-100/80 uppercase sm:mb-6">
            Preloved books · Sri Lanka
          </p>

          <h1 className="font-serif text-[2.6rem] font-medium leading-[1.12] text-white sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            Give books a{" "}
            <em className="not-italic font-medium text-amber-200">
              second life
            </em>
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/75 sm:mt-6 sm:text-lg">
            Buy pre-loved titles for less, sell the ones you&apos;ve finished,
            or request something we don&apos;t have yet.
          </p>

          <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:justify-center sm:gap-3">
            <Link
              to="/browse"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-[15px] font-medium text-stone-900 transition-colors hover:bg-amber-400"
            >
              Browse books
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/40 bg-white/10 px-6 py-3 text-[15px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/18"
            >
              Create account
            </Link>
          </div>

          {/* Slide indicators — second-hand book scenes */}
          <div
            className="mt-10 flex items-center gap-2"
            role="tablist"
            aria-label="Hero background scenes"
          >
            {HERO_SLIDES.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                role="tab"
                aria-selected={index === heroSlide}
                aria-label={slide.alt}
                onClick={() => setHeroSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === heroSlide
                    ? "w-8 bg-amber-400 shadow-sm shadow-amber-500/40"
                    : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="relative z-10 -mt-8 px-4 sm:-mt-10 sm:px-6">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-lg border border-amber-900/10 bg-paper-elevated shadow-lg shadow-amber-950/8 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/30">
          <ul className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, index) => {
              const isLastColMobile = index % 2 === 1;
              const isLastRowMobile = index >= 2;
              const isLastDesktop = index === stats.length - 1;
              return (
                <li
                  key={stat.label}
                  className={[
                    "flex items-center gap-3 px-4 py-4 sm:gap-3.5 sm:px-5 sm:py-5",
                    !isLastColMobile
                      ? "border-r border-amber-900/8 dark:border-gray-700/80"
                      : "",
                    !isLastRowMobile
                      ? "border-b border-amber-900/8 dark:border-gray-700/80"
                      : "",
                    "md:border-b-0",
                    !isLastDesktop
                      ? "md:border-r md:border-amber-900/8 dark:md:border-gray-700/80"
                      : "md:border-r-0",
                  ].join(" ")}
                >
                  <div className="min-w-0 text-left">
                    <p className="font-serif truncate text-xl font-semibold leading-none text-amber-800 dark:text-amber-300 sm:text-2xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 truncate text-xs font-medium leading-snug text-amber-950/75 dark:text-amber-100/80 sm:text-sm">
                      {stat.label}
                    </p>
                    <p className="mt-0.5 hidden truncate text-[11px] leading-snug text-amber-900/45 dark:text-amber-200/40 sm:block">
                      {stat.hint}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-lg sm:mb-12">
            <p className="mb-2 text-[13px] font-medium tracking-[0.12em] text-amber-700/80 uppercase dark:text-amber-400/80">
              How it works
            </p>
            <h2 className="font-serif text-3xl font-medium tracking-tight text-amber-950 dark:text-amber-50 sm:text-4xl">
              Three steps to get going
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-amber-900/55 dark:text-amber-200/45">
              Buy, sell, or request — whatever you need from the shelf.
            </p>
          </div>

          <div
            ref={stepsRef}
            className="grid gap-px overflow-hidden rounded-lg border border-amber-900/10 bg-amber-900/10 dark:border-gray-700 dark:bg-gray-700 md:grid-cols-3"
          >
            {steps.map((step, i) => {
              return (
                <div
                  key={step.title}
                  className="step-card bg-paper p-6 dark:bg-gray-900 sm:p-7"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <span className="font-serif text-sm font-medium text-amber-700/50 dark:text-amber-400/40">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="font-serif mb-2 text-lg font-medium text-amber-950 dark:text-amber-50">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-amber-900/55 dark:text-amber-200/45">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Browse by Category ── */}
      <section className="border-y border-amber-900/8 bg-paper-elevated px-5 py-16 dark:border-gray-800 dark:bg-gray-900/40 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[13px] font-medium tracking-[0.12em] text-amber-700/80 uppercase dark:text-amber-400/80">
                The shelves
              </p>
              <h2 className="font-serif text-3xl font-medium tracking-tight text-amber-950 dark:text-amber-50 sm:text-4xl">
                Browse by category
              </h2>
            </div>
            <Link
              to="/browse"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-amber-800/70 transition-colors hover:text-amber-700 dark:text-amber-300/70 dark:hover:text-amber-300"
            >
              See everything
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div
            ref={categoriesRef}
            className="grid grid-cols-1 border-t border-amber-900/10 dark:border-gray-700 sm:grid-cols-2 lg:grid-cols-3"
          >
            {browseCategories.map((name, index) => (
              <Link
                key={name}
                to={`/browse?category=${encodeURIComponent(name)}`}
                className="category-chip group flex items-center justify-between gap-4 border-b border-amber-900/10 px-1 py-4 transition-colors hover:bg-amber-50/60 dark:border-gray-700 dark:hover:bg-amber-950/20 sm:px-3"
              >
                <span className="flex min-w-0 items-baseline gap-3">
                  <span className="font-serif w-5 shrink-0 text-xs text-amber-700/35 dark:text-amber-400/30">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif text-lg font-medium text-amber-950 transition-colors group-hover:text-amber-800 dark:text-amber-50 dark:group-hover:text-amber-200 sm:text-xl">
                    {name}
                  </span>
                </span>
                <ArrowRightIcon className="h-4 w-4 shrink-0 text-amber-900/20 transition-all group-hover:translate-x-0.5 group-hover:text-amber-700 dark:text-amber-200/20 dark:group-hover:text-amber-400" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Books (always rendered so the section never disappears) ── */}
      <section className="px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
            <div>
              <p className="mb-2 text-[13px] font-medium tracking-[0.12em] text-amber-700/80 uppercase dark:text-amber-400/80">
                On the shelf
              </p>
              <h2 className="font-serif text-3xl font-medium tracking-tight text-amber-950 dark:text-amber-50 sm:text-4xl">
                Fresh finds
              </h2>
            </div>
            <Link
              to="/browse"
              className="group hidden items-center gap-1.5 text-sm font-medium text-amber-800/70 transition-colors hover:text-amber-700 dark:text-amber-300/70 dark:hover:text-amber-300 sm:inline-flex"
            >
              View all
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {booksLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-lg border border-amber-900/8 bg-amber-100/40 dark:border-gray-700 dark:bg-gray-800"
                />
              ))}
            </div>
          ) : books.length > 0 ? (
            <>
              <div
                ref={booksRef}
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {books.map((book) => (
                  <Link
                    key={book._id}
                    to={`/books/${book._id}`}
                    className="book-card group overflow-hidden rounded-lg border border-amber-900/10 bg-paper-elevated transition-shadow hover:shadow-md hover:shadow-amber-950/6 dark:border-gray-700 dark:bg-gray-900"
                  >
                    <div className="relative flex h-48 items-center justify-center bg-stone-100 p-4 dark:bg-gray-800 sm:h-52">
                      {book.imgUrl ? (
                        <img
                          src={book.imgUrl}
                          alt={book.title}
                          className="max-h-full max-w-[130px] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      ) : (
                        <BookOpenIcon className="h-12 w-12 text-amber-900/15 dark:text-amber-200/15" />
                      )}
                      {book.category?.[0] && (
                        <span className="absolute left-3 top-3 bg-white/90 px-2 py-0.5 text-[11px] font-medium tracking-wide text-amber-900/70 dark:bg-gray-900/80 dark:text-amber-200/70">
                          {book.category[0]}
                        </span>
                      )}
                    </div>
                    <div className="border-t border-amber-900/8 p-4 dark:border-gray-700 sm:p-5">
                      <h3 className="font-serif truncate text-base font-medium text-amber-950 dark:text-amber-50">
                        {book.title}
                      </h3>
                      <p className="mt-1 truncate text-sm text-amber-900/50 dark:text-amber-200/40">
                        {book.author}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[15px] font-semibold text-amber-800 dark:text-amber-300">
                          Rs. {book.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs font-medium text-amber-700/0 transition-colors group-hover:text-amber-700 dark:group-hover:text-amber-400">
                          View →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-8 text-center sm:hidden">
                <Link
                  to="/browse"
                  className="inline-flex items-center gap-2 rounded-md bg-amber-800 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
                >
                  Browse all books
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-amber-900/15 bg-white px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900/40">
              <BookOpenIcon className="mx-auto mb-3 h-9 w-9 text-amber-700/35 dark:text-amber-300/35" />
              <p className="font-serif text-base font-medium text-amber-950 dark:text-amber-100">
                No books listed yet
              </p>
              <p className="mt-1 text-sm text-amber-900/50 dark:text-amber-200/45">
                Check back soon, or browse the full collection.
              </p>
              <Link
                to="/browse"
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-amber-800 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
              >
                Go to browse
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Why DustedBooks ── */}
      <section className="border-t border-amber-900/8 bg-paper-elevated px-5 py-16 dark:border-gray-800 dark:bg-gray-900/40 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
            <div>
              <p className="mb-2 text-[13px] font-medium tracking-[0.12em] text-amber-700/80 uppercase dark:text-amber-400/80">
                Why DustedBooks
              </p>
              <h2 className="font-serif text-3xl font-medium leading-snug tracking-tight text-amber-950 dark:text-amber-50 sm:text-4xl">
                Books deserve more than one reader
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-amber-900/55 dark:text-amber-200/45">
                Great stories should keep circulating. Buy with confidence, sell
                without hassle, and read for less.
              </p>
              <Link
                to="/signup"
                className="group mt-6 inline-flex items-center gap-2 rounded-md bg-amber-800 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
              >
                Join free
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div
              ref={perksRef}
              className="grid gap-px overflow-hidden rounded-lg border border-amber-900/10 bg-amber-900/10 dark:border-gray-700 dark:bg-gray-700 sm:grid-cols-2"
            >
              {perks.map((perk) => {
                return (
                  <div
                    key={perk.title}
                    className="perk-card bg-paper p-5 dark:bg-gray-900 sm:p-6"
                  >
                    <h3 className="font-serif mb-1.5 text-base font-medium text-amber-950 dark:text-amber-50">
                      {perk.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-amber-900/55 dark:text-amber-200/45">
                      {perk.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-5 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl rounded-lg bg-shelf px-6 py-12 text-center dark:bg-gray-900 sm:px-10 sm:py-14">
          <p className="mb-3 text-[13px] font-medium tracking-[0.12em] text-amber-200/60 uppercase">
            Start reading
          </p>
          <h2 className="font-serif text-3xl font-medium leading-snug text-white sm:text-4xl">
            Ready to dust off your bookshelf?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-amber-100/55">
            Free account. Buy, explore, and request books when you&apos;re
            ready.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-400 px-6 py-3 text-[15px] font-medium text-stone-900 transition-colors hover:bg-amber-300"
            >
              Create free account
            </Link>
            <Link
              to="/browse"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/25 px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-white/10"
            >
              Browse first
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
