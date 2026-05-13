"use client";

import { useRef, useEffect, useCallback } from "react";

interface Star { x: number; y: number; size: number; brightness: number; twinkleSpeed: number; }
interface Cloud { x: number; y: number; height: number; speed: number; opacity: number; }
interface WaveCrest { x: number; speed: number; amplitude: number; width: number; ridden: boolean; }
interface Seagull { x: number; y: number; vx: number; wingPhase: number; wingSpeed: number; }
interface Surfer { x: number; y: number; targetX: number; prevY: number; angle: number; facingRight: boolean; }
interface Sun { x: number; y: number; radius: number; dragging: boolean; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string; }

function rr(min: number, max: number) { return Math.random() * (max - min) + min; }
function dist(x1: number, y1: number, x2: number, y2: number) { return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

export default function WindsurfScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const scoreRef = useRef(0);
  const sunRef = useRef<Sun>({ x: 0, y: 0, radius: 50, dragging: false });

  const initGame = useCallback((width: number, height: number) => {
    const horizonY = height * 0.45;

    const stars: Star[] = Array.from({ length: 100 }, () => ({
      x: Math.random() * width, y: Math.random() * horizonY * 0.85,
      size: rr(0.3, 2), brightness: rr(0.3, 1), twinkleSpeed: rr(0.005, 0.025),
    }));

    const clouds: Cloud[] = Array.from({ length: 6 }, () => ({
      x: rr(-100, width + 100), y: rr(30, horizonY * 0.55),
      height: rr(18, 45), speed: rr(0.1, 0.35), opacity: rr(0.15, 0.45),
    }));

    const waveCrests: WaveCrest[] = Array.from({ length: 8 }, () => ({
      x: rr(0, width), speed: rr(0.25, 0.7),
      amplitude: rr(8, 24), width: rr(45, 90), ridden: false,
    }));

    const seagulls: Seagull[] = Array.from({ length: 5 }, () => ({
      x: rr(-50, width + 50), y: rr(20, horizonY * 0.45),
      vx: rr(0.4, 1.2) * (Math.random() > 0.5 ? 1 : -1),
      wingPhase: Math.random() * Math.PI * 2, wingSpeed: rr(0.04, 0.08),
    }));

    const surfer: Surfer = {
      x: width / 2, y: horizonY, targetX: width / 2,
      prevY: horizonY, angle: 0, facingRight: true,
    };

    sunRef.current = { x: width * 0.72, y: horizonY * 0.5, radius: 55, dragging: false };
    scoreRef.current = 0;

    return { stars, clouds, waveCrests, seagulls, surfer, particles: [] as Particle[], horizonY };
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
      if (sunRef.current.dragging) {
        sunRef.current.x = e.clientX; sunRef.current.y = e.clientY;
      } else {
        mouseRef.current.x = e.clientX; mouseRef.current.y = e.clientY;
        mouseRef.current.active = true;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (dist(e.clientX, e.clientY, sunRef.current.x, sunRef.current.y) < sunRef.current.radius + 15) {
        sunRef.current.dragging = true; e.preventDefault();
      }
    };

    const handleMouseUp = () => { sunRef.current.dragging = false; };

    const handleTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (dist(t.clientX, t.clientY, sunRef.current.x, sunRef.current.y) < sunRef.current.radius + 25) {
        sunRef.current.dragging = true; e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (sunRef.current.dragging) {
        sunRef.current.x = e.touches[0].clientX;
        sunRef.current.y = e.touches[0].clientY;
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => { sunRef.current.dragging = false; };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);

    // ── Water surface ──

    function baseWaterY(x: number): number {
      return game.horizonY
        + Math.sin(x * 0.008 + time * 0.012) * 8
        + Math.sin(x * 0.016 + time * 0.022) * 5
        + Math.sin(x * 0.003 + time * 0.007) * 14;
    }

    function crestBump(x: number, c: WaveCrest): number {
      const dx = x - c.x;
      if (Math.abs(dx) > c.width) return 0;
      return c.amplitude * Math.pow(Math.cos((dx / c.width) * Math.PI / 2), 2);
    }

    function waterY(x: number): number {
      let y = baseWaterY(x);
      for (const c of game.waveCrests) y -= crestBump(x, c);
      return y;
    }

    // ── Drawing ──

    function drawSky() {
      const sun = sunRef.current;
      const sunT = clamp((game.horizonY - sun.y) / game.horizonY, -0.3, 1);

      const bg = ctx.createLinearGradient(0, 0, 0, height);

      if (sunT > 0.5) {
        const t = (sunT - 0.5) / 0.5;
        bg.addColorStop(0, `rgb(${lerp(50, 65, t)},${lerp(30, 120, t)},${lerp(90, 200, t)})`);
        bg.addColorStop(0.35, `rgb(${lerp(100, 90, t)},${lerp(50, 155, t)},${lerp(70, 220, t)})`);
        bg.addColorStop(0.45, `rgb(${lerp(200, 150, t)},${lerp(110, 190, t)},${lerp(55, 230, t)})`);
        bg.addColorStop(0.55, `rgb(${lerp(15, 30, t)},${lerp(50, 100, t)},${lerp(90, 150, t)})`);
        bg.addColorStop(1, `rgb(${lerp(5, 10, t)},${lerp(25, 45, t)},${lerp(50, 80, t)})`);
      } else if (sunT > -0.05) {
        const t = clamp((sunT + 0.05) / 0.55, 0, 1);
        bg.addColorStop(0, `rgb(${lerp(8, 50, t)},${lerp(5, 30, t)},${lerp(20, 90, t)})`);
        bg.addColorStop(0.2, `rgb(${lerp(12, 100, t)},${lerp(8, 50, t)},${lerp(25, 70, t)})`);
        bg.addColorStop(0.35, `rgb(${lerp(18, 180, t)},${lerp(12, 75, t)},${lerp(30, 55, t)})`);
        bg.addColorStop(0.45, `rgb(${lerp(20, 230, t)},${lerp(15, 130, t)},${lerp(35, 45, t)})`);
        bg.addColorStop(0.55, `rgb(${lerp(5, 15, t)},${lerp(15, 50, t)},${lerp(30, 90, t)})`);
        bg.addColorStop(1, `rgb(${lerp(2, 5, t)},${lerp(8, 25, t)},${lerp(18, 50, t)})`);
      } else {
        bg.addColorStop(0, "rgb(4,3,12)");
        bg.addColorStop(0.45, "rgb(8,8,22)");
        bg.addColorStop(0.55, "rgb(3,10,22)");
        bg.addColorStop(1, "rgb(2,5,15)");
      }

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);
    }

    function drawStars() {
      const sunT = clamp((game.horizonY - sunRef.current.y) / game.horizonY, -0.3, 1);
      if (sunT > 0.55) return;
      const alpha = clamp(1 - sunT / 0.55, 0, 1);
      for (const s of game.stars) {
        const a = s.brightness * (0.5 + 0.5 * Math.sin(time * s.twinkleSpeed * Math.PI * 2)) * alpha;
        if (a < 0.01) continue;
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill();
      }
    }

    function drawCloud(c: Cloud) {
      const sunT = clamp((game.horizonY - sunRef.current.y) / game.horizonY, -0.3, 1);
      const warmth = clamp(1 - sunT, 0, 1);
      const r = Math.round(lerp(255, 255, warmth));
      const g = Math.round(lerp(250, 210, warmth));
      const b = Math.round(lerp(245, 180, warmth));
      ctx.fillStyle = `rgba(${r},${g},${b},${c.opacity})`;
      const hr = c.height / 2;
      ctx.beginPath();
      ctx.arc(c.x, c.y, hr * 1.3, 0, Math.PI * 2);
      ctx.arc(c.x - hr * 1.3, c.y + hr * 0.3, hr * 0.9, 0, Math.PI * 2);
      ctx.arc(c.x + hr * 1.3, c.y + hr * 0.2, hr, 0, Math.PI * 2);
      ctx.arc(c.x + hr * 2.3, c.y + hr * 0.35, hr * 0.7, 0, Math.PI * 2);
      ctx.arc(c.x - hr * 2, c.y + hr * 0.4, hr * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawSunBody() {
      const sun = sunRef.current;

      const corona = ctx.createRadialGradient(sun.x, sun.y, sun.radius * 0.4, sun.x, sun.y, sun.radius * 3.5);
      corona.addColorStop(0, "rgba(255,200,50,0.3)");
      corona.addColorStop(0.35, "rgba(255,140,20,0.12)");
      corona.addColorStop(1, "transparent");
      ctx.fillStyle = corona;
      ctx.beginPath(); ctx.arc(sun.x, sun.y, sun.radius * 3.5, 0, Math.PI * 2); ctx.fill();

      const numRays = 14;
      for (let i = 0; i < numRays; i++) {
        const angle = time * 0.003 + (i / numRays) * Math.PI * 2;
        const innerR = sun.radius * 1.05;
        const outerR = sun.radius * (1.25 + Math.sin(time * 0.012 + i * 0.9) * 0.2);
        const spread = Math.PI / (numRays * 2.5);
        ctx.beginPath();
        ctx.moveTo(sun.x + Math.cos(angle - spread) * innerR, sun.y + Math.sin(angle - spread) * innerR);
        ctx.lineTo(sun.x + Math.cos(angle) * outerR, sun.y + Math.sin(angle) * outerR);
        ctx.lineTo(sun.x + Math.cos(angle + spread) * innerR, sun.y + Math.sin(angle + spread) * innerR);
        ctx.closePath();
        ctx.fillStyle = `rgba(255,200,50,${0.18 + Math.sin(time * 0.018 + i) * 0.07})`;
        ctx.fill();
      }

      const body = ctx.createRadialGradient(
        sun.x - sun.radius * 0.2, sun.y - sun.radius * 0.2, 0,
        sun.x, sun.y, sun.radius
      );
      body.addColorStop(0, "#fff8e1");
      body.addColorStop(0.25, "#ffd54f");
      body.addColorStop(0.65, "#ff9800");
      body.addColorStop(1, "#e65100");
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.arc(sun.x, sun.y, sun.radius, 0, Math.PI * 2); ctx.fill();

      ctx.beginPath(); ctx.arc(sun.x - sun.radius * 0.22, sun.y - sun.radius * 0.22, sun.radius * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.13)"; ctx.fill();

      if (time < 500 && !sun.dragging) {
        const fadeIn = Math.min(1, time / 60);
        const fadeOut = time > 380 ? 1 - (time - 380) / 120 : 1;
        const a = fadeIn * fadeOut * (0.55 + Math.sin(time * 0.03) * 0.12);
        if (a > 0.01) {
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          const hy = sun.y + sun.radius + 24;
          ctx.strokeStyle = `rgba(0,0,0,${a * 0.5})`; ctx.lineWidth = 3;
          ctx.strokeText("drag me!", sun.x, hy);
          ctx.fillStyle = `rgba(255,255,255,${a})`;
          ctx.fillText("drag me!", sun.x, hy);
          ctx.textAlign = "left";
        }
      }
    }

    function drawWater() {
      const sunT = clamp((game.horizonY - sunRef.current.y) / game.horizonY, -0.3, 1);
      const t = clamp(sunT + 0.1, 0, 1);

      const wg = ctx.createLinearGradient(0, game.horizonY - 20, 0, height);
      wg.addColorStop(0, `rgba(${lerp(6, 20, t)},${lerp(25, 75, t)},${lerp(55, 135, t)},0.97)`);
      wg.addColorStop(0.25, `rgba(${lerp(4, 12, t)},${lerp(18, 55, t)},${lerp(40, 100, t)},0.98)`);
      wg.addColorStop(1, `rgba(${lerp(2, 5, t)},${lerp(10, 25, t)},${lerp(25, 55, t)},1)`);

      ctx.fillStyle = wg;
      ctx.beginPath();
      const startX = 0;
      ctx.moveTo(startX, waterY(startX));
      for (let x = startX + 3; x <= width; x += 3) ctx.lineTo(x, waterY(x));
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(140,210,255,${0.06 + t * 0.06})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, waterY(0));
      for (let x = 3; x <= width; x += 3) ctx.lineTo(x, waterY(x));
      ctx.stroke();

      for (const c of game.waveCrests) {
        if (c.amplitude < 10) continue;
        const left = c.x - c.width * 0.5;
        const right = c.x + c.width * 0.5;
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.beginPath();
        ctx.moveTo(left, waterY(left));
        for (let x = left + 3; x <= right; x += 3) ctx.lineTo(x, waterY(x));
        ctx.lineTo(right, waterY(right) + 3);
        ctx.lineTo(left, waterY(left) + 3);
        ctx.closePath();
        ctx.fill();
      }

      // Extra wave highlight lines deeper in the water
      for (let layer = 1; layer <= 3; layer++) {
        const yOff = layer * 35 + 15;
        const a = 0.03 / layer;
        ctx.strokeStyle = `rgba(140,210,255,${a})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (let x = 0; x <= width; x += 4) {
          const wy = game.horizonY + yOff + Math.sin(x * 0.006 + time * 0.008 + layer * 2) * 6;
          if (x === 0) ctx.moveTo(x, wy); else ctx.lineTo(x, wy);
        }
        ctx.stroke();
      }
    }

    function drawSunReflection() {
      const sun = sunRef.current;
      if (sun.y > game.horizonY + 80) return;

      for (let i = 0; i < 30; i++) {
        const y = game.horizonY + 8 + i * ((height - game.horizonY - 8) / 30);
        const shimmer = Math.sin(time * 0.035 + i * 0.55) * (3 + i * 0.2);
        const w = Math.max(1, sun.radius * (1.8 - i * 0.04) + shimmer);
        const alpha = 0.1 - i * 0.003;
        if (alpha <= 0) continue;
        ctx.fillStyle = `rgba(255,190,50,${alpha})`;
        ctx.beginPath();
        ctx.ellipse(sun.x + shimmer, y, w, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawWindsurfer(s: Surfer) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      if (!s.facingRight) ctx.scale(-1, 1);

      // Spray under board
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = "rgba(200,230,255,0.6)";
      ctx.beginPath();
      ctx.ellipse(-6, 4, 28, 5, 0, 0, Math.PI);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Board
      const bg = ctx.createLinearGradient(-24, -3, -24, 4);
      bg.addColorStop(0, "#f5deb3"); bg.addColorStop(1, "#d2a86e");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(-24, 0);
      ctx.quadraticCurveTo(-26, -3, -21, -3);
      ctx.lineTo(21, -3);
      ctx.quadraticCurveTo(26, -2, 24, 0);
      ctx.quadraticCurveTo(26, 3, 21, 3);
      ctx.lineTo(-21, 3);
      ctx.quadraticCurveTo(-26, 3, -24, 0);
      ctx.fill();
      ctx.strokeStyle = "#8B4513"; ctx.lineWidth = 0.5; ctx.stroke();

      // Fin
      ctx.fillStyle = "#444";
      ctx.beginPath(); ctx.moveTo(-6, 3); ctx.lineTo(-4, 9); ctx.lineTo(-2, 3); ctx.fill();

      // Person silhouette
      const pc = "#1a1a2e";
      ctx.fillStyle = pc;
      ctx.beginPath(); ctx.moveTo(-7, -2); ctx.lineTo(-5, -13); ctx.lineTo(-1, -13); ctx.lineTo(-1, -2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(1, -2); ctx.lineTo(3, -13); ctx.lineTo(7, -13); ctx.lineTo(5, -2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-4, -13); ctx.lineTo(-2, -25); ctx.lineTo(4, -25); ctx.lineTo(6, -13); ctx.fill();
      ctx.beginPath(); ctx.arc(1, -28, 3.5, 0, Math.PI * 2); ctx.fill();

      // Arms
      ctx.strokeStyle = pc; ctx.lineWidth = 2.5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(0, -21); ctx.lineTo(13, -16); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(3, -21); ctx.lineTo(15, -14); ctx.stroke();

      // Mast
      ctx.strokeStyle = "#666"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(3, -2); ctx.lineTo(3, -42); ctx.stroke();

      // Sail
      const sg = ctx.createLinearGradient(3, -40, 32, -15);
      sg.addColorStop(0, "rgba(255,255,255,0.93)");
      sg.addColorStop(0.35, "rgba(255,80,35,0.88)");
      sg.addColorStop(0.6, "rgba(255,80,35,0.88)");
      sg.addColorStop(1, "rgba(255,255,255,0.9)");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(3, -40);
      ctx.quadraticCurveTo(35, -26, 27, -3);
      ctx.lineTo(3, -2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 0.5; ctx.stroke();

      // Boom
      ctx.strokeStyle = "#777"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(3, -16); ctx.quadraticCurveTo(20, -13, 22, -7); ctx.stroke();

      ctx.restore();
    }

    function drawSeagull(s: Seagull) {
      const wing = Math.sin(s.wingPhase) * 7;
      ctx.strokeStyle = "rgba(40,40,40,0.6)";
      ctx.lineWidth = 1.5; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(s.x - 10, s.y + wing);
      ctx.quadraticCurveTo(s.x - 3, s.y - wing * 0.4, s.x, s.y);
      ctx.quadraticCurveTo(s.x + 3, s.y - wing * 0.4, s.x + 10, s.y + wing);
      ctx.stroke();
    }

    function drawParticle(p: Particle) {
      const a = p.life / p.maxLife;
      ctx.fillStyle = p.color === "spray"
        ? `rgba(200,235,255,${a * 0.55})`
        : `rgba(255,255,255,${a * 0.35})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2); ctx.fill();
    }

    function spawnSpray(x: number, y: number) {
      for (let i = 0; i < 12; i++) {
        const angle = rr(-Math.PI * 0.9, -Math.PI * 0.1);
        game.particles.push({
          x: x + rr(-10, 10), y: y + rr(-3, 3),
          vx: Math.cos(angle) * rr(1, 4.5), vy: Math.sin(angle) * rr(1, 5),
          life: 1, maxLife: 1, size: rr(1.5, 4), color: "spray",
        });
      }
      scoreRef.current++;
    }

    function spawnTrail(s: Surfer) {
      if (Math.random() > 0.35) return;
      const ox = s.facingRight ? -18 : 18;
      game.particles.push({
        x: s.x + ox + rr(-5, 5), y: s.y + rr(1, 6),
        vx: (s.facingRight ? -1 : 1) * rr(0.2, 1.2), vy: rr(-0.8, -0.1),
        life: 1, maxLife: 1, size: rr(1, 2.5), color: "foam",
      });
    }

    // ── Update ──

    function update() {
      time++;
      const { surfer, waveCrests, clouds, seagulls, particles } = game;
      const sun = sunRef.current;

      if (mouseRef.current.active && !sun.dragging) {
        surfer.targetX = mouseRef.current.x;
      } else if (!mouseRef.current.active && time % 220 === 0) {
        surfer.targetX = rr(80, width - 80);
      }

      const dx = surfer.targetX - surfer.x;
      const speed = Math.min(Math.abs(dx) * 0.055, 7);
      if (Math.abs(dx) > 2) {
        surfer.x += Math.sign(dx) * speed;
        surfer.facingRight = dx > 0;
        spawnTrail(surfer);
      }
      surfer.x = clamp(surfer.x, 50, width - 50);

      surfer.prevY = surfer.y;
      const tgtY = waterY(surfer.x);
      surfer.y += (tgtY - surfer.y) * 0.25;

      const slope = waterY(surfer.x + 6) - waterY(surfer.x - 6);
      surfer.angle += (Math.atan2(slope, 12) * 0.5 - surfer.angle) * 0.12;

      for (const c of waveCrests) {
        const d = Math.abs(surfer.x - c.x);
        if (d < 18 && !c.ridden && c.amplitude > 11) {
          c.ridden = true;
          spawnSpray(surfer.x, surfer.y);
        }
        if (d > c.width) c.ridden = false;
      }

      for (const c of waveCrests) {
        c.x -= c.speed;
        if (c.x < -c.width) {
          c.x = width + rr(20, 80);
          c.speed = rr(0.25, 0.7);
          c.amplitude = rr(8, 24);
          c.width = rr(45, 90);
          c.ridden = false;
        }
      }

      for (const c of clouds) {
        c.x += c.speed;
        if (c.x > width + 120) {
          c.x = -100; c.y = rr(30, game.horizonY * 0.55);
          c.speed = rr(0.1, 0.35); c.opacity = rr(0.15, 0.45);
        }
      }

      for (const s of seagulls) {
        s.x += s.vx;
        s.y = clamp(s.y + Math.sin(time * 0.004 + s.x * 0.008) * 0.25, 10, game.horizonY * 0.55);
        s.wingPhase += s.wingSpeed;
        if (s.x > width + 30) { s.x = -20; s.y = rr(20, game.horizonY * 0.45); }
        if (s.x < -30) { s.x = width + 20; s.y = rr(20, game.horizonY * 0.45); }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.04;
        p.life -= 0.022;
        if (p.life <= 0) particles.splice(i, 1);
      }
      if (particles.length > 200) particles.splice(0, particles.length - 200);
    }

    // ── Draw ──

    function draw() {
      ctx.clearRect(0, 0, width, height);
      drawSky();
      drawStars();
      for (const c of game.clouds) drawCloud(c);
      drawSunBody();
      drawWater();
      drawSunReflection();
      for (const p of game.particles) drawParticle(p);
      drawWindsurfer(game.surfer);
      for (const s of game.seagulls) drawSeagull(s);

      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "13px monospace";
      ctx.fillText(`Wave Rides: ${scoreRef.current}`, 16, 28);
    }

    function loop() { update(); draw(); animFrameRef.current = requestAnimationFrame(loop); }
    loop();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [initGame]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 0, touchAction: "pan-y" }} />;
}
