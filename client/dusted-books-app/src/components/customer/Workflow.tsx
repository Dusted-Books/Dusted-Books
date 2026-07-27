function Workflow() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 -mr-20 w-72 h-72 rounded-full bg-amber-200/40 dark:bg-gray-700/30 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 w-96 h-96 rounded-full bg-amber-100/50 dark:bg-gray-700/30 blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Step 1 */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 mb-32">
          <div className="flex-1">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-800 dark:bg-amber-700 text-white mb-8 shadow-lg shadow-amber-950/20 dark:shadow-black/40">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
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
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-amber-950 dark:text-amber-50 tracking-tight mb-6 leading-tight">
              Read Again.
            </h2>
            <p className="text-lg md:text-xl text-amber-900/60 dark:text-amber-200/50 leading-relaxed max-w-2xl font-medium">
              Discover affordable hidden gems, clear your shelves, and pass on
              the joy of reading. Shop and sell used books today with absolute
              confidence.
            </p>
          </div>

          <div className="flex-1 w-full">
            <div className="aspect-[4/3] rounded-[2rem] bg-paper-elevated dark:bg-gray-800 border border-amber-900/10 dark:border-gray-700 p-8 shadow-[0_20px_50px_rgba(42,33,24,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-paper-elevated dark:from-gray-800 dark:to-gray-900 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>

              {/* Abstract decorative elements representing reading */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-paper-muted dark:bg-gray-700 rounded-xl shadow-xl rotate-[-6deg] group-hover:rotate-0 transition-all duration-700 ease-out border border-amber-900/10 dark:border-gray-600"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-paper-elevated dark:bg-gray-800 rounded-xl shadow-2xl rotate-[3deg] group-hover:rotate-[8deg] transition-all duration-700 ease-out border border-amber-900/8 dark:border-gray-600 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-amber-300 dark:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Workflow;
