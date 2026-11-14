import { useEffect, useRef } from "react";

interface RibbonSpec {
  colorA: string;
  colorB: string;
  colorC: string;
  glow: string;
  width: number;
  amp: number;
  freq: number;
  speed: number;
  phase: number;
  offsetY: number;
}

const FALLBACK_RIBBONS: RibbonSpec[] = [
  {
    colorA: "rgba(139, 53, 213, 0.85)",
    colorB: "rgba(232, 76, 168, 0.85)",
    colorC: "rgba(54, 217, 232, 0.80)",
    glow: "rgba(139, 53, 213, 0.42)",
    width: 68,
    amp: 62,
    freq: 1.4,
    speed: 0.32,
    phase: 0.0,
    offsetY: -0.14,
  },
  {
    colorA: "rgba(232, 76, 168, 0.85)",
    colorB: "rgba(255, 121, 198, 0.85)",
    colorC: "rgba(255, 173, 87, 0.80)",
    glow: "rgba(232, 76, 168, 0.40)",
    width: 48,
    amp: 48,
    freq: 1.75,
    speed: 0.4,
    phase: 1.1,
    offsetY: -0.04,
  },
  {
    colorA: "rgba(54, 217, 232, 0.85)",
    colorB: "rgba(139, 53, 213, 0.82)",
    colorC: "rgba(255, 121, 198, 0.84)",
    glow: "rgba(54, 217, 232, 0.38)",
    width: 38,
    amp: 52,
    freq: 1.6,
    speed: 0.35,
    phase: 2.2,
    offsetY: 0.05,
  },
  {
    colorA: "rgba(255, 173, 87, 0.82)",
    colorB: "rgba(232, 76, 168, 0.85)",
    colorC: "rgba(139, 53, 213, 0.80)",
    glow: "rgba(255, 173, 87, 0.34)",
    width: 30,
    amp: 42,
    freq: 1.9,
    speed: 0.45,
    phase: 3.1,
    offsetY: 0.14,
  },
];

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_scroll;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

// Compute smooth ribbon intensity for a diagonal wave trajectory
vec2 ribbonProfile(vec2 uv, float freq, float speed, float phase, float offset, float width) {
  float u = uv.x;
  float diag = 0.20 + u * 0.62 + offset;
  float w1 = sin(u * 3.14159 * freq + u_time * speed + phase) * 0.065;
  float w2 = cos(u * 3.14159 * (freq * 0.62) - u_time * (speed * 0.72) + phase) * 0.028;
  float cursorInfluence = (u_pointer.y - 0.5) * 0.045 * exp(-pow(u - u_pointer.x, 2.0) * 7.0);
  float scrollShift = sin(u_scroll * 0.0006 + phase) * 0.015;
  float center = diag + w1 + w2 + cursorInfluence + scrollShift;
  float dist = abs(uv.y - center);
  float core = exp(-dist / max(width * 0.16, 0.002));
  float glow = exp(-dist / max(width, 0.008));
  return vec2(core, glow);
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);

  // 1. Deep nocturnal base gradient (#090611 -> #220b38)
  vec2 pCenter = vec2(0.55 + (u_pointer.x - 0.5) * 0.08, 0.62 + (u_pointer.y - 0.5) * 0.08);
  float rad = length((uv - pCenter) * vec2(aspect * 0.65, 1.0));
  vec3 cMidnight = vec3(0.035, 0.024, 0.067); // #090611
  vec3 cViolet   = vec3(0.165, 0.055, 0.255); // Deep violet
  vec3 cPurple   = vec3(0.545, 0.208, 0.835); // #8B35D5
  vec3 cMagenta  = vec3(0.910, 0.298, 0.659); // #E84CA8
  vec3 cPink     = vec3(1.000, 0.475, 0.776); // #FF79C6
  vec3 cCyan     = vec3(0.212, 0.851, 0.910); // #36D9E8
  vec3 cOrange   = vec3(1.000, 0.678, 0.341); // #FFAD57

  vec3 col = mix(cViolet, cMidnight, smoothstep(0.0, 1.15, rad));

  // 2. Subtle atmospheric diagonal aura
  float diagAura = smoothstep(0.0, 1.0, uv.x * 0.65 + uv.y * 0.35);
  col += mix(cPurple, cCyan, diagAura) * 0.055 * exp(-abs(uv.y - (0.22 + uv.x * 0.58)) * 3.2);

  // 3. Recessed perspective synthwave horizon grid in lower 28% of viewport
  if (uv.y < 0.30) {
    float horizon = 0.30;
    float depth = max(horizon - uv.y, 0.002);
    float perspX = (uv.x - 0.5) * aspect / (depth * 3.6);
    float perspZ = (1.0 / depth) * 0.22 + u_time * 0.35 + u_scroll * 0.002;
    float gx = abs(fract(perspX) - 0.5);
    float gz = abs(fract(perspZ) - 0.5);
    float lineX = smoothstep(0.035, 0.0, gx);
    float lineZ = smoothstep(0.045, 0.0, gz);
    float gridMask = smoothstep(0.30, 0.02, uv.y) * smoothstep(0.0, 0.12, uv.y);
    vec3 gridCol = mix(cMagenta, cCyan, clamp(uv.x, 0.0, 1.0));
    col += gridCol * max(lineX, lineZ * 0.75) * gridMask * 0.13;
  }

  // 4. Multi-spectral diagonal light ribbons
  vec2 r1 = ribbonProfile(uv, 1.40, 0.32, 0.0, -0.10, 0.055);
  vec3 grad1 = mix(cPurple, mix(cMagenta, cCyan, uv.x), uv.x);
  col += grad1 * (r1.y * 0.22 + r1.x * 0.55);

  vec2 r2 = ribbonProfile(uv, 1.75, 0.40, 1.1, -0.02, 0.042);
  vec3 grad2 = mix(cMagenta, mix(cPink, cOrange, uv.x), uv.x);
  col += grad2 * (r2.y * 0.20 + r2.x * 0.52);

  vec2 r3 = ribbonProfile(uv, 1.60, 0.35, 2.2, 0.06, 0.036);
  vec3 grad3 = mix(cCyan, mix(cPurple, cPink, uv.x), uv.x);
  col += grad3 * (r3.y * 0.18 + r3.x * 0.48);

  vec2 r4 = ribbonProfile(uv, 1.90, 0.45, 3.1, 0.14, 0.028);
  vec3 grad4 = mix(cOrange, mix(cMagenta, cPurple, uv.x), uv.x);
  col += grad4 * (r4.y * 0.15 + r4.x * 0.42);

  // 5. Subtle starfield dust in upper region
  vec2 starGrid = floor(uv * vec2(aspect * 38.0, 38.0));
  vec2 starLocal = fract(uv * vec2(aspect * 38.0, 38.0)) - 0.5;
  float seed = hash21(starGrid);
  if (seed > 0.94) {
    float d = length(starLocal);
    float twinkle = 0.65 + 0.35 * sin(u_time * (1.2 + fract(seed * 17.0) * 2.0) + seed * 40.0);
    float star = smoothstep(0.08, 0.0, d) * twinkle * smoothstep(0.15, 0.85, uv.y);
    col += mix(cPink, cCyan, fract(seed * 13.0)) * star * 0.55;
  }

  // 6. Soft edge vignette & micro-dither to prevent banding and keep text legible
  float vig = smoothstep(1.25, 0.28, length((uv - 0.5) * vec2(1.15, 1.05)));
  col *= mix(0.42, 1.0, vig);
  float dither = (hash21(gl_FragCoord.xy + fract(u_time)) - 0.5) / 255.0;
  col += dither;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export function SynthwaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = reducedMotionQuery.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
    };
    reducedMotionQuery.addEventListener("change", onMotionChange);

    let w = window.innerWidth;
    let h = window.innerHeight;
    let rafId = 0;
    let scrollY = window.scrollY;

    const pointer = { tx: 0.5, ty: 0.5, x: 0.5, y: 0.5 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.tx = e.clientX / Math.max(w, 1);
      pointer.ty = 1.0 - e.clientY / Math.max(h, 1);
    };
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    // Attempt lightweight WebGL shader pipeline first; fall back to 2D Canvas if unavailable
    const gl = (canvas.getContext("webgl2", { alpha: false, antialias: false, powerPreference: "low-power" }) ||
      canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        powerPreference: "low-power",
      })) as WebGLRenderingContext | null;

    const program = gl ? createProgram(gl) : null;

    if (gl && program) {
      const posBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );

      const aPos = gl.getAttribLocation(program, "a_position");
      const uRes = gl.getUniformLocation(program, "u_resolution");
      const uTime = gl.getUniformLocation(program, "u_time");
      const uPtr = gl.getUniformLocation(program, "u_pointer");
      const uScroll = gl.getUniformLocation(program, "u_scroll");

      const resizeGl = () => {
        w = window.innerWidth;
        h = window.innerHeight;
        const dpr = w < 768 ? 1 : Math.min(window.devicePixelRatio || 1, 1.25);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
      };
      resizeGl();
      window.addEventListener("resize", resizeGl, { passive: true });

      const renderGl = (timeMs: number) => {
        const shouldAnimate = !reducedMotion && !document.hidden;
        const t = shouldAnimate ? timeMs * 0.001 : 4.2;
        pointer.x += (pointer.tx - pointer.x) * 0.05;
        pointer.y += (pointer.ty - pointer.y) * 0.05;

        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, t);
        gl.uniform2f(uPtr, pointer.x, pointer.y);
        gl.uniform1f(uScroll, scrollY);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        if (shouldAnimate) {
          rafId = window.requestAnimationFrame(renderGl);
        }
      };

      const onVisibilityGl = () => {
        window.cancelAnimationFrame(rafId);
        if (!document.hidden && !reducedMotion) {
          rafId = window.requestAnimationFrame(renderGl);
        }
      };
      document.addEventListener("visibilitychange", onVisibilityGl);

      renderGl(performance.now());
      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(renderGl);
      }

      return () => {
        window.cancelAnimationFrame(rafId);
        window.removeEventListener("resize", resizeGl);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("scroll", onScroll);
        document.removeEventListener("visibilitychange", onVisibilityGl);
        reducedMotionQuery.removeEventListener("change", onMotionChange);
        if (posBuffer) gl.deleteBuffer(posBuffer);
        gl.deleteProgram(program);
      };
    }

    // Graceful 2D Canvas Fallback if WebGL is unavailable
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const resize2d = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize2d();
    window.addEventListener("resize", resize2d, { passive: true });

    const draw2d = (timeMs: number) => {
      const shouldAnimate = !reducedMotion && !document.hidden;
      const t = shouldAnimate ? timeMs * 0.001 : 4.2;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;

      const baseGrad = ctx.createRadialGradient(w * 0.55, h * 0.35, 20, w * 0.5, h * 0.5, Math.max(w, h) * 0.9);
      baseGrad.addColorStop(0, "#210b36");
      baseGrad.addColorStop(0.5, "#120622");
      baseGrad.addColorStop(1, "#090611");
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = "screen";
      const steps = w < 640 ? 32 : 52;
      const startX = -w * 0.12;
      const spanX = w * 1.24;

      for (let rIdx = 0; rIdx < FALLBACK_RIBBONS.length; rIdx++) {
        const r = FALLBACK_RIBBONS[rIdx];
        const grad = ctx.createLinearGradient(0, h * 0.85, w, h * 0.12);
        grad.addColorStop(0, r.colorA);
        grad.addColorStop(0.5, r.colorB);
        grad.addColorStop(1, r.colorC);

        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const u = i / steps;
          const x = startX + u * spanX;
          const y =
            h * (0.82 - u * 0.64 + r.offsetY) +
            Math.sin(u * Math.PI * r.freq + t * r.speed + r.phase) * r.amp;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineCap = "round";
        ctx.strokeStyle = r.glow;
        ctx.lineWidth = r.width * 1.8;
        ctx.globalAlpha = 0.22;
        ctx.stroke();

        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(2.2, r.width * 0.12);
        ctx.globalAlpha = 0.8;
        ctx.stroke();
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      if (shouldAnimate) {
        rafId = window.requestAnimationFrame(draw2d);
      }
    };

    draw2d(performance.now());
    if (!reducedMotion) {
      rafId = window.requestAnimationFrame(draw2d);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize2d);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      reducedMotionQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <canvas ref={canvasRef} className="block size-full" />
    </div>
  );
}
