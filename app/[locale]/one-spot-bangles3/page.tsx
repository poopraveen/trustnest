"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Phone, MapPin, Instagram, Search, Filter, Star, ShoppingBag,
  X, Plus, Edit2, Trash2, Upload, Video, Image as ImageIcon,
  Check, Loader2, ChevronDown, Heart, Play, Pause, Volume2, VolumeX,
  Store, Award, Shield, Truck,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type MediaType = "image" | "video";
type Category = "All" | "Gold" | "Silver" | "Diamond" | "Bridal" | "Antique" | "Fashion";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  mediaUrl: string;
  mediaType: MediaType;
  category: string;
  material: string;
  inStock: boolean;
  featured: boolean;
  createdAt: string;
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const G = {
  bg: "#0c0804",
  bgCard: "#140e08",
  bgCardHov: "#1c160e",
  gold: "#d4af37",
  goldLight: "#f0d060",
  goldDark: "#a07820",
  rose: "#c07858",
  roseLight: "#e09878",
  cream: "#f5e6c8",
  textPrimary: "#f5e6c8",
  textSub: "#a08060",
  textFaint: "#5a4030",
  border: "rgba(212,175,55,0.2)",
  borderBright: "rgba(212,175,55,0.5)",
  surface: "rgba(212,175,55,0.06)",
  surfaceHov: "rgba(212,175,55,0.1)",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(212,175,55,0.07)",
  border: `1px solid ${G.border}`,
  borderRadius: 10,
  color: G.textPrimary,
  padding: "10px 14px",
  fontSize: 14,
  outline: "none",
  width: "100%",
};

const CATEGORIES: Category[] = ["All","Gold","Silver","Diamond","Bridal","Antique","Fashion"];

const OWNERS = [
  { name: "Kavya", emoji: "👑", role: "Co-owner & Designer" },
  { name: "Sheela", emoji: "💎", role: "Co-owner & Finance" },
  { name: "Madhu", emoji: "🌸", role: "Co-owner & Operations" },
];

const FEATURES = [
  { icon: <Award className="w-5 h-5"/>, title: "Certified Quality", sub: "BIS hallmarked gold & silver" },
  { icon: <Shield className="w-5 h-5"/>, title: "Genuine Products", sub: "100% authentic jewellery" },
  { icon: <Truck className="w-5 h-5"/>, title: "Home Delivery", sub: "Free delivery in Bangalore" },
  { icon: <Store className="w-5 h-5"/>, title: "Visit Our Store", sub: "Magdi Road, Bangalore City" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function discount(orig?: number, price?: number) {
  if (!orig || !price || orig <= price) return null;
  return Math.round(((orig - price) / orig) * 100);
}

// ─── Video Card ───────────────────────────────────────────────────────────────

function VideoCard({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted]     = useState(true);

  const toggle = () => {
    if (!ref.current) return;
    if (playing) { ref.current.pause(); setPlaying(false); }
    else { ref.current.play(); setPlaying(true); }
  };

  return (
    <div style={{ position:"relative", width:"100%", aspectRatio:"1/1", background:"#000", borderRadius:16, overflow:"hidden" }}>
      <video ref={ref} src={src} poster={poster} muted={muted} loop playsInline
        style={{ width:"100%", height:"100%", objectFit:"cover" }}
        onEnded={()=>setPlaying(false)}/>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <button onClick={toggle} style={{ width:48, height:48, borderRadius:24, background:"rgba(0,0,0,0.55)", border:`1.5px solid ${G.gold}`,
          display:"flex", alignItems:"center", justifyContent:"center", color: G.gold, cursor:"pointer", backdropFilter:"blur(4px)" }}>
          {playing?<Pause className="w-5 h-5"/>:<Play className="w-5 h-5 ml-0.5"/>}
        </button>
      </div>
      <button onClick={()=>{setMuted(m=>!m); if(ref.current) ref.current.muted=!muted;}}
        style={{ position:"absolute", bottom:10, right:10, width:30, height:30, borderRadius:15, background:"rgba(0,0,0,0.55)",
          display:"flex", alignItems:"center", justifyContent:"center", color: G.gold, cursor:"pointer", border:`1px solid ${G.border}` }}>
        {muted?<VolumeX className="w-3.5 h-3.5"/>:<Volume2 className="w-3.5 h-3.5"/>}
      </button>
      <div style={{ position:"absolute", top:10, left:10, display:"flex", alignItems:"center", gap:5, padding:"4px 8px", borderRadius:8,
        background:"rgba(0,0,0,0.6)", border:`1px solid ${G.border}` }}>
        <Video className="w-3 h-3" style={{ color: G.gold }}/><span style={{ fontSize:10, color: G.gold, fontWeight:700 }}>VIDEO</span>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ p, onEdit, onDelete, isAdmin, wishlist, toggleWish }:
  { p: Product; onEdit:(p:Product)=>void; onDelete:(id:string)=>void; isAdmin:boolean; wishlist:Set<string>; toggleWish:(id:string)=>void }) {
  const disc = discount(p.originalPrice, p.price);
  return (
    <div style={{ borderRadius:20, overflow:"hidden", background: G.bgCard, border:`1px solid ${G.border}`,
      transition:"all 0.2s", display:"flex", flexDirection:"column" }}
      onMouseEnter={ev=>{ev.currentTarget.style.border=`1px solid ${G.borderBright}`;ev.currentTarget.style.transform="translateY(-2px)";ev.currentTarget.style.boxShadow=`0 8px 32px rgba(212,175,55,0.12)`;}}
      onMouseLeave={ev=>{ev.currentTarget.style.border=`1px solid ${G.border}`;ev.currentTarget.style.transform="none";ev.currentTarget.style.boxShadow="none";}}>

      {/* Media */}
      <div style={{ position:"relative", aspectRatio:"1/1", background:"#1a1008", overflow:"hidden" }}>
        {p.mediaUrl ? (
          p.mediaType==="video"
            ? <VideoCard src={p.mediaUrl}/>
            : <img src={p.mediaUrl} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
        ) : (
          <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}>
            <div style={{ fontSize:40 }}>💍</div>
            <span style={{ fontSize:11, color: G.textFaint }}>No image</span>
          </div>
        )}
        {/* Badges */}
        {p.featured && (
          <div style={{ position:"absolute", top:10, left:10, padding:"3px 9px", borderRadius:8, fontSize:10, fontWeight:700,
            background:`linear-gradient(135deg,${G.gold},${G.goldDark})`, color:"#0c0804" }}>⭐ Featured</div>
        )}
        {!p.inStock && (
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:13, fontWeight:700, color:"#f87171", padding:"6px 16px", borderRadius:10, background:"rgba(0,0,0,0.7)", border:"1px solid rgba(248,113,113,0.3)" }}>Out of Stock</span>
          </div>
        )}
        {disc && (
          <div style={{ position:"absolute", top:10, right:10, width:38, height:38, borderRadius:19, background:"#dc2626",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"white" }}>
            -{disc}%
          </div>
        )}
        {/* Wishlist */}
        <button onClick={()=>toggleWish(p.id)}
          style={{ position:"absolute", bottom:10, right:10, width:34, height:34, borderRadius:17, background:"rgba(0,0,0,0.6)",
            display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${wishlist.has(p.id)?G.rose:G.border}`, cursor:"pointer" }}>
          <Heart className="w-4 h-4" style={{ color:wishlist.has(p.id)?G.roseLight:"#888", fill:wishlist.has(p.id)?G.roseLight:"none" }}/>
        </button>
      </div>

      {/* Info */}
      <div style={{ padding:"14px 16px", flex:1, display:"flex", flexDirection:"column", gap:6 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:6, background:`${G.gold}18`, color: G.gold }}>{p.category}</span>
          <span style={{ fontSize:10, color: G.textFaint, marginLeft:"auto" }}>{p.material}</span>
        </div>
        <p style={{ fontSize:14, fontWeight:700, color: G.textPrimary, lineHeight:1.3 }}>{p.name}</p>
        <p style={{ fontSize:12, color: G.textSub, lineHeight:1.5, flex:1 }}>{p.description}</p>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:4 }}>
          <div>
            <span style={{ fontSize:17, fontWeight:800, color: G.gold }}>{fmt(p.price)}</span>
            {p.originalPrice && <span style={{ fontSize:12, color: G.textFaint, textDecoration:"line-through", marginLeft:6 }}>{fmt(p.originalPrice)}</span>}
          </div>
          <button style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 14px", borderRadius:10,
            background: p.inStock?`linear-gradient(135deg,${G.gold},${G.goldDark})`:"rgba(255,255,255,0.06)",
            color: p.inStock?"#0c0804":G.textFaint, fontSize:12, fontWeight:700, border:"none", cursor:p.inStock?"pointer":"not-allowed" }}>
            <ShoppingBag className="w-3.5 h-3.5"/>{p.inStock?"Buy Now":"N/A"}
          </button>
        </div>
      </div>

      {/* Admin actions */}
      {isAdmin && (
        <div style={{ display:"flex", gap:8, padding:"10px 16px", borderTop:`1px solid ${G.border}` }}>
          <button onClick={()=>onEdit(p)} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"7px",
            borderRadius:8, background:"rgba(212,175,55,0.1)", border:`1px solid ${G.border}`, color: G.gold, fontSize:12, fontWeight:600, cursor:"pointer" }}>
            <Edit2 className="w-3.5 h-3.5"/>Edit
          </button>
          <button onClick={()=>onDelete(p.id)} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"7px",
            borderRadius:8, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", color:"#f87171", fontSize:12, fontWeight:600, cursor:"pointer" }}>
            <Trash2 className="w-3.5 h-3.5"/>Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const BLANK_FORM = { name:"", description:"", price:"", originalPrice:"", category:"Gold", material:"", inStock:true, featured:false };

export default function OneSpotBanglesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filterCat,setFilterCat]= useState<Category>("All");
  const [wishlist, setWishlist]  = useState<Set<string>>(new Set());
  const [isAdmin,  setIsAdmin]  = useState(false);
  const [adminPass,setAdminPass]= useState("");
  const [showAdmin,setShowAdmin]= useState(false);

  // Form
  const [showForm, setShowForm]   = useState(false);
  const [editId,   setEditId]     = useState<string|null>(null);
  const [form,     setForm]       = useState(BLANK_FORM);
  const [mediaFile,setMediaFile]  = useState<File|null>(null);
  const [mediaPreview,setMediaPreview] = useState<{url:string;type:MediaType}|null>(null);
  const [uploading,setUploading]  = useState(false);
  const [saving,   setSaving]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load products
  const load = useCallback(async()=>{
    setLoading(true);
    try {
      const res = await fetch("/api/one-spot-bangles3/products");
      const { products: p } = await res.json();
      setProducts(p ?? []);
    } catch { setProducts([]); } finally { setLoading(false); }
  },[]);

  useEffect(()=>{ load(); },[load]);

  // Wishlist persist
  useEffect(()=>{ try{ const w=localStorage.getItem("bangle_wish"); if(w) setWishlist(new Set(JSON.parse(w))); }catch{} },[]);
  const toggleWish = (id:string)=>{
    setWishlist(prev=>{
      const next = new Set(prev);
      next.has(id)?next.delete(id):next.add(id);
      localStorage.setItem("bangle_wish",JSON.stringify(Array.from(next)));
      return next;
    });
  };

  // Admin login
  const tryLogin = ()=>{
    if (adminPass==="onespot2025"||adminPass==="admin123") { setIsAdmin(true); setShowAdmin(false); }
    else alert("Wrong password");
  };

  // File pick
  const handleFile = (file: File)=>{
    setMediaFile(file);
    const url = URL.createObjectURL(file);
    setMediaPreview({ url, type: file.type.startsWith("video/")?"video":"image" });
  };

  const openForm = (p?: Product)=>{
    if (p) {
      setEditId(p.id);
      setForm({ name:p.name, description:p.description, price:String(p.price), originalPrice:String(p.originalPrice??""),
        category:p.category, material:p.material, inStock:p.inStock, featured:p.featured });
      setMediaPreview(p.mediaUrl?{url:p.mediaUrl,type:p.mediaType}:null);
    } else {
      setEditId(null); setForm(BLANK_FORM); setMediaPreview(null); setMediaFile(null);
    }
    setShowForm(true);
  };

  const saveProduct = async()=>{
    if (!form.name||!form.price) return;
    setSaving(true);
    try {
      let mediaUrl = mediaPreview?.url ?? "";
      let mediaType: MediaType = mediaPreview?.type ?? "image";

      // Upload new file if chosen
      if (mediaFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", mediaFile);
        const res = await fetch("/api/one-spot-bangles3/upload", { method:"POST", body:fd });
        const data = await res.json();
        if (data.url) { mediaUrl = data.url; mediaType = data.type; }
        setUploading(false);
      }

      const payload = { ...form, price:parseFloat(form.price), originalPrice:form.originalPrice?parseFloat(form.originalPrice):undefined, mediaUrl, mediaType };

      if (editId) {
        await fetch(`/api/one-spot-bangles3/products/${editId}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      } else {
        await fetch("/api/one-spot-bangles3/products",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      }
      await load();
      setShowForm(false); setEditId(null); setForm(BLANK_FORM); setMediaFile(null); setMediaPreview(null);
    } catch(e){ alert("Error: "+String(e)); } finally { setSaving(false); }
  };

  const deleteProduct = async(id:string)=>{
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/one-spot-bangles3/products/${id}`,{method:"DELETE"});
    await load();
  };

  // Filter
  const filtered = products.filter(p=>{
    const matchCat = filterCat==="All"||p.category===filterCat;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = products.filter(p=>p.featured&&p.inStock).slice(0,3);

  return (
    <div style={{ minHeight:"100vh", background: G.bg, color: G.textPrimary, fontFamily:"system-ui,-apple-system,sans-serif" }}>

      {/* ── Ambient glow ──────────────────────────────────────────────────────── */}
      <div style={{ position:"fixed", top:-150, left:"50%", transform:"translateX(-50%)", width:700, height:350,
        background:"radial-gradient(ellipse,rgba(212,175,55,0.1) 0%,transparent 70%)", pointerEvents:"none", zIndex:0 }}/>

      {/* ── Hero Header ───────────────────────────────────────────────────────── */}
      <div style={{ position:"relative", overflow:"hidden", borderBottom:`1px solid ${G.border}` }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(212,175,55,0.08) 0%,transparent 100%)", pointerEvents:"none" }}/>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"40px 20px 32px", position:"relative", zIndex:1 }}>
          {/* Top bar */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32, flexWrap:"wrap", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:56, height:56, borderRadius:18, background:`linear-gradient(135deg,${G.gold},${G.goldDark})`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0, boxShadow:`0 4px 20px rgba(212,175,55,0.3)` }}>
                💍
              </div>
              <div>
                <h1 style={{ fontSize:22, fontWeight:900, color: G.cream, letterSpacing:"-0.02em", lineHeight:1 }}>One Spot Bangles</h1>
                <p style={{ fontSize:12, color: G.textSub, marginTop:3, display:"flex", alignItems:"center", gap:5 }}>
                  <MapPin className="w-3.5 h-3.5" style={{ color: G.gold }}/> Magdi Road, Bangalore City
                </p>
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <a href="tel:+919876543210" style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:12,
                background:"rgba(212,175,55,0.1)", border:`1px solid ${G.border}`, color: G.gold, fontSize:13, fontWeight:600, textDecoration:"none" }}>
                <Phone className="w-4 h-4"/>Call Us
              </a>
              {!isAdmin && (
                <button onClick={()=>setShowAdmin(true)} style={{ padding:"9px 16px", borderRadius:12,
                  background: G.surface, border:`1px solid ${G.border}`, color: G.textSub, fontSize:13, cursor:"pointer" }}>
                  Admin
                </button>
              )}
              {isAdmin && (
                <button onClick={()=>openForm()} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:12,
                  background:`linear-gradient(135deg,${G.gold},${G.goldDark})`, border:"none", color:"#0c0804", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                  <Plus className="w-4 h-4"/>Add Bangle
                </button>
              )}
            </div>
          </div>

          {/* Tagline */}
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <h2 style={{ fontSize:32, fontWeight:900, letterSpacing:"-0.03em", lineHeight:1.1, marginBottom:10 }}>
              <span style={{ background:`linear-gradient(135deg,${G.goldLight},${G.gold},${G.roseLight})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Elegance in Every Bangle
              </span>
            </h2>
            <p style={{ fontSize:15, color: G.textSub, maxWidth:480, margin:"0 auto" }}>
              Handcrafted bangles from our family to yours. Gold, silver, diamond &amp; more — curated with love from Bangalore.
            </p>
          </div>

          {/* Feature pills */}
          <div style={{ display:"flex", justifyContent:"center", flexWrap:"wrap", gap:10, marginBottom:28 }}>
            {FEATURES.map(f=>(
              <div key={f.title} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 16px", borderRadius:14,
                background: G.surface, border:`1px solid ${G.border}` }}>
                <span style={{ color: G.gold }}>{f.icon}</span>
                <div>
                  <p style={{ fontSize:11, fontWeight:700, color: G.cream }}>{f.title}</p>
                  <p style={{ fontSize:10, color: G.textSub }}>{f.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search + filter */}
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
            <div style={{ position:"relative", flex:"1 1 280px", maxWidth:400 }}>
              <Search className="w-4 h-4" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color: G.textSub }}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search bangles…"
                style={{ ...inputStyle, paddingLeft:36 }}/>
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {CATEGORIES.map(c=>(
                <button key={c} onClick={()=>setFilterCat(c)}
                  style={{ padding:"8px 14px", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
                    background: filterCat===c?`linear-gradient(135deg,${G.gold},${G.goldDark})`:G.surface,
                    border:`1px solid ${filterCat===c?G.gold:G.border}`,
                    color: filterCat===c?"#0c0804":G.textSub }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 16px 60px", position:"relative", zIndex:1 }}>

        {/* ── Featured strip ──────────────────────────────────────────────────── */}
        {featured.length>0 && !search && filterCat==="All" && (
          <div style={{ marginBottom:36 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <Star className="w-4 h-4" style={{ color: G.gold }}/><p style={{ fontSize:14, fontWeight:700, color: G.cream }}>Featured Collection</p>
              <div style={{ flex:1, height:1, background: G.border }}/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
              {featured.map(p=>(
                <ProductCard key={p.id} p={p} onEdit={openForm} onDelete={deleteProduct} isAdmin={isAdmin} wishlist={wishlist} toggleWish={toggleWish}/>
              ))}
            </div>
          </div>
        )}

        {/* ── All products ────────────────────────────────────────────────────── */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
          <Filter className="w-4 h-4" style={{ color: G.gold }}/>
          <p style={{ fontSize:14, fontWeight:700, color: G.cream }}>
            {filterCat==="All"?"All Bangles":`${filterCat} Bangles`}
            <span style={{ fontSize:12, fontWeight:400, color: G.textSub, marginLeft:8 }}>{filtered.length} items</span>
          </p>
        </div>

        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", padding:"60px 0" }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: G.gold }}/>
          </div>
        ) : filtered.length===0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>💍</div>
            <p style={{ color: G.textSub }}>No bangles found</p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16 }}>
            {filtered.map(p=>(
              <ProductCard key={p.id} p={p} onEdit={openForm} onDelete={deleteProduct} isAdmin={isAdmin} wishlist={wishlist} toggleWish={toggleWish}/>
            ))}
          </div>
        )}

        {/* ── Owners section ──────────────────────────────────────────────────── */}
        <div style={{ marginTop:60, borderRadius:24, overflow:"hidden", border:`1px solid ${G.border}`,
          background:"linear-gradient(135deg,rgba(212,175,55,0.06) 0%,rgba(192,120,88,0.06) 100%)" }}>
          <div style={{ padding:"28px 24px", textAlign:"center", borderBottom:`1px solid ${G.border}` }}>
            <p style={{ fontSize:11, fontWeight:700, color: G.gold, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>About Us</p>
            <h3 style={{ fontSize:22, fontWeight:800, color: G.cream, marginBottom:8 }}>The Faces Behind One Spot Bangles</h3>
            <p style={{ fontSize:13, color: G.textSub, maxWidth:480, margin:"0 auto" }}>
              A family-run jewellery business bringing you authentic, affordable bangles from the heart of Bangalore.
            </p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:0 }}>
            {OWNERS.map((o,i)=>(
              <div key={o.name} style={{ padding:"28px 20px", textAlign:"center", borderRight:i<OWNERS.length-1?`1px solid ${G.border}`:"none" }}>
                <div style={{ width:64, height:64, borderRadius:32, background:`linear-gradient(135deg,${G.gold}30,${G.rose}30)`,
                  border:`2px solid ${G.gold}50`, display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:28, margin:"0 auto 12px" }}>{o.emoji}</div>
                <p style={{ fontSize:17, fontWeight:800, color: G.cream, marginBottom:4 }}>{o.name}</p>
                <p style={{ fontSize:12, color: G.textSub }}>{o.role}</p>
              </div>
            ))}
          </div>
          <div style={{ padding:"20px 24px", borderTop:`1px solid ${G.border}`, display:"flex", alignItems:"center", justifyContent:"center", gap:20, flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, color: G.textSub, fontSize:13 }}>
              <MapPin className="w-4 h-4" style={{ color: G.gold }}/> Magdi Road, Bangalore City — 560023
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, color: G.textSub, fontSize:13 }}>
              <Phone className="w-4 h-4" style={{ color: G.gold }}/> +91 98765 43210
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, color: G.textSub, fontSize:13 }}>
              <Instagram className="w-4 h-4" style={{ color: G.gold }}/> @onespotbangles
            </div>
          </div>
        </div>

      </div>

      {/* ── Admin login modal ─────────────────────────────────────────────────── */}
      {showAdmin && (
        <>
          <div onClick={()=>setShowAdmin(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:60, backdropFilter:"blur(4px)" }}/>
          <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:70,
            background:"#1a1008", border:`1px solid ${G.borderBright}`, borderRadius:20, padding:"28px 24px", width:320 }}>
            <p style={{ fontSize:16, fontWeight:800, color: G.cream, marginBottom:16 }}>Admin Login</p>
            <input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&tryLogin()} placeholder="Enter admin password"
              style={inputStyle} autoFocus/>
            <div style={{ display:"flex", gap:8, marginTop:12 }}>
              <button onClick={()=>setShowAdmin(false)} style={{ flex:1, padding:"10px", borderRadius:10, background:"rgba(255,255,255,0.05)",
                border:`1px solid ${G.border}`, color: G.textSub, fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button onClick={tryLogin} style={{ flex:1, padding:"10px", borderRadius:10,
                background:`linear-gradient(135deg,${G.gold},${G.goldDark})`, border:"none",
                color:"#0c0804", fontSize:13, fontWeight:700, cursor:"pointer" }}>Login</button>
            </div>
            <p style={{ fontSize:11, color: G.textFaint, marginTop:10, textAlign:"center" }}>Default: onespot2025</p>
          </div>
        </>
      )}

      {/* ── Add / Edit form modal ────────────────────────────────────────────── */}
      {showForm && (
        <>
          <div onClick={()=>setShowForm(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:60, backdropFilter:"blur(4px)" }}/>
          <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:70, borderRadius:"24px 24px 0 0",
            background:"#150f07", border:`1px solid ${G.border}`, borderBottom:"none",
            maxHeight:"92vh", overflowY:"auto", maxWidth:680, margin:"0 auto" }}>
            <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 4px" }}>
              <div style={{ width:36, height:4, borderRadius:2, background:"rgba(212,175,55,0.3)" }}/>
            </div>
            <div style={{ padding:"8px 20px 36px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                <p style={{ fontSize:16, fontWeight:800, color: G.cream }}>{editId?"Edit Product":"Add New Bangle"}</p>
                <button onClick={()=>setShowForm(false)} style={{ width:32, height:32, borderRadius:10, background: G.surface,
                  border:`1px solid ${G.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color: G.textSub }}>
                  <X className="w-4 h-4"/>
                </button>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

                {/* Media upload */}
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color: G.textSub, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:8 }}>
                    Image or Video
                  </label>
                  <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display:"none" }}
                    onChange={e=>{ const f=e.target.files?.[0]; if(f) handleFile(f); }}/>
                  {mediaPreview ? (
                    <div style={{ position:"relative", borderRadius:14, overflow:"hidden", aspectRatio:"16/9", background:"#000" }}>
                      {mediaPreview.type==="video"
                        ? <video src={mediaPreview.url} style={{ width:"100%", height:"100%", objectFit:"cover" }} controls/>
                        : <img src={mediaPreview.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>}
                      <button onClick={()=>{setMediaPreview(null);setMediaFile(null);}}
                        style={{ position:"absolute", top:8, right:8, width:28, height:28, borderRadius:14, background:"rgba(0,0,0,0.7)",
                          display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", border:`1px solid ${G.border}`, color: G.textSub }}>
                        <X className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  ) : (
                    <button onClick={()=>fileRef.current?.click()}
                      style={{ width:"100%", aspectRatio:"16/9", borderRadius:14, background: G.surface, border:`2px dashed ${G.border}`,
                        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, cursor:"pointer" }}>
                      <div style={{ display:"flex", gap:12, color: G.gold }}>
                        <ImageIcon className="w-6 h-6"/><Video className="w-6 h-6"/>
                      </div>
                      <p style={{ fontSize:13, color: G.textSub }}>Click to upload image or video</p>
                      <p style={{ fontSize:11, color: G.textFaint }}>JPG, PNG, MP4, MOV — Max 50MB</p>
                    </button>
                  )}
                </div>

                <div>
                  <label style={{ fontSize:11, fontWeight:700, color: G.textSub, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>Product Name *</label>
                  <input style={inputStyle} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Gold Kundan Bangle Set"/>
                </div>

                <div>
                  <label style={{ fontSize:11, fontWeight:700, color: G.textSub, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>Description</label>
                  <textarea style={{ ...inputStyle, minHeight:80, resize:"vertical" }} value={form.description}
                    onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Describe the bangle — material, design, set size…"/>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color: G.textSub, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>Price (₹) *</label>
                    <input type="number" style={inputStyle} value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="0"/>
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color: G.textSub, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>Original Price (₹)</label>
                    <input type="number" style={inputStyle} value={form.originalPrice} onChange={e=>setForm(f=>({...f,originalPrice:e.target.value}))} placeholder="0 (for discount)"/>
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color: G.textSub, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>Category</label>
                    <select style={{ ...inputStyle }} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                      {["Gold","Silver","Diamond","Bridal","Antique","Fashion","Other"].map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color: G.textSub, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>Material</label>
                    <input style={inputStyle} value={form.material} onChange={e=>setForm(f=>({...f,material:e.target.value}))} placeholder="e.g. 22K Gold"/>
                  </div>
                </div>

                <div style={{ display:"flex", gap:20 }}>
                  <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                    <div onClick={()=>setForm(f=>({...f,inStock:!f.inStock}))} style={{ width:42, height:24, borderRadius:12, position:"relative",
                      background: form.inStock?`linear-gradient(135deg,${G.gold},${G.goldDark})`:"rgba(255,255,255,0.1)", cursor:"pointer" }}>
                      <div style={{ position:"absolute", top:3, width:18, height:18, borderRadius:9, background:"white",
                        left:form.inStock?"21px":"3px", transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }}/>
                    </div>
                    <span style={{ fontSize:12, color: G.textSub }}>In Stock</span>
                  </label>
                  <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                    <div onClick={()=>setForm(f=>({...f,featured:!f.featured}))} style={{ width:42, height:24, borderRadius:12, position:"relative",
                      background: form.featured?`linear-gradient(135deg,${G.gold},${G.goldDark})`:"rgba(255,255,255,0.1)", cursor:"pointer" }}>
                      <div style={{ position:"absolute", top:3, width:18, height:18, borderRadius:9, background:"white",
                        left:form.featured?"21px":"3px", transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }}/>
                    </div>
                    <span style={{ fontSize:12, color: G.textSub }}>Featured</span>
                  </label>
                </div>

                <button onClick={saveProduct} disabled={!form.name||!form.price||saving}
                  style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"14px", borderRadius:14,
                    background:(!form.name||!form.price)?G.surface:`linear-gradient(135deg,${G.gold},${G.goldDark})`,
                    color:(!form.name||!form.price)?G.textFaint:"#0c0804", fontSize:14, fontWeight:700, border:"none",
                    cursor:(!form.name||!form.price)?"not-allowed":"pointer", opacity:saving?0.7:1,
                    boxShadow:(!form.name||!form.price)?"none":`0 4px 20px rgba(212,175,55,0.3)` }}>
                  {saving||uploading?<Loader2 className="w-4 h-4 animate-spin"/>:<Check className="w-4 h-4"/>}
                  {uploading?"Uploading media…":saving?"Saving…":editId?"Save Changes":"Add Bangle"}
                </button>

              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        * { box-sizing: border-box; }
        select option { background: #1a1008; color: #f5e6c8; }
        textarea { font-family: inherit; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.3); border-radius: 4px; }
      `}</style>
    </div>
  );
}
