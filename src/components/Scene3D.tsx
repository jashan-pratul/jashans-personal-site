import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  LineLoop,
  LineSegments,
  OctahedronGeometry,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  TorusKnotGeometry,
  Vector2,
  WebGLRenderer,
  WireframeGeometry,
} from "three";
import { useEffect, useRef } from "react";

/**
 * Signature 3D Orbital & GPU Particle Engine (Three.js + Custom GLSL).
 *
 * Designed specifically to frame Jashan Pratul's hero portrait without occluding
 * or competing with his likeness:
 *  - Multi-planar orbital astrolabe rings with directional shader sweep pulses
 *  - Real-time orbiting satellite nodes travelling along inclined orbital paths
 *  - Multi-layered wireframe latitude/longitude globe + inner faceted core at upper-right apogee
 *  - Counter-rotating faceted polyhedron assembly at lower-left perigee
 *  - GPU-accelerated particle field with cursor-responsive repulsion, tangential swirl, and entrance choreography
 *  - Adaptive DPR, IntersectionObserver pause, tab-visibility pause, and prefers-reduced-motion support
 */

type Variant = "portrait" | "sculpture";

const ORANGE = 0xff5500;
const IVORY = 0xf2efe9;
const BLUE = 0x38bdf8;

function lineMaterial(color: number, opacity: number, sweepStrength = 0.0) {
  return new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color(color) },
      uOpacity: { value: opacity },
      uTime: { value: 0 },
      uIntro: { value: 1 },
      uSweep: { value: sweepStrength },
    },
    vertexShader: /* glsl */ `
      varying float vD;
      varying float vAngle;
      void main() {
        vAngle = atan(position.z, position.x);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vD = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uTime;
      uniform float uIntro;
      uniform float uSweep;
      varying float vD;
      varying float vAngle;
      void main() {
        float depthFade = smoothstep(10.5, 5.5, vD);
        float pulse = 1.0 + uSweep * (0.5 + 0.5 * sin(vAngle * 2.0 - uTime * 1.4));
        float alpha = uOpacity * mix(0.2, 1.0, depthFade) * pulse * uIntro;
        gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 1.0));
      }`,
    transparent: true,
    depthWrite: false,
  });
}

function globeGeometry(radius: number, latStep = 15, lonStep = 15, seg = 72) {
  const pos: number[] = [];
  for (let lat = -75; lat <= 75; lat += latStep) {
    const phi = (lat * Math.PI) / 180;
    const r = Math.cos(phi) * radius;
    const y = Math.sin(phi) * radius;
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2;
      const a1 = ((i + 1) / seg) * Math.PI * 2;
      pos.push(Math.cos(a0) * r, y, Math.sin(a0) * r, Math.cos(a1) * r, y, Math.sin(a1) * r);
    }
  }
  for (let lon = 0; lon < 180; lon += lonStep) {
    const theta = (lon * Math.PI) / 180;
    for (let i = 0; i < seg; i++) {
      const p0 = (i / seg) * Math.PI * 2;
      const p1 = ((i + 1) / seg) * Math.PI * 2;
      const pt = (p: number) => [
        Math.cos(p) * Math.cos(theta) * radius,
        Math.sin(p) * radius,
        Math.cos(p) * Math.sin(theta) * radius,
      ];
      pos.push(...pt(p0), ...pt(p1));
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  return g;
}

function ringGeometry(radius: number, seg = 180) {
  const pos: number[] = [];
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    pos.push(Math.cos(a) * radius, 0, Math.sin(a) * radius);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  return g;
}

function dashedRingGeometry(radius: number, dashes = 48, duty = 0.55) {
  const pos: number[] = [];
  for (let i = 0; i < dashes; i++) {
    const a0 = (i / dashes) * Math.PI * 2;
    const a1 = ((i + duty) / dashes) * Math.PI * 2;
    pos.push(
      Math.cos(a0) * radius,
      0,
      Math.sin(a0) * radius,
      Math.cos(a1) * radius,
      0,
      Math.sin(a1) * radius,
    );
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  return g;
}

function tickGeometry(radius: number, count = 144) {
  const pos: number[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const len = i % 12 === 0 ? 0.17 : i % 6 === 0 ? 0.1 : 0.045;
    pos.push(
      Math.cos(a) * radius,
      0,
      Math.sin(a) * radius,
      Math.cos(a) * (radius + len),
      0,
      Math.sin(a) * (radius + len),
    );
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  return g;
}

function particleField(count: number, spread: [number, number, number]) {
  const position = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const color = new Float32Array(count * 3);
  const palette = [new Color(ORANGE), new Color(IVORY), new Color(BLUE)];

  let s = 1234567;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };

  for (let i = 0; i < count; i++) {
    // Distribute particles in a hollow cylindrical/spherical shell around the portrait frame
    // so more particles are visible in the perimeter halo.
    const angle = rnd() * Math.PI * 2;
    const radiusBias = 0.35 + 0.65 * Math.sqrt(rnd());
    position[i * 3] = Math.cos(angle) * spread[0] * radiusBias;
    position[i * 3 + 1] = (rnd() - 0.5) * 2 * spread[1];
    position[i * 3 + 2] = Math.sin(angle) * spread[2] * radiusBias;
    seed[i] = rnd();
    const r = rnd();
    const c = r < 0.58 ? palette[0] : r < 0.86 ? palette[1] : palette[2];
    color[i * 3] = c.r;
    color[i * 3 + 1] = c.g;
    color[i * 3 + 2] = c.b;
  }

  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(position, 3));
  g.setAttribute("aSeed", new Float32BufferAttribute(seed, 1));
  g.setAttribute("aColor", new Float32BufferAttribute(color, 3));

  const m = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMotion: { value: 1 },
      uPixelRatio: { value: 1 },
      uPointer: { value: new Vector2(0, 0) },
      uIntro: { value: 1 },
    },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      attribute vec3 aColor;
      uniform float uTime;
      uniform float uMotion;
      uniform float uPixelRatio;
      uniform vec2 uPointer;
      uniform float uIntro;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float t = uTime * uMotion;
        vec3 p = position * mix(0.72, 1.0, uIntro);

        // Gentle orbital drift
        p.y += sin(t * 0.34 + aSeed * 20.0) * 0.11;
        p.x += cos(t * 0.28 + aSeed * 13.0) * 0.08;
        p.z += sin(t * 0.22 + aSeed * 17.0) * 0.08;

        // Interactive cursor repulsion + tangential swirl in world-XY plane
        vec2 ptrWorld = uPointer * vec2(2.3, 2.3);
        vec2 toParticle = p.xy - ptrWorld;
        float dist = length(toParticle);
        float influence = exp(-dist * dist * 1.45) * uMotion;
        vec2 dir = dist > 0.001 ? normalize(toParticle) : vec2(0.0, 1.0);
        vec2 tangent = vec2(-dir.y, dir.x);
        p.xy += (dir * 0.24 + tangent * 0.16) * influence;
        p.z += influence * 0.22;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;

        float boost = 1.0 + influence * 0.85;
        gl_PointSize = (1.35 + aSeed * 2.65) * boost * uPixelRatio * (22.0 / -mv.z);
        vColor = mix(aColor, vec3(1.0, 0.45, 0.1), influence * 0.55);
        float tw = 0.5 + 0.5 * sin(t * 0.9 + aSeed * 40.0);
        vAlpha = (0.28 + 0.72 * tw) * smoothstep(11.5, 4.8, -mv.z) * uIntro;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float core = smoothstep(0.5, 0.08, d);
        float glow = exp(-d * 5.0) * 0.45;
        gl_FragColor = vec4(vColor, (core + glow) * vAlpha * 0.88);
      }`,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  return new Points(g, m);
}

export default function Scene3D({ variant = "portrait" }: { variant?: Variant }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      return;
    }
    renderer.setClearColor(0x000000, 0);
    let pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(pixelRatio);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const scene = new Scene();
    const camera = new PerspectiveCamera(35, 1, 0.1, 40);
    camera.position.z = 7.7;

    const root = new Group();
    scene.add(root);

    const disposables: { dispose: () => void }[] = [];
    const lineMats: ShaderMaterial[] = [];

    const track = <T extends { dispose: () => void }>(o: T) => {
      disposables.push(o);
      return o;
    };
    const trackLineMat = (color: number, opacity: number, sweep = 0) => {
      const m = track(lineMaterial(color, opacity, sweep));
      lineMats.push(m);
      return m;
    };

    const animated: { obj: { rotation: { x: number; y: number; z: number } }; speed: [number, number, number] }[] =
      [];

    let particles: Points;

    if (variant === "portrait") {
      // 1. Primary Inclined Telemetry Ring (Orange + Ivory degree ticks + 2 orbital satellites)
      const ringA = new Group();
      const ringRadiusA = 2.68;
      ringA.add(new LineLoop(track(ringGeometry(ringRadiusA)), trackLineMat(ORANGE, 0.92, 0.45)));
      ringA.add(new LineSegments(track(tickGeometry(ringRadiusA, 144)), trackLineMat(IVORY, 0.58, 0.2)));

      // Satellite nodes positioned on ringA so they physically orbit as ringA rotates around Y
      const satGeo = track(new EdgesGeometry(track(new OctahedronGeometry(0.085, 0)), 1));
      const sat1 = new LineSegments(satGeo, trackLineMat(ORANGE, 1.0));
      sat1.position.set(ringRadiusA, 0, 0);
      const sat2 = new LineSegments(satGeo, trackLineMat(IVORY, 0.9));
      sat2.position.set(-ringRadiusA, 0, 0);
      ringA.add(sat1, sat2);

      ringA.rotation.set(1.16, 0.0, 0.48);
      root.add(ringA);
      animated.push({ obj: ringA, speed: [0, 0.085, 0] });

      // 2. Counter-Rotating Azimuth Ring (Cyan + Dashed Telemetry Arc)
      const ringB = new Group();
      const ringRadiusB = 2.96;
      ringB.add(new LineLoop(track(ringGeometry(ringRadiusB)), trackLineMat(BLUE, 0.58, 0.35)));
      ringB.add(new LineSegments(track(dashedRingGeometry(ringRadiusB * 0.965, 56, 0.5)), trackLineMat(IVORY, 0.35)));

      const sat3 = new LineSegments(satGeo, trackLineMat(BLUE, 0.95));
      sat3.position.set(0, 0, ringRadiusB);
      ringB.add(sat3);

      ringB.rotation.set(0.92, 0.38, -0.66);
      root.add(ringB);
      animated.push({ obj: ringB, speed: [0, -0.055, 0] });

      // 3. Outer Calibration Meridian Ring (Subtle Ivory/Orange Halo)
      const ringC = new Group();
      ringC.add(new LineSegments(track(dashedRingGeometry(3.22, 72, 0.42)), trackLineMat(IVORY, 0.26)));
      ringC.rotation.set(1.42, -0.22, 0.18);
      root.add(ringC);
      animated.push({ obj: ringC, speed: [0, 0.03, 0] });

      // 4. Multi-Layered Wireframe Globe Assembly at Upper-Right Apogee
      // Positioned at (1.76, 1.72, 0.35) so it sits cleanly outside the portrait corner without container clipping
      const globeGroup = new Group();
      globeGroup.position.set(1.76, 1.72, 0.35);
      globeGroup.rotation.set(0.32, 0.1, 0.26);

      const globeOuter = new LineSegments(track(globeGeometry(0.56, 15, 15, 72)), trackLineMat(ORANGE, 0.95, 0.3));
      const globeInnerIso = new LineSegments(
        track(new EdgesGeometry(track(new IcosahedronGeometry(0.3, 0)), 1)),
        trackLineMat(IVORY, 0.65),
      );
      const globeEquator = new LineLoop(track(ringGeometry(0.72, 96)), trackLineMat(BLUE, 0.65, 0.35));
      globeEquator.rotation.x = Math.PI * 0.42;

      globeGroup.add(globeOuter, globeInnerIso, globeEquator);
      root.add(globeGroup);
      animated.push({ obj: globeOuter, speed: [0, 0.22, 0] });
      animated.push({ obj: globeInnerIso, speed: [-0.18, -0.28, 0.1] });
      animated.push({ obj: globeEquator, speed: [0, 0, 0.16] });

      // 5. Lower-Left Faceted Polyhedron Assembly at Perigee
      const isoGroup = new Group();
      isoGroup.position.set(-1.78, -1.72, 0.42);
      const isoOuter = new LineSegments(
        track(new EdgesGeometry(track(new IcosahedronGeometry(0.42, 1)), 1)),
        trackLineMat(IVORY, 0.78, 0.25),
      );
      const isoCore = new LineSegments(
        track(new EdgesGeometry(track(new OctahedronGeometry(0.22, 0)), 1)),
        trackLineMat(ORANGE, 0.9),
      );
      isoGroup.add(isoOuter, isoCore);
      root.add(isoGroup);
      animated.push({ obj: isoOuter, speed: [0.14, 0.22, 0] });
      animated.push({ obj: isoCore, speed: [-0.24, -0.18, 0.12] });

      particles = particleField(440, [3.05, 3.05, 2.5]);
    } else {
      const knotGeo = track(new TorusKnotGeometry(0.95, 0.3, 120, 12, 2, 3));
      const wire = track(new WireframeGeometry(knotGeo));
      const knot = new LineSegments(wire, trackLineMat(ORANGE, 0.7));
      root.add(knot);
      animated.push({ obj: knot, speed: [0.06, 0.14, 0] });

      const core = new LineSegments(
        track(new EdgesGeometry(track(new IcosahedronGeometry(0.5, 1)), 1)),
        trackLineMat(IVORY, 0.9),
      );
      root.add(core);
      animated.push({ obj: core, speed: [-0.1, -0.18, 0] });

      const orbit = new Group();
      orbit.add(new LineLoop(track(ringGeometry(2.0)), trackLineMat(BLUE, 0.5)));
      orbit.add(new LineSegments(track(tickGeometry(2.0, 144)), trackLineMat(IVORY, 0.4)));
      orbit.rotation.set(1.25, 0, 0.35);
      root.add(orbit);
      animated.push({ obj: orbit, speed: [0, 0.07, 0] });

      particles = particleField(220, [3.2, 2.6, 2.4]);
    }

    root.add(particles);
    track(particles.geometry);
    track(particles.material as ShaderMaterial);
    const pMat = particles.material as ShaderMaterial;

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      pMat.uniforms.uPixelRatio.value = pixelRatio;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = reducedQuery.matches;
    let visible = true;
    let raf = 0;
    const ptr = { tx: 0, ty: 0, x: 0, y: 0 };
    const mountTime = performance.now();
    let last = mountTime;
    let elapsed = 0;
    let frames = 0;
    let sampleStart = 0;

    const onPointer = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        // Normalize pointer relative to the 3D stage center (-1..1)
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        ptr.tx = Math.max(-1.25, Math.min(1.25, nx));
        ptr.ty = Math.max(-1.25, Math.min(1.25, ny));
      }
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const renderFrame = (dt: number, now: number) => {
      if (!reduced) {
        elapsed += dt;
        for (const a of animated) {
          a.obj.rotation.x += a.speed[0] * dt;
          a.obj.rotation.y += a.speed[1] * dt;
          a.obj.rotation.z += a.speed[2] * dt;
        }
      }

      const introRaw = reduced ? 1 : Math.min(1, (now - mountTime) / 1400);
      const introEased = 1 - Math.pow(1 - introRaw, 3);

      ptr.x += (ptr.tx - ptr.x) * 0.065;
      ptr.y += (ptr.ty - ptr.y) * 0.065;

      const scale = 0.9 + 0.1 * introEased;
      root.scale.setScalar(scale);
      root.rotation.y = ptr.x * 0.24;
      root.rotation.x = -ptr.y * 0.16;

      camera.position.x = ptr.x * 0.2;
      camera.position.y = ptr.y * 0.14;
      camera.lookAt(0, 0, 0);

      for (const m of lineMats) {
        m.uniforms.uTime.value = elapsed;
        m.uniforms.uIntro.value = introEased;
      }

      pMat.uniforms.uTime.value = elapsed;
      pMat.uniforms.uMotion.value = reduced ? 0 : 1;
      pMat.uniforms.uIntro.value = introEased;
      (pMat.uniforms.uPointer.value as Vector2).set(ptr.x, ptr.y);

      renderer.render(scene, camera);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (frames === 0) sampleStart = now;
      frames++;
      renderFrame(dt, now);
      if (frames >= 90) {
        const avg = (now - sampleStart) / frames;
        if (avg > 24 && pixelRatio > 1) {
          pixelRatio = 1;
          resize();
        }
        frames = 0;
      }
    };

    const sync = () => {
      cancelAnimationFrame(raf);
      frames = 0;
      last = performance.now();
      if (visible && !document.hidden && !reduced) {
        raf = requestAnimationFrame(loop);
      } else {
        renderFrame(0, performance.now());
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { rootMargin: "80px" },
    );
    io.observe(host);

    const onVis = () => sync();
    const onMotion = (e: MediaQueryListEvent) => {
      reduced = e.matches;
      sync();
    };
    document.addEventListener("visibilitychange", onVis);
    reducedQuery.addEventListener("change", onMotion);

    renderFrame(0, performance.now());
    sync();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVis);
      reducedQuery.removeEventListener("change", onMotion);
      for (const d of disposables) d.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [variant]);

  return <div ref={hostRef} className="size-full" />;
}
