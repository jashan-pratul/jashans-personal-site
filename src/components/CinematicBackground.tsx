import { useEffect, useRef, useState } from "react";

/**
 * Nocturnal Retrofuturism — Full-Page Procedural WebGL2 Environment.
 *
 * Single full-screen triangle shader producing:
 *  - Smooth emergence from darkness on initial load (u_intro)
 *  - Perspective horizon floor with anti-aliased grid derivatives
 *  - Text-column luminance protection so left-hand editorial copy stays high-contrast
 *  - Orbital horizon arcs & cursor-reactive illumination wave
 *  - Travelling light packets along perspective lanes
 *  - Subtle scanline & film-grain dithering (zero color banding)
 *
 * Performance & Accessibility:
 *  - 1 draw call, 0 external textures.
 *  - Adaptive resolution scaling (steps down automatically if frame time exceeds budget).
 *  - 30 FPS cap on mobile viewports; pauses when tab is hidden.
 *  - Renders a single static frame when prefers-reduced-motion is enabled.
 */

const VERT = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_ptr;      // 0..1, y up
uniform float u_scroll;   // scrollY in viewport heights
uniform float u_closing;  // 0..1 as the contact section arrives
uniform float u_motion;   // 0 when reduced motion
uniform float u_intro;    // 0..1 smooth emergence on initial load

const vec3 ORANGE  = vec3(1.0, 0.333, 0.0);
const vec3 IVORY   = vec3(0.949, 0.937, 0.914);
const vec3 BLUE    = vec3(0.22, 0.74, 0.97);
const vec3 MAGENTA = vec3(0.80, 0.22, 0.52);

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Anti-aliased line of a scalar field at integer values.
float gridLine(float v) {
  float w = fwidth(v);
  float a = abs(fract(v - 0.5) - 0.5);
  float line = 1.0 - smoothstep(0.0, max(w * 1.25, 0.0001), a);
  // Fade lines out as they get denser than a pixel (kills moire at the horizon).
  return line * clamp(0.55 / max(w * 2.0, 0.0001), 0.0, 1.0);
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 uv = fc / u_res;
  float aspect = u_res.x / u_res.y;
  float px = 1.0 / u_res.y;

  float heroK = exp(-u_scroll * 1.65);
  float gridK = max(heroK, u_closing * 0.18) * u_intro;

  // Horizon drifts down gently as the page scrolls (subtle camera altitude parallax).
  float hy = 0.275 - min(u_scroll, 1.5) * 0.075;

  // Protect the left editorial reading column near the horizon so body copy is never crossed by a bright line.
  float leftColumnMask = smoothstep(0.12, 0.52, uv.x);
  float textGuard = mix(0.28, 1.0, leftColumnMask);

  vec3 col = vec3(0.031, 0.031, 0.039);

  // Atmosphere: warm glow hugging the horizon, falling off above and below.
  float dh = uv.y - hy;
  float skyGlow = exp(-max(dh, 0.0) * 5.2) * 0.115;
  float groundGlow = exp(-max(-dh, 0.0) * 8.8) * 0.075;
  col += ORANGE * (dh > 0.0 ? skyGlow : groundGlow) * gridK * mix(0.55, 1.0, leftColumnMask);

  // Restrained crimson/magenta atmospheric edge bleed
  float edge = smoothstep(0.35, 0.95, abs(uv.x - 0.5) * 2.0);
  col += MAGENTA * exp(-abs(dh) * 22.0) * edge * 0.042 * gridK;

  // Cursor light with soft falloff.
  vec2 pd = (uv - u_ptr) * vec2(aspect, 1.0);
  float pDist = length(pd);
  float pl = exp(-pDist * 3.2);
  col += ORANGE * pl * 0.055 * (0.4 + 0.6 * heroK) * u_intro;

  // Orbit rings rising from the horizon behind the portrait stage (right side).
  vec2 sp = (uv - vec2(0.71, hy)) * vec2(aspect, 1.0);
  if (sp.y > 0.0) {
    float r = length(sp);
    float rings = 0.0;
    float radii[4] = float[4](0.17, 0.25, 0.34, 0.44);
    for (int i = 0; i < 4; i++) {
      float d = abs(r - radii[i]);
      rings += (1.0 - smoothstep(0.0, px * 1.45, d)) * (0.24 - float(i) * 0.04);
    }
    float ang = atan(sp.y, sp.x);
    float sweep = 0.55 + 0.45 * sin(ang * 3.0 - u_time * 0.38 * u_motion);
    col += mix(ORANGE, IVORY, 0.25) * rings * sweep * 0.58 * gridK;
    col += ORANGE * exp(-r * 4.8) * 0.075 * gridK;
  }

  // Perspective floor.
  if (uv.y < hy) {
    float d = hy - uv.y;                 // distance below the horizon
    float z = 0.075 / max(d, 0.0008);    // depth
    float x = (uv.x - 0.5) * aspect * z * 1.15;
    float gx = x * 1.4;
    float gz = z * 1.1 - u_time * 0.22 * u_motion;

    float lx = gridLine(gx);
    float lz = gridLine(gz);
    float fog = smoothstep(0.0, 0.07, d) * (1.0 - 0.78 * smoothstep(0.06, hy, d));
    float lines = max(lx, lz) * fog;

    // Subtle radial pulse wave near cursor on the floor
    float wave = 0.5 + 0.5 * sin(pDist * 18.0 - u_time * 2.2 * u_motion);
    float cursorBoost = 1.0 + pl * (1.7 + 0.5 * wave);

    float tint = smoothstep(0.7, 2.2, abs(gx) * 0.25);
    vec3 lineCol = mix(mix(ORANGE, IVORY, 0.14), BLUE, tint * 0.55);
    col += lineCol * lines * 0.55 * gridK * textGuard * cursorBoost;

    // Light trails travelling toward the viewer along perspective lanes.
    float s = d / hy;
    float trails = 0.0;
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float lane = floor(mix(-8.0, 9.0, hash(vec2(fi, 3.7))));
      float t = fract(u_time * (0.05 + 0.02 * fi) * u_motion + hash(vec2(fi, 9.1)));
      float head = t * t;
      float dd = head - s;
      float streak = dd > 0.0 ? exp(-dd * 16.0) : exp(dd * 110.0);
      float laneMask = 1.0 - smoothstep(0.0, max(fwidth(gx) * 1.6, 0.0001), abs(gx - lane));
      trails += streak * laneMask * (1.0 - smoothstep(0.0, 0.06, 1.0 - s));
    }
    col += ORANGE * trails * fog * 1.35 * gridK * textGuard * (u_motion * 0.9 + 0.1);

    // Faint cyan reflection directly under the horizon line
    col += BLUE * exp(-d * 55.0) * 0.035 * gridK * textGuard;
  }

  // Horizon line (attenuated behind left text column so copy stays effortless to read).
  float hl = 1.0 - smoothstep(0.0, px * 1.6, abs(uv.y - hy));
  col += mix(ORANGE, IVORY, 0.22) * hl * 0.28 * gridK * textGuard;

  // Soft ambient pool for the reading sections.
  vec2 ap = (uv - vec2(0.84, 0.62)) * vec2(aspect * 0.7, 1.0);
  col += ORANGE * exp(-length(ap) * 2.6) * 0.04 * (1.0 - heroK * 0.6) * u_intro;

  // Vignette.
  float vig = smoothstep(1.35, 0.3, length((uv - 0.5) * vec2(1.05, 1.0)));
  col *= mix(0.6, 1.0, vig);

  // Scanlines + film grain (also dithers away banding).
  float scan = 0.5 + 0.5 * sin(fc.y * 3.14159);
  col *= 1.0 - 0.026 * scan;
  float frame = floor(u_time * 14.0 * u_motion);
  float g = hash(fc + frame * 17.0) - 0.5;
  col += g * 0.036;

  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    if (import.meta.env.DEV) console.warn(gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function CinematicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) {
      setFallback(true);
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      setFallback(true);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFallback(true);
      return;
    }
    gl.useProgram(program);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = {
      res: gl.getUniformLocation(program, "u_res"),
      time: gl.getUniformLocation(program, "u_time"),
      ptr: gl.getUniformLocation(program, "u_ptr"),
      scroll: gl.getUniformLocation(program, "u_scroll"),
      closing: gl.getUniformLocation(program, "u_closing"),
      motion: gl.getUniformLocation(program, "u_motion"),
      intro: gl.getUniformLocation(program, "u_intro"),
    };

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = reducedQuery.matches;
    const isPhone = () => window.innerWidth < 768;

    let renderScale = isPhone() ? 0.75 : 1;
    const minScale = 0.5;
    let docHeight = document.documentElement.scrollHeight;
    let scrollY = window.scrollY;
    const ptr = { tx: 0.68, ty: 0.56, x: 0.68, y: 0.56 };

    let raf = 0;
    let lastDraw = 0;
    let stillQueued = false;
    const t0 = performance.now();

    let sampleFrames = 0;
    let sampleStart = 0;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.max(2, Math.floor(w * renderScale));
      canvas.height = Math.max(2, Math.floor(h * renderScale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      docHeight = document.documentElement.scrollHeight;
    };
    resize();

    const draw = (now: number) => {
      const vh = window.innerHeight;
      const elapsedSec = (now - t0) * 0.001;
      const introLinear = reduced ? 1 : Math.min(1, elapsedSec / 1.35);
      const introEased = 1 - Math.pow(1 - introLinear, 3);

      const scrollVh = scrollY / Math.max(vh, 1);
      const closingRaw = (scrollY + vh - (docHeight - 1.6 * vh)) / (0.9 * vh);
      const closing = Math.min(1, Math.max(0, closingRaw));
      const eased = closing * closing * (3 - 2 * closing);

      ptr.x += (ptr.tx - ptr.x) * 0.06;
      ptr.y += (ptr.ty - ptr.y) * 0.06;

      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, reduced ? 3.0 : elapsedSec);
      gl.uniform2f(u.ptr, ptr.x, ptr.y);
      gl.uniform1f(u.scroll, scrollVh);
      gl.uniform1f(u.closing, eased);
      gl.uniform1f(u.motion, reduced ? 0 : 1);
      gl.uniform1f(u.intro, introEased);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const minFrame = isPhone() ? 1000 / 30 : 0;
      if (now - lastDraw < minFrame - 1) return;

      if (sampleFrames === 0) sampleStart = now;
      sampleFrames++;
      lastDraw = now;
      draw(now);
      if (sampleFrames >= 60) {
        const avg = (now - sampleStart) / sampleFrames;
        const target = isPhone() ? 1000 / 30 + 6 : 22;
        if (avg > target && renderScale > minScale) {
          renderScale = Math.max(minScale, renderScale - 0.25);
          resize();
        }
        sampleFrames = 0;
      }
    };

    const start = () => {
      cancelAnimationFrame(raf);
      sampleFrames = 0;
      if (!reduced && !document.hidden) raf = requestAnimationFrame(loop);
    };

    const queueStill = () => {
      if (!reduced || stillQueued) return;
      stillQueued = true;
      requestAnimationFrame((now) => {
        stillQueued = false;
        draw(now);
      });
    };

    const onScroll = () => {
      scrollY = window.scrollY;
      queueStill();
    };
    const onPointer = (e: PointerEvent) => {
      ptr.tx = e.clientX / Math.max(window.innerWidth, 1);
      ptr.ty = 1 - e.clientY / Math.max(window.innerHeight, 1);
    };
    const onResize = () => {
      resize();
      queueStill();
    };
    const onVisibility = () => start();
    const onMotion = (e: MediaQueryListEvent) => {
      reduced = e.matches;
      start();
      queueStill();
    };

    const ro = new ResizeObserver(() => {
      docHeight = document.documentElement.scrollHeight;
      queueStill();
    });
    ro.observe(document.body);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reducedQuery.addEventListener("change", onMotion);

    draw(performance.now());
    start();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedQuery.removeEventListener("change", onMotion);
      gl.deleteBuffer(buf);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#08080A]"
      style={
        fallback
          ? {
              background:
                "radial-gradient(60% 50% at 70% 30%, rgba(255,85,0,0.10), transparent 70%), radial-gradient(80% 40% at 50% 100%, rgba(255,85,0,0.06), transparent 70%), #08080A",
            }
          : undefined
      }
    >
      {!fallback && <canvas ref={canvasRef} className="block size-full" />}
    </div>
  );
}
