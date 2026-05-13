import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Nicola Turns 40 by The Sea! July 18, 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(180deg, #1a0a3e 0%, #c43e1c 35%, #f59e0b 55%, #0c4a6e 70%, #041525 100%)",
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
        {/* Sun */}
        <div
          style={{
            position: "absolute",
            left: 880,
            top: 130,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "radial-gradient(circle, #fff8e1 0%, #ffd54f 30%, #ff9800 70%, #e65100 100%)",
            boxShadow: "0 0 80px 30px rgba(255,200,50,0.45)",
            display: "flex",
          }}
        />

        {/* Water band */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 240,
            background: "linear-gradient(180deg, rgba(10,55,110,0.95) 0%, rgba(4,20,45,1) 100%)",
            display: "flex",
          }}
        />

        {/* Sailboat */}
        <svg
          width="220"
          height="240"
          viewBox="0 0 220 240"
          style={{ position: "absolute", left: 130, top: 280 }}
        >
          <line x1="80" y1="20" x2="80" y2="160" stroke="#222" strokeWidth="5" strokeLinecap="round" />
          <path d="M80 22 L80 158 L180 138 Q140 72 80 22 Z" fill="white" stroke="#d8d8d8" strokeWidth="1.5" />
          <path d="M80 60 L150 122 L80 138 Z" fill="#f97316" />
          <path
            d="M20 160 L180 160 Q172 200 40 200 Q20 192 20 160 Z"
            fill="#deb887"
            stroke="#8B4513"
            strokeWidth="2"
          />
          <path
            d="M0 222 Q35 215 70 222 Q105 228 140 222 Q175 215 220 220"
            stroke="#60a5fa"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            position: "absolute",
            right: 80,
            top: 380,
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "white",
              letterSpacing: "-1.5px",
              lineHeight: 1.05,
              textShadow: "0 2px 20px rgba(0,0,0,0.4)",
              display: "flex",
            }}
          >
            Nicola Turns 40
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#fbbf24",
              marginTop: 4,
              textShadow: "0 2px 20px rgba(0,0,0,0.4)",
              display: "flex",
            }}
          >
            by The Sea
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#fef3c7",
              marginTop: 14,
              textShadow: "0 1px 10px rgba(0,0,0,0.5)",
              display: "flex",
            }}
          >
            July 18, 2026 &middot; 3:00 &ndash; 6:00 PM &middot; Beachclub Breez
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
