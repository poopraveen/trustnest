"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { primitives } from "@jscad/modeling";
import type { Geom3 } from "@jscad/modeling/src/geometries/types";
import { MATERIALS, QUOTE_CALC } from "@/lib/print3d/data";
import type { Material } from "@/lib/print3d/types";

const { booleans, transforms: jt } = require("@jscad/modeling") as {
  booleans: { union: (...g: Geom3[]) => Geom3; subtract: (...g: Geom3[]) => Geom3; intersect: (...g: Geom3[]) => Geom3 };
  transforms: {
    translate: (v: [number,number,number], g: Geom3) => Geom3;
    rotateX: (a: number, g: Geom3) => Geom3;
    rotateY: (a: number, g: Geom3) => Geom3;
    rotateZ: (a: number, g: Geom3) => Geom3;
    scale: (v: [number,number,number], g: Geom3) => Geom3;
    mirror: (opts: { normal: [number,number,number] }, g: Geom3) => Geom3;
  };
};
const stlSerializer = require("@jscad/stl-serializer") as {
  serialize: (opts: { binary: boolean }, geom: Geom3) => Uint8Array;
};

import {
  Box, Cylinder, Globe, Triangle, Circle, Layers,
  Eye, EyeOff, Trash2, Download, ShoppingCart, RotateCcw,
  Grid3x3, Monitor, Upload, Info, ImageIcon, Loader2, FlipHorizontal,
  Move, RotateCw, Maximize2, Copy, Lock, Unlock, Minus, Plus,
  AlignCenter, AlignCenterVertical, Layers3, Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ShapeType = "box" | "cylinder" | "sphere" | "cone" | "torus" | "custom";
type CSGOp = "none" | "union" | "subtract" | "intersect";
type TransformMode = "translate" | "rotate" | "scale";

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
  locked: boolean;
  csgOp: CSGOp;
  shape: ShapeParams;
  color: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  mirror: { x: boolean; y: boolean; z: boolean };
}

interface ModelStats { triangles: number; width: number; height: number; depth: number }

interface PhotoSettings {
  surfaceMode: "flat" | "cylinder";
  realWidth: number; realDepth: number; maxHeight: number;
  baseThickness: number; resolution: number; invert: boolean; keepAspect: boolean;
  cylinderRadius: number; cylinderHeight: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEG = Math.PI / 180;

const PALETTE = [
  "#f97316","#3b82f6","#22c55e","#ec4899",
  "#a855f7","#06b6d4","#eab308","#ef4444",
];

const SHAPE_CARDS: { type: ShapeType; label: string; icon: React.ReactNode }[] = [
  { type:"box",      label:"Box",      icon:<Box className="w-5 h-5"/> },
  { type:"cylinder", label:"Cylinder", icon:<Cylinder className="w-5 h-5"/> },
  { type:"sphere",   label:"Sphere",   icon:<Globe className="w-5 h-5"/> },
  { type:"cone",     label:"Cone",     icon:<Triangle className="w-5 h-5"/> },
  { type:"torus",    label:"Torus",    icon:<Circle className="w-5 h-5"/> },
  { type:"custom",   label:"Custom",   icon:<Layers className="w-5 h-5"/> },
];

// ─── jscad helpers ────────────────────────────────────────────────────────────

function jscadToThree(geom: Geom3): THREE.BufferGeometry {
  const p: number[] = [], n: number[] = [];
  for (const poly of geom.polygons) {
    const vs = poly.vertices as unknown as number[][];
    for (let i = 1; i < vs.length - 1; i++) {
      const v0=vs[0],v1=vs[i],v2=vs[i+1];
      p.push(...v0,...v1,...v2);
      const ax=v1[0]-v0[0],ay=v1[1]-v0[1],az=v1[2]-v0[2];
      const bx=v2[0]-v0[0],by=v2[1]-v0[1],bz=v2[2]-v0[2];
      const nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;
      const l=Math.sqrt(nx*nx+ny*ny+nz*nz)||1;
      for(let j=0;j<3;j++) n.push(nx/l,ny/l,nz/l);
    }
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute("position",new THREE.BufferAttribute(new Float32Array(p),3));
  g.setAttribute("normal",new THREE.BufferAttribute(new Float32Array(n),3));
  return g;
}

function buildRaw(shape: ShapeParams): Geom3 {
  switch(shape.type){
    case "box":      { const p=shape.params; return primitives.cuboid({size:[p.width,p.height,p.depth]}); }
    case "cylinder": { const p=shape.params; return primitives.cylinder({radius:p.radius,height:p.height,segments:p.segments}); }
    case "sphere":   { const p=shape.params; return primitives.sphere({radius:p.radius,segments:p.segments}); }
    case "cone":     { const p=shape.params; return primitives.cylinderElliptic({height:p.height,startRadius:[p.radiusBottom,p.radiusBottom],endRadius:[p.radiusTop,p.radiusTop],segments:32}); }
    case "torus":    { const p=shape.params; return primitives.torus({innerRadius:p.innerRadius,outerRadius:p.outerRadius,innerSegments:p.segments,outerSegments:p.segments}); }
    case "custom":   { const p=shape.params; return booleans.union(primitives.cuboid({size:[p.width,p.height,p.depth]}),primitives.cuboid({size:[p.width*.5,p.height*.5,p.depth*1.5]})); }
  }
}

function applyXforms(g: Geom3, s: ShapeItem): Geom3 {
  if(s.mirror.x) g=jt.mirror({normal:[1,0,0]},g);
  if(s.mirror.y) g=jt.mirror({normal:[0,1,0]},g);
  if(s.mirror.z) g=jt.mirror({normal:[0,0,1]},g);
  if(s.scale!==1) g=jt.scale([s.scale,s.scale,s.scale],g);
  if(s.rotation.x) g=jt.rotateX(s.rotation.x*DEG,g);
  if(s.rotation.y) g=jt.rotateY(s.rotation.y*DEG,g);
  if(s.rotation.z) g=jt.rotateZ(s.rotation.z*DEG,g);
  g=jt.translate([s.position.x,s.position.y,s.position.z],g);
  return g;
}

function buildCombined(shapes: ShapeItem[]): Geom3|null {
  const vis=shapes.filter(s=>s.visible);
  if(!vis.length) return null;
  const gs=vis.map(s=>applyXforms(buildRaw(s.shape),s));
  if(gs.length===1) return gs[0];
  let base=gs[0];
  for(let i=1;i<vis.length;i++){
    const op=vis[i].csgOp;
    if(op==="subtract") base=booleans.subtract(base,gs[i]);
    else if(op==="intersect") base=booleans.intersect(base,gs[i]);
    else base=booleans.union(base,gs[i]);
  }
  return base;
}

// ─── STL parser ───────────────────────────────────────────────────────────────

function parseSTL(buf: ArrayBuffer): THREE.BufferGeometry {
  const dv=new DataView(buf);
  const n=dv.getUint32(80,true);
  if(80+4+n*50===buf.byteLength){
    const p:number[]=[],nor:number[]=[];
    let o=84;
    for(let i=0;i<n;i++){
      const nx=dv.getFloat32(o,true),ny=dv.getFloat32(o+4,true),nz=dv.getFloat32(o+8,true); o+=12;
      for(let v=0;v<3;v++){p.push(dv.getFloat32(o,true),dv.getFloat32(o+4,true),dv.getFloat32(o+8,true));nor.push(nx,ny,nz);o+=12;}
      o+=2;
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute("position",new THREE.BufferAttribute(new Float32Array(p),3));
    g.setAttribute("normal",new THREE.BufferAttribute(new Float32Array(nor),3));
    return g;
  }
  const tx=new TextDecoder().decode(buf),p:number[]=[],nor:number[]=[];
  const nre=/facet normal\s+([\d.eE+-]+)\s+([\d.eE+-]+)\s+([\d.eE+-]+)/g;
  const vre=/vertex\s+([\d.eE+-]+)\s+([\d.eE+-]+)\s+([\d.eE+-]+)/g;
  let nm:RegExpExecArray|null,vm:RegExpExecArray|null;
  while((nm=nre.exec(tx))!==null){
    const[,snx,sny,snz]=nm;
    for(let v=0;v<3;v++){vm=vre.exec(tx);if(vm)p.push(+vm[1],+vm[2],+vm[3]);nor.push(+snx,+sny,+snz);}
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute("position",new THREE.BufferAttribute(new Float32Array(p),3));
  g.setAttribute("normal",new THREE.BufferAttribute(new Float32Array(nor),3));
  return g;
}

// ─── Photo → heightmap ────────────────────────────────────────────────────────

function sampleBrightness(id: ImageData, cols: number, rows: number, r: number, c: number, invert: boolean): number {
  const i=(r*cols+c)*4;
  const alpha=id.data[i+3]/255; // 0=bg, 1=subject (for bg-removed images)
  const raw=(id.data[i]+id.data[i+1]+id.data[i+2])/3/255;
  return (invert?1-raw:raw)*alpha;
}

function imageToHeightmap(img: HTMLImageElement, o: PhotoSettings): THREE.BufferGeometry {
  const cv=document.createElement("canvas");
  const res=Math.round(o.resolution);
  cv.width=res; cv.height=o.keepAspect?Math.round(res*(img.naturalHeight/img.naturalWidth)):res;
  const ctx=cv.getContext("2d")!; ctx.drawImage(img,0,0,cv.width,cv.height);
  const id=ctx.getImageData(0,0,cv.width,cv.height);
  const cols=cv.width,rows=cv.height;
  const W=o.realWidth,D=o.keepAspect?W*(rows/cols):o.realDepth,H=o.maxHeight,base=o.baseThickness;
  const h=new Array(rows*cols);
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){h[r*cols+c]=sampleBrightness(id,cols,rows,r,c,o.invert)*H;}
  const p:number[]=[],ix:number[]=[];
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) p.push((c/(cols-1))*W-W/2,base+h[r*cols+c],(r/(rows-1))*D-D/2);
  for(let r=0;r<rows-1;r++) for(let c=0;c<cols-1;c++){const a=r*cols+c,b=a+1,cc=(r+1)*cols+c,d=cc+1;ix.push(a,cc,b,b,cc,d);}
  const bot=p.length/3; p.push(-W/2,0,-D/2,W/2,0,-D/2,W/2,0,D/2,-W/2,0,D/2); ix.push(bot,bot+2,bot+1,bot,bot+3,bot+2);
  const fw=p.length/3; for(let c=0;c<cols;c++){const x=(c/(cols-1))*W-W/2;p.push(x,base+h[c],-D/2,x,0,-D/2);} for(let c=0;c<cols-1;c++){const b=fw+c*2;ix.push(b,b+1,b+2,b+1,b+3,b+2);}
  const bw=p.length/3; for(let c=0;c<cols;c++){const x=(c/(cols-1))*W-W/2;p.push(x,base+h[(rows-1)*cols+c],D/2,x,0,D/2);} for(let c=0;c<cols-1;c++){const b=bw+c*2;ix.push(b+2,b+1,b,b+2,b+3,b+1);}
  const lw=p.length/3; for(let r=0;r<rows;r++){const z=(r/(rows-1))*D-D/2;p.push(-W/2,base+h[r*cols],z,-W/2,0,z);} for(let r=0;r<rows-1;r++){const b=lw+r*2;ix.push(b+2,b+1,b,b+2,b+3,b+1);}
  const rw=p.length/3; for(let r=0;r<rows;r++){const z=(r/(rows-1))*D-D/2;p.push(W/2,base+h[r*cols+cols-1],z,W/2,0,z);} for(let r=0;r<rows-1;r++){const b=rw+r*2;ix.push(b,b+1,b+2,b+1,b+3,b+2);}
  const geo=new THREE.BufferGeometry();
  geo.setAttribute("position",new THREE.BufferAttribute(new Float32Array(p),3));
  geo.setIndex(ix); geo.computeVertexNormals();
  return geo;
}

// ─── Photo → cylinder wrap ────────────────────────────────────────────────────

function imageToCylinderHeightmap(img: HTMLImageElement, o: PhotoSettings): THREE.BufferGeometry {
  const cv=document.createElement("canvas");
  const cols=Math.round(o.resolution);
  const rows=o.keepAspect?Math.round(cols*(img.naturalHeight/img.naturalWidth)):cols;
  cv.width=cols; cv.height=rows;
  const ctx=cv.getContext("2d")!; ctx.drawImage(img,0,0,cols,rows);
  const id=ctx.getImageData(0,0,cols,rows);

  const R=o.cylinderRadius, H=o.cylinderHeight, base=o.baseThickness, relief=o.maxHeight;
  const bright=new Array(rows*cols);
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){bright[r*cols+c]=sampleBrightness(id,cols,rows,r,c,o.invert);}

  const p:number[]=[],ix:number[]=[];

  // outer surface (R + base + relief·brightness), image row 0 = top of cylinder
  for(let r=0;r<rows;r++){
    const y=H/2-(r/(rows-1))*H; // top → bottom along Y
    for(let c=0;c<cols;c++){
      const theta=(c/cols)*Math.PI*2;
      const outerR=R+base+bright[r*cols+c]*relief;
      p.push(outerR*Math.cos(theta),y,outerR*Math.sin(theta));
    }
  }

  // inner surface (smooth, radius R)
  const innerStart=rows*cols;
  for(let r=0;r<rows;r++){
    const y=H/2-(r/(rows-1))*H;
    for(let c=0;c<cols;c++){
      const theta=(c/cols)*Math.PI*2;
      p.push(R*Math.cos(theta),y,R*Math.sin(theta));
    }
  }

  // outer surface quads (outward facing)
  for(let r=0;r<rows-1;r++) for(let c=0;c<cols;c++){
    const nc=(c+1)%cols;
    const a=r*cols+c,b=r*cols+nc,cc=(r+1)*cols+c,d=(r+1)*cols+nc;
    ix.push(a,b,cc, b,d,cc);
  }

  // inner surface quads (inward facing — reversed winding)
  for(let r=0;r<rows-1;r++) for(let c=0;c<cols;c++){
    const nc=(c+1)%cols;
    const a=innerStart+r*cols+c,b=innerStart+r*cols+nc,cc=innerStart+(r+1)*cols+c,d=innerStart+(r+1)*cols+nc;
    ix.push(cc,b,a, cc,d,b);
  }

  // top cap (row 0) — connect outer to inner
  for(let c=0;c<cols;c++){
    const nc=(c+1)%cols;
    ix.push(c,nc,innerStart+nc, c,innerStart+nc,innerStart+c);
  }

  // bottom cap (row rows-1) — connect outer to inner
  const ob=(rows-1)*cols,ib=innerStart+(rows-1)*cols;
  for(let c=0;c<cols;c++){
    const nc=(c+1)%cols;
    ix.push(ob+nc,ob+c,ib+c, ob+nc,ib+c,ib+nc);
  }

  const geo=new THREE.BufferGeometry();
  geo.setAttribute("position",new THREE.BufferAttribute(new Float32Array(p),3));
  geo.setIndex(ix); geo.computeVertexNormals();
  return geo;
}

// ─── STL export ───────────────────────────────────────────────────────────────

function exportSTL(geo: THREE.BufferGeometry, filename: string) {
  const ix=geo.getIndex(),pos=geo.getAttribute("position"),nor=geo.getAttribute("normal");
  const tc=ix?ix.count/3:pos.count/3;
  const buf=new ArrayBuffer(84+tc*50); const dv=new DataView(buf); let off=80;
  dv.setUint32(off,tc,true); off+=4;
  for(let i=0;i<tc;i++){
    const i0=ix?ix.getX(i*3):i*3;
    dv.setFloat32(off,nor.getX(i0),true);off+=4; dv.setFloat32(off,nor.getY(i0),true);off+=4; dv.setFloat32(off,nor.getZ(i0),true);off+=4;
    for(let v=0;v<3;v++){const vi=ix?ix.getX(i*3+v):i*3+v;dv.setFloat32(off,pos.getX(vi),true);off+=4;dv.setFloat32(off,pos.getY(vi),true);off+=4;dv.setFloat32(off,pos.getZ(vi),true);off+=4;}
    off+=2;
  }
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([buf],{type:"application/octet-stream"}));
  a.download=filename; a.click();
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

function defaultParams(type: ShapeType): ShapeParams {
  switch(type){
    case "box":      return {type,params:{width:20,height:20,depth:20}};
    case "cylinder": return {type,params:{radius:10,height:30,segments:32}};
    case "sphere":   return {type,params:{radius:12,segments:32}};
    case "cone":     return {type,params:{radiusBottom:12,radiusTop:0,height:25}};
    case "torus":    return {type,params:{outerRadius:15,innerRadius:4,segments:32}};
    case "custom":   return {type,params:{width:20,height:20,depth:20}};
  }
}

// ─── ParamInput ───────────────────────────────────────────────────────────────

function ParamInput({label,value,min,max,step=1,onChange}:{label:string;value:number;min:number;max:number;step?:number;onChange:(v:number)=>void}) {
  return (
    <div className="mb-2.5">
      <div className="flex justify-between mb-1">
        <span className="text-xs" style={{color:"#94a3b8"}}>{label}</span>
        <span className="text-xs font-mono text-white">{value.toFixed(step<1?1:0)}</span>
      </div>
      <div className="flex gap-2 items-center">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e=>onChange(parseFloat(e.target.value))} className="flex-1 h-1.5 rounded" style={{accentColor:"#f97316"}}/>
        <input type="number" min={min} max={max} step={step} value={value}
          onChange={e=>{const v=parseFloat(e.target.value);if(!isNaN(v))onChange(Math.min(max,Math.max(min,v)));}}
          className="w-14 text-xs text-center rounded py-1"
          style={{background:"#060912",border:"1px solid rgba(249,115,22,0.2)",color:"white"}}/>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CADDesigner() {
  const router = useRouter();

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef  = useRef<THREE.WebGLRenderer|null>(null);
  const sceneRef     = useRef<THREE.Scene|null>(null);
  const cameraRef    = useRef<THREE.PerspectiveCamera|null>(null);
  const orbitRef     = useRef<OrbitControls|null>(null);
  const tcRef        = useRef<TransformControls|null>(null);
  const meshMapRef   = useRef<Map<string,THREE.Mesh>>(new Map());
  const raycaster    = useRef(new THREE.Raycaster());
  const frameRef     = useRef(0);
  const tcDragging   = useRef(false);
  const geoCache     = useRef<Map<string,THREE.BufferGeometry>>(new Map());

  // Stable refs (never stale in event handlers)
  const selectedIdRef = useRef<string|null>(null);
  const shapesRef     = useRef<ShapeItem[]>([]);
  const undoRef       = useRef<()=>void>(()=>{});
  const redoRef       = useRef<()=>void>(()=>{});
  const deleteRef     = useRef<()=>void>(()=>{});

  // History stored as a ref to avoid closures
  const hist = useRef<{states:ShapeItem[][];idx:number}>({states:[[]],idx:0});

  const [tab,        setTab]        = useState<"design"|"import"|"photo">("design");
  const [shapes,     setShapes]     = useState<ShapeItem[]>([]);
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [wireframe,  setWireframe]  = useState(false);
  const [csgPreview, setCsgPreview] = useState(false);
  const [tMode,      setTMode]      = useState<TransformMode>("translate");
  const [stats,      setStats]      = useState<ModelStats|null>(null);

  const [stlGeo,   setStlGeo]   = useState<THREE.BufferGeometry|null>(null);
  const [stlStats, setStlStats] = useState<ModelStats|null>(null);
  const [isDrag,   setIsDrag]   = useState(false);
  const fileRef                 = useRef<HTMLInputElement>(null);

  const [photoImg,       setPhotoImg]        = useState<HTMLImageElement|null>(null);
  const [photoPreview,   setPhotoPreview]    = useState<string|null>(null);
  const [photoGeo,       setPhotoGeo]        = useState<THREE.BufferGeometry|null>(null);
  const [photoStats,     setPhotoStats]      = useState<ModelStats|null>(null);
  const [photoProc,      setPhotoProc]       = useState(false);
  const [isPhotoDrag,    setIsPhotoDrag]     = useState(false);
  const [photoSettings,  setPhotoSettings]   = useState<PhotoSettings>({surfaceMode:"flat",realWidth:80,realDepth:60,maxHeight:5,baseThickness:2,resolution:100,invert:false,keepAspect:true,cylinderRadius:30,cylinderHeight:80});
  const [bgRemoving,     setBgRemoving]      = useState(false);
  const [bgRemoved,      setBgRemoved]       = useState(false);
  const photoFileRef = useRef<HTMLInputElement>(null);

  const [estMat,    setEstMat]    = useState<Material>("PLA");
  const [estInfill, setEstInfill] = useState(20);
  const [estQty,    setEstQty]    = useState(1);

  const activeStats = stats ?? photoStats ?? stlStats;

  const estCost = useMemo(()=>{
    if(!activeStats) return null;
    return QUOTE_CALC({length:activeStats.depth,width:activeStats.width,height:activeStats.height,unit:"mm"},estMat,estQty,estInfill);
  },[activeStats,estMat,estInfill,estQty]);

  useEffect(()=>{ selectedIdRef.current=selectedId; },[selectedId]);
  useEffect(()=>{ shapesRef.current=shapes; },[shapes]);

  // ── History ───────────────────────────────────────────────────────────────────
  const mutate = useCallback((next: ShapeItem[])=>{
    const h=hist.current;
    const states=[...h.states.slice(0,h.idx+1),next].slice(-60);
    hist.current={states,idx:states.length-1};
    setShapes(next);
  },[]);

  // Updated every render so keyboard handlers never see stale closures
  undoRef.current=()=>{
    const h=hist.current; if(h.idx<=0) return;
    const ni=h.idx-1; hist.current={...h,idx:ni}; setShapes(h.states[ni]??[]);
  };
  redoRef.current=()=>{
    const h=hist.current; if(h.idx>=h.states.length-1) return;
    const ni=h.idx+1; hist.current={...h,idx:ni}; setShapes(h.states[ni]);
  };
  deleteRef.current=()=>{
    const id=selectedIdRef.current; if(!id) return;
    mutate(shapesRef.current.filter(s=>s.id!==id)); setSelectedId(null);
  };

  // ── Three.js setup ────────────────────────────────────────────────────────────
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x060912);
    rendererRef.current=renderer;

    const scene=new THREE.Scene(); sceneRef.current=scene;
    const camera=new THREE.PerspectiveCamera(50,1,0.1,10000);
    camera.position.set(80,80,120); cameraRef.current=camera;

    const orbit=new OrbitControls(camera,canvas);
    orbit.enableDamping=true; orbit.dampingFactor=0.05;
    orbit.autoRotate=true; orbit.autoRotateSpeed=1.5;
    orbitRef.current=orbit;

    const tc=new TransformControls(camera,renderer.domElement);
    tc.setMode("translate"); scene.add(tc as unknown as THREE.Object3D); tcRef.current=tc;
    tc.addEventListener("dragging-changed",(e:any)=>{
      orbit.enabled=!e.value; tcDragging.current=!!e.value;
      if(e.value) orbit.autoRotate=false;
    });
    tc.addEventListener("mouseUp",()=>{
      const obj=tc.object; const id=selectedIdRef.current;
      if(!obj||!id) return;
      const updated=shapesRef.current.map(s=>s.id!==id?s:{
        ...s,
        position:{x:+obj.position.x.toFixed(2),y:+obj.position.y.toFixed(2),z:+obj.position.z.toFixed(2)},
        rotation:{x:+(obj.rotation.x/DEG).toFixed(1),y:+(obj.rotation.y/DEG).toFixed(1),z:+(obj.rotation.z/DEG).toFixed(1)},
        scale:+obj.scale.x.toFixed(3),
      });
      mutate(updated);
    });

    scene.add(new THREE.AmbientLight(0xffffff,0.4));
    const d1=new THREE.DirectionalLight(0xffffff,1.0); d1.position.set(5,10,7.5); scene.add(d1);
    const d2=new THREE.DirectionalLight(0xffffff,0.3); d2.position.set(-5,-2,-5); scene.add(d2);
    const grid=new THREE.GridHelper(200,20,0xf97316,0x1a2235); grid.position.y=-0.5; scene.add(grid);

    canvas.addEventListener("pointerup",e=>{
      if(tcDragging.current||e.button!==0) return;
      const rect=canvas.getBoundingClientRect();
      const mouse=new THREE.Vector2(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);
      raycaster.current.setFromCamera(mouse,camera);
      const entries=Array.from(meshMapRef.current.entries()).filter(([id])=>id!=="__ext__"&&id!=="__csg__");
      const hits=raycaster.current.intersectObjects(entries.map(([,m])=>m),false);
      if(hits.length>0){
        const hit=hits[0].object as THREE.Mesh;
        for(const [id,m] of Array.from(meshMapRef.current.entries())) if(m===hit){setSelectedId(id);return;}
      } else {
        if(!tcRef.current?.object) setSelectedId(null);
      }
    });

    const onKey=(e:KeyboardEvent)=>{
      const tag=(e.target as HTMLElement)?.tagName;
      if(tag==="INPUT"||tag==="SELECT"||tag==="TEXTAREA") return;
      if(e.key==="g"||e.key==="G") setTMode("translate");
      if(e.key==="r"||e.key==="R") setTMode("rotate");
      if(e.key==="s"&&!e.ctrlKey&&!e.metaKey) setTMode("scale");
      if((e.ctrlKey||e.metaKey)&&e.key==="z"){e.preventDefault();undoRef.current();}
      if((e.ctrlKey||e.metaKey)&&(e.key==="y"||e.key==="Y")){e.preventDefault();redoRef.current();}
      if(e.key==="Delete"||e.key==="Backspace") deleteRef.current();
    };
    window.addEventListener("keydown",onKey);

    const ro=new ResizeObserver(()=>{
      const el=containerRef.current; if(!el) return;
      renderer.setSize(el.clientWidth,el.clientHeight);
      camera.aspect=el.clientWidth/el.clientHeight; camera.updateProjectionMatrix();
    });
    if(containerRef.current) ro.observe(containerRef.current);
    const el=containerRef.current;
    if(el){renderer.setSize(el.clientWidth,el.clientHeight);camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();}

    orbit.addEventListener("start",()=>{orbit.autoRotate=false;});
    const animate=()=>{frameRef.current=requestAnimationFrame(animate);orbit.update();renderer.render(scene,camera);};
    animate();

    return ()=>{cancelAnimationFrame(frameRef.current);ro.disconnect();window.removeEventListener("keydown",onKey);renderer.dispose();};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  useEffect(()=>{ tcRef.current?.setMode(tMode); },[tMode]);

  // ── updateScene ───────────────────────────────────────────────────────────────
  const updateScene=useCallback((
    currentShapes: ShapeItem[], preview: boolean, selId: string|null, wf: boolean,
    extGeo?: THREE.BufferGeometry|null,
  )=>{
    const scene=sceneRef.current; if(!scene) return;
    Array.from(meshMapRef.current.values()).forEach(m=>{scene.remove(m);m.geometry.dispose();(m.material as THREE.Material).dispose();});
    meshMapRef.current.clear();
    tcRef.current?.detach();
    setStats(null);

    if(extGeo){
      extGeo.computeBoundingBox();
      const bbox=extGeo.boundingBox!;
      const size=new THREE.Vector3(); bbox.getSize(size);
      const center=new THREE.Vector3(); bbox.getCenter(center);
      const mat=new THREE.MeshPhongMaterial({color:0xf97316,wireframe:wf,shininess:80,specular:0x444444});
      const mesh=new THREE.Mesh(extGeo,mat);
      mesh.position.set(-center.x,-center.y,-center.z);
      scene.add(mesh); meshMapRef.current.set("__ext__",mesh);
      const ix=extGeo.getIndex();
      setStats({triangles:ix?ix.count/3:extGeo.getAttribute("position").count/3,width:+size.x.toFixed(2),height:+size.y.toFixed(2),depth:+size.z.toFixed(2)});
      return;
    }

    const vis=currentShapes.filter(s=>s.visible);
    if(!vis.length) return;

    if(preview){
      try{
        const combined=buildCombined(vis); if(!combined) return;
        const geo=jscadToThree(combined);
        const mat=new THREE.MeshPhongMaterial({color:0xf97316,wireframe:wf,shininess:80,specular:0x444444});
        const mesh=new THREE.Mesh(geo,mat); scene.add(mesh);
        meshMapRef.current.set("__csg__",mesh);
        geo.computeBoundingBox();
        const size=new THREE.Vector3(); geo.boundingBox!.getSize(size);
        setStats({triangles:geo.getAttribute("position").count/3,width:+size.x.toFixed(2),height:+size.y.toFixed(2),depth:+size.z.toFixed(2)});
      }catch{}
      return;
    }

    const box3=new THREE.Box3(); let tris=0; let any=false;
    for(const s of vis){
      const ck=JSON.stringify(s.shape);
      let rawGeo=geoCache.current.get(ck);
      if(!rawGeo){try{rawGeo=jscadToThree(buildRaw(s.shape));geoCache.current.set(ck,rawGeo);}catch{continue;}}
      const isSel=s.id===selId;
      const col=new THREE.Color(s.color);
      const mat=new THREE.MeshPhongMaterial({
        color:col, wireframe:wf, shininess:80, specular:0x333333,
        emissive:isSel?col:new THREE.Color(0), emissiveIntensity:isSel?0.3:0,
        transparent:!isSel&&vis.length>1, opacity:!isSel&&vis.length>1?0.82:1,
      });
      const mesh=new THREE.Mesh(rawGeo.clone(),mat);
      mesh.scale.set(s.scale*(s.mirror.x?-1:1),s.scale*(s.mirror.y?-1:1),s.scale*(s.mirror.z?-1:1));
      mesh.rotation.set(s.rotation.x*DEG,s.rotation.y*DEG,s.rotation.z*DEG);
      mesh.position.set(s.position.x,s.position.y,s.position.z);
      if(s.mirror.x||s.mirror.y||s.mirror.z) mesh.geometry.computeVertexNormals();
      scene.add(mesh); meshMapRef.current.set(s.id,mesh);
      box3.expandByObject(mesh); tris+=mesh.geometry.getAttribute("position").count/3; any=true;
    }
    if(selId&&meshMapRef.current.has(selId)){
      const sh=vis.find(s=>s.id===selId);
      if(sh&&!sh.locked) tcRef.current?.attach(meshMapRef.current.get(selId)!);
    }
    if(any){const size=new THREE.Vector3();box3.getSize(size);setStats({triangles:tris,width:+size.x.toFixed(2),height:+size.y.toFixed(2),depth:+size.z.toFixed(2)});}
  },[]);

  useEffect(()=>{ if(tab==="design") updateScene(shapes,csgPreview,selectedId,wireframe); },[shapes,tab,csgPreview,selectedId,wireframe,updateScene]);
  useEffect(()=>{ if(tab==="import") updateScene([],false,null,wireframe,stlGeo); },[stlGeo,tab,wireframe,updateScene]);
  useEffect(()=>{ if(tab==="photo")  updateScene([],false,null,wireframe,photoGeo); },[photoGeo,tab,wireframe,updateScene]);

  // ── Shape manipulation ────────────────────────────────────────────────────────
  const addShape=(type:ShapeType)=>{
    const id=Math.random().toString(36).slice(2);
    mutate([...shapes,{
      id, name:`${type.charAt(0).toUpperCase()+type.slice(1)} ${shapes.length+1}`,
      visible:true, locked:false, csgOp:shapes.length===0?"none":"union",
      shape:defaultParams(type), color:PALETTE[shapes.length%PALETTE.length],
      position:{x:0,y:0,z:0}, rotation:{x:0,y:0,z:0}, scale:1, mirror:{x:false,y:false,z:false},
    }]);
    setSelectedId(id);
    if(orbitRef.current) orbitRef.current.autoRotate=false;
  };

  const updateShape=(id:string,fn:(s:ShapeItem)=>ShapeItem)=>{
    setShapes(prev=>prev.map(s=>s.id===id?fn(s):s));
  };

  const duplicateShape=()=>{
    const src=shapes.find(s=>s.id===selectedId); if(!src) return;
    const clone:ShapeItem={...src,id:Math.random().toString(36).slice(2),name:src.name+" Copy",position:{...src.position,x:src.position.x+15}};
    mutate([...shapes,clone]); setSelectedId(clone.id);
  };

  const mirrorAxis=(ax:"x"|"y"|"z")=>{
    if(!selectedId) return;
    setShapes(prev=>prev.map(s=>s.id===selectedId?{...s,mirror:{...s.mirror,[ax]:!s.mirror[ax]}}:s));
  };

  const snapToBed=()=>{
    const mesh=meshMapRef.current.get(selectedId??""); if(!mesh||!selectedId) return;
    mesh.geometry.computeBoundingBox();
    const minY=mesh.geometry.boundingBox!.min.y*Math.abs(mesh.scale.y);
    const worldMin=mesh.position.y+minY;
    updateShape(selectedId,s=>({...s,position:{...s.position,y:s.position.y-worldMin}}));
  };

  const selected=shapes.find(s=>s.id===selectedId)??null;

  // ── File handlers ─────────────────────────────────────────────────────────────
  const handleSTLFile=(file:File)=>{
    const rd=new FileReader();
    rd.onload=e=>{
      const buf=e.target?.result as ArrayBuffer;
      const geo=parseSTL(buf);
      geo.computeBoundingBox();
      const s=new THREE.Vector3(); geo.boundingBox!.getSize(s);
      const mx=Math.max(s.x,s.y,s.z); const sc=mx>0?100/mx:1;
      geo.scale(sc,sc,sc); geo.computeBoundingBox();
      const s2=new THREE.Vector3(); geo.boundingBox!.getSize(s2);
      setStlStats({triangles:geo.getAttribute("position").count/3,width:+s2.x.toFixed(2),height:+s2.y.toFixed(2),depth:+s2.z.toFixed(2)});
      setStlGeo(geo);
    };
    rd.readAsArrayBuffer(file);
  };

  const handlePhotoFile=(file:File)=>{
    const url=URL.createObjectURL(file);
    const img=new Image();
    img.onload=()=>{setPhotoImg(img);setPhotoPreview(url);setPhotoGeo(null);setPhotoStats(null);setBgRemoved(false);};
    img.src=url;
  };

  const extractSubject=async()=>{
    if(!photoImg||bgRemoving) return;
    setBgRemoving(true);
    try{
      const { removeBackground } = await import("@imgly/background-removal");
      const res=await fetch(photoImg.src);
      const blob=await res.blob();
      const outBlob=await removeBackground(blob);
      const url=URL.createObjectURL(outBlob);
      const img=new Image();
      img.onload=()=>{
        setPhotoImg(img);
        setPhotoPreview(url);
        setPhotoGeo(null);
        setPhotoStats(null);
        setBgRemoved(true);
      };
      img.src=url;
    }catch(e){console.error("BG removal failed",e);}
    finally{setBgRemoving(false);}
  };

  const generateFromPhoto=()=>{
    if(!photoImg) return;
    setPhotoProc(true);
    setTimeout(()=>{
      try{
        const geo=photoSettings.surfaceMode==="cylinder"
          ?imageToCylinderHeightmap(photoImg,photoSettings)
          :imageToHeightmap(photoImg,photoSettings);
        geo.computeBoundingBox();
        const size=new THREE.Vector3(); geo.boundingBox!.getSize(size);
        const ix=geo.getIndex();
        setPhotoStats({triangles:ix?ix.count/3:geo.getAttribute("position").count/3,width:+size.x.toFixed(2),height:+size.y.toFixed(2),depth:+size.z.toFixed(2)});
        setPhotoGeo(geo);
      }finally{setPhotoProc(false);}
    },50);
  };

  // ── Export ────────────────────────────────────────────────────────────────────
  const downloadSTL=()=>{
    if(tab==="design"){
      const c=buildCombined(shapes.filter(s=>s.visible)); if(!c) return;
      const raw=stlSerializer.serialize({binary:true},c);
      const data=Array.isArray(raw)?raw[0]:raw;
      const a=document.createElement("a");
      a.href=URL.createObjectURL(new Blob([data.buffer as ArrayBuffer],{type:"application/octet-stream"}));
      a.download="model.stl"; a.click();
    } else if(tab==="photo"&&photoGeo) exportSTL(photoGeo,"photo_relief.stl");
    else if(stlGeo) exportSTL(stlGeo,"imported_model.stl");
  };

  const sendToOrder=()=>{
    const s=activeStats; if(!s) return;
    const title=tab==="photo"?"Photo Bas-Relief":shapes.length>0?shapes[0].name:"CAD Model";
    router.push(`/print3d/order?w=${s.width.toFixed(1)}&h=${s.height.toFixed(1)}&d=${s.depth.toFixed(1)}&unit=mm&title=${encodeURIComponent(title)}`);
  };

  const setView=(v:"front"|"top"|"side"|"reset")=>{
    const cam=cameraRef.current,ctrl=orbitRef.current; if(!cam||!ctrl) return;
    const d=180;
    if(v==="front") cam.position.set(0,0,d);
    else if(v==="top") cam.position.set(0,d,0);
    else if(v==="side") cam.position.set(d,0,0);
    else cam.position.set(80,80,120);
    cam.lookAt(0,0,0); ctrl.target.set(0,0,0); ctrl.update();
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  const card={background:"#0d1220",border:"1px solid rgba(249,115,22,0.15)",borderRadius:"0.75rem"} as const;
  const btnSt={background:"#060912",border:"1px solid rgba(249,115,22,0.2)",color:"#94a3b8"} as const;
  const canDL=tab==="design"?shapes.filter(s=>s.visible).length>0:tab==="photo"?!!photoGeo:!!stlGeo;

  return (
    <div className="flex" style={{height:"calc(100vh - 3.5rem)"}}>

      {/* Sidebar */}
      <div className="flex flex-col overflow-hidden" style={{width:296,borderRight:"1px solid rgba(249,115,22,0.15)",background:"#0d1220"}}>

        {/* Tab bar */}
        <div className="flex border-b" style={{borderColor:"rgba(249,115,22,0.15)"}}>
          {([{id:"design",label:"Design"},{id:"import",label:"Import"},{id:"photo",label:"Photo→3D"}] as const).map(({id,label})=>(
            <button key={id} onClick={()=>setTab(id)} className="flex-1 py-2 text-xs font-semibold transition-colors"
              style={{color:tab===id?"#f97316":"#94a3b8",borderBottom:tab===id?"2px solid #f97316":"2px solid transparent",background:"transparent"}}>
              {label}
            </button>
          ))}
        </div>

        {/* Scrollable panel */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">

          {tab==="photo" ? (
            <>
              <div style={card} className="p-3">
                <p className="text-xs font-bold text-white mb-2">Upload Photo</p>
                <div className="relative rounded-xl overflow-hidden cursor-pointer"
                  style={{border:`2px dashed ${isPhotoDrag?"#f97316":"rgba(249,115,22,0.3)"}`,background:isPhotoDrag?"rgba(249,115,22,0.05)":"transparent",minHeight:90}}
                  onDragOver={e=>{e.preventDefault();setIsPhotoDrag(true)}} onDragLeave={()=>setIsPhotoDrag(false)}
                  onDrop={e=>{e.preventDefault();setIsPhotoDrag(false);const f=e.dataTransfer.files[0];if(f&&f.type.startsWith("image/"))handlePhotoFile(f)}}
                  onClick={()=>photoFileRef.current?.click()}>
                  {photoPreview
                    // eslint-disable-next-line @next/next/no-img-element
                    ?<img src={photoPreview} alt="" className="w-full rounded-lg" style={{maxHeight:130,objectFit:"cover"}}/>
                    :<div className="flex flex-col items-center justify-center py-5">
                      <ImageIcon className="w-7 h-7 mb-1" style={{color:isPhotoDrag?"#f97316":"#64748b"}}/>
                      <p className="text-white text-sm font-semibold">Drop image here</p>
                      <p className="text-slate-500 text-xs">JPG, PNG, WebP</p>
                    </div>}
                  <input ref={photoFileRef} type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)handlePhotoFile(f)}}/>
                </div>
              </div>
              {photoImg&&(
                <div style={card} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-white">AI Subject Extraction</p>
                    {bgRemoved&&<span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:"rgba(34,197,94,0.15)",color:"#22c55e"}}>Subject only</span>}
                  </div>
                  <p className="text-xs mb-2" style={{color:"#64748b"}}>Removes background — only the person/subject gets relief.</p>
                  <button onClick={extractSubject} disabled={bgRemoving}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold disabled:opacity-60 transition-all"
                    style={{background:bgRemoved?"rgba(34,197,94,0.15)":"rgba(139,92,246,0.15)",color:bgRemoved?"#22c55e":"#a78bfa",border:`1px solid ${bgRemoved?"rgba(34,197,94,0.3)":"rgba(139,92,246,0.3)"}`}}>
                    {bgRemoving?<><Loader2 className="w-3.5 h-3.5 animate-spin"/>Removing background…</>
                      :bgRemoved?<><Zap className="w-3.5 h-3.5"/>Re-extract Subject</>
                      :<><Zap className="w-3.5 h-3.5"/>Extract Subject (AI)</>}
                  </button>
                </div>
              )}
              {photoImg&&(
                <div style={card} className="p-3">
                  <p className="text-xs font-bold text-white mb-2">Surface Mode</p>
                  <div className="flex gap-2 mb-3">
                    {(["flat","cylinder"] as const).map(mode=>(
                      <button key={mode} onClick={()=>setPhotoSettings(s=>({...s,surfaceMode:mode}))}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                        style={{background:photoSettings.surfaceMode===mode?"#f97316":"rgba(249,115,22,0.1)",color:photoSettings.surfaceMode===mode?"white":"#94a3b8",border:`1px solid ${photoSettings.surfaceMode===mode?"#f97316":"rgba(249,115,22,0.2)"}`}}>
                        {mode==="flat"?"Flat Plate":"Cylinder Wrap"}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs font-bold text-white mb-3">Relief Settings</p>
                  {photoSettings.surfaceMode==="flat"?(
                    <>
                      <ParamInput label="Width (mm)" value={photoSettings.realWidth} min={10} max={300} onChange={v=>setPhotoSettings(s=>({...s,realWidth:v}))}/>
                      {!photoSettings.keepAspect&&<ParamInput label="Depth (mm)" value={photoSettings.realDepth} min={10} max={300} onChange={v=>setPhotoSettings(s=>({...s,realDepth:v}))}/>}
                    </>
                  ):(
                    <>
                      <ParamInput label="Cylinder Radius (mm)" value={photoSettings.cylinderRadius} min={5} max={150} onChange={v=>setPhotoSettings(s=>({...s,cylinderRadius:v}))}/>
                      <ParamInput label="Cylinder Height (mm)" value={photoSettings.cylinderHeight} min={10} max={300} onChange={v=>setPhotoSettings(s=>({...s,cylinderHeight:v}))}/>
                    </>
                  )}
                  <ParamInput label="Relief Height (mm)" value={photoSettings.maxHeight} min={1} max={30} step={0.5} onChange={v=>setPhotoSettings(s=>({...s,maxHeight:v}))}/>
                  <ParamInput label="Base Thickness (mm)" value={photoSettings.baseThickness} min={0.5} max={20} step={0.5} onChange={v=>setPhotoSettings(s=>({...s,baseThickness:v}))}/>
                  <ParamInput label="Resolution" value={photoSettings.resolution} min={30} max={200} onChange={v=>setPhotoSettings(s=>({...s,resolution:Math.round(v)}))}/>
                  <div className="flex gap-4 mt-1 mb-3">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input type="checkbox" checked={photoSettings.invert} onChange={e=>setPhotoSettings(s=>({...s,invert:e.target.checked}))} className="rounded" style={{accentColor:"#f97316"}}/>
                      <span className="text-xs" style={{color:"#94a3b8"}}>Invert</span>
                      <FlipHorizontal className="w-3 h-3" style={{color:"#64748b"}}/>
                    </label>
                    {photoSettings.surfaceMode==="flat"&&(
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input type="checkbox" checked={photoSettings.keepAspect} onChange={e=>setPhotoSettings(s=>({...s,keepAspect:e.target.checked}))} className="rounded" style={{accentColor:"#f97316"}}/>
                        <span className="text-xs" style={{color:"#94a3b8"}}>Lock Aspect</span>
                      </label>
                    )}
                  </div>
                  <button onClick={generateFromPhoto} disabled={photoProc}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
                    style={{background:"#f97316",color:"white"}}>
                    {photoProc?<><Loader2 className="w-4 h-4 animate-spin"/>Generating…</>:<><ImageIcon className="w-4 h-4"/>Generate 3D Model</>}
                  </button>
                </div>
              )}
              {photoStats&&(
                <div style={card} className="p-3">
                  <div className="flex items-center gap-2 mb-2"><Info className="w-3.5 h-3.5" style={{color:"#22d3ee"}}/><p className="text-xs font-bold text-white">Model Info</p></div>
                  <div className="space-y-1 text-xs">
                    {[["Triangles",photoStats.triangles.toLocaleString()],["W",`${photoStats.width.toFixed(1)}mm`],["H",`${photoStats.height.toFixed(1)}mm`],["D",`${photoStats.depth.toFixed(1)}mm`]].map(([k,v])=>(
                      <div key={k} className="flex justify-between"><span style={{color:"#94a3b8"}}>{k}</span><span className="text-white font-mono">{v}</span></div>
                    ))}
                  </div>
                </div>
              )}
            </>

          ) : tab==="import" ? (
            <>
              <div style={card} className="p-3">
                <p className="text-xs font-bold text-white mb-2">Import STL File</p>
                <div className="flex flex-col items-center justify-center rounded-xl p-6 cursor-pointer"
                  style={{border:`2px dashed ${isDrag?"#f97316":"rgba(249,115,22,0.3)"}`,background:isDrag?"rgba(249,115,22,0.05)":"transparent"}}
                  onDragOver={e=>{e.preventDefault();setIsDrag(true)}} onDragLeave={()=>setIsDrag(false)}
                  onDrop={e=>{e.preventDefault();setIsDrag(false);const f=e.dataTransfer.files[0];if(f&&f.name.toLowerCase().endsWith(".stl"))handleSTLFile(f)}}
                  onClick={()=>fileRef.current?.click()}>
                  <Upload className="w-8 h-8 mb-2" style={{color:isDrag?"#f97316":"#64748b"}}/>
                  <p className="text-white text-sm font-semibold mb-1">Drop STL here</p>
                  <p className="text-slate-500 text-xs">or click to browse</p>
                  <input ref={fileRef} type="file" accept=".stl" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)handleSTLFile(f)}}/>
                </div>
              </div>
              {stlStats&&(
                <div style={card} className="p-3">
                  <div className="flex items-center gap-2 mb-2"><Info className="w-3.5 h-3.5" style={{color:"#22d3ee"}}/><p className="text-xs font-bold text-white">Model Info</p></div>
                  <div className="space-y-1 text-xs">
                    {[["Triangles",stlStats.triangles.toLocaleString()],["Width",`${stlStats.width.toFixed(2)}mm`],["Height",`${stlStats.height.toFixed(2)}mm`],["Depth",`${stlStats.depth.toFixed(2)}mm`]].map(([k,v])=>(
                      <div key={k} className="flex justify-between"><span style={{color:"#94a3b8"}}>{k}</span><span className="text-white font-mono">{v}</span></div>
                    ))}
                  </div>
                </div>
              )}
            </>

          ) : (
            /* Design tab */
            <>
              {/* Shape library */}
              <div style={card} className="p-3">
                <p className="text-xs font-bold text-white mb-2">Shape Library</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {SHAPE_CARDS.map(c=>(
                    <button key={c.type} onClick={()=>addShape(c.type)}
                      className="flex flex-col items-center gap-1 py-2 rounded-lg text-xs transition-all hover:scale-105" style={btnSt}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="#f97316";(e.currentTarget as HTMLElement).style.color="#f97316"}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(249,115,22,0.2)";(e.currentTarget as HTMLElement).style.color="#94a3b8"}}>
                      {c.icon}<span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected shape */}
              {selected&&(
                <div style={card} className="p-3">
                  <p className="text-xs font-bold mb-3"><span style={{color:"#f97316"}}>{selected.name}</span></p>

                  {/* Color */}
                  <p className="text-xs mb-1.5" style={{color:"#94a3b8"}}>Color</p>
                  <div className="flex gap-1.5 flex-wrap items-center mb-3">
                    {PALETTE.map(c=>(
                      <button key={c} onClick={()=>updateShape(selected.id,s=>({...s,color:c}))}
                        className="w-5 h-5 rounded-full transition-all hover:scale-110"
                        style={{background:c,outline:selected.color===c?"2px solid white":"2px solid transparent",outlineOffset:2}}/>
                    ))}
                    <input type="color" value={selected.color} onChange={e=>updateShape(selected.id,s=>({...s,color:e.target.value}))}
                      className="w-5 h-5 rounded-full cursor-pointer border-0 p-0" style={{background:"transparent"}} title="Custom color"/>
                  </div>

                  {/* Shape params */}
                  <ShapeParamEditor shape={selected} onUpdate={fn=>updateShape(selected.id,fn)}/>

                  {/* Transform */}
                  <div className="mt-2 pt-2 border-t" style={{borderColor:"rgba(249,115,22,0.1)"}}>
                    <p className="text-xs font-semibold text-white mb-2">Transform</p>
                    <ParamInput label="Pos X" value={selected.position.x} min={-150} max={150} onChange={v=>updateShape(selected.id,s=>({...s,position:{...s.position,x:v}}))}/>
                    <ParamInput label="Pos Y" value={selected.position.y} min={-150} max={150} onChange={v=>updateShape(selected.id,s=>({...s,position:{...s.position,y:v}}))}/>
                    <ParamInput label="Pos Z" value={selected.position.z} min={-150} max={150} onChange={v=>updateShape(selected.id,s=>({...s,position:{...s.position,z:v}}))}/>
                    <ParamInput label="Rot X°" value={selected.rotation.x} min={-180} max={180} onChange={v=>updateShape(selected.id,s=>({...s,rotation:{...s.rotation,x:v}}))}/>
                    <ParamInput label="Rot Y°" value={selected.rotation.y} min={-180} max={180} onChange={v=>updateShape(selected.id,s=>({...s,rotation:{...s.rotation,y:v}}))}/>
                    <ParamInput label="Rot Z°" value={selected.rotation.z} min={-180} max={180} onChange={v=>updateShape(selected.id,s=>({...s,rotation:{...s.rotation,z:v}}))}/>
                    <ParamInput label="Scale" value={selected.scale} min={0.05} max={5} step={0.05} onChange={v=>updateShape(selected.id,s=>({...s,scale:v}))}/>
                  </div>

                  {/* Quick actions */}
                  <div className="mt-2 pt-2 border-t" style={{borderColor:"rgba(249,115,22,0.1)"}}>
                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                      {[
                        {label:"Duplicate",      icon:<Copy className="w-3 h-3"/>,             fn:duplicateShape},
                        {label:"Snap to Bed",    icon:<AlignCenterVertical className="w-3 h-3"/>, fn:snapToBed},
                        {label:"Center X/Z",     icon:<AlignCenter className="w-3 h-3"/>,       fn:()=>updateShape(selected.id,s=>({...s,position:{...s.position,x:0,z:0}}))},
                        {label:selected.locked?"Unlock":"Lock", icon:selected.locked?<Unlock className="w-3 h-3"/>:<Lock className="w-3 h-3"/>, fn:()=>updateShape(selected.id,s=>({...s,locked:!s.locked}))},
                      ].map(b=>(
                        <button key={b.label} onClick={b.fn} className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs hover:text-white transition-colors" style={btnSt}>
                          {b.icon}{b.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-white mb-1.5">Mirror Axis</p>
                    <div className="flex gap-1.5">
                      {(["x","y","z"] as const).map(ax=>(
                        <button key={ax} onClick={()=>mirrorAxis(ax)} className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors"
                          style={{background:selected.mirror[ax]?"rgba(249,115,22,0.2)":"#060912",border:"1px solid rgba(249,115,22,0.2)",color:selected.mirror[ax]?"#f97316":"#94a3b8"}}>
                          {ax.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Scene list */}
              {shapes.length>0&&(
                <div style={card} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-white">Scene ({shapes.length})</p>
                    <button onClick={()=>mutate([])} className="text-xs px-1.5 py-0.5 rounded hover:text-red-400 transition-colors" style={btnSt}>Clear</button>
                  </div>
                  <div className="space-y-1">
                    {shapes.map((s,idx)=>(
                      <div key={s.id} onClick={()=>!s.locked&&setSelectedId(s.id)}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer"
                        style={{background:selectedId===s.id?"rgba(249,115,22,0.1)":"transparent",border:`1px solid ${selectedId===s.id?"rgba(249,115,22,0.4)":"rgba(249,115,22,0.1)"}`}}>
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:s.color}}/>
                        <span className="text-xs text-white flex-1 truncate">{s.name}</span>
                        {s.locked&&<Lock className="w-3 h-3 flex-shrink-0" style={{color:"#f97316"}}/>}
                        {idx>0&&(
                          <select value={s.csgOp} onClick={e=>e.stopPropagation()} onChange={e=>{e.stopPropagation();updateShape(s.id,sh=>({...sh,csgOp:e.target.value as CSGOp}))}}
                            className="text-[10px] rounded px-1 py-0.5"
                            style={{background:"#060912",border:"1px solid rgba(249,115,22,0.2)",color:"#22d3ee",cursor:"pointer"}}>
                            <option value="union">∪</option>
                            <option value="subtract">−</option>
                            <option value="intersect">∩</option>
                          </select>
                        )}
                        <button onClick={e=>{e.stopPropagation();updateShape(s.id,sh=>({...sh,visible:!sh.visible}))}} style={{color:s.visible?"#f97316":"#64748b"}}>
                          {s.visible?<Eye className="w-3.5 h-3.5"/>:<EyeOff className="w-3.5 h-3.5"/>}
                        </button>
                        <button onClick={e=>{e.stopPropagation();mutate(shapes.filter(sh=>sh.id!==s.id));if(selectedId===s.id)setSelectedId(null);}} className="hover:text-red-400" style={{color:"#64748b"}}>
                          <Trash2 className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cost estimator */}
              <div style={card} className="p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-3.5 h-3.5" style={{color:"#f97316"}}/>
                  <p className="text-xs font-bold text-white">Print Cost Estimator</p>
                </div>
                <p className="text-xs mb-1.5" style={{color:"#94a3b8"}}>Material</p>
                <div className="grid grid-cols-3 gap-1 mb-3">
                  {MATERIALS.map(m=>(
                    <button key={m.name} onClick={()=>setEstMat(m.name as Material)}
                      className="py-1 rounded text-xs font-semibold transition-colors"
                      style={{background:estMat===m.name?"rgba(249,115,22,0.2)":"#060912",border:`1px solid ${estMat===m.name?m.borderColor:"rgba(249,115,22,0.2)"}`,color:estMat===m.name?"#f97316":"#94a3b8"}}>
                      {m.name}
                    </button>
                  ))}
                </div>
                <ParamInput label="Infill %" value={estInfill} min={5} max={100} onChange={setEstInfill}/>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs flex-1" style={{color:"#94a3b8"}}>Qty</span>
                  <button onClick={()=>setEstQty(q=>Math.max(1,q-1))} className="w-6 h-6 rounded flex items-center justify-center" style={btnSt}><Minus className="w-3 h-3"/></button>
                  <span className="text-white text-sm font-mono w-5 text-center">{estQty}</span>
                  <button onClick={()=>setEstQty(q=>Math.min(50,q+1))} className="w-6 h-6 rounded flex items-center justify-center" style={btnSt}><Plus className="w-3 h-3"/></button>
                </div>
                <div className="rounded-lg p-3 text-center" style={{background:"rgba(249,115,22,0.1)",border:"1px solid rgba(249,115,22,0.3)"}}>
                  {estCost!==null?(
                    <><p className="text-2xl font-black" style={{color:"#f97316"}}>₹{estCost.toLocaleString()}</p>
                    <p className="text-xs mt-0.5" style={{color:"#94a3b8"}}>{estQty}× {estMat} · {estInfill}% infill</p></>
                  ):(
                    <p className="text-xs" style={{color:"#64748b"}}>Add shapes to see<br/>live cost estimate</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Export */}
        <div className="p-3 border-t space-y-2" style={{borderColor:"rgba(249,115,22,0.15)"}}>
          <button onClick={downloadSTL} disabled={!canDL}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
            style={{background:"#f97316",color:"white"}}>
            <Download className="w-4 h-4"/>Download STL
          </button>
          <button onClick={sendToOrder} disabled={!activeStats}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
            style={{background:"rgba(249,115,22,0.15)",color:"#f97316",border:"1px solid rgba(249,115,22,0.3)"}}>
            <ShoppingCart className="w-4 h-4"/>Send to Order Form
          </button>
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="flex-1 relative" ref={containerRef}>
        <canvas ref={canvasRef} className="w-full h-full block"/>

        {/* Transform mode bar */}
        {tab==="design"&&(
          <div className="absolute top-3 left-3 flex gap-1" style={{zIndex:10}}>
            {([
              {mode:"translate" as const,label:"Move (G)",   icon:<Move className="w-3.5 h-3.5"/>},
              {mode:"rotate"    as const,label:"Rotate (R)", icon:<RotateCw className="w-3.5 h-3.5"/>},
              {mode:"scale"     as const,label:"Scale (S)",  icon:<Maximize2 className="w-3.5 h-3.5"/>},
            ]).map(b=>(
              <button key={b.mode} onClick={()=>setTMode(b.mode)} title={b.label}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{background:tMode===b.mode?"rgba(249,115,22,0.3)":"rgba(13,18,32,0.9)",border:"1px solid rgba(249,115,22,0.2)",color:tMode===b.mode?"#f97316":"#94a3b8",backdropFilter:"blur(8px)"}}>
                {b.icon}<span className="ml-1 hidden sm:inline">{b.mode.charAt(0).toUpperCase()+b.mode.slice(1)}</span>
              </button>
            ))}
            <button onClick={()=>setCsgPreview(p=>!p)} title="Toggle CSG Preview"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{background:csgPreview?"rgba(34,211,238,0.2)":"rgba(13,18,32,0.9)",border:"1px solid rgba(34,211,238,0.25)",color:csgPreview?"#22d3ee":"#94a3b8",backdropFilter:"blur(8px)"}}>
              <Layers3 className="w-3.5 h-3.5"/><span className="ml-1 hidden sm:inline">CSG</span>
            </button>
          </div>
        )}

        {/* Camera toolbar */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5" style={{zIndex:10}}>
          {[
            {label:"Reset",     icon:<RotateCcw className="w-3.5 h-3.5"/>, fn:()=>setView("reset")},
            {label:"Wireframe", icon:<Grid3x3 className="w-3.5 h-3.5"/>,  fn:()=>setWireframe(w=>!w)},
            {label:"Front",     icon:<Monitor className="w-3.5 h-3.5"/>,   fn:()=>setView("front")},
            {label:"Top",       icon:<Monitor className="w-3.5 h-3.5"/>,   fn:()=>setView("top")},
            {label:"Side",      icon:<Monitor className="w-3.5 h-3.5"/>,   fn:()=>setView("side")},
          ].map(b=>(
            <button key={b.label} onClick={b.fn} title={b.label}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{background:b.label==="Wireframe"&&wireframe?"rgba(249,115,22,0.3)":"rgba(13,18,32,0.9)",border:"1px solid rgba(249,115,22,0.2)",color:b.label==="Wireframe"&&wireframe?"#f97316":"#94a3b8",backdropFilter:"blur(8px)"}}>
              {b.icon}<span className="ml-1">{b.label}</span>
            </button>
          ))}
        </div>

        {/* Stats overlay */}
        {activeStats&&(
          <div className="absolute bottom-3 right-3 rounded-lg px-3 py-2 text-xs font-mono space-y-0.5"
            style={{background:"rgba(13,18,32,0.9)",border:"1px solid rgba(249,115,22,0.15)",backdropFilter:"blur(8px)",color:"#94a3b8",zIndex:10}}>
            <div><span style={{color:"#f97316"}}>△</span> {activeStats.triangles.toLocaleString()}</div>
            <div>{activeStats.width.toFixed(1)} × {activeStats.height.toFixed(1)} × {activeStats.depth.toFixed(1)} mm</div>
            {estCost!==null&&<div style={{color:"#f97316",fontWeight:"bold"}}>₹{estCost.toLocaleString()}</div>}
          </div>
        )}

        {/* Keyboard hint */}
        {tab==="design"&&shapes.length>0&&selectedId&&(
          <div className="absolute bottom-3 left-3 rounded-lg px-2.5 py-1.5 text-xs"
            style={{background:"rgba(13,18,32,0.85)",border:"1px solid rgba(249,115,22,0.1)",backdropFilter:"blur(8px)",color:"#475569",zIndex:10}}>
            G·R·S = mode &nbsp;·&nbsp; Del = delete &nbsp;·&nbsp; Ctrl+Z/Y = undo/redo
          </div>
        )}

        {/* Empty state */}
        {shapes.length===0&&!stlGeo&&!photoGeo&&(
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{color:"#1e293b"}}>
            <Box className="w-16 h-16 mb-4"/>
            <p className="text-lg font-bold">Add a shape to get started</p>
            <p className="text-sm mt-1">Or import an STL / upload a photo</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shape param editor ───────────────────────────────────────────────────────

function ShapeParamEditor({shape,onUpdate}:{shape:ShapeItem;onUpdate:(f:(s:ShapeItem)=>ShapeItem)=>void}) {
  const{shape:sp}=shape;
  function sp2<T>(p:T){onUpdate(s=>({...s,shape:{...s.shape,params:p} as typeof s.shape}));}
  if(sp.type==="box"||sp.type==="custom"){const p=sp.params as BoxParams;return<>
    <ParamInput label="Width (mm)"  value={p.width}  min={1} max={300} onChange={v=>sp2({...p,width:v})}/>
    <ParamInput label="Height (mm)" value={p.height} min={1} max={300} onChange={v=>sp2({...p,height:v})}/>
    <ParamInput label="Depth (mm)"  value={p.depth}  min={1} max={300} onChange={v=>sp2({...p,depth:v})}/>
  </>;}
  if(sp.type==="cylinder"){const p=sp.params as CylinderParams;return<>
    <ParamInput label="Radius (mm)" value={p.radius}   min={1}  max={150} onChange={v=>sp2({...p,radius:v})}/>
    <ParamInput label="Height (mm)" value={p.height}   min={1}  max={300} onChange={v=>sp2({...p,height:v})}/>
    <ParamInput label="Segments"    value={p.segments} min={8}  max={64}  onChange={v=>sp2({...p,segments:Math.round(v)})}/>
  </>;}
  if(sp.type==="sphere"){const p=sp.params as SphereParams;return<>
    <ParamInput label="Radius (mm)" value={p.radius}   min={1} max={150} onChange={v=>sp2({...p,radius:v})}/>
    <ParamInput label="Segments"    value={p.segments} min={8} max={64}  onChange={v=>sp2({...p,segments:Math.round(v)})}/>
  </>;}
  if(sp.type==="cone"){const p=sp.params as ConeParams;return<>
    <ParamInput label="Bottom R (mm)" value={p.radiusBottom} min={0} max={150} onChange={v=>sp2({...p,radiusBottom:v})}/>
    <ParamInput label="Top R (mm)"    value={p.radiusTop}    min={0} max={150} onChange={v=>sp2({...p,radiusTop:v})}/>
    <ParamInput label="Height (mm)"   value={p.height}       min={1} max={300} onChange={v=>sp2({...p,height:v})}/>
  </>;}
  if(sp.type==="torus"){const p=sp.params as TorusParams;return<>
    <ParamInput label="Outer R (mm)" value={p.outerRadius} min={3}  max={150}          onChange={v=>sp2({...p,outerRadius:v})}/>
    <ParamInput label="Inner R (mm)" value={p.innerRadius} min={1}  max={p.outerRadius-1} onChange={v=>sp2({...p,innerRadius:v})}/>
    <ParamInput label="Segments"     value={p.segments}    min={8}  max={64}            onChange={v=>sp2({...p,segments:Math.round(v)})}/>
  </>;}
  return null;
}
