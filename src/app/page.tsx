import RocketGame from "./components/RocketGame";
import RSVPForm from "./components/RSVPForm";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Full-screen game background */}
      <RocketGame />

      {/* Content overlay */}
      <div className="relative z-10 pointer-events-none">
        {/* Hero Section */}
        <section className="min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 text-center">
          <div className="animate-float mb-4 sm:mb-6">
            <svg
              width="64"
              height="64"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="sm:w-20 sm:h-20 drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]"
            >
              <path d="M40 8C40 8 24 24 24 48L32 44L40 56L48 44L56 48C56 24 40 8 40 8Z" fill="#e8e8e8" stroke="#666" strokeWidth="1"/>
              <path d="M40 8C40 8 30 18 27 36L40 28L53 36C50 18 40 8 40 8Z" fill="#e53935"/>
              <circle cx="40" cy="32" r="5" fill="#4fc3f7" stroke="#0288d1" strokeWidth="1"/>
              <path d="M24 48L16 58L24 52Z" fill="#e53935"/>
              <path d="M56 48L64 58L56 52Z" fill="#e53935"/>
              <path d="M34 56L40 72L46 56Z" fill="#ff9800"/>
              <path d="M37 56L40 66L43 56Z" fill="#ffeb3b"/>
            </svg>
          </div>

          <p className="text-indigo-300/80 text-xs sm:text-sm md:text-base font-medium tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-2 sm:mb-3">
            You&apos;re Invited to
          </p>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-2 sm:mb-3 tracking-tight drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            Kiran&apos;s Birthday
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Blast-Off!
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl font-semibold text-indigo-200/90 mt-1">
            Launching into year <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">4</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 mt-4 sm:mt-6 text-indigo-200/80 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span className="font-semibold text-white">May 10, 2026</span>
            </div>
            <span className="hidden sm:block text-indigo-500/40">|</span>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="font-semibold text-white">3:00 &ndash; 5:30 PM</span>
            </div>
            <span className="hidden sm:block text-indigo-500/40">|</span>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>Haarlem</span>
            </div>
          </div>

          {/* Scroll indicator */}
          <a
            href="#rsvp"
            className="pointer-events-auto mt-10 sm:mt-16 flex flex-col items-center gap-2 text-indigo-300/50 hover:text-indigo-300/80 transition-colors"
          >
            <span className="text-[10px] sm:text-xs tracking-widest uppercase">RSVP Below</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
          </a>
        </section>

        {/* Spacer */}
        <div className="h-[10vh] sm:h-[20vh]" />

        {/* RSVP Section */}
        <section id="rsvp" className="pointer-events-auto px-3 sm:px-4 md:px-8 py-10 sm:py-16 max-w-5xl mx-auto">
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              Join the Crew
            </h2>
            <p className="text-indigo-200/80 text-xs sm:text-sm md:text-base">
              Confirm your spot at Kiran&apos;s 4th birthday party!
            </p>
          </div>
          <RSVPForm />
        </section>

        {/* Location Footer */}
        <section className="pointer-events-auto px-3 sm:px-4 md:px-8 py-10 sm:py-16 max-w-3xl mx-auto">
          <div className="glass-card p-6 sm:p-8 text-center space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-white">Party Location</h3>
            <div className="space-y-1.5 sm:space-y-2 text-indigo-200/90 text-sm sm:text-base">
              <p className="font-medium text-white">Karel van Manderstraat 38</p>
              <p>2014 VE Haarlem</p>
              <p className="text-xs sm:text-sm text-indigo-200/70">The Netherlands</p>
            </div>
            <div className="text-indigo-200/80 text-xs sm:text-sm pt-1 sm:pt-2">
              Saturday, May 10 &middot; 3:00 &ndash; 5:30 PM
            </div>
            <div className="flex items-center justify-center gap-2 text-indigo-200/90 pt-1 text-sm">
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <a href="tel:+316871013646" className="hover:text-indigo-300 transition-colors">
                +31 6 87 10 13 646
              </a>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Karel+van+Manderstraat+38+2014VE+Haarlem"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 sm:mt-4 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl
                bg-indigo-600/20 border border-indigo-500/30
                text-indigo-200 hover:bg-indigo-600/30 hover:border-indigo-500/50 transition-all text-xs sm:text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Open in Maps
            </a>
          </div>

          <p className="text-center text-indigo-200/30 text-xs mt-8 sm:mt-12 pb-6 sm:pb-8">
            Made with love for Kiran&apos;s special day
          </p>
        </section>
      </div>
    </main>
  );
}
