"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { primitives } from "@jscad/modeling";
import type { Geom3 } from "@jscad/modeling/src/geometries/types";

// Use require for untyped/complex-typed modules to avoid TypeScript issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { booleans } = require("@jscad/modeling") as { booleans: { union: (...g: Geom3[]) => Geom3; subtract: (...g: Geom3[]) => Geom3; intersect: (...g: Geom3[]) => Geom3 } };
// eslint-disable-next-line @typescript-eslint/no-require-imports
const stlSerializer = require("@jscad/stl-serializer") as { serialize: (opts: { binary: boolean }, geom: Geom3) => Uint8Array };

import {
  Box,
  Cylinder,
  Globe,
  Triangle,
  Circle,
  Layers,
  Eye,
  EyeOff,
  Trash2,
  Download,
  ShoppingCart,
  RotateCcw,
  Grid3x3,
  Monitor,
  Upload,
  Info,
  ImageIcon,
  Loader2,
  FlipHorizontal,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ShapeType = "box" | "cylinder" | "sphere" | "cone" | "torus" | "custom";
type CSGOp = "none" | "union" | "subtract" | "intersect";

interface BoxParams { width: number; height: number; depth: number }
interface CylinderParams { radius: number; height: number; segments: number }
interface SphereParams { radius: number; segments: number }
interface ConeParams { radiusBottom: number; radiusTop: number; height: number }
interface TorusParams { outerRadius: number; innerRadius: number; segments: number }

type ShapeParams =
  | { type: "box"; params: BoxParams }
  | { type: "cylinder"; params: CylinderParams }
  | { type: "sphere"; params: SphereParams }
  | { type: "cone"; params: ConeParams }
  | { type: "torus"; params: TorusParams }
  | { type: "custom"; params: BoxParams };

interface ShapeItem {
  id: string;
  name: string;
  visible: boolean;
  csgOp: CSGOp;
  shape: ShapeParams;
}

interface ModelStats {
  triangles: number;
  width: number;
  height: number;
  depth: number;
}

// ─── jscad → Three.js conversion ─────────────────────────────────────────────

function jscadToThree(geom: Geom3): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  for (const poly of geom.polygons) {
    const verts = poly.vertices as unknown as number[][];
    for (let i = 1; i < verts.length - 1; i++) {
      const v0 = verts[0], v1 = verts[i], v2 = verts[i + 1];
      positions.push(...v0, ...v1, ...v2);
      const ax = v1[0] - v0[0], ay = v1[1] - v0[1], az = v1[2] - v0[2];
      const bx = v2[0] - v0[0], by = v2[1] - v0[1], bz = v2[2] - v0[2];
      const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      for (let j = 0; j < 3; j++) normals.push(nx / len, ny / len, nz / len);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(normals), 3));
  return geo;
}

function buildJscadGeom(shape: ShapeParams): Geom3 {
  switch (shape.type) {
    case "box": {
      const p = shape.params;
      return primitives.cuboid({ size: [p.width, p.height, p.depth] });
    }
    case "cylinder": {
      const p = shape.params;
      return primitives.cylinder({ radius: p.radius, height: p.height, segments: p.segments });
    }
    case "sphere": {
      const p = shape.params;
      return primitives.sphere({ radius: p.radius, segments: p.segments });
    }
    case "cone": {
      const p = shape.params;
      // Use cylinderElliptic for cone (radiusBottom ≠ radiusTop)
      return primitives.cylinderElliptic({
        height: p.height,
        startRadius: [p.radiusBottom, p.radiusBottom],
        endRadius: [p.radiusTop, p.radiusTop],
        segments: 32,
      });
    }
    case "torus": {
      const p = shape.params;
      return primitives.torus({
        innerRadius: p.innerRadius,
        outerRadius: p.outerRadius,
        innerSegments: p.segments,
        outerSegments: p.segments,
      });
    }
    case "custom": {
      const p = shape.params;
      const b1 = primitives.cuboid({ size: [p.width, p.height, p.depth] });
      const b2 = primitives.cuboid({ size: [p.width * 0.5, p.height * 0.5, p.depth * 1.5] });
      return booleans.union(b1, b2);
    }
  }
}

function buildCombinedGeom(shapes: ShapeItem[]): Geom3 | null {
  const visible = shapes.filter((s) => s.visible);
  if (visible.length === 0) return null;
  if (visible.length === 1) return buildJscadGeom(visible[0].shape);

  let base = buildJscadGeom(visible[0].shape);
  for (let i = 1; i < visible.length; i++) {
    const next = buildJscadGeom(visible[i].shape);
    const op = visible[i].csgOp;
    if (op === "subtract") {
      base = booleans.subtract(base, next);
    } else if (op === "intersect") {
      base = booleans.intersect(base, next);
    } else {
      base = booleans.union(base, next);
    }
  }
  return base;
}

// ─── STL parser ──────────────────────────────────────────────────────────────

function parseSTL(buffer: ArrayBuffer): THREE.BufferGeometry {
  const data = new DataView(buffer);
  const numTriangles = data.getUint32(80, true);
  if (80 + 4 + numTriangles * 50 === buffer.byteLength) {
    const positions: number[] = [];
    const normals: number[] = [];
    let offset = 84;
    for (let i = 0; i < numTriangles; i++) {
      const nx = data.getFloat32(offset, true);
      const ny = data.getFloat32(offset + 4, true);
      const nz = data.getFloat32(offset + 8, true);
      offset += 12;
      for (let v = 0; v < 3; v++) {
        positions.push(
          data.getFloat32(offset, true),
          data.getFloat32(offset + 4, true),
          data.getFloat32(offset + 8, true)
        );
        normals.push(nx, ny, nz);
        offset += 12;
      }
      offset += 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(normals), 3));
    return geo;
  }
  // ASCII fallback
  const text = new TextDecoder().decode(buffer);
  const positions: number[] = [];
  const normals: number[] = [];
  const normalRe = /facet normal\s+([\d.eE+-]+)\s+([\d.eE+-]+)\s+([\d.eE+-]+)/g;
  const vertexRe = /vertex\s+([\d.eE+-]+)\s+([\d.eE+-]+)\s+([\d.eE+-]+)/g;
  let nm: RegExpExecArray | null;
  let vm: RegExpExecArray | null;
  while ((nm = normalRe.exec(text)) !== null) {
    const [, sNx, sNy, sNz] = nm;
    for (let v = 0; v < 3; v++) {
      vm = vertexRe.exec(text);
      if (vm) positions.push(+vm[1], +vm[2], +vm[3]);
      normals.push(+sNx, +sNy, +sNz);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(normals), 3));
  return geo;
}

// ─── Photo → Heightmap (bas-relief) conversion ────────────────────────────────

interface PhotoSettings {
  realWidth: number     // mm
  realDepth: number     // mm (auto from aspect)
  maxHeight: number     // mm depth of relief
  baseThickness: number // mm flat base plate
  resolution: number    // grid density 50–200
  invert: boolean
  keepAspect: boolean
}

function imageToHeightmapGeometry(
  imgEl: HTMLImageElement,
  opts: PhotoSettings
): THREE.BufferGeometry {
  const canvas = document.createElement("canvas");
  const res = Math.round(opts.resolution);
  canvas.width = res;
  canvas.height = opts.keepAspect
    ? Math.round(res * (imgEl.naturalHeight / imgEl.naturalWidth))
    : res;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const cols = canvas.width;
  const rows = canvas.height;
  const W = opts.realWidth;
  const D = opts.keepAspect ? W * (rows / cols) : opts.realDepth;
  const H = opts.maxHeight;
  const base = opts.baseThickness;

  const heights: number[] = new Array(rows * cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = (r * cols + c) * 4;
      const gray = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3 / 255;
      heights[r * cols + c] = (opts.invert ? 1 - gray : gray) * H;
    }
  }

  const positions: number[] = [];
  const indices: number[] = [];

  // Top surface
  const topBase = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c / (cols - 1)) * W - W / 2;
      const z = (r / (rows - 1)) * D - D / 2;
      const y = base + heights[r * cols + c];
      positions.push(x, y, z);
    }
  }
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const a = topBase + r * cols + c;
      const b = topBase + r * cols + c + 1;
      const cc = topBase + (r + 1) * cols + c;
      const d = topBase + (r + 1) * cols + c + 1;
      indices.push(a, cc, b, b, cc, d);
    }
  }

  // Bottom face
  const botBase = positions.length / 3;
  positions.push(-W/2, 0, -D/2, W/2, 0, -D/2, W/2, 0, D/2, -W/2, 0, D/2);
  indices.push(botBase, botBase+2, botBase+1, botBase, botBase+3, botBase+2);

  // Front wall (r=0)
  const fw = positions.length / 3;
  for (let c = 0; c < cols; c++) {
    const x = (c / (cols - 1)) * W - W / 2;
    positions.push(x, base + heights[c], -D/2);
    positions.push(x, 0, -D/2);
  }
  for (let c = 0; c < cols - 1; c++) {
    const b = fw + c * 2;
    indices.push(b, b+1, b+2, b+1, b+3, b+2);
  }

  // Back wall (r=rows-1)
  const bw = positions.length / 3;
  for (let c = 0; c < cols; c++) {
    const x = (c / (cols - 1)) * W - W / 2;
    positions.push(x, base + heights[(rows-1)*cols + c], D/2);
    positions.push(x, 0, D/2);
  }
  for (let c = 0; c < cols - 1; c++) {
    const b = bw + c * 2;
    indices.push(b+2, b+1, b, b+2, b+3, b+1);
  }

  // Left wall (c=0)
  const lw = positions.length / 3;
  for (let r = 0; r < rows; r++) {
    const z = (r / (rows - 1)) * D - D / 2;
    positions.push(-W/2, base + heights[r*cols], z);
    positions.push(-W/2, 0, z);
  }
  for (let r = 0; r < rows - 1; r++) {
    const b = lw + r * 2;
    indices.push(b+2, b+1, b, b+2, b+3, b+1);
  }

  // Right wall (c=cols-1)
  const rw = positions.length / 3;
  for (let r = 0; r < rows; r++) {
    const z = (r / (rows - 1)) * D - D / 2;
    positions.push(W/2, base + heights[r*cols + cols-1], z);
    positions.push(W/2, 0, z);
  }
  for (let r = 0; r < rows - 1; r++) {
    const b = rw + r * 2;
    indices.push(b, b+1, b+2, b+1, b+3, b+2);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ─── Default shape params ─────────────────────────────────────────────────────

function defaultParams(type: ShapeType): ShapeParams {
  switch (type) {
    case "box": return { type, params: { width: 20, height: 20, depth: 20 } };
    case "cylinder": return { type, params: { radius: 10, height: 30, segments: 32 } };
    case "sphere": return { type, params: { radius: 12, segments: 32 } };
    case "cone": return { type, params: { radiusBottom: 12, radiusTop: 0, height: 25 } };
    case "torus": return { type, params: { outerRadius: 15, innerRadius: 4, segments: 32 } };
    case "custom": return { type, params: { width: 20, height: 20, depth: 20 } };
  }
}

// ─── Shape cards ──────────────────────────────────────────────────────────────

const SHAPE_CARDS: { type: ShapeType; label: string; icon: React.ReactNode }[] = [
  { type: "box", label: "Box", icon: <Box className="w-5 h-5" /> },
  { type: "cylinder", label: "Cylinder", icon: <Cylinder className="w-5 h-5" /> },
  { type: "sphere", label: "Sphere", icon: <Globe className="w-5 h-5" /> },
  { type: "cone", label: "Cone", icon: <Triangle className="w-5 h-5" /> },
  { type: "torus", label: "Torus", icon: <Circle className="w-5 h-5" /> },
  { type: "custom", label: "Custom", icon: <Layers className="w-5 h-5" /> },
];

// ─── Slider+Number input ─────────────────────────────────────────────────────

interface ParamInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}

function ParamInput({ label, value, min, max, step = 1, onChange }: ParamInputProps) {
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-xs" style={{ color: "#94a3b8" }}>{label}</span>
        <span className="text-xs font-mono text-white">{value.toFixed(step < 1 ? 1 : 0)}</span>
      </div>
      <div className="flex gap-2 items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 h-1.5 rounded"
          style={{ accentColor: "#f97316" }}
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
          }}
          className="w-16 text-xs text-center rounded py-1"
          style={{ background: "#060912", border: "1px solid rgba(249,115,22,0.2)", color: "white" }}
        />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CADDesigner() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const frameRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<"design" | "import" | "photo">("design");
  const [shapes, setShapes] = useState<ShapeItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wireframe, setWireframe] = useState(false);
  const [stats, setStats] = useState<ModelStats | null>(null);

  // Import STL state
  const [stlGeo, setStlGeo] = useState<THREE.BufferGeometry | null>(null);
  const [stlStats, setStlStats] = useState<ModelStats | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Photo → 3D state
  const [photoImg, setPhotoImg] = useState<HTMLImageElement | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoGeo, setPhotoGeo] = useState<THREE.BufferGeometry | null>(null);
  const [photoStats, setPhotoStats] = useState<ModelStats | null>(null);
  const [photoProcessing, setPhotoProcessing] = useState(false);
  const [isPhotoDragging, setIsPhotoDragging] = useState(false);
  const [photoSettings, setPhotoSettings] = useState<PhotoSettings>({
    realWidth: 80, realDepth: 60, maxHeight: 5,
    baseThickness: 2, resolution: 100, invert: false, keepAspect: true,
  });
  const photoFileRef = useRef<HTMLInputElement>(null);

  // ── Three.js setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x060912);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 10000);
    camera.position.set(80, 80, 120);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    controlsRef.current = controls;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);

    // Print bed grid
    const gridHelper = new THREE.GridHelper(200, 20, 0xf97316, 0x1a2235);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      const el = containerRef.current;
      if (!el || !renderer || !camera) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    // Trigger initial resize
    const el = containerRef.current;
    if (el) {
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    }

    controls.addEventListener("start", () => { controls.autoRotate = false; });

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // ── Update mesh from shapes ─────────────────────────────────────────────────
  const updateMesh = useCallback(
    (currentShapes: ShapeItem[], geo?: THREE.BufferGeometry | null) => {
      const scene = sceneRef.current;
      if (!scene) return;
      if (meshRef.current) {
        scene.remove(meshRef.current);
        meshRef.current.geometry.dispose();
        (meshRef.current.material as THREE.Material).dispose();
        meshRef.current = null;
      }
      setStats(null);

      let geometry: THREE.BufferGeometry | null = geo ?? null;

      if (!geometry) {
        const combined = buildCombinedGeom(currentShapes);
        if (!combined) return;
        geometry = jscadToThree(combined);
      }

      geometry.computeBoundingBox();
      const bbox = geometry.boundingBox!;
      const w = bbox.max.x - bbox.min.x;
      const h = bbox.max.y - bbox.min.y;
      const d = bbox.max.z - bbox.min.z;
      const triCount = geometry.getAttribute("position").count / 3;
      setStats({ triangles: triCount, width: w, height: h, depth: d });

      const material = new THREE.MeshPhongMaterial({
        color: 0xf97316,
        wireframe,
        shininess: 80,
        specular: 0x444444,
      });
      const mesh = new THREE.Mesh(geometry, material);
      // Center on grid
      geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      geometry.boundingBox!.getCenter(center);
      mesh.position.set(-center.x, -center.y, -center.z);
      scene.add(mesh);
      meshRef.current = mesh;

      if (controlsRef.current && currentShapes.length === 1 && !geo) {
        controlsRef.current.autoRotate = false;
      }
    },
    [wireframe]
  );

  useEffect(() => {
    if (tab === "design") updateMesh(shapes);
  }, [shapes, tab, updateMesh]);

  useEffect(() => {
    if (tab === "import" && stlGeo) updateMesh([], stlGeo);
  }, [stlGeo, tab, updateMesh]);

  useEffect(() => {
    if (tab === "photo" && photoGeo) updateMesh([], photoGeo);
  }, [photoGeo, tab, updateMesh]);

  // Toggle wireframe
  useEffect(() => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshPhongMaterial).wireframe = wireframe;
    }
  }, [wireframe]);

  // ── Shape manipulation ──────────────────────────────────────────────────────
  const addShape = (type: ShapeType) => {
    const id = Math.random().toString(36).slice(2);
    const newShape: ShapeItem = {
      id,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${shapes.length + 1}`,
      visible: true,
      csgOp: shapes.length === 0 ? "none" : "union",
      shape: defaultParams(type),
    };
    const next = [...shapes, newShape];
    setShapes(next);
    setSelectedId(id);
  };

  const updateShape = (id: string, updater: (s: ShapeItem) => ShapeItem) => {
    setShapes((prev) => prev.map((s) => (s.id === id ? updater(s) : s)));
  };

  const selected = shapes.find((s) => s.id === selectedId) ?? null;

  // ── Photo file handling ─────────────────────────────────────────────────────
  const handlePhotoFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setPhotoImg(img);
      setPhotoPreview(url);
      setPhotoGeo(null);
      setPhotoStats(null);
    };
    img.src = url;
  };

  const generateFromPhoto = () => {
    if (!photoImg) return;
    setPhotoProcessing(true);
    setTimeout(() => {
      try {
        const geo = imageToHeightmapGeometry(photoImg, photoSettings);
        geo.computeBoundingBox();
        const bbox = geo.boundingBox!;
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const idx = geo.getIndex();
        const triCount = idx ? idx.count / 3 : geo.getAttribute("position").count / 3;
        setPhotoStats({
          triangles: triCount,
          width: parseFloat(size.x.toFixed(2)),
          height: parseFloat(size.y.toFixed(2)),
          depth: parseFloat(size.z.toFixed(2)),
        });
        setPhotoGeo(geo);
      } finally {
        setPhotoProcessing(false);
      }
    }, 50);
  };

  // ── STL file handling ───────────────────────────────────────────────────────
  const handleSTLFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buf = e.target?.result as ArrayBuffer;
      const geo = parseSTL(buf);
      geo.computeBoundingBox();
      const bbox = geo.boundingBox!;
      const size = new THREE.Vector3();
      bbox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = maxDim > 0 ? 100 / maxDim : 1;
      geo.scale(scale, scale, scale);
      geo.computeBoundingBox();
      const bbox2 = geo.boundingBox!;
      const size2 = new THREE.Vector3();
      bbox2.getSize(size2);
      setStlStats({
        triangles: geo.getAttribute("position").count / 3,
        width: parseFloat(size2.x.toFixed(2)),
        height: parseFloat(size2.y.toFixed(2)),
        depth: parseFloat(size2.z.toFixed(2)),
      });
      setStlGeo(geo);
    };
    reader.readAsArrayBuffer(file);
  };

  // ── STL export ──────────────────────────────────────────────────────────────
  const exportGeoAsSTL = (geo: THREE.BufferGeometry, filename: string) => {
    const index = geo.getIndex();
    const pos = geo.getAttribute("position");
    const nor = geo.getAttribute("normal");
    const triCount = index ? index.count / 3 : pos.count / 3;
    const buf = new ArrayBuffer(84 + triCount * 50);
    const view = new DataView(buf);
    let off = 80;
    view.setUint32(off, triCount, true); off += 4;
    for (let i = 0; i < triCount; i++) {
      const idx0 = index ? index.getX(i * 3) : i * 3;
      view.setFloat32(off, nor.getX(idx0), true); off += 4;
      view.setFloat32(off, nor.getY(idx0), true); off += 4;
      view.setFloat32(off, nor.getZ(idx0), true); off += 4;
      for (let v = 0; v < 3; v++) {
        const vi = index ? index.getX(i * 3 + v) : i * 3 + v;
        view.setFloat32(off, pos.getX(vi), true); off += 4;
        view.setFloat32(off, pos.getY(vi), true); off += 4;
        view.setFloat32(off, pos.getZ(vi), true); off += 4;
      }
      off += 2;
    }
    const blob = new Blob([buf], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSTL = () => {
    if (tab === "design") {
      const geomData = buildCombinedGeom(shapes.filter((s) => s.visible));
      if (!geomData) return;
      const raw = stlSerializer.serialize({ binary: true }, geomData);
      const data = Array.isArray(raw) ? raw[0] : raw;
      const blob = new Blob([data.buffer as ArrayBuffer], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "model.stl"; a.click();
      URL.revokeObjectURL(url);
    } else if (tab === "photo" && photoGeo) {
      exportGeoAsSTL(photoGeo, "photo_relief.stl");
    } else if (stlGeo) {
      exportGeoAsSTL(stlGeo, "imported_model.stl");
    }
  };

  // ── Send to order form ───────────────────────────────────────────────────────
  const sendToOrder = () => {
    const s = stats ?? photoStats ?? stlStats;
    if (!s) return;
    const title = tab === "photo"
      ? "Photo Bas-Relief Model"
      : shapes.length > 0 ? shapes[0].name : "CAD Model";
    router.push(
      `/print3d/order?w=${s.width.toFixed(1)}&h=${s.height.toFixed(1)}&d=${s.depth.toFixed(1)}&title=${encodeURIComponent(title)}`
    );
  };

  // ── Camera view helpers ──────────────────────────────────────────────────────
  const setView = (view: "front" | "top" | "side" | "reset") => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    const dist = 180;
    if (view === "front") camera.position.set(0, 0, dist);
    else if (view === "top") camera.position.set(0, dist, 0);
    else if (view === "side") camera.position.set(dist, 0, 0);
    else camera.position.set(80, 80, 120);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  const cardBase = {
    background: "#0d1220",
    border: "1px solid rgba(249,115,22,0.15)",
    borderRadius: "0.75rem",
  } as const;

  return (
    <div className="flex" style={{ height: "calc(100vh - 3.5rem)" }}>
      {/* ── Left Sidebar ── */}
      <div
        className="flex flex-col overflow-hidden"
        style={{ width: 320, borderRight: "1px solid rgba(249,115,22,0.15)", background: "#0d1220" }}
      >
        {/* Tab selector */}
        <div className="flex border-b" style={{ borderColor: "rgba(249,115,22,0.15)" }}>
          {([
            { id: "design", label: "Design" },
            { id: "import", label: "Import STL" },
            { id: "photo", label: "Photo→3D" },
          ] as const).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex-1 py-2.5 text-xs font-semibold transition-colors"
              style={{
                color: tab === id ? "#f97316" : "#94a3b8",
                borderBottom: tab === id ? "2px solid #f97316" : "2px solid transparent",
                background: "transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {tab === "photo" ? (
            /* Photo → 3D tab */
            <>
              <div style={cardBase} className="p-3">
                <p className="text-xs font-bold text-white mb-2">Upload Photo</p>
                <div
                  className="relative rounded-xl overflow-hidden cursor-pointer transition-all"
                  style={{
                    border: `2px dashed ${isPhotoDragging ? "#f97316" : "rgba(249,115,22,0.3)"}`,
                    background: isPhotoDragging ? "rgba(249,115,22,0.05)" : "transparent",
                    minHeight: 100,
                  }}
                  onDragOver={(e) => { e.preventDefault(); setIsPhotoDragging(true); }}
                  onDragLeave={() => setIsPhotoDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault(); setIsPhotoDragging(false);
                    const f = e.dataTransfer.files[0];
                    if (f && f.type.startsWith("image/")) handlePhotoFile(f);
                  }}
                  onClick={() => photoFileRef.current?.click()}
                >
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="preview" className="w-full rounded-lg" style={{ maxHeight: 140, objectFit: "cover" }} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6">
                      <ImageIcon className="w-8 h-8 mb-2" style={{ color: isPhotoDragging ? "#f97316" : "#64748b" }} />
                      <p className="text-white text-sm font-semibold mb-1">Drop image here</p>
                      <p className="text-slate-500 text-xs">JPG, PNG, WebP</p>
                    </div>
                  )}
                  <input ref={photoFileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoFile(f); }} />
                </div>
              </div>

              {photoImg && (
                <div style={cardBase} className="p-3">
                  <p className="text-xs font-bold text-white mb-3">Relief Settings</p>
                  <ParamInput label="Width (mm)" value={photoSettings.realWidth} min={10} max={300}
                    onChange={(v) => setPhotoSettings(s => ({ ...s, realWidth: v }))} />
                  {!photoSettings.keepAspect && (
                    <ParamInput label="Depth (mm)" value={photoSettings.realDepth} min={10} max={300}
                      onChange={(v) => setPhotoSettings(s => ({ ...s, realDepth: v }))} />
                  )}
                  <ParamInput label="Max Relief Height (mm)" value={photoSettings.maxHeight} min={1} max={30} step={0.5}
                    onChange={(v) => setPhotoSettings(s => ({ ...s, maxHeight: v }))} />
                  <ParamInput label="Base Thickness (mm)" value={photoSettings.baseThickness} min={0.5} max={20} step={0.5}
                    onChange={(v) => setPhotoSettings(s => ({ ...s, baseThickness: v }))} />
                  <ParamInput label="Resolution" value={photoSettings.resolution} min={30} max={200}
                    onChange={(v) => setPhotoSettings(s => ({ ...s, resolution: Math.round(v) }))} />
                  <div className="flex gap-3 mt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input type="checkbox" checked={photoSettings.invert}
                        onChange={(e) => setPhotoSettings(s => ({ ...s, invert: e.target.checked }))}
                        className="rounded" style={{ accentColor: "#f97316" }} />
                      <span className="text-xs" style={{ color: "#94a3b8" }}>Invert</span>
                      <FlipHorizontal className="w-3 h-3" style={{ color: "#64748b" }} />
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input type="checkbox" checked={photoSettings.keepAspect}
                        onChange={(e) => setPhotoSettings(s => ({ ...s, keepAspect: e.target.checked }))}
                        className="rounded" style={{ accentColor: "#f97316" }} />
                      <span className="text-xs" style={{ color: "#94a3b8" }}>Lock Aspect</span>
                    </label>
                  </div>
                  <button
                    onClick={generateFromPhoto}
                    disabled={photoProcessing}
                    className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                    style={{ background: "#f97316", color: "white" }}
                  >
                    {photoProcessing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                    ) : (
                      <><ImageIcon className="w-4 h-4" /> Generate 3D Model</>
                    )}
                  </button>
                </div>
              )}

              {photoStats && (
                <div style={cardBase} className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-3.5 h-3.5" style={{ color: "#22d3ee" }} />
                    <p className="text-xs font-bold text-white">Model Info</p>
                  </div>
                  <div className="space-y-1 text-xs">
                    {[
                      ["Triangles", photoStats.triangles.toLocaleString()],
                      ["Width", `${photoStats.width.toFixed(2)} mm`],
                      ["Height", `${photoStats.height.toFixed(2)} mm`],
                      ["Depth", `${photoStats.depth.toFixed(2)} mm`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span style={{ color: "#94a3b8" }}>{k}</span>
                        <span className="text-white font-mono">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : tab === "design" ? (
            <>
              {/* Shape Library */}
              <div style={cardBase} className="p-3">
                <p className="text-xs font-bold text-white mb-2">Shape Library</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {SHAPE_CARDS.map((card) => (
                    <button
                      key={card.type}
                      onClick={() => addShape(card.type)}
                      className="flex flex-col items-center gap-1 py-2 rounded-lg text-xs transition-all hover:scale-105"
                      style={{
                        background: "#060912",
                        border: "1px solid rgba(249,115,22,0.2)",
                        color: "#94a3b8",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#f97316";
                        (e.currentTarget as HTMLButtonElement).style.color = "#f97316";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(249,115,22,0.2)";
                        (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
                      }}
                    >
                      {card.icon}
                      <span>{card.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Shape Properties */}
              {selected && (
                <div style={cardBase} className="p-3">
                  <p className="text-xs font-bold text-white mb-3">
                    Properties —{" "}
                    <span style={{ color: "#f97316" }}>{selected.name}</span>
                  </p>
                  <ShapeParamEditor
                    shape={selected}
                    onUpdate={(updater) => updateShape(selected.id, updater)}
                  />
                </div>
              )}

              {/* Shapes List */}
              {shapes.length > 0 && (
                <div style={cardBase} className="p-3">
                  <p className="text-xs font-bold text-white mb-2">
                    Scene ({shapes.length})
                  </p>
                  <div className="space-y-1.5">
                    {shapes.map((s, idx) => (
                      <div
                        key={s.id}
                        onClick={() => setSelectedId(s.id)}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors"
                        style={{
                          background:
                            selectedId === s.id
                              ? "rgba(249,115,22,0.1)"
                              : "transparent",
                          border: `1px solid ${selectedId === s.id ? "rgba(249,115,22,0.4)" : "rgba(249,115,22,0.1)"}`,
                        }}
                      >
                        <span className="text-xs text-white flex-1 truncate">
                          {s.name}
                        </span>
                        <span
                          className="text-[10px] px-1 py-0.5 rounded"
                          style={{
                            background: "rgba(249,115,22,0.15)",
                            color: "#f97316",
                          }}
                        >
                          {s.shape.type}
                        </span>
                        {idx > 0 && (
                          <select
                            value={s.csgOp}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateShape(s.id, (sh) => ({
                                ...sh,
                                csgOp: e.target.value as CSGOp,
                              }));
                            }}
                            className="text-[10px] rounded px-1 py-0.5"
                            style={{
                              background: "#060912",
                              border: "1px solid rgba(249,115,22,0.2)",
                              color: "#22d3ee",
                              cursor: "pointer",
                            }}
                          >
                            <option value="union">∪ Union</option>
                            <option value="subtract">− Subtract</option>
                            <option value="intersect">∩ Intersect</option>
                          </select>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateShape(s.id, (sh) => ({
                              ...sh,
                              visible: !sh.visible,
                            }));
                          }}
                          className="p-0.5 rounded transition-colors"
                          style={{ color: s.visible ? "#f97316" : "#64748b" }}
                          title={s.visible ? "Hide" : "Show"}
                        >
                          {s.visible ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShapes((prev) =>
                              prev.filter((sh) => sh.id !== s.id)
                            );
                            if (selectedId === s.id) setSelectedId(null);
                          }}
                          className="p-0.5 rounded transition-colors hover:text-red-400"
                          style={{ color: "#64748b" }}
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Import STL tab */
            <>
              <div style={cardBase} className="p-3">
                <p className="text-xs font-bold text-white mb-2">
                  Import STL File
                </p>
                <div
                  className="flex flex-col items-center justify-center rounded-xl p-6 cursor-pointer transition-all"
                  style={{
                    border: `2px dashed ${isDragging ? "#f97316" : "rgba(249,115,22,0.3)"}`,
                    background: isDragging
                      ? "rgba(249,115,22,0.05)"
                      : "transparent",
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const f = e.dataTransfer.files[0];
                    if (f && f.name.toLowerCase().endsWith(".stl"))
                      handleSTLFile(f);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload
                    className="w-8 h-8 mb-2"
                    style={{ color: isDragging ? "#f97316" : "#64748b" }}
                  />
                  <p className="text-white text-sm font-semibold mb-1">
                    Drop STL here
                  </p>
                  <p className="text-slate-500 text-xs">or click to browse</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".stl"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleSTLFile(f);
                    }}
                  />
                </div>
              </div>

              {stlStats && (
                <div style={cardBase} className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Info
                      className="w-3.5 h-3.5"
                      style={{ color: "#22d3ee" }}
                    />
                    <p className="text-xs font-bold text-white">Model Info</p>
                  </div>
                  <div className="space-y-1 text-xs">
                    {[
                      ["Triangles", stlStats.triangles.toLocaleString()],
                      ["Width", `${stlStats.width.toFixed(2)} mm`],
                      ["Height", `${stlStats.height.toFixed(2)} mm`],
                      ["Depth", `${stlStats.depth.toFixed(2)} mm`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span style={{ color: "#94a3b8" }}>{k}</span>
                        <span className="text-white font-mono">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Export section */}
        <div
          className="p-3 border-t space-y-2"
          style={{ borderColor: "rgba(249,115,22,0.15)" }}
        >
          <button
            onClick={downloadSTL}
            disabled={
              tab === "design"
                ? shapes.filter((s) => s.visible).length === 0
                : tab === "photo"
                ? !photoGeo
                : !stlGeo
            }
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40"
            style={{ background: "#f97316", color: "white" }}
          >
            <Download className="w-4 h-4" />
            Download STL
          </button>
          <button
            onClick={sendToOrder}
            disabled={!stats && !photoStats && !stlStats}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40"
            style={{
              background: "rgba(249,115,22,0.15)",
              color: "#f97316",
              border: "1px solid rgba(249,115,22,0.3)",
            }}
          >
            <ShoppingCart className="w-4 h-4" />
            Send to Order Form
          </button>
        </div>
      </div>

      {/* ── Right Panel: 3D Viewport ── */}
      <div className="flex-1 relative" ref={containerRef}>
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Toolbar overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5" style={{ zIndex: 10 }}>
          {[
            {
              label: "Reset",
              icon: <RotateCcw className="w-3.5 h-3.5" />,
              action: () => setView("reset"),
            },
            {
              label: "Wireframe",
              icon: <Grid3x3 className="w-3.5 h-3.5" />,
              action: () => setWireframe((w) => !w),
            },
            {
              label: "Front",
              icon: <Monitor className="w-3.5 h-3.5" />,
              action: () => setView("front"),
            },
            {
              label: "Top",
              icon: <Monitor className="w-3.5 h-3.5" />,
              action: () => setView("top"),
            },
            {
              label: "Side",
              icon: <Monitor className="w-3.5 h-3.5" />,
              action: () => setView("side"),
            },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              title={btn.label}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background:
                  btn.label === "Wireframe" && wireframe
                    ? "rgba(249,115,22,0.3)"
                    : "rgba(13,18,32,0.9)",
                border: "1px solid rgba(249,115,22,0.2)",
                color:
                  btn.label === "Wireframe" && wireframe
                    ? "#f97316"
                    : "#94a3b8",
                backdropFilter: "blur(8px)",
              }}
            >
              {btn.icon}
              <span>{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Stats overlay */}
        {(stats ?? photoStats ?? stlStats) && (
          <div
            className="absolute bottom-3 right-3 rounded-lg px-3 py-2 text-xs font-mono space-y-0.5"
            style={{
              background: "rgba(13,18,32,0.9)",
              border: "1px solid rgba(249,115,22,0.15)",
              backdropFilter: "blur(8px)",
              color: "#94a3b8",
              zIndex: 10,
            }}
          >
            {(() => {
              const s = stats ?? photoStats ?? stlStats!;
              return (
                <>
                  <div>
                    <span style={{ color: "#f97316" }}>△</span>{" "}
                    {s.triangles.toLocaleString()}
                  </div>
                  <div>
                    {s.width.toFixed(1)} × {s.height.toFixed(1)} ×{" "}
                    {s.depth.toFixed(1)} mm
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Empty state */}
        {shapes.length === 0 && !stlGeo && !photoGeo && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ color: "#1e293b" }}
          >
            <Box className="w-16 h-16 mb-4" />
            <p className="text-lg font-bold">Add a shape to get started</p>
            <p className="text-sm mt-1">Or import an STL / upload a photo</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shape parameter editor ───────────────────────────────────────────────────

function ShapeParamEditor({
  shape,
  onUpdate,
}: {
  shape: ShapeItem;
  onUpdate: (updater: (s: ShapeItem) => ShapeItem) => void;
}) {
  const { shape: sp } = shape;

  function setParams<T>(newParams: T) {
    onUpdate((s) => ({
      ...s,
      shape: { ...s.shape, params: newParams } as ShapeParams,
    }));
  }

  if (sp.type === "box" || sp.type === "custom") {
    const p = sp.params as BoxParams;
    return (
      <>
        <ParamInput
          label="Width (mm)"
          value={p.width}
          min={1}
          max={300}
          onChange={(v) => setParams({ ...p, width: v })}
        />
        <ParamInput
          label="Height (mm)"
          value={p.height}
          min={1}
          max={300}
          onChange={(v) => setParams({ ...p, height: v })}
        />
        <ParamInput
          label="Depth (mm)"
          value={p.depth}
          min={1}
          max={300}
          onChange={(v) => setParams({ ...p, depth: v })}
        />
      </>
    );
  }
  if (sp.type === "cylinder") {
    const p = sp.params as CylinderParams;
    return (
      <>
        <ParamInput
          label="Radius (mm)"
          value={p.radius}
          min={1}
          max={150}
          onChange={(v) => setParams({ ...p, radius: v })}
        />
        <ParamInput
          label="Height (mm)"
          value={p.height}
          min={1}
          max={300}
          onChange={(v) => setParams({ ...p, height: v })}
        />
        <ParamInput
          label="Segments"
          value={p.segments}
          min={8}
          max={64}
          onChange={(v) => setParams({ ...p, segments: Math.round(v) })}
        />
      </>
    );
  }
  if (sp.type === "sphere") {
    const p = sp.params as SphereParams;
    return (
      <>
        <ParamInput
          label="Radius (mm)"
          value={p.radius}
          min={1}
          max={150}
          onChange={(v) => setParams({ ...p, radius: v })}
        />
        <ParamInput
          label="Segments"
          value={p.segments}
          min={8}
          max={64}
          onChange={(v) => setParams({ ...p, segments: Math.round(v) })}
        />
      </>
    );
  }
  if (sp.type === "cone") {
    const p = sp.params as ConeParams;
    return (
      <>
        <ParamInput
          label="Bottom Radius (mm)"
          value={p.radiusBottom}
          min={0}
          max={150}
          onChange={(v) => setParams({ ...p, radiusBottom: v })}
        />
        <ParamInput
          label="Top Radius (mm)"
          value={p.radiusTop}
          min={0}
          max={150}
          onChange={(v) => setParams({ ...p, radiusTop: v })}
        />
        <ParamInput
          label="Height (mm)"
          value={p.height}
          min={1}
          max={300}
          onChange={(v) => setParams({ ...p, height: v })}
        />
      </>
    );
  }
  if (sp.type === "torus") {
    const p = sp.params as TorusParams;
    return (
      <>
        <ParamInput
          label="Outer Radius (mm)"
          value={p.outerRadius}
          min={3}
          max={150}
          onChange={(v) => setParams({ ...p, outerRadius: v })}
        />
        <ParamInput
          label="Inner Radius (mm)"
          value={p.innerRadius}
          min={1}
          max={p.outerRadius - 1}
          onChange={(v) => setParams({ ...p, innerRadius: v })}
        />
        <ParamInput
          label="Segments"
          value={p.segments}
          min={8}
          max={64}
          onChange={(v) => setParams({ ...p, segments: Math.round(v) })}
        />
      </>
    );
  }
  return null;
}
