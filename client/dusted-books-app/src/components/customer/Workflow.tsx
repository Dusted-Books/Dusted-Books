function Workflow() {
  return (
    <section className="py-16 sm:py-20 relative overflow-hidden" style={{ contain: "layout style" }}>
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 -mr-20 w-72 h-72 rounded-full bg-amber-200/40 dark:bg-gray-700/30 blur-xl sm:blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 w-96 h-96 rounded-full bg-amber-100/50 dark:bg-gray-700/30 blur-xl sm:blur-2xl pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Step 1 */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          <div className="flex-1">
            <div className="inline-flex items-center justify-center h-14 px-5 rounded-2xl bg-amber-800 dark:bg-amber-700 text-amber-50 mb-8 shadow-lg shadow-amber-950/20 dark:shadow-black/40">
              <span className="font-cursive text-3xl tracking-wide">Story</span>
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
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-paper-muted dark:bg-gray-700 rounded-xl shadow-xl rotate-[-6deg] group-hover:rotate-0 transition-all duration-700 ease-out border border-amber-900/10 dark:border-gray-600 flex items-center justify-center p-6 text-center">
                <span className="font-cursive text-3xl text-amber-900/30 dark:text-gray-400 rotate-[-12deg]">Once upon a time...</span>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-paper-elevated dark:bg-gray-800 rounded-xl shadow-2xl rotate-[3deg] group-hover:rotate-[8deg] transition-all duration-700 ease-out border border-amber-900/8 dark:border-gray-600 flex flex-col items-center justify-center p-6 text-center">
                <span className="font-cursive text-5xl text-amber-800 dark:text-amber-200 mb-1">Read</span>
                <span className="font-cursive text-3xl text-amber-600 dark:text-amber-400">Again.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Workflow;
