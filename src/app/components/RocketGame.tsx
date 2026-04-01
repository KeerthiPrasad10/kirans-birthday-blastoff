"use client";

import { useRef, useEffect, useCallback } from "react";

interface Star { x: number; y: number; size: number; brightness: number; twinkleSpeed: number; }
interface Meteorite { x: number; y: number; vx: number; vy: number; radius: number; color: string; angle: number; angularVel: number; jaggedness: number[]; craters: { cx: number; cy: number; r: number }[]; }
interface Comet { x: number; y: number; vx: number; vy: number; radius: number; color: string; tailColor: string; trail: { x: number; y: number; alpha: number }[]; }
interface Planet { x: number; y: number; radius: number; color1: string; color2: string; color3: string; hasRings: boolean; ringColor: string; ringColor2: string; bands: { offset: number; color: string; width: number }[]; spots: { cx: number; cy: number; r: number; color: string }[]; atmosphereColor: string; rotationOffset: number; craters: { cx: number; cy: number; r: number }[]; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string; }
interface Rocket { x: number; y: number; targetX: number; targetY: number; angle: number; }
interface Sun { x: number; y: number; homeX: number; homeY: number; radius: number; dragging: boolean; influence: number; /* 0 = corner/night, 1 = full day */ warmth: number; /* 0 = neutral blue sky, 1 = warm sunrise/sunset */ }

const METEORITE_COLORS = ["#6d5d4b", "#7e7e7e", "#5a6a72", "#8a7560", "#969696"];

function rr(min: number, max: number) { return Math.random() * (max - min) + min; }
function dist(x1: number, y1: number, x2: number, y2: number) { return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2); }

// Fixed solar system planets
const SOLAR_PLANETS: Omit<Planet, "x" | "y" | "rotationOffset">[] = [
  { // Jupiter
    radius: 72, color1: "#d4a44c", color2: "#b07830", color3: "#8b5e28",
    atmosphereColor: "rgba(212,164,76,0.14)",
    bands: [
      { offset: -0.55, color: "rgba(200,140,60,0.55)", width: 0.1 },
      { offset: -0.3, color: "rgba(160,100,40,0.5)", width: 0.07 },
      { offset: -0.1, color: "rgba(220,170,80,0.5)", width: 0.12 },
      { offset: 0.1, color: "rgba(180,110,40,0.45)", width: 0.06 },
      { offset: 0.25, color: "rgba(210,150,60,0.5)", width: 0.1 },
      { offset: 0.45, color: "rgba(150,90,30,0.45)", width: 0.08 },
    ],
    spots: [
      { cx: 0.2, cy: 0.18, r: 0.13, color: "rgba(200,70,30,0.65)" },
      { cx: 0.22, cy: 0.18, r: 0.08, color: "rgba(220,100,50,0.4)" },
    ],
    craters: [],
    hasRings: false, ringColor: "", ringColor2: "",
  },
  { // Saturn
    radius: 58, color1: "#ecd9a0", color2: "#c9a84e", color3: "#a08030",
    atmosphereColor: "rgba(236,217,160,0.1)",
    bands: [
      { offset: -0.4, color: "rgba(220,190,120,0.4)", width: 0.12 },
      { offset: -0.1, color: "rgba(200,160,80,0.35)", width: 0.08 },
      { offset: 0.15, color: "rgba(230,200,140,0.35)", width: 0.1 },
      { offset: 0.4, color: "rgba(190,150,70,0.3)", width: 0.08 },
    ],
    spots: [], craters: [],
    hasRings: true, ringColor: "rgba(210,190,150,0.4)", ringColor2: "rgba(180,160,120,0.25)",
  },
  { // Mars — small, red, with craters
    radius: 32, color1: "#d05a20", color2: "#b04418", color3: "#7a2a08",
    atmosphereColor: "rgba(208,90,32,0.06)",
    bands: [{ offset: -0.4, color: "rgba(120,45,12,0.25)", width: 0.18 }],
    spots: [
      { cx: 0.0, cy: -0.42, r: 0.12, color: "rgba(240,235,225,0.35)" }, // polar cap
    ],
    craters: [
      { cx: 0.15, cy: 0.1, r: 0.14 },
      { cx: -0.2, cy: -0.15, r: 0.1 },
      { cx: 0.05, cy: 0.3, r: 0.08 },
      { cx: -0.25, cy: 0.2, r: 0.06 },
    ],
    hasRings: false, ringColor: "", ringColor2: "",
  },
  { // Earth
    radius: 36, color1: "#4a90d9", color2: "#2a6ab4", color3: "#1a4a8a",
    atmosphereColor: "rgba(100,180,255,0.18)",
    bands: [],
    spots: [
      { cx: -0.15, cy: -0.1, r: 0.18, color: "rgba(60,140,60,0.45)" },
      { cx: 0.2, cy: 0.15, r: 0.14, color: "rgba(80,150,70,0.4)" },
      { cx: -0.05, cy: 0.3, r: 0.1, color: "rgba(70,130,60,0.35)" },
      { cx: 0.3, cy: -0.2, r: 0.1, color: "rgba(255,255,255,0.22)" },
      { cx: -0.25, cy: 0.05, r: 0.13, color: "rgba(255,255,255,0.18)" },
    ],
    craters: [],
    hasRings: false, ringColor: "", ringColor2: "",
  },
  { // Moon — grey with many craters
    radius: 24, color1: "#c8c8c8", color2: "#a0a0a0", color3: "#707070",
    atmosphereColor: "rgba(200,200,200,0.05)",
    bands: [],
    spots: [],
    craters: [
      { cx: 0.1, cy: -0.15, r: 0.18 },
      { cx: -0.2, cy: 0.1, r: 0.14 },
      { cx: 0.25, cy: 0.25, r: 0.1 },
      { cx: -0.1, cy: -0.35, r: 0.08 },
      { cx: 0.3, cy: -0.05, r: 0.12 },
      { cx: -0.3, cy: -0.2, r: 0.06 },
      { cx: 0.0, cy: 0.3, r: 0.09 },
    ],
    hasRings: false, ringColor: "", ringColor2: "",
  },
];

export default function RocketGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const scoreRef = useRef(0);
  const sunRef = useRef<Sun>({ x: 0, y: 0, homeX: 0, homeY: 0, radius: 45, dragging: false, influence: 0, warmth: 0 });

  const initGame = useCallback((width: number, height: number) => {
    const stars: Star[] = Array.from({ length: 180 }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      size: rr(0.3, 2.2), brightness: rr(0.2, 1), twinkleSpeed: rr(0.005, 0.03),
    }));

    const meteorites: Meteorite[] = Array.from({ length: 10 }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: rr(-0.4, 0.4), vy: rr(-0.4, 0.4), radius: rr(8, 20),
      color: METEORITE_COLORS[Math.floor(Math.random() * METEORITE_COLORS.length)],
      angle: Math.random() * Math.PI * 2, angularVel: rr(-0.008, 0.008),
      jaggedness: Array.from({ length: 10 }, () => rr(0.75, 1.25)),
      craters: Array.from({ length: Math.floor(rr(2, 5)) }, () => ({
        cx: rr(-0.4, 0.4), cy: rr(-0.4, 0.4), r: rr(0.1, 0.25),
      })),
    }));

    const comets: Comet[] = Array.from({ length: 3 }, () => {
      const fromLeft = Math.random() > 0.5;
      const colors = [
        { color: "#a0d8ef", tailColor: "100,180,220" },
        { color: "#f0e68c", tailColor: "240,230,140" },
        { color: "#dda0dd", tailColor: "200,160,200" },
      ];
      const c = colors[Math.floor(Math.random() * colors.length)];
      return {
        x: fromLeft ? -50 : width + 50, y: rr(50, height - 50),
        vx: (fromLeft ? 1 : -1) * rr(1.5, 3), vy: rr(-0.5, 0.5),
        radius: rr(3, 6), color: c.color, tailColor: c.tailColor,
        trail: [] as { x: number; y: number; alpha: number }[],
      };
    });

    const planets: Planet[] = [];
    const shuffled = [...SOLAR_PLANETS].sort(() => Math.random() - 0.5);
    for (const cfg of shuffled) {
      let px: number, py: number, attempts = 0;
      const margin = cfg.radius + 50;
      do {
        px = rr(margin, width - margin); py = rr(margin, height - margin); attempts++;
      } while (attempts < 100 && planets.some((p) => dist(px, py, p.x, p.y) < p.radius + cfg.radius + 90));
      planets.push({ ...cfg, x: px, y: py, rotationOffset: Math.random() * Math.PI * 2 });
    }

    // Sun starts in top-right corner
    sunRef.current = {
      x: width - 60, y: 60, homeX: width - 60, homeY: 60,
      radius: 45, dragging: false, influence: 0, warmth: 0,
    };

    const rocket: Rocket = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2, angle: -Math.PI / 2 };
    const particles: Particle[] = [];
    scoreRef.current = 0;
    return { stars, meteorites, comets, planets, rocket, particles };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let game = initGame(width, height);
    let time = 0;

    const handleResize = () => {
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = width; canvas.height = height;
      game = initGame(width, height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const sun = sunRef.current;
      if (sun.dragging) {
        sun.x = e.clientX; sun.y = e.clientY;
      } else {
        mouseRef.current.x = e.clientX; mouseRef.current.y = e.clientY;
        mouseRef.current.active = true;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const sun = sunRef.current;
      if (dist(e.clientX, e.clientY, sun.x, sun.y) < sun.radius + 10) {
        sun.dragging = true;
        e.preventDefault();
      }
    };

    const handleMouseUp = () => {
      sunRef.current.dragging = false;
    };

    // Touch handlers on canvas only — sun dragging captures touch, everything else scrolls normally
    const handleCanvasTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const sun = sunRef.current;
      if (dist(touch.clientX, touch.clientY, sun.x, sun.y) < sun.radius + 20) {
        sun.dragging = true;
        e.preventDefault(); // only prevent scroll when dragging sun
      }
      // Don't track touch for rocket — let it auto-wander on mobile
    };

    const handleCanvasTouchMove = (e: TouchEvent) => {
      const sun = sunRef.current;
      if (sun.dragging) {
        const touch = e.touches[0];
        sun.x = touch.clientX; sun.y = touch.clientY;
        e.preventDefault();
      }
    };

    const handleCanvasTouchEnd = () => { sunRef.current.dragging = false; };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchstart", handleCanvasTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleCanvasTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleCanvasTouchEnd);

    // ── Drawing functions ──

    function drawStar(star: Star, t: number, dayAlpha: number) {
      const nightAlpha = 1 - dayAlpha;
      const alpha = star.brightness * (0.5 + 0.5 * Math.sin(t * star.twinkleSpeed * Math.PI * 2)) * nightAlpha;
      if (alpha < 0.01) return;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fill();
    }

    function drawCrater(cx: number, cy: number, r: number, lightAngle: number) {
      // Shadow side of crater
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fill();
      // Lit rim
      const rimX = cx + Math.cos(lightAngle) * r * 0.25;
      const rimY = cy + Math.sin(lightAngle) * r * 0.25;
      ctx.beginPath(); ctx.arc(rimX, rimY, r * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.1)"; ctx.fill();
      // Highlight rim edge
      const hlX = cx - Math.cos(lightAngle) * r * 0.3;
      const hlY = cy - Math.sin(lightAngle) * r * 0.3;
      ctx.beginPath(); ctx.arc(hlX, hlY, r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fill();
    }

    function drawMeteorite(m: Meteorite) {
      ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.angle);
      ctx.beginPath();
      const pts = m.jaggedness.length;
      for (let i = 0; i <= pts; i++) {
        const a = (i / pts) * Math.PI * 2;
        const r = m.radius * m.jaggedness[i % pts];
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      const grad = ctx.createRadialGradient(-m.radius * 0.3, -m.radius * 0.3, m.radius * 0.05, 0, 0, m.radius);
      grad.addColorStop(0, lighten(m.color, 40)); grad.addColorStop(0.5, m.color); grad.addColorStop(1, darken(m.color, 50));
      ctx.fillStyle = grad; ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 0.5; ctx.stroke();
      for (const cr of m.craters) drawCrater(cr.cx * m.radius, cr.cy * m.radius, cr.r * m.radius, -Math.PI * 0.75);
      ctx.restore();
    }

    function drawComet(c: Comet) {
      for (const t of c.trail) {
        ctx.fillStyle = `rgba(${c.tailColor},${t.alpha * 0.6})`;
        ctx.beginPath(); ctx.arc(t.x, t.y, c.radius * (t.alpha * 0.8 + 0.2), 0, Math.PI * 2); ctx.fill();
      }
      const glow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.radius * 4);
      glow.addColorStop(0, `rgba(${c.tailColor},0.3)`); glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(c.x, c.y, c.radius * 4, 0, Math.PI * 2); ctx.fill();
      const head = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.radius);
      head.addColorStop(0, "#fff"); head.addColorStop(0.4, c.color); head.addColorStop(1, `rgba(${c.tailColor},0.5)`);
      ctx.fillStyle = head; ctx.beginPath(); ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2); ctx.fill();
    }

    function drawPlanet(p: Planet, t: number) {
      ctx.save();
      // Atmosphere glow
      const atmo = ctx.createRadialGradient(p.x, p.y, p.radius * 0.9, p.x, p.y, p.radius * 1.4);
      atmo.addColorStop(0, "transparent"); atmo.addColorStop(0.5, p.atmosphereColor); atmo.addColorStop(1, "transparent");
      ctx.fillStyle = atmo; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius * 1.4, 0, Math.PI * 2); ctx.fill();

      // Clip to sphere
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.clip();

      // Base sphere gradient
      const base = ctx.createRadialGradient(p.x - p.radius * 0.35, p.y - p.radius * 0.35, p.radius * 0.05, p.x + p.radius * 0.15, p.y + p.radius * 0.15, p.radius * 1.15);
      base.addColorStop(0, p.color1); base.addColorStop(0.5, p.color2); base.addColorStop(1, p.color3);
      ctx.fillStyle = base; ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);

      // Bands
      for (const band of p.bands) {
        const by = p.y + band.offset * p.radius * 2;
        ctx.fillStyle = band.color;
        ctx.beginPath(); ctx.ellipse(p.x, by, p.radius * 1.05, band.width * p.radius, 0, 0, Math.PI * 2); ctx.fill();
      }

      // Spots
      for (const spot of p.spots) {
        const sx = p.x + spot.cx * p.radius * 2, sy = p.y + spot.cy * p.radius * 2;
        ctx.beginPath(); ctx.ellipse(sx, sy, spot.r * p.radius * 1.3, spot.r * p.radius, p.rotationOffset + t * 0.0002, 0, Math.PI * 2);
        ctx.fillStyle = spot.color; ctx.fill();
      }

      // Craters (3D with light direction)
      const lightAngle = -Math.PI * 0.7; // light from upper-left (where sun starts)
      for (const cr of p.craters) {
        const cx = p.x + cr.cx * p.radius * 2, cy = p.y + cr.cy * p.radius * 2;
        const crR = cr.r * p.radius;
        // Outer shadow
        ctx.beginPath(); ctx.arc(cx, cy, crR, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.fill();
        // Inner lit floor
        ctx.beginPath(); ctx.arc(cx + Math.cos(lightAngle) * crR * 0.15, cy + Math.sin(lightAngle) * crR * 0.15, crR * 0.75, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fill();
        // Bright rim (opposite light)
        ctx.beginPath();
        ctx.arc(cx - Math.cos(lightAngle) * crR * 0.35, cy - Math.sin(lightAngle) * crR * 0.35, crR * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.fill();
      }

      // Specular highlight
      const spec = ctx.createRadialGradient(p.x - p.radius * 0.35, p.y - p.radius * 0.35, 0, p.x - p.radius * 0.2, p.y - p.radius * 0.2, p.radius * 0.7);
      spec.addColorStop(0, "rgba(255,255,255,0.22)"); spec.addColorStop(1, "transparent");
      ctx.fillStyle = spec; ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);

      // Terminator shadow
      const shadow = ctx.createRadialGradient(p.x + p.radius * 0.4, p.y + p.radius * 0.3, p.radius * 0.2, p.x + p.radius * 0.2, p.y + p.radius * 0.2, p.radius * 1.1);
      shadow.addColorStop(0, "transparent"); shadow.addColorStop(0.5, "transparent"); shadow.addColorStop(1, "rgba(0,0,0,0.4)");
      ctx.fillStyle = shadow; ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);

      ctx.restore();

      // Rings
      if (p.hasRings) {
        ctx.save();
        // Back half
        ctx.beginPath(); ctx.ellipse(p.x, p.y, p.radius * 1.85, p.radius * 0.3, -0.15, Math.PI, Math.PI * 2);
        ctx.strokeStyle = p.ringColor; ctx.lineWidth = 8; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(p.x, p.y, p.radius * 1.6, p.radius * 0.24, -0.15, Math.PI, Math.PI * 2);
        ctx.strokeStyle = p.ringColor2; ctx.lineWidth = 4; ctx.stroke();
        // Front half
        ctx.beginPath(); ctx.ellipse(p.x, p.y, p.radius * 1.85, p.radius * 0.3, -0.15, 0, Math.PI);
        ctx.strokeStyle = p.ringColor; ctx.lineWidth = 8; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(p.x, p.y, p.radius * 1.6, p.radius * 0.24, -0.15, 0, Math.PI);
        ctx.strokeStyle = p.ringColor2; ctx.lineWidth = 4; ctx.stroke();
        ctx.restore();
      }
    }

    function drawSun(sun: Sun, t: number) {
      const morph = sun.influence; // 0 = moon, 1 = sun
      const w = sun.warmth;

      // Colors morph from moon (cool grey/blue) to sun (warm yellow/orange)
      const glowR = Math.round(lerp(180, 255, morph));
      const glowG = Math.round(lerp(200, lerp(200, 120, w), morph));
      const glowB = Math.round(lerp(255, lerp(50, 20, w), morph));

      // Outer glow — moon: soft blue halo, sun: warm corona
      const corona = ctx.createRadialGradient(sun.x, sun.y, sun.radius * 0.5, sun.x, sun.y, sun.radius * (lerp(2, 3.5, morph)));
      corona.addColorStop(0, `rgba(${glowR},${glowG},${glowB},${lerp(0.15, 0.3, morph)})`);
      corona.addColorStop(0.5, `rgba(${glowR},${Math.round(glowG * 0.6)},${Math.round(lerp(200, 0, morph))},${lerp(0.06, 0.12, morph)})`);
      corona.addColorStop(1, "transparent");
      ctx.fillStyle = corona;
      ctx.beginPath(); ctx.arc(sun.x, sun.y, sun.radius * lerp(2, 3.5, morph), 0, Math.PI * 2); ctx.fill();

      // Sun rays — fade in as it morphs from moon to sun
      if (morph > 0.15) {
        const rayAlphaBase = (morph - 0.15) / 0.85; // 0→1 as morph goes 0.15→1
        const numRays = 12;
        const rotation = t * 0.004;
        for (let i = 0; i < numRays; i++) {
          const angle = rotation + (i / numRays) * Math.PI * 2;
          const innerR = sun.radius * 1.05;
          const outerR = sun.radius * (1.2 + rayAlphaBase * 0.5 + Math.sin(t * 0.015 + i * 0.8) * 0.25 * rayAlphaBase);
          const halfSpread = Math.PI / (numRays * 2.2);
          ctx.beginPath();
          ctx.moveTo(sun.x + Math.cos(angle - halfSpread) * innerR, sun.y + Math.sin(angle - halfSpread) * innerR);
          ctx.lineTo(sun.x + Math.cos(angle) * outerR, sun.y + Math.sin(angle) * outerR);
          ctx.lineTo(sun.x + Math.cos(angle + halfSpread) * innerR, sun.y + Math.sin(angle + halfSpread) * innerR);
          ctx.closePath();
          const rayA = rayAlphaBase * (0.35 + Math.sin(t * 0.02 + i * 1.2) * 0.1);
          ctx.fillStyle = `rgba(${glowR},${glowG},${Math.round(lerp(glowB, 50, rayAlphaBase))},${rayA})`;
          ctx.fill();
        }
      }

      // Pulsing glow
      const pulseR = sun.radius * (lerp(1.15, 1.3, morph) + Math.sin(t * 0.02) * lerp(0.03, 0.1, morph));
      const glow = ctx.createRadialGradient(sun.x, sun.y, sun.radius * 0.3, sun.x, sun.y, pulseR);
      glow.addColorStop(0, `rgba(${glowR},${glowG},${Math.round(lerp(240, 80, morph))},${lerp(0.4, 0.8, morph)})`);
      glow.addColorStop(0.6, `rgba(${glowR},${Math.round(glowG * 0.7)},${Math.round(lerp(200, 20, morph))},${lerp(0.15, 0.4, morph)})`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(sun.x, sun.y, pulseR, 0, Math.PI * 2); ctx.fill();

      // Body — morphs from moon grey to sun yellow
      const body = ctx.createRadialGradient(
        sun.x - sun.radius * 0.25, sun.y - sun.radius * 0.25, 0,
        sun.x + sun.radius * 0.1, sun.y + sun.radius * 0.1, sun.radius
      );
      // Moon: light grey → mid grey → dark grey | Sun: white-yellow → yellow → orange → deep orange
      body.addColorStop(0, `rgb(${Math.round(lerp(220, 255, morph))},${Math.round(lerp(220, 248, morph))},${Math.round(lerp(230, 225, morph))})`);
      body.addColorStop(0.35, `rgb(${Math.round(lerp(185, 255, morph))},${Math.round(lerp(185, lerp(235, 170, w), morph))},${Math.round(lerp(195, lerp(59, 20, w), morph))})`);
      body.addColorStop(0.7, `rgb(${Math.round(lerp(140, 255, morph))},${Math.round(lerp(140, lerp(152, 90, w), morph))},${Math.round(lerp(155, 0, morph))})`);
      body.addColorStop(1, `rgb(${Math.round(lerp(100, lerp(230, 200, w), morph))},${Math.round(lerp(100, lerp(81, 30, w), morph))},${Math.round(lerp(115, 0, morph))})`);
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.arc(sun.x, sun.y, sun.radius, 0, Math.PI * 2); ctx.fill();

      // Moon craters — fade out as it becomes sun
      if (morph < 0.85) {
        const craterAlpha = (1 - morph / 0.85) * 0.25;
        const moonCraters = [
          { cx: 0.2, cy: -0.15, r: 0.18 },
          { cx: -0.25, cy: 0.12, r: 0.14 },
          { cx: 0.08, cy: 0.28, r: 0.1 },
          { cx: -0.12, cy: -0.3, r: 0.09 },
          { cx: 0.3, cy: 0.05, r: 0.11 },
        ];
        for (const cr of moonCraters) {
          const cx = sun.x + cr.cx * sun.radius * 2;
          const cy = sun.y + cr.cy * sun.radius * 2;
          const crR = cr.r * sun.radius;
          // Shadow
          ctx.beginPath(); ctx.arc(cx, cy, crR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,0,0,${craterAlpha})`; ctx.fill();
          // Inner floor
          ctx.beginPath(); ctx.arc(cx + crR * 0.15, cy + crR * 0.15, crR * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,0,0,${craterAlpha * 0.5})`; ctx.fill();
          // Bright rim
          ctx.beginPath(); ctx.arc(cx - crR * 0.2, cy - crR * 0.2, crR * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${craterAlpha * 0.4})`; ctx.fill();
        }
      }

      // Sun surface spots — fade in as it becomes sun
      if (morph > 0.5) {
        const spotAlpha = (morph - 0.5) / 0.5 * 0.3;
        ctx.fillStyle = `rgba(230,120,0,${spotAlpha})`;
        ctx.beginPath(); ctx.arc(sun.x + 8, sun.y - 5, 8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sun.x - 12, sun.y + 10, 6, 0, Math.PI * 2); ctx.fill();
      }

      // Specular highlight on body
      const specAlpha = lerp(0.12, 0.06, morph);
      ctx.beginPath(); ctx.arc(sun.x - sun.radius * 0.3, sun.y - sun.radius * 0.3, sun.radius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${specAlpha})`; ctx.fill();

      // "Drag me" hint — visible while it's still a moon, fades once dragged into sun
      if (morph < 0.3 && !sun.dragging) {
        const a = 0.7 + Math.sin(t * 0.03) * 0.15; // gentle pulse
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        const hintY = sun.y + sun.radius + 28;
        ctx.strokeStyle = `rgba(0,0,0,${a * 0.6})`;
        ctx.lineWidth = 3;
        ctx.strokeText("drag me!", sun.x, hintY);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fillText("drag me!", sun.x, hintY);
        ctx.textAlign = "left";
      }
    }

    function drawRocket(r: Rocket) {
      ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.angle + Math.PI / 2);
      const flameLen = 14 + Math.sin(time * 0.3) * 6;
      ctx.beginPath(); ctx.moveTo(-6, 13); ctx.quadraticCurveTo(-2, 13 + flameLen * 0.7, 0, 13 + flameLen); ctx.quadraticCurveTo(2, 13 + flameLen * 0.7, 6, 13); ctx.fillStyle = "#ff6d00"; ctx.fill();
      ctx.beginPath(); ctx.moveTo(-4, 13); ctx.quadraticCurveTo(-1, 13 + flameLen * 0.5, 0, 13 + flameLen * 0.7); ctx.quadraticCurveTo(1, 13 + flameLen * 0.5, 4, 13); ctx.fillStyle = "#ff9800"; ctx.fill();
      ctx.beginPath(); ctx.moveTo(-2, 13); ctx.quadraticCurveTo(0, 13 + flameLen * 0.3, 0, 13 + flameLen * 0.45); ctx.quadraticCurveTo(0, 13 + flameLen * 0.3, 2, 13); ctx.fillStyle = "#ffeb3b"; ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, -18); ctx.bezierCurveTo(9, -7, 9, 8, 7, 13); ctx.lineTo(-7, 13); ctx.bezierCurveTo(-9, 8, -9, -7, 0, -18); ctx.fillStyle = "#e8e8e8"; ctx.fill(); ctx.strokeStyle = "#aaa"; ctx.lineWidth = 0.5; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-7, 6); ctx.lineTo(7, 6); ctx.lineTo(7, 9); ctx.lineTo(-7, 9); ctx.closePath(); ctx.fillStyle = "#ccc"; ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, -18); ctx.bezierCurveTo(5, -13, 6, -8, 6, -6); ctx.lineTo(-6, -6); ctx.bezierCurveTo(-6, -8, -5, -13, 0, -18); ctx.fillStyle = "#e53935"; ctx.fill();
      ctx.beginPath(); ctx.arc(0, -1, 3.5, 0, Math.PI * 2);
      const wg = ctx.createRadialGradient(-1, -2, 0.5, 0, -1, 3.5); wg.addColorStop(0, "#b3e5fc"); wg.addColorStop(0.5, "#4fc3f7"); wg.addColorStop(1, "#0277bd");
      ctx.fillStyle = wg; ctx.fill(); ctx.strokeStyle = "#01579b"; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.beginPath(); ctx.arc(-1, -2.5, 1, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fill();
      ctx.beginPath(); ctx.moveTo(-7, 8); ctx.lineTo(-14, 17); ctx.lineTo(-7, 13); ctx.fillStyle = "#e53935"; ctx.fill();
      ctx.beginPath(); ctx.moveTo(7, 8); ctx.lineTo(14, 17); ctx.lineTo(7, 13); ctx.fillStyle = "#e53935"; ctx.fill();
      ctx.restore();
    }

    function drawParticle(p: Particle) {
      const a = p.life / p.maxLife;
      ctx.fillStyle = p.color === "fire" ? `rgba(255,${Math.floor(120 + 80 * a)},0,${a * 0.6})` : `rgba(255,235,59,${a * 0.4})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2); ctx.fill();
    }

    function spawnExhaust(r: Rocket) {
      const tx = r.x - Math.cos(r.angle) * 16, ty = r.y - Math.sin(r.angle) * 16;
      for (let i = 0; i < 2; i++) {
        game.particles.push({
          x: tx + rr(-3, 3), y: ty + rr(-3, 3),
          vx: -Math.cos(r.angle) * rr(1, 3) + rr(-0.5, 0.5),
          vy: -Math.sin(r.angle) * rr(1, 3) + rr(-0.5, 0.5),
          life: 1, maxLife: 1, size: rr(2, 5),
          color: Math.random() > 0.5 ? "fire" : "spark",
        });
      }
    }

    function spawnBounce(x: number, y: number) {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        game.particles.push({ x, y, vx: Math.cos(a) * rr(2, 5), vy: Math.sin(a) * rr(2, 5), life: 1, maxLife: 1, size: rr(2, 4), color: "spark" });
      }
      scoreRef.current += 10;
    }

    // ── Game loop ──

    function update() {
      time++;
      const { rocket, meteorites, comets, planets, particles } = game;
      const sun = sunRef.current;

      // Sun influence (how "day" it is based on distance from corner)
      const sunDistFromHome = dist(sun.x, sun.y, sun.homeX, sun.homeY);
      const baseInfluence = Math.min(1, sunDistFromHome / (Math.min(width, height) * 0.4));
      // Edge proximity: 0 = center of screen, 1 = at left/right edge
      const edgeProx = Math.min(1, Math.abs(sun.x - width / 2) / (width / 2));
      // Dim at edges for sunrise/sunset feel
      const targetInfluence = baseInfluence * (1 - edgeProx * 0.45);
      sun.influence += (targetInfluence - sun.influence) * 0.05;
      // Warmth: warm red/orange hue when near edges with daylight
      const targetWarmth = baseInfluence > 0.1 ? edgeProx * Math.min(1, baseInfluence * 1.5) : 0;
      sun.warmth += (targetWarmth - sun.warmth) * 0.05;
      // Stay where dropped — no snap back

      // Rocket — follows mouse on desktop, auto-wanders on mobile/touch
      if (mouseRef.current.active && !sun.dragging) {
        rocket.targetX = mouseRef.current.x; rocket.targetY = mouseRef.current.y;
      } else if (!mouseRef.current.active) {
        // Auto-wander: pick new random targets periodically
        if (time % 200 === 0) {
          rocket.targetX = rr(80, width - 80);
          rocket.targetY = rr(80, height - 80);
        }
      }
      const dx = rocket.targetX - rocket.x, dy = rocket.targetY - rocket.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > 1) {
        const speed = Math.min(d * 0.07, 10);
        const ma = Math.atan2(dy, dx);
        rocket.x += Math.cos(ma) * speed; rocket.y += Math.sin(ma) * speed;
        let ad = ma - rocket.angle;
        while (ad > Math.PI) ad -= Math.PI * 2;
        while (ad < -Math.PI) ad += Math.PI * 2;
        rocket.angle += ad * 0.1;
        spawnExhaust(rocket);
      }

      // Meteorites
      for (const m of meteorites) {
        m.x += m.vx; m.y += m.vy; m.angle += m.angularVel; m.vx *= 0.9995; m.vy *= 0.9995;
        const ms = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
        if (ms < 0.15) { const da = Math.atan2(m.vy, m.vx); m.vx = Math.cos(da) * 0.15; m.vy = Math.sin(da) * 0.15; }
        if (m.x < -m.radius * 2) m.x = width + m.radius;
        if (m.x > width + m.radius * 2) m.x = -m.radius;
        if (m.y < -m.radius * 2) m.y = height + m.radius;
        if (m.y > height + m.radius * 2) m.y = -m.radius;
        const md = dist(rocket.x, rocket.y, m.x, m.y);
        if (md < m.radius + 16) {
          const pa = Math.atan2(m.y - rocket.y, m.x - rocket.x);
          m.vx += Math.cos(pa) * 3; m.vy += Math.sin(pa) * 3; m.angularVel += rr(-0.04, 0.04);
          const ol = m.radius + 16 - md; m.x += Math.cos(pa) * ol; m.y += Math.sin(pa) * ol;
          spawnBounce((rocket.x + m.x) / 2, (rocket.y + m.y) / 2);
        }
      }

      // Comets
      for (const c of comets) {
        c.x += c.vx; c.y += c.vy;
        c.trail.unshift({ x: c.x, y: c.y, alpha: 1 });
        for (let i = c.trail.length - 1; i >= 0; i--) { c.trail[i].alpha -= 0.015; if (c.trail[i].alpha <= 0) c.trail.splice(i, 1); }
        if (c.x < -100 || c.x > width + 100 || c.y < -100 || c.y > height + 100) {
          const fl = Math.random() > 0.5;
          c.x = fl ? -40 : width + 40; c.y = rr(50, height - 50);
          c.vx = (fl ? 1 : -1) * rr(1.5, 3); c.vy = rr(-0.5, 0.5); c.trail = [];
        }
        const cd = dist(rocket.x, rocket.y, c.x, c.y);
        if (cd < c.radius + 16) {
          const pa = Math.atan2(rocket.y - c.y, rocket.x - c.x);
          rocket.x += Math.cos(pa) * 20; rocket.y += Math.sin(pa) * 20;
          rocket.targetX = rocket.x + Math.cos(pa) * 40; rocket.targetY = rocket.y + Math.sin(pa) * 40;
          spawnBounce(c.x, c.y);
        }
      }

      // Rocket vs planets
      for (const p of planets) {
        const pd = dist(rocket.x, rocket.y, p.x, p.y);
        const cd = p.radius + (p.hasRings ? 10 : 16);
        if (pd < cd) {
          const pa = Math.atan2(rocket.y - p.y, rocket.x - p.x);
          const ol = cd - pd;
          rocket.x += Math.cos(pa) * (ol + 6); rocket.y += Math.sin(pa) * (ol + 6);
          rocket.targetX = rocket.x + Math.cos(pa) * 70; rocket.targetY = rocket.y + Math.sin(pa) * 70;
          spawnBounce(rocket.x - Math.cos(pa) * 16, rocket.y - Math.sin(pa) * 16);
        }
      }

      // Meteorites vs planets
      for (const m of meteorites) {
        for (const p of planets) {
          const pd = dist(m.x, m.y, p.x, p.y);
          if (pd < p.radius + m.radius) {
            const ba = Math.atan2(m.y - p.y, m.x - p.x);
            m.x += Math.cos(ba) * (p.radius + m.radius - pd); m.y += Math.sin(ba) * (p.radius + m.radius - pd);
            const dot = m.vx * Math.cos(ba) + m.vy * Math.sin(ba);
            if (dot < 0) { m.vx -= 2 * dot * Math.cos(ba); m.vy -= 2 * dot * Math.sin(ba); }
          }
        }
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.03;
        if (p.life <= 0) particles.splice(i, 1);
      }
      if (particles.length > 250) particles.splice(0, particles.length - 250);
    }

    function draw() {
      const sun = sunRef.current;
      const day = sun.influence;
      const warm = sun.warmth;

      // Background: blend night → day sky → warm sunrise/sunset
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      if (day < 0.01 && warm < 0.01) {
        bg.addColorStop(0, "#030510"); bg.addColorStop(0.3, "#070b1e"); bg.addColorStop(0.7, "#0a0e2a"); bg.addColorStop(1, "#050714");
      } else {
        // Blue sky targets (at full day, no warmth)
        const br1 = 100, bg1 = 170, bb1 = 240;
        const br2 = 60, bg2v = 130, bb2 = 220;
        const br3 = 180, bg3 = 220, bb3 = 255;
        // Warm sunset targets (at full day, full warmth)
        const wr1 = 80, wg1 = 30, wb1 = 70;    // deep purple top
        const wr2 = 200, wg2 = 90, wb2 = 40;   // deep orange mid
        const wr3 = 240, wg3 = 140, wb3 = 60;  // golden horizon

        // Blend blue→warm based on warmth, then night→day based on day
        const r1 = lerp(3, lerp(br1, wr1, warm), day);
        const g1 = lerp(5, lerp(bg1, wg1, warm), day);
        const b1 = lerp(16, lerp(bb1, wb1, warm), day);
        const r2 = lerp(7, lerp(br2, wr2, warm), day);
        const g2 = lerp(11, lerp(bg2v, wg2, warm), day);
        const b2 = lerp(30, lerp(bb2, wb2, warm), day);
        const r3 = lerp(10, lerp(br3, wr3, warm), day);
        const g3 = lerp(14, lerp(bg3, wg3, warm), day);
        const b3 = lerp(42, lerp(bb3, wb3, warm), day);

        bg.addColorStop(0, `rgb(${r1},${g1},${b1})`);
        bg.addColorStop(0.5, `rgb(${r2},${g2},${b2})`);
        bg.addColorStop(1, `rgb(${r3},${g3},${b3})`);
      }
      ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);

      // Nebula (fades with day)
      if (day < 0.8) {
        const na = 1 - day;
        drawNebula(width * 0.2, height * 0.3, 200, `rgba(80,40,120,${0.04 * na})`);
        drawNebula(width * 0.75, height * 0.6, 250, `rgba(40,60,120,${0.035 * na})`);
      }

      for (const s of game.stars) drawStar(s, time, day);
      for (const p of game.planets) drawPlanet(p, time);
      for (const p of game.particles) drawParticle(p);
      for (const c of game.comets) drawComet(c);
      for (const m of game.meteorites) drawMeteorite(m);
      drawRocket(game.rocket);
      drawSun(sun, time);

      ctx.fillStyle = `rgba(255,255,255,${0.5 - day * 0.3})`;
      ctx.font = "13px monospace";
      ctx.fillText(`Bounces: ${scoreRef.current / 10}`, 16, 28);
    }

    function drawNebula(x: number, y: number, r: number, color: string) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color); g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    function loop() { update(); draw(); animFrameRef.current = requestAnimationFrame(loop); }
    loop();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchstart", handleCanvasTouchStart);
      canvas.removeEventListener("touchmove", handleCanvasTouchMove);
      canvas.removeEventListener("touchend", handleCanvasTouchEnd);
    };
  }, [initGame]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" style={{ cursor: "none", zIndex: 0, touchAction: "pan-y" }} />;
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function lighten(hex: string, n: number) { const v = parseInt(hex.replace("#", ""), 16); return `rgb(${Math.min(255, (v >> 16) + n)},${Math.min(255, ((v >> 8) & 0xff) + n)},${Math.min(255, (v & 0xff) + n)})`;  }
function darken(hex: string, n: number) { const v = parseInt(hex.replace("#", ""), 16); return `rgb(${Math.max(0, (v >> 16) - n)},${Math.max(0, ((v >> 8) & 0xff) - n)},${Math.max(0, (v & 0xff) - n)})`; }
