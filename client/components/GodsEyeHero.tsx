"use client";

export default function GodsEyeHero() {
  const scrollToResults = () => {
    const results = document.getElementById("results");
    if (results) {
      results.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      className="relative flex min-h-[480px] flex-col items-center justify-center overflow-hidden bg-[#FFFFFF] px-6 py-14 text-center sm:min-h-[540px] sm:px-10 sm:py-20"
      aria-labelledby="gods-eye-title"
    >
      {/* Ambient light orange glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[-160px] z-[1] h-[640px] w-[640px] -translate-x-1/2 sm:top-[-200px] sm:h-[800px] sm:w-[800px]"
        style={{
          background: "radial-gradient(circle, #FFB74D 0%, transparent 70%)",
          opacity: 0.15,
        }}
      />

      {/* Dramatic God&apos;s eye SVG background */}
      <svg
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 opacity-[0.04] sm:h-[480px] sm:w-[480px] lg:h-[600px] lg:w-[600px]"
        viewBox="0 0 200 200"
        fill="none"
        stroke="#3E2723"
        strokeWidth="1"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="90" />
        <path d="M10 100 Q100 20 190 100 Q100 180 10 100 Z" />
        <circle cx="100" cy="100" r="35" fill="#3E2723" />
        <circle cx="100" cy="100" r="15" fill="#FFB74D" />
        <line x1="100" y1="0" x2="100" y2="200" />
        <line x1="0" y1="100" x2="200" y2="100" />
      </svg>

      <div className="relative z-[2] mx-auto w-full max-w-[850px]">
        <div className="mb-6 inline-block rounded-full border border-[#D7CCC8] px-5 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#8D6E63] sm:mb-8">
          Guarded Around The Clock
        </div>

        <h1
          id="gods-eye-title"
          className="font-cinzel text-4xl font-bold leading-[1.1] tracking-wide text-[#3E2723] sm:text-5xl md:text-6xl lg:text-7xl"
        >
          THE GOD&apos;S <span className="text-[#E65100]">EYE</span>
        </h1>

        <p className="mb-3 mt-3 font-[var(--font-oswald)] text-sm font-light uppercase tracking-[0.25em] text-[#5D4037] sm:mb-4 sm:mt-4 sm:text-base">
          Every Story, Carved In Light
        </p>

        <p className="mx-auto mb-8 max-w-[600px] text-sm leading-relaxed text-[#8D6E63] sm:mb-10 sm:text-base">
          Search, stream, and download from one place — guarded around the clock. The court of a thousand tales awaits
          your arrival.
        </p>

        {/* Stats */}
        <div className="mb-8 flex justify-center gap-10 sm:mb-10 sm:gap-16">
          {[
            { value: "∞", label: "Titles" },
            { value: "4K", label: "Quality" },
            { value: "24/7", label: "Uptime" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="relative text-center after:absolute after:right-[-1.25rem] after:top-1/2 after:hidden after:h-[30px] after:w-px after:-translate-y-1/2 after:bg-[#D7CCC8] last:after:hidden sm:after:right-[-2rem] sm:after:block"
            >
              <span className="block font-cinzel text-xl font-bold text-[#E65100] sm:text-2xl">{stat.value}</span>
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[#8D6E63] sm:text-[0.7rem]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {["Discover", "Stream", "Download"].map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={scrollToResults}
              className={`rounded-sm px-6 py-3 text-[0.7rem] font-bold uppercase tracking-[0.15em] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:px-7 sm:py-3.5 sm:text-[0.75rem] ${
                index === 0
                  ? "border border-[#E65100] bg-[#E65100] text-white hover:border-[#3E2723] hover:bg-[#3E2723]"
                  : "border border-[#3E2723] bg-transparent text-[#3E2723] hover:bg-[#3E2723] hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
