import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import HeroImgSpines from "../../assets/hero-imgs-optimized/hero-img2.webp";
import HeroImgShelves from "../../assets/hero-imgs-optimized/hero-shelves.webp";
import HeroImgStack from "../../assets/hero-imgs-optimized/hero-stack.webp";
import HeroImgOpen from "../../assets/hero-imgs-optimized/hero-open.webp";
import HeroImgBrowse from "../../assets/hero-imgs-optimized/hero-browse.webp";
import HeroImgReading from "../../assets/hero-imgs-optimized/hero-reading.webp";
import {
  usePrefersReducedMotion,
  useIsMobile,
} from "../../hooks/useReducedEffects";
import gsap from "gsap";

/**
 * Hero story (second-hand book journey):
 * 1. Discover shelves → 2. Browse collection → 3. Choose a stack
 * → 4. Feel the worn spines → 5. Open the pages → 6. Read & enjoy
 */
const HERO_SLIDES = [
  {
    src: HeroImgShelves,
    alt: "Discover — shelves full of pre-loved books waiting to be found",
    label: "Discover",
    kenBurns: "scale(1.15) translate(2%, -1%)",
  },
  {
    src: HeroImgBrowse,
    alt: "Browse — colorful used bookstore collection to explore",
    label: "Browse",
    kenBurns: "scale(1.12) translate(-2%, -1%)",
  },
  {
    src: HeroImgStack,
    alt: "Choose — stack of second-hand paperbacks ready for a new home",
    label: "Choose",
    kenBurns: "scale(1.1) translate(-1%, -2%)",
  },
  {
    src: HeroImgSpines,
    alt: "Preloved — worn spines that show every book has a past",
    label: "Preloved",
    kenBurns: "scale(1.12) translate(-2%, 1%)",
  },
  {
    src: HeroImgOpen,
    alt: "Open — yellowed pages of a book starting its second life",
    label: "Open",
    kenBurns: "scale(1.14) translate(1%, 2%)",
  },
  {
    src: HeroImgReading,
    alt: "Enjoy — someone reading a pre-loved book in a quiet moment",
    label: "Enjoy",
    kenBurns: "scale(1.12) translate(1%, -1%)",
  },
] as const;

const HERO_SLIDE_MS = 6500;
const SLIDE_COUNT = HERO_SLIDES.length;

const CONTACT_PHONES = [
  { display: "077 496 5624", tel: "0774965624", wa: "94774965624" },
  { display: "078 390 7616", tel: "0783907616", wa: "94783907616" },
] as const;

const CONTACT_EMAIL = "dustedbooks130@gmail.com";

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



function Hero() {
  const [heroSlide, setHeroSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [timerEpoch, setTimerEpoch] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  // Pause flags live in refs so the interval stays mounted and always loops.
  const pausedRef = useRef(false);
  const tabHiddenRef = useRef(false);
  const modalOpenRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  // Fancy extras only — slide autoplay is independent and always runs.
  const heavyEffects = !isMobile && !prefersReducedMotion;
  const autoplayActive = !paused && !isContactModalOpen;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    modalOpenRef.current = isContactModalOpen;
  }, [isContactModalOpen]);

  useEffect(() => {
    if (!isContactModalOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsContactModalOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isContactModalOpen]);

  const goToSlide = useCallback((index: number) => {
    setHeroSlide(((index % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);
    setTimerEpoch((n) => n + 1);
  }, []);

  // Pause only while the tab is hidden (interval itself keeps running)
  useEffect(() => {
    const onVisibility = () => {
      tabHiddenRef.current = document.hidden;
    };
    tabHiddenRef.current = document.hidden;
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Always-on loop: 0 → 1 → … → last → 0 → …
  // Resets timer when heroSlide changes (e.g. from manual dot click)
  useEffect(() => {
    let id: number;
    const tick = () => {
      if (pausedRef.current || tabHiddenRef.current || modalOpenRef.current) {
        // If paused, wait 1 second and check again
        id = window.setTimeout(tick, 1000);
        return;
      }
      setHeroSlide((prev) => (prev + 1) % SLIDE_COUNT);
      setTimerEpoch((n) => n + 1);
    };
    id = window.setTimeout(tick, HERO_SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [heroSlide]);

  // Entrance animation (skipped on mobile / reduced motion)
  useEffect(() => {
    if (!heavyEffects || !textRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(textRef.current!.children, {
        y: 36,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "all",
      });
    }, textRef);

    return () => ctx.revert();
  }, [heavyEffects]);

  const activeSlide = HERO_SLIDES[heroSlide];
  const progressStyle = {
    ["--hero-slide-ms" as string]: `${HERO_SLIDE_MS}ms`,
  } as CSSProperties;

  return (
    <section
      className="relative flex min-h-[100svh] w-full flex-col justify-center overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured book scenes"
    >
      {/* All slides always mounted — opacity crossfade + Ken Burns on desktop */}
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
              <img
                src={slide.src}
                alt=""
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  transform:
                    isActive && isMounted
                      ? slide.kenBurns
                      : "scale(1)",
                  transition: isActive
                    ? `transform ${HERO_SLIDE_MS + 400}ms ease-out`
                    : "transform 0ms 1400ms",
                  willChange: isActive ? "transform" : "auto",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Warm paper / amber overlays for text contrast */}
      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-shelf-deep/80 via-shelf/50 to-shelf-deep/85" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-tr from-amber-950/30 via-transparent to-orange-950/20" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-40 bg-gradient-to-t from-shelf-deep/80 to-transparent" />

      {/* Soft dust motes — disabled on mobile / reduced motion */}
      {heavyEffects && (
        <div
          className="pointer-events-none absolute inset-0 z-[3] overflow-hidden motion-reduce:hidden"
          aria-hidden="true"
        >
          <span className="hero-dust absolute left-[12%] top-[28%] h-1 w-1 rounded-full bg-amber-200/40" />
          <span className="hero-dust absolute left-[78%] top-[22%] h-1.5 w-1.5 rounded-full bg-amber-100/30 [animation-delay:700ms]" />
          <span className="hero-dust absolute left-[55%] top-[65%] h-1 w-1 rounded-full bg-orange-200/35 [animation-delay:1.2s]" />
          <span className="hero-dust absolute left-[30%] top-[72%] h-0.5 w-0.5 rounded-full bg-amber-50/40 [animation-delay:400ms]" />
          <span className="hero-dust absolute left-[88%] top-[48%] h-1 w-1 rounded-full bg-amber-200/25 [animation-delay:900ms]" />
        </div>
      )}

      {/* ── Hero copy ── */}
      <div
        ref={textRef}
        className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 pb-20 pt-28 text-center sm:px-6 sm:pb-24 sm:pt-32"
      >
        <p className="mb-4 text-[13px] font-medium tracking-[0.14em] text-amber-100/75 uppercase sm:mb-5">
          Welcome back
        </p>

        {/* Story chapter that tracks the slideshow */}
        <p
          className="mb-3 text-[12px] font-medium tracking-[0.16em] text-amber-200/70 uppercase"
          aria-live="polite"
        >
          <span className="text-amber-200/40">
            {String(heroSlide + 1).padStart(2, "0")}
          </span>
          <span className="mx-2 text-amber-200/25">·</span>
          {activeSlide.label}
        </p>

        <h1 className="font-serif text-balance text-[2.5rem] font-medium leading-[1.12] text-white sm:text-5xl md:text-6xl lg:text-[4rem]">
          Your next story is <span className="text-amber-200">waiting</span>
        </h1>

        <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-white/75 sm:mt-6 sm:text-lg">
          Browse pre-loved books, request titles we don&apos;t stock yet, or
          sell the ones you&apos;ve finished.
        </p>

        <div className="mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-3">
          <Link
            to="/browse"
            className="group inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-[15px] font-medium text-stone-900 transition-colors hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
          >
            Browse books
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/my-requests"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-white/35 bg-white/10 px-6 py-3 text-[15px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Request a book
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsContactModalOpen(true)}
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-amber-100/60 transition-colors hover:text-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
          </svg>
          Got books to sell? <span className="underline decoration-amber-200/30 underline-offset-2">Get in touch</span>
        </button>

        {/* Progress indicators — hover/focus pauses autoplay so users can choose */}
        <div
          className="mt-10 flex items-center gap-2"
          role="tablist"
          aria-label="Hero background scenes"
          style={progressStyle}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setPaused(false);
            }
          }}
        >
          {HERO_SLIDES.map((slide, index) => {
            const isActive = index === heroSlide;
            return (
              <button
                key={slide.src}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={slide.alt}
                onClick={() => goToSlide(index)}
                className={`relative h-1.5 overflow-hidden rounded-full transition-[width,background-color] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 ${
                  isActive
                    ? "w-9 bg-white/25"
                    : "w-1.5 bg-white/35 hover:bg-white/65"
                }`}
              >
                {isActive && autoplayActive && (
                  <span
                    key={`${index}-${timerEpoch}`}
                    className="hero-progress-fill absolute inset-y-0 left-0 w-full rounded-full bg-amber-400 shadow-sm shadow-amber-500/40"
                  />
                )}
                {isActive && !autoplayActive && (
                  <span className="absolute inset-y-0 left-0 w-full rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>


      {/* ── Contact / Sell books dialog (portaled so it stays fixed over ScrollSmoother) ── */}
      {isContactModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
            role="presentation"
            onClick={() => setIsContactModalOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="sell-books-title"
              className="relative w-full max-w-[420px] rounded-lg border border-amber-900/10 bg-paper-elevated shadow-2xl shadow-black/20 dark:border-gray-700 dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-amber-900/8 px-5 py-4 dark:border-gray-800">
                <div>
                  <h3
                    id="sell-books-title"
                    className="font-serif text-xl font-medium text-amber-950 dark:text-amber-50"
                  >
                    Sell your books
                  </h3>
                  <p className="mt-1 text-sm text-amber-900/55 dark:text-amber-200/45">
                    Reach us by phone, WhatsApp, or email — we handle evaluation
                    and collection.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="shrink-0 rounded-md p-1.5 text-amber-900/40 transition-colors hover:bg-amber-50 hover:text-amber-900 dark:text-amber-200/40 dark:hover:bg-gray-800 dark:hover:text-amber-100"
                  aria-label="Close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-5 px-5 py-5">
                <div>
                  <p className="mb-2.5 text-[11px] font-medium tracking-[0.12em] text-amber-800/55 uppercase dark:text-amber-300/50">
                    Phone
                  </p>
                  <ul className="divide-y divide-amber-900/8 overflow-hidden rounded-md border border-amber-900/10 dark:divide-gray-700 dark:border-gray-700">
                    {CONTACT_PHONES.map((phone) => (
                      <li
                        key={phone.tel}
                        className="flex flex-wrap items-center justify-between gap-3 bg-paper px-4 py-3.5 dark:bg-gray-900/80"
                      >
                        <span className="text-sm font-medium tabular-nums text-amber-950 dark:text-amber-50">
                          {phone.display}
                        </span>
                        <div className="flex shrink-0 items-center gap-2">
                          <a
                            href={`tel:${phone.tel}`}
                            className="rounded-md border border-amber-900/12 bg-white px-3 py-1.5 text-xs font-medium text-amber-900/80 transition-colors hover:border-amber-700/30 hover:bg-amber-50 dark:border-gray-600 dark:bg-gray-800 dark:text-amber-100 dark:hover:bg-gray-700"
                          >
                            Call
                          </a>
                          <a
                            href={`https://wa.me/${phone.wa}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-600"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="mb-2.5 text-[11px] font-medium tracking-[0.12em] text-amber-800/55 uppercase dark:text-amber-300/50">
                    Email
                  </p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-amber-900/10 bg-paper px-4 py-3.5 text-sm font-medium text-amber-950 transition-colors hover:border-amber-700/25 hover:bg-amber-50/80 dark:border-gray-700 dark:bg-gray-900/80 dark:text-amber-50 dark:hover:bg-gray-800"
                  >
                    <span className="truncate">{CONTACT_EMAIL}</span>
                    <span className="shrink-0 text-xs font-medium text-amber-700 dark:text-amber-400">
                      Send email
                    </span>
                  </a>
                </div>
              </div>

              <div className="border-t border-amber-900/8 px-5 py-3.5 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="w-full rounded-md bg-amber-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-800 dark:bg-amber-700 dark:hover:bg-amber-600"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}

export default Hero;
