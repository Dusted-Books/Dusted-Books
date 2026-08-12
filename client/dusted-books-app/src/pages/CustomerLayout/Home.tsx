import { useEffect, useState } from "react";
import Workflow from "../../components/customer/Workflow";
import Hero from "../../components/customer/Hero";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import Books from "../../components/Books";
import { Link } from "react-router-dom";
import { apiFetch } from "../../service/apiClient";
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

/** Touch / narrow viewport → skip ScrollSmoother entirely (native scroll is faster) */
const isTouchDevice = () =>
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0 ||
  window.matchMedia("(max-width: 1024px)").matches;

// ── Data ──

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

// ── Icons ──

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

type BookCountResponse = { _id: string }[] | { books?: { _id: string }[] };

function Home() {
  const [totalBooks, setTotalBooks] = useState(0);

  useEffect(() => {
    if (isTouchDevice()) return;

    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1,
      effects: false,
      smoothTouch: false,
    });

    return () => {
      smoother.kill();
    };
  }, []);

  // Fetch total book count for the stats strip
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<BookCountResponse>("/books");
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.books)
            ? data.books
            : [];
        if (!cancelled) setTotalBooks(list.length);
      } catch {
        /* stats will show fallback "100s" */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
    <div className="bg-paper dark:bg-gray-950 text-amber-950 dark:text-amber-100 font-sans selection:bg-amber-900 selection:text-white min-h-screen overflow-x-hidden w-full max-w-full">
      <Nav />

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <section id="customer-interface">

            {/* 1. Hero — Welcome back, main CTAs */}
            <Hero />

            {/* 2. Stats strip — Social proof: show breadth of selection */}
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

            {/* 3. Books — Featured picks, the main thing they came for */}
            <Books />

            {/* 4. Browse by Category — Help them navigate deeper */}
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

                <div className="grid grid-cols-1 border-t border-amber-900/10 dark:border-gray-700 sm:grid-cols-2 lg:grid-cols-3">
                  {browseCategories.map((name, index) => (
                    <Link
                      key={name}
                      to={`/browse?category=${encodeURIComponent(name)}`}
                      className="group flex items-center justify-between gap-4 border-b border-amber-900/10 px-1 py-4 transition-colors hover:bg-amber-50/60 dark:border-gray-700 dark:hover:bg-amber-950/20 sm:px-3"
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

            {/* 5. How It Works — Remind users of the buy/request/sell process */}
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

                <div className="grid gap-px overflow-hidden rounded-lg border border-amber-900/10 bg-amber-900/10 dark:border-gray-700 dark:bg-gray-700 md:grid-cols-3">
                  {steps.map((step, i) => (
                    <div
                      key={step.title}
                      className="bg-paper p-6 dark:bg-gray-900 sm:p-7"
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
                  ))}
                </div>
              </div>
            </section>

            {/* 6. Why DustedBooks — Value reinforcement */}
            <section className="border-y border-amber-900/8 bg-paper-elevated px-5 py-16 dark:border-gray-800 dark:bg-gray-900/40 sm:px-6 sm:py-20">
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
                      to="/browse"
                      className="group mt-6 inline-flex items-center gap-2 rounded-md bg-amber-800 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
                    >
                      Browse books
                      <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>

                  <div className="grid gap-px overflow-hidden rounded-lg border border-amber-900/10 bg-amber-900/10 dark:border-gray-700 dark:bg-gray-700 sm:grid-cols-2">
                    {perks.map((perk) => (
                      <div
                        key={perk.title}
                        className="bg-paper p-5 dark:bg-gray-900 sm:p-6"
                      >
                        <h3 className="font-serif mb-1.5 text-base font-medium text-amber-950 dark:text-amber-50">
                          {perk.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-amber-900/55 dark:text-amber-200/45">
                          {perk.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Workflow — "Read Again" story */}
            <Workflow />
          </section>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Home;
