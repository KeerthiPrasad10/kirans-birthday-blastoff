import WindsurfScene from "./components/WindsurfScene";
import RSVPForm from "./components/RSVPForm";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <WindsurfScene />

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
              className="sm:w-20 sm:h-20 drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]"
            >
              <line x1="38" y1="10" x2="38" y2="58" stroke="#888" strokeWidth="2"/>
              <path d="M38 12L38 56L62 48Q50 28 38 12Z" fill="white" fillOpacity="0.9" stroke="#ccc" strokeWidth="0.5"/>
              <path d="M38 28L55 42L38 47Z" fill="#f97316" fillOpacity="0.7"/>
              <path d="M18 58Q16 54 20 54L56 54Q60 54 58 58Q54 62 22 62Q18 62 18 58Z" fill="#deb887" stroke="#8B4513" strokeWidth="0.5"/>
              <path d="M8 68Q18 64 28 68Q38 72 48 68Q58 64 68 68" stroke="#60a5fa" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </div>

          <p className="text-amber-200/80 text-xs sm:text-sm md:text-base font-medium tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-2 sm:mb-3">
            You&apos;re Invited to
          </p>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-2 sm:mb-3 tracking-tight drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
            Nicola Turns 40
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
              by The Sea
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-amber-100/85 mt-3 sm:mt-4 max-w-md mx-auto leading-relaxed">
            Hello friends, Nicola is turning 40!
            <br />
            Let&apos;s celebrate together: Sun, sea, drinks...
            <br />
            <span className="text-amber-200/65 text-sm sm:text-base">Looking forward to create new memories with you!</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 mt-5 sm:mt-7 text-amber-100/80 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span className="font-semibold text-white">July 18, 2026</span>
            </div>
            <span className="hidden sm:block text-amber-500/40">|</span>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="font-semibold text-white">3:00 &ndash; 6:00 PM</span>
            </div>
            <span className="hidden sm:block text-amber-500/40">|</span>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>Beachclub Breez</span>
            </div>
          </div>

          <p className="text-amber-200/55 text-xs sm:text-sm mt-3">
            Please RSVP before July 1st
          </p>

          <a
            href="#rsvp"
            className="pointer-events-auto mt-10 sm:mt-16 flex flex-col items-center gap-2 text-amber-200/50 hover:text-amber-200/80 transition-colors"
          >
            <span className="text-[10px] sm:text-xs tracking-widest uppercase">RSVP Below</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
          </a>
        </section>

        <div className="h-[10vh] sm:h-[20vh]" />

        {/* RSVP Section */}
        <section id="rsvp" className="pointer-events-auto px-3 sm:px-4 md:px-8 py-10 sm:py-16 max-w-5xl mx-auto">
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              Join the Celebration
            </h2>
            <p className="text-amber-100/80 text-xs sm:text-sm md:text-base">
              RSVP for Nicola&apos;s 40th birthday by the sea!
            </p>
          </div>
          <RSVPForm />
        </section>

        {/* Location Footer */}
        <section className="pointer-events-auto px-3 sm:px-4 md:px-8 py-10 sm:py-16 max-w-3xl mx-auto">
          <div className="glass-card p-6 sm:p-8 text-center space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-white">Party Location</h3>
            <div className="space-y-1.5 sm:space-y-2 text-amber-100/90 text-sm sm:text-base">
              <p className="font-medium text-white">Beachclub Breez</p>
              <p>Verlengde Strandweg 1</p>
              <p>2691 KL &apos;s-Gravenzande</p>
              <p className="text-xs sm:text-sm text-amber-100/70">The Netherlands</p>
            </div>
            <div className="text-amber-100/80 text-xs sm:text-sm pt-1 sm:pt-2">
              Saturday, July 18 &middot; 3:00 &ndash; 6:00 PM
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Beachclub+Breez+Verlengde+Strandweg+1+2691KL+s-Gravenzande"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 sm:mt-4 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl
                bg-amber-600/20 border border-amber-500/30
                text-amber-100 hover:bg-amber-600/30 hover:border-amber-500/50 transition-all text-xs sm:text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Open in Maps
            </a>
          </div>

          <p className="text-center text-amber-200/30 text-xs mt-8 sm:mt-12 pb-6 sm:pb-8">
            Made with love for Nicola&apos;s special day
          </p>
        </section>
      </div>
    </main>
  );
}
