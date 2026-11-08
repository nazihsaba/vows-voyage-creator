import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * "Golden Vows" — 3D hero background for the home page.
 * Gold dust gathers into two interlocking wedding bands (yellow-gold solitaire
 * engagement ring + rose-gold band), they shine, then dissolve back to stardust.
 * Rose petals drift throughout. Pure three.js, cleaned up on unmount.
 */

// ---------- Ring dimensions (scene units) ----------
const RI = 0.9; // inner radius
const RO = 1.02; // outer radius
const HALF_W = 0.13; // half of band width
const BAND_C = (RI + RO) / 2;
const BAND_H = (RO - RI) / 2;

// Comfort-fit wedding band profile: domed outside, almost flat inside.
function bandPoint(theta: number) {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const n = c >= 0 ? 2.4 : 7;
  const e = 2 / n;
  const x = BAND_C + BAND_H * Math.sign(c) * Math.pow(Math.abs(c), e);
  const y = HALF_W * Math.sign(s) * Math.pow(Math.abs(s), e);
  return new THREE.Vector2(x, y);
}

function bandGeometry(segments: number) {
  const pts: THREE.Vector2[] = [];
  const steps = 72;
  for (let i = 0; i <= steps; i++) pts.push(bandPoint(-Math.PI / 2 + (i / steps) * Math.PI * 2));
  const geo = new THREE.LatheGeometry(pts, segments);
  geo.computeVertexNormals();
  return geo;
}

// Round brilliant cut (faceted via flat shading).
function diamondGeometry() {
  const g = 0.14; // girdle radius
  const pts = [
    new THREE.Vector2(0.0001, -0.12), // culet
    new THREE.Vector2(g, 0),
    new THREE.Vector2(g, 0.012),
    new THREE.Vector2(g * 0.74, 0.042),
    new THREE.Vector2(g * 0.56, 0.058), // table edge
    new THREE.Vector2(0.0001, 0.058),
  ];
  return new THREE.LatheGeometry(pts, 16);
}

// Photo-studio style environment (softboxes) for realistic metal reflections.
function studioEnvironment(renderer: THREE.WebGLRenderer) {
  const env = new THREE.Scene();
  const disposables: { dispose: () => void }[] = [];
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.09, 0.07, 0.055), side: THREE.BackSide }),
  );
  env.add(room);
  disposables.push(room.geometry, room.material as THREE.Material);

  const panel = (w: number, h: number, power: number, color: number, pos: [number, number, number]) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide }),
    );
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    env.add(m);
    disposables.push(m.geometry, m.material as THREE.Material);
  };
  panel(7, 1.4, 9, 0xffffff, [0, 4.8, 0.5]); // overhead strip
  panel(1.2, 6, 6, 0xfff4e6, [-4.8, 0.5, 1.5]); // left strip
  panel(1.2, 6, 6, 0xfff4e6, [4.8, 0.5, 1.5]); // right strip
  panel(4, 2.2, 3.5, 0xffdcb4, [0, 1, 4.8]); // warm key, front
  panel(5, 3, 3, 0xffc391, [0, 0, -4.8]); // warm back
  panel(4, 0.8, 1.8, 0xffffff, [0, -4.8, 0]); // floor bounce

  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.025).texture;
  pmrem.dispose();
  disposables.forEach((d) => d.dispose());
  return tex;
}

const GoldenVowsHero = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // no WebGL: the gradient background stays
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.75 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    const envTex = studioEnvironment(renderer);
    scene.environment = envTex;
    const ambient = new THREE.AmbientLight(0xffe8cc, 0.5);
    const keyLight = new THREE.DirectionalLight(0xfff1dc, 1.6);
    keyLight.position.set(3, 4, 5);
    scene.add(ambient, keyLight);

    // ---------- Rings ----------
    const ringA = { c: new THREE.Vector3(-0.55, 0, 0), rot: new THREE.Euler(0, 0, 0) }; // yellow gold
    const ringB = { c: new THREE.Vector3(0.55, 0, 0), rot: new THREE.Euler(Math.PI / 2, 0, 0) }; // rose gold

    const rings = new THREE.Group();
    rings.rotation.set(0.35, -0.5, 0.12);
    rings.scale.setScalar(isMobile ? 1.15 : 1.9);
    scene.add(rings);

    const goldMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(1.0, 0.74, 0.3).convertLinearToSRGB(),
      metalness: 1,
      roughness: 0.08,
      envMapIntensity: 1.8,
      transparent: true,
      opacity: 0,
    });
    const roseMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(1.0, 0.64, 0.52).convertLinearToSRGB(),
      metalness: 1,
      roughness: 0.08,
      envMapIntensity: 2.2,
      transparent: true,
      opacity: 0,
    });

    const bandGeo = bandGeometry(isMobile ? 128 : 200);
    const makeRing = (ring: typeof ringA, mat: THREE.Material) => {
      const g = new THREE.Group();
      g.position.copy(ring.c);
      g.rotation.copy(ring.rot);
      const mesh = new THREE.Mesh(bandGeo, mat);
      mesh.rotation.x = Math.PI / 2; // lathe axis (Y) -> ring axis (Z)
      g.add(mesh);
      rings.add(g);
      return { group: g, mesh };
    };
    const A = makeRing(ringA, goldMat);
    const B = makeRing(ringB, roseMat);

    // Solitaire setting on the yellow-gold ring
    const head = new THREE.Group();
    head.position.set(0, RO - 0.01, 0);
    A.group.add(head);
    const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.1, 32), goldMat);
    basket.position.y = 0.04;
    head.add(basket);
    const prongGeo = new THREE.CylinderGeometry(0.011, 0.014, 0.2, 12);
    const tipGeo = new THREE.SphereGeometry(0.016, 12, 10);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      const prong = new THREE.Mesh(prongGeo, goldMat);
      prong.position.set(Math.cos(a) * 0.1, 0.16, Math.sin(a) * 0.1);
      prong.lookAt(Math.cos(a) * 0.3, 1.5, Math.sin(a) * 0.3);
      prong.rotateX(Math.PI / 2);
      head.add(prong);
      const tip = new THREE.Mesh(tipGeo, goldMat);
      tip.position.set(Math.cos(a) * 0.118, 0.255, Math.sin(a) * 0.118);
      head.add(tip);
    }
    const diamondMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0,
      transmission: 1,
      ior: 2.42,
      thickness: 0.35,
      envMapIntensity: 4.5,
      iridescence: 0.35,
      iridescenceIOR: 1.8,
      specularIntensity: 1,
      flatShading: true,
    });
    const diamondGeo = diamondGeometry();
    const diamond = new THREE.Mesh(diamondGeo, diamondMat);
    diamond.position.y = 0.21;
    head.add(diamond);

    // Star glint on the diamond
    const glintGeo = new THREE.BufferGeometry();
    glintGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0, 0.27, 0]), 3));
    const glintMat = new THREE.ShaderMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uGlint: { value: 0 }, uSize: { value: (isMobile ? 90 : 150) * renderer.getPixelRatio() } },
      vertexShader: `uniform float uSize; void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); gl_PointSize = uSize; }`,
      fragmentShader: `uniform float uGlint;
        void main(){
          vec2 p = gl_PointCoord - .5;
          float rays = max(0., 1. - abs(p.x) * 60.) * max(0., 1. - abs(p.y) * 2.)
                     + max(0., 1. - abs(p.y) * 60.) * max(0., 1. - abs(p.x) * 2.);
          float core = smoothstep(.12, 0., length(p));
          float a = (rays + core) * uGlint;
          gl_FragColor = vec4(vec3(1., .97, .9) * a, a);
        }`,
    });
    const glint = new THREE.Points(glintGeo, glintMat);
    glint.renderOrder = 10;
    head.add(glint);

    // ---------- Gold dust particles ----------
    const N = isMobile ? 3500 : 8000;
    const scatter = new Float32Array(N * 3);
    const target = new Float32Array(N * 3);
    const rnd = new Float32Array(N * 4);
    const col = new Float32Array(N * 3);
    const v = new THREE.Vector3();
    const ringMatrix = (ring: typeof ringA) =>
      new THREE.Matrix4()
        .compose(ring.c, new THREE.Quaternion().setFromEuler(ring.rot), new THREE.Vector3(1, 1, 1))
        .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    const mA = ringMatrix(ringA);
    const mB = ringMatrix(ringB);
    const gemCenter = new THREE.Vector3(ringA.c.x, ringA.c.y + RO + 0.2, 0);
    const bandSample = (m: THREE.Matrix4) => {
      const p = bandPoint(Math.random() * Math.PI * 2);
      const u = Math.random() * Math.PI * 2;
      return v.set(p.x * Math.sin(u), p.y, p.x * Math.cos(u)).applyMatrix4(m);
    };
    const cGold = new THREE.Color(0xf6cf83);
    const cChamp = new THREE.Color(0xfff2d6);
    const cRose = new THREE.Color(0xf7b9a3);
    const cWhite = new THREE.Color(0xffffff);
    for (let i = 0; i < N; i++) {
      const th = Math.random() * Math.PI * 2;
      const rr = 2 + Math.pow(Math.random(), 0.7) * 6;
      scatter.set([Math.cos(th) * rr * 1.4, (Math.random() - 0.5) * 7, Math.sin(th) * rr * 0.6 - 1], i * 3);
      const pick = Math.random();
      let c: THREE.Color;
      if (pick < 0.45) {
        bandSample(mA);
        c = cGold.clone().lerp(cChamp, Math.random() * 0.5);
      } else if (pick < 0.86) {
        bandSample(mB);
        c = cRose.clone().lerp(cChamp, Math.random() * 0.4);
      } else if (pick < 0.89) {
        v.copy(gemCenter).add(new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * 0.16));
        c = cWhite.clone();
      } else {
        v.fromArray(scatter, i * 3); // free ambient stardust
        c = cChamp.clone().lerp(cGold, Math.random());
      }
      target.set([v.x, v.y, v.z], i * 3);
      rnd.set([Math.random(), 0.6 + Math.random() * 1.2, Math.random(), pick >= 0.89 ? 1 : 0], i * 4);
      col.set([c.r, c.g, c.b], i * 3);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(target, 3));
    pGeo.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
    pGeo.setAttribute("aRand", new THREE.BufferAttribute(rnd, 4));
    pGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const pMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: {
        uTime: { value: 0 },
        uForm: { value: 0 },
        uSolid: { value: 0 },
        uPR: { value: renderer.getPixelRatio() },
        uSize: { value: isMobile ? 34 : 40 },
      },
      vertexShader: `
        attribute vec3 aScatter; attribute vec4 aRand;
        uniform float uTime, uForm, uSolid, uPR, uSize;
        varying vec3 vColor; varying float vAlpha;
        mat2 rot(float a){ float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }
        void main(){
          vColor = color;
          float bound = aRand.w > .5 ? 0. : 1.;
          vec3 drift = vec3(sin(uTime*.31 + aRand.z*6.28), cos(uTime*.23 + aRand.z*9.), sin(uTime*.19 + aRand.z*4.)) * .35;
          vec3 sc = aScatter + drift;
          float d = aRand.x * .45;
          float f = smoothstep(d, d + .55, uForm);
          float travel = f * (1. - f) * 4.;
          vec3 p = mix(sc, position, f);
          p.xz = rot(travel * 2.2 * (aRand.z - .5)) * p.xz;
          p.y += travel * .6 * sin(aRand.z * 20.);
          p += f * .012 * vec3(sin(uTime*2. + aRand.z*50.), cos(uTime*2.3 + aRand.z*40.), 0.);
          vec4 mv = modelViewMatrix * vec4(p, 1.);
          gl_Position = projectionMatrix * mv;
          float tw = .55 + .45 * sin(uTime * (2. + aRand.y * 2.) + aRand.z * 60.);
          gl_PointSize = uSize * aRand.y * uPR * (.55 + .45 * tw) / -mv.z;
          vAlpha = tw * mix(1., mix(1., .12, uSolid), f * bound + (1. - bound) * f * .3);
        }`,
      fragmentShader: `
        varying vec3 vColor; varying float vAlpha;
        void main(){
          float r = length(gl_PointCoord - .5);
          float a = smoothstep(.5, 0., r); a *= a;
          gl_FragColor = vec4(vColor * (1. + a), a * vAlpha);
        }`,
    });
    const points = new THREE.Points(pGeo, pMat);
    rings.add(points);

    // ---------- Rose petals ----------
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, -0.12);
    petalShape.bezierCurveTo(0.13, -0.05, 0.12, 0.1, 0, 0.14);
    petalShape.bezierCurveTo(-0.12, 0.1, -0.13, -0.05, 0, -0.12);
    const petalGeo = new THREE.ShapeGeometry(petalShape, 10);
    const pp = petalGeo.attributes.position;
    for (let i = 0; i < pp.count; i++) pp.setZ(i, pp.getX(i) ** 2 * 2.2);
    petalGeo.computeVertexNormals();
    const petalMat = new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide,
      roughness: 0.55,
      metalness: 0,
      emissive: 0x3a1c18,
      transparent: true,
      opacity: 0.92,
    });
    const P = isMobile ? 22 : 45;
    const petals = new THREE.InstancedMesh(petalGeo, petalMat, P);
    const petalCols = [0xf6d6cf, 0xf3c1b6, 0xfff4ec, 0xe9a99a];
    const petalData = Array.from({ length: P }, (_, i) => {
      petals.setColorAt(i, new THREE.Color(petalCols[i % petalCols.length]));
      return {
        x: (Math.random() - 0.5) * 12,
        y: Math.random() * 10 - 5,
        z: -3 + Math.random() * 5,
        s: 0.6 + Math.random() * 0.6,
        speed: 0.25 + Math.random() * 0.3,
        sway: Math.random() * 6.28,
        spin: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(1.5),
      };
    });
    scene.add(petals);
    const dummy = new THREE.Object3D();

    // ---------- Timeline (16s loop) ----------
    const CYCLE = 16;
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
    const timeline = (t: number) => {
      const c = t % CYCLE;
      let form: number;
      if (c < 1.5) form = 0;
      else if (c < 6) form = ease((c - 1.5) / 4.5);
      else if (c < 12.5) form = 1;
      else form = 1 - ease((c - 12.5) / 3.5);
      const solid = c < 12 ? clamp01((c - 5.2) / 1.6) : 1 - clamp01((c - 12) / 0.9);
      return { form, solid, c };
    };

    // ---------- Interaction & sizing ----------
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      const b = wrap.getBoundingClientRect();
      if (e.clientY < b.top || e.clientY > b.bottom) {
        mouse.tx = mouse.ty = 0;
        return;
      }
      mouse.tx = ((e.clientX - b.left) / b.width - 0.5) * 2;
      mouse.ty = ((e.clientY - b.top) / b.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove);

    const resize = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w / h < 1 ? (8 / Math.max(w / h, 0.55)) * 0.8 : 8;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    let inView = true;
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
    });
    io.observe(wrap);

    const setSolid = (mat: THREE.MeshPhysicalMaterial, s: number) => {
      mat.opacity = s;
      const wantTransparent = s < 0.999;
      if (mat.transparent !== wantTransparent) {
        mat.transparent = wantTransparent;
        mat.needsUpdate = true;
      }
    };

    const clock = new THREE.Clock();
    let t = reduceMotion ? 8 : 0;
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!inView || document.hidden) return;
      if (!reduceMotion) t += dt;

      const { form, solid, c } = timeline(t);
      pMat.uniforms.uTime.value = t;
      pMat.uniforms.uForm.value = form;
      pMat.uniforms.uSolid.value = solid;
      setSolid(goldMat, solid);
      setSolid(roseMat, solid);
      const show = solid > 0.01;
      A.mesh.visible = B.mesh.visible = head.visible = show;
      head.scale.setScalar(0.001 + 0.999 * ease(solid));
      diamond.rotation.y = t * 0.6;
      // two glints per shine: one as the rings settle, one before they dissolve
      const g1 = Math.exp(-Math.pow((c - 7.6) / 0.35, 2));
      const g2 = Math.exp(-Math.pow((c - 10.6) / 0.3, 2));
      glintMat.uniforms.uGlint.value = solid * Math.max(g1, g2 * 0.8);

      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      rings.rotation.y = -0.5 + t * 0.18 + mouse.x * 0.35;
      rings.rotation.x = 0.35 + Math.sin(t * 0.4) * 0.08 + mouse.y * 0.25;
      rings.position.y = Math.sin(t * 0.6) * 0.08 + (isMobile ? 0.9 : 0.1);

      for (let i = 0; i < P; i++) {
        const p = petalData[i];
        p.y -= p.speed * dt;
        if (p.y < -5) {
          p.y = 5;
          p.x = (Math.random() - 0.5) * 12;
        }
        dummy.position.set(p.x + Math.sin(t * 0.7 + p.sway) * 0.6, p.y, p.z);
        dummy.rotation.set(t * p.spin.x + p.sway, t * p.spin.y, t * p.spin.z);
        dummy.scale.setScalar(p.s);
        dummy.updateMatrix();
        petals.setMatrixAt(i, dummy.matrix);
      }
      petals.instanceMatrix.needsUpdate = true;

      camera.position.x = mouse.x * 0.3;
      camera.position.y = -mouse.y * 0.2;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      io.disconnect();
      [bandGeo, prongGeo, tipGeo, diamondGeo, basket.geometry, glintGeo, pGeo, petalGeo].forEach((g) => g.dispose());
      [goldMat, roseMat, diamondMat, glintMat, pMat, petalMat].forEach((m) => m.dispose());
      petals.dispose();
      envTex.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0"
      style={{ background: "radial-gradient(ellipse at 50% 45%, #3a2a1c 0%, #1f1610 55%, #120d09 100%)" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" aria-hidden="true" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 55% 38% at 50% 52%, rgba(18,13,9,.62), rgba(18,13,9,0) 75%)",
        }}
      />
    </div>
  );
};

export default GoldenVowsHero;
