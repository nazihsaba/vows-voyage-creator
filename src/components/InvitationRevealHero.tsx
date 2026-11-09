import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Home page hero background: "Invitation Reveal".
 * A dark luxury envelope with a bronze wax seal opens, a black gold-foil
 * invitation card rises out and settles behind the hero text, as if the
 * headline were printed on it. Plays once, then the card floats gently
 * and its foil catches a soft sweeping light.
 */

const BG = "radial-gradient(ellipse at 50% 45%, #3a2a1c 0%, #1f1610 55%, #120d09 100%)";
const GOLD = "#dcb874";
const SERIF = '"Playfair Display", Georgia, serif';

// Envelope is modelled at this size, then scaled to the viewport.
const EW = 3.2;
const EH = 2.12;
const HW = EW / 2;
const HH = EH / 2;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const seg = (t: number, a: number, b: number) => ease(clamp01((t - a) / (b - a)));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, g: c.getContext("2d")! };
}

/** Draws gold foil both into the colour canvas and into the roughness/metalness canvas. */
function foilPainter(color: CanvasRenderingContext2D, orm: CanvasRenderingContext2D) {
  return (draw: (ctx: CanvasRenderingContext2D) => void) => {
    color.save();
    color.strokeStyle = color.fillStyle = GOLD;
    draw(color);
    color.restore();
    orm.save();
    orm.strokeStyle = orm.fillStyle = "rgb(255,64,255)"; // G = roughness .25, B = metal
    draw(orm);
    orm.restore();
  };
}

function paperBase(color: CanvasRenderingContext2D, orm: CanvasRenderingContext2D, w: number, h: number, base: string) {
  color.fillStyle = base;
  color.fillRect(0, 0, w, h);
  // subtle paper fibre speckle
  for (let i = 0; i < (w * h) / 600; i++) {
    color.fillStyle = Math.random() < 0.5 ? "rgba(255,235,210,0.035)" : "rgba(0,0,0,0.06)";
    color.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1);
  }
  orm.fillStyle = "rgb(255,220,0)"; // paper: roughness .86, not metal
  orm.fillRect(0, 0, w, h);
}

/** The invitation card face: double foil border, corner ornaments, monogram, bottom ornament. */
function drawCard(aspect: number, color: HTMLCanvasElement, orm: HTMLCanvasElement) {
  const long = 2048;
  const W = aspect >= 1 ? long : Math.round(long * aspect);
  const H = aspect >= 1 ? Math.round(long / aspect) : long;
  color.width = orm.width = W;
  color.height = orm.height = H;
  const c = color.getContext("2d")!;
  const o = orm.getContext("2d")!;
  paperBase(c, o, W, H, "#1f1813");
  const foil = foilPainter(c, o);
  const m = Math.min(W, H);
  const i1 = m * 0.034;
  const i2 = m * 0.05;

  foil((ctx) => {
    ctx.lineWidth = m * 0.005;
    ctx.strokeRect(i1, i1, W - 2 * i1, H - 2 * i1);
    ctx.lineWidth = m * 0.0022;
    ctx.strokeRect(i2, i2, W - 2 * i2, H - 2 * i2);
    // corner lozenges + quarter arcs
    const s = m * 0.012;
    for (const [x, y, sx, sy] of [
      [i2, i2, 1, 1],
      [W - i2, i2, -1, 1],
      [i2, H - i2, 1, -1],
      [W - i2, H - i2, -1, -1],
    ]) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-s / 2, -s / 2, s, s);
      ctx.restore();
      ctx.lineWidth = m * 0.0018;
      ctx.beginPath();
      ctx.arc(x, y, m * 0.035, sx > 0 ? (sy > 0 ? 0 : -Math.PI / 2) : sy > 0 ? Math.PI / 2 : Math.PI, sx > 0 ? (sy > 0 ? Math.PI / 2 : 0) : sy > 0 ? Math.PI : -Math.PI / 2);
      ctx.stroke();
    }
  });

  // Monogram at the top
  // portrait (mobile): smaller monogram tucked into the top margin, above the headline
  const r = m * (aspect < 1 ? 0.05 : 0.058);
  const cy = aspect < 1 ? i2 + r * 1.5 : H * 0.13;
  foil((ctx) => {
    ctx.lineWidth = m * 0.0028;
    ctx.beginPath();
    ctx.arc(W / 2, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = m * 0.0014;
    ctx.beginPath();
    ctx.arc(W / 2, cy, r * 0.86, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = `italic 600 ${r * 1.15}px ${SERIF}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("A", W / 2, cy + r * 0.06);
    ctx.lineWidth = m * 0.0018;
    const len = Math.min(W * 0.16, m * 0.3);
    for (const dir of [-1, 1]) {
      const x0 = W / 2 + dir * r * 1.45;
      ctx.beginPath();
      ctx.moveTo(x0, cy);
      ctx.lineTo(x0 + dir * len, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x0 + dir * len, cy, m * 0.004, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Small ornament resting on the bottom inner border
  foil((ctx) => {
    const y = H - i2;
    const s = m * 0.014;
    ctx.save();
    ctx.translate(W / 2, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-s / 2, -s / 2, s, s);
    ctx.restore();
    for (const dir of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(W / 2 + dir * s * 1.8, y, m * 0.0035, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/** Art-deco fan pattern for the envelope liner. */
function linerTextures() {
  const S = 512;
  const col = canvas(S, S);
  const orm = canvas(S, S);
  paperBase(col.g, orm.g, S, S, "#1a1310");
  const foil = foilPainter(col.g, orm.g);
  const step = S / 4;
  foil((ctx) => {
    ctx.lineWidth = 3;
    for (let row = -1; row <= 8; row++) {
      for (let k = -1; k <= 4; k++) {
        const x = k * step + (row % 2 ? step / 2 : 0);
        const y = row * (step / 2);
        for (const rr of [step * 0.5, step * 0.36, step * 0.22]) {
          ctx.beginPath();
          ctx.arc(x, y, rr, Math.PI, 2 * Math.PI);
          ctx.stroke();
        }
      }
    }
  });
  const map = new THREE.CanvasTexture(col.c);
  map.colorSpace = THREE.SRGBColorSpace;
  const ormTex = new THREE.CanvasTexture(orm.c);
  for (const t of [map, ormTex]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1.6, 1.6);
  }
  return { map, orm: ormTex };
}

function paperTexture() {
  const { c, g } = canvas(512, 512);
  const img = g.createImageData(512, 512);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 232 + Math.random() * 23;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function sealBump() {
  const { c, g } = canvas(256, 256);
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 256, 256);
  g.filter = "blur(3px)";
  g.strokeStyle = g.fillStyle = "#fff";
  g.lineWidth = 9;
  g.beginPath();
  g.arc(128, 128, 92, 0, Math.PI * 2);
  g.stroke();
  g.font = `italic 600 120px ${SERIF}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("A", 128, 136);
  return new THREE.CanvasTexture(c);
}

/** Soft studio light boxes, so gold foil and wax reflect like product photography. */
function studioEnvironment(renderer: THREE.WebGLRenderer) {
  const env = new THREE.Scene();
  const trash: { dispose: () => void }[] = [];
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, pos?: [number, number, number]) => {
    const m = new THREE.Mesh(geo, mat);
    if (pos) {
      m.position.set(...pos);
      m.lookAt(0, 0, 0);
    }
    env.add(m);
    trash.push(geo, mat);
  };
  add(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.06, 0.045, 0.035), side: THREE.BackSide }));
  const panel = (w: number, h: number, power: number, color: number, pos: [number, number, number]) =>
    add(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide }), pos);
  panel(6, 1.2, 6, 0xffffff, [0, 4.8, 1]);
  panel(1.2, 5, 4, 0xfff1e0, [-4.8, 0.5, 2]);
  panel(1.2, 5, 4, 0xfff1e0, [4.8, 0.5, 2]);
  panel(4, 2, 2.5, 0xffd7a8, [0, 1, 4.8]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.03).texture;
  pmrem.dispose();
  trash.forEach((d) => d.dispose());
  return tex;
}

const InvitationRevealHero = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const cv = canvasRef.current;
    if (!wrap || !cv) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
    } catch {
      return; // no WebGL: the gradient background stays
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 8);
    const envTex = studioEnvironment(renderer);
    scene.environment = envTex;

    const ambient = new THREE.AmbientLight(0xffe6c8, 0.35);
    const key = new THREE.DirectionalLight(0xfff0dc, 1.5);
    key.position.set(-3, 4, 5);
    const sweep = new THREE.PointLight(0xfff0d8, 0, 14, 1.4);
    sweep.position.set(0, 0.6, 2.6);
    scene.add(ambient, key, sweep);

    const disposables: { dispose: () => void }[] = [];
    const keep = <T extends { dispose: () => void }>(x: T) => {
      disposables.push(x);
      return x;
    };

    // ---------- Materials ----------
    const paperTex = keep(paperTexture());
    const paperMat = keep(new THREE.MeshStandardMaterial({ color: 0x4a392d, map: paperTex, roughness: 0.86, side: THREE.DoubleSide }));
    const paperFront = keep(new THREE.MeshStandardMaterial({ color: 0x4a392d, map: paperTex, roughness: 0.86 }));
    const liner = linerTextures();
    keep(liner.map);
    keep(liner.orm);
    const linerProps = { map: liner.map, roughnessMap: liner.orm, metalnessMap: liner.orm, roughness: 1, metalness: 1, envMapIntensity: 1.3 };
    const linerFront = keep(new THREE.MeshStandardMaterial({ ...linerProps }));
    const linerBack = keep(new THREE.MeshStandardMaterial({ ...linerProps, side: THREE.BackSide }));

    // ---------- Envelope ----------
    const envelope = new THREE.Group();
    scene.add(envelope);
    const shapeMesh = (pts: [number, number][], mat: THREE.Material, z: number, parent: THREE.Object3D) => {
      const s = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
      const geo = keep(new THREE.ShapeGeometry(s));
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.z = z;
      parent.add(mesh);
      return mesh;
    };
    // inside of the back panel shows the liner
    shapeMesh([[-HW, -HH], [HW, -HH], [HW, HH], [-HW, HH]], linerFront, -0.03, envelope);
    // front pocket: side flaps + bottom flap
    const left = shapeMesh([[-HW, -HH], [0.06, -EH * 0.03], [-HW, HH * 0.97]], paperMat, 0.02, envelope);
    const right = shapeMesh([[HW, -HH], [HW, HH * 0.97], [-0.06, -EH * 0.03]], paperMat, 0.022, envelope);
    left.rotation.y = 0.025;
    right.rotation.y = -0.025;
    const bottomShape = new THREE.Shape();
    bottomShape.moveTo(-HW, -HH);
    bottomShape.lineTo(HW, -HH);
    bottomShape.quadraticCurveTo(HW * 0.35, -HH * 0.1, 0, EH * 0.05);
    bottomShape.quadraticCurveTo(-HW * 0.35, -HH * 0.1, -HW, -HH);
    const bottomGeo = keep(new THREE.ShapeGeometry(bottomShape, 16));
    const bottom = new THREE.Mesh(bottomGeo, paperMat);
    bottom.position.z = 0.03;
    bottom.rotation.x = -0.015;
    envelope.add(bottom);

    // top flap, hinged on the top edge
    const hinge = new THREE.Group();
    hinge.position.set(0, HH, 0.045);
    envelope.add(hinge);
    const flapShape = new THREE.Shape();
    flapShape.moveTo(-HW, 0);
    flapShape.lineTo(HW, 0);
    flapShape.lineTo(HW * 0.1, -EH * 0.58);
    flapShape.quadraticCurveTo(0, -EH * 0.63, -HW * 0.1, -EH * 0.58);
    flapShape.lineTo(-HW, 0);
    const flapGeo = keep(new THREE.ShapeGeometry(flapShape, 12));
    hinge.add(new THREE.Mesh(flapGeo, paperFront), new THREE.Mesh(flapGeo, linerBack));

    // wax seal on the flap tip
    const rs = EW * 0.075;
    const sealGeo = keep(new THREE.CylinderGeometry(rs, rs * 1.02, 0.045, 96, 1));
    sealGeo.rotateX(Math.PI / 2);
    const sp = sealGeo.attributes.position;
    for (let i = 0; i < sp.count; i++) {
      const x = sp.getX(i);
      const y = sp.getY(i);
      if (Math.hypot(x, y) > rs * 0.5) {
        const a = Math.atan2(y, x);
        const k = 1 + 0.05 * Math.sin(a * 5 + 1) + 0.035 * Math.sin(a * 9 + 2) + 0.02 * Math.sin(a * 17);
        sp.setXY(i, x * k, y * k);
      }
    }
    sealGeo.computeVertexNormals();
    const bump = keep(sealBump());
    const waxMat = keep(new THREE.MeshPhysicalMaterial({ color: 0x8e5a26, metalness: 0.55, roughness: 0.3, clearcoat: 0.5, bumpMap: bump, bumpScale: 2.5, envMapIntensity: 1.4 }));
    const seal = new THREE.Mesh(sealGeo, waxMat);
    seal.position.set(0, -EH * 0.565, 0.028);
    hinge.add(seal);

    // ---------- Invitation card ----------
    const cardColor = document.createElement("canvas");
    const cardOrm = document.createElement("canvas");
    const cardMap = keep(new THREE.CanvasTexture(cardColor));
    cardMap.colorSpace = THREE.SRGBColorSpace;
    const cardOrmTex = keep(new THREE.CanvasTexture(cardOrm));
    const aniso = renderer.capabilities.getMaxAnisotropy();
    cardMap.anisotropy = cardOrmTex.anisotropy = aniso;
    const cardFace = keep(new THREE.MeshStandardMaterial({ map: cardMap, roughnessMap: cardOrmTex, metalnessMap: cardOrmTex, roughness: 1, metalness: 1, envMapIntensity: 1.25 }));
    const gilded = keep(new THREE.MeshStandardMaterial({ color: 0xd9b26a, metalness: 1, roughness: 0.25 }));
    const cardBack = keep(new THREE.MeshStandardMaterial({ color: 0x1f1813, roughness: 0.9 }));
    const cardGeo = keep(new THREE.BoxGeometry(1, 1, 0.014));
    const card = new THREE.Mesh(cardGeo, [gilded, gilded, gilded, gilded, cardFace, cardBack]);
    scene.add(card);

    let cardAspect = 0;
    const paintCard = (aspect: number) => {
      cardAspect = aspect;
      drawCard(aspect, cardColor, cardOrm);
      cardMap.dispose(); // canvas size changed: re-upload
      cardOrmTex.dispose();
      cardMap.needsUpdate = cardOrmTex.needsUpdate = true;
    };

    // ---------- Layout (recomputed on resize) ----------
    const L = { visW: 1, visH: 1, sEnv: 1, envY: 0, cw0: 1, ch0: 1, cwF: 1, chF: 1, mobile: false };
    let repaintTimer = 0;
    const resize = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      L.mobile = w < 768;
      L.visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      L.visW = L.visH * camera.aspect;
      L.cwF = L.mobile ? L.visW * 0.96 : Math.min(L.visW * 0.8, L.visH * 2.3);
      L.chF = L.visH * (L.mobile ? 0.95 : 0.86);
      const aspect = L.cwF / L.chF;
      L.sEnv = Math.min(1, (0.82 * L.visW) / EW);
      L.cw0 = EW * 0.9;
      L.ch0 = L.cw0 / aspect;
      if (L.ch0 > EH * 0.92) {
        L.ch0 = EH * 0.92;
        L.cw0 = L.ch0 * aspect;
      }
      L.envY = -(L.ch0 * L.sEnv) / 2 - 0.1;
      if (!cardAspect) paintCard(aspect);
      else if (Math.abs(aspect / cardAspect - 1) > 0.05) {
        clearTimeout(repaintTimer);
        repaintTimer = window.setTimeout(() => paintCard(aspect), 200);
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();
    // repaint once the serif font is available for the monogram
    document.fonts?.load(`italic 600 100px ${SERIF}`).then(() => {
      paintCard(cardAspect || 1.6);
      const b = sealBump();
      waxMat.bumpMap = b;
      bump.dispose();
      disposables.push(b);
      waxMat.needsUpdate = true;
    }).catch(() => undefined);

    // ---------- Interaction ----------
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) {
        mouse.tx = mouse.ty = 0;
        return;
      }
      mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouse.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove);

    let inView = true;
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
    });
    io.observe(wrap);

    // ---------- Animation ----------
    const introRot = new THREE.Euler(-0.24, 0.16, 0);
    const tmp = new THREE.Vector3();
    const clock = new THREE.Clock();
    let t = reduceMotion ? 30 : 0;
    let raf = 0;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!inView || document.hidden) return;
      t += dt;

      const p0 = seg(t, 0, 1.0); // envelope arrives
      const p1 = seg(t, 1.0, 2.3); // flap opens
      const p2 = seg(t, 2.0, 3.6); // card slides out
      const p3 = seg(t, 3.4, 5.6); // card settles, envelope falls away

      // envelope
      const sEnvNow = L.sEnv * (0.94 + 0.06 * p0);
      envelope.scale.setScalar(sEnvNow);
      envelope.position.set(0, L.envY - (1 - p0) * 0.5 - p3 * L.visH, -p3 * 1.5);
      envelope.rotation.set(lerp(introRot.x, 0.7, p3), introRot.y, 0);
      envelope.visible = p3 < 0.999;
      const alpha = lerp(-0.05, Math.PI * 0.93, p1);
      hinge.rotation.x = alpha;
      hinge.position.z = alpha > Math.PI / 2 ? -0.045 : 0.045;

      // card: from its place in the envelope to its final framing
      const y0 = -HH + L.ch0 / 2 + 0.04;
      const y1 = HH * 0.98 + L.ch0 / 2;
      const yLocal = lerp(y0, y1, p2);
      tmp.set(0, yLocal, 0).multiplyScalar(sEnvNow).applyEuler(introRot);
      tmp.y += L.envY - (1 - p0) * 0.5;
      const idle = p3;
      const floatY = Math.sin(t * 0.6) * 0.025 * idle;
      card.position.set(lerp(tmp.x, 0, p3), lerp(tmp.y, floatY, p3), lerp(tmp.z, 0.15, p3));
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      const rxIdle = Math.sin(t * 0.45) * 0.025 + mouse.y * 0.06;
      const ryIdle = Math.sin(t * 0.35) * 0.04 + mouse.x * 0.1;
      card.rotation.set(lerp(introRot.x, rxIdle, p3), lerp(introRot.y, ryIdle, p3), 0);
      card.scale.set(lerp(L.cw0 * sEnvNow, L.cwF, p3), lerp(L.ch0 * sEnvNow, L.chF, p3), 1);

      // a soft light sweeps across the foil every few seconds once settled
      const sp = (t - 4.6) % 8;
      if (t > 4.6 && sp < 2.8) {
        const k = sp / 2.8;
        sweep.position.x = lerp(-L.visW * 0.55, L.visW * 0.55, k);
        sweep.intensity = Math.sin(Math.PI * k) * 18;
      } else sweep.intensity = 0;

      renderer.render(scene, camera);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(repaintTimer);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      io.disconnect();
      disposables.forEach((d) => d.dispose());
      envTex.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0" style={{ background: BG }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" aria-hidden="true" />
    </div>
  );
};

export default InvitationRevealHero;
