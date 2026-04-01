import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kiran's Birthday Blast-Off! Turning 4! May 10, 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(180deg, #030510 0%, #0a0e2a 50%, #050714 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Stars */}
        {[
          { x: 100, y: 80, s: 4 },
          { x: 300, y: 150, s: 3 },
          { x: 500, y: 60, s: 4 },
          { x: 700, y: 120, s: 2 },
          { x: 900, y: 80, s: 5 },
          { x: 1100, y: 150, s: 3 },
          { x: 200, y: 500, s: 4 },
          { x: 800, y: 550, s: 3 },
          { x: 1050, y: 450, s: 4 },
          { x: 150, y: 350, s: 2 },
          { x: 400, y: 400, s: 3 },
          { x: 600, y: 200, s: 2 },
        ].map((star, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: star.x,
              top: star.y,
              width: star.s,
              height: star.s,
              borderRadius: "50%",
              background: "white",
              opacity: 0.7,
            }}
          />
        ))}

        {/* Planet */}
        <div
          style={{
            position: "absolute",
            right: 140,
            top: 280,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #d4a44c 0%, #8b5e28 100%)",
            opacity: 0.6,
          }}
        />

        {/* Rocket */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          <svg
            width="100"
            height="120"
            viewBox="0 0 80 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M40 8C40 8 24 24 24 48L32 44L40 56L48 44L56 48C56 24 40 8 40 8Z"
              fill="#e8e8e8"
              stroke="#666"
              strokeWidth="1"
            />
            <path
              d="M40 8C40 8 30 18 27 36L40 28L53 36C50 18 40 8 40 8Z"
              fill="#e53935"
            />
            <circle cx="40" cy="32" r="5" fill="#4fc3f7" stroke="#0288d1" strokeWidth="1" />
            <path d="M24 48L16 58L24 52Z" fill="#e53935" />
            <path d="M56 48L64 58L56 52Z" fill="#e53935" />
            <path d="M34 56L40 72L46 56Z" fill="#ff9800" />
            <path d="M37 56L40 66L43 56Z" fill="#ffeb3b" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "white",
              letterSpacing: "-1px",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            Kiran&apos;s Birthday Blast-Off!
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#fbbf24",
              marginTop: 8,
            }}
          >
            Launching into Year 4!
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#a5b4fc",
              marginTop: 8,
            }}
          >
            May 10, 2026 &middot; 3:00 &ndash; 5:30 PM &middot; Haarlem
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
