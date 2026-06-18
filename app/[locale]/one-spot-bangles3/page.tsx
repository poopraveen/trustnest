"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Phone, MapPin, Instagram, Search, Star, ShoppingBag,
  X, Plus, Edit2, Trash2, Video, Image as ImageIcon,
  Check, Loader2, Heart, Play, Pause, Volume2, VolumeX,
  Store, Award, Shield, Truck, ShoppingCart, ChevronUp, ChevronDown,
  MessageCircle, ArrowUpDown, Sparkles, Send,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type MediaType = "image" | "video";
type Category = "All" | "Gold" | "Silver" | "Diamond" | "Bridal" | "Antique" | "Fashion";
type SortOption = "featured" | "price_asc" | "price_desc" | "newest";

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

interface CartItem {
  product: Product;
  qty: number;
}

interface Toast {
  id: number;
  message: string;
  type: "cart" | "wish";
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const G = {
  bg:           "#0a0804",
  headerBg:     "#12100a",
  bgCard:       "#1a140c",
  bgCardHov:    "#221a10",
  gold:         "#d4af37",
  goldLight:    "#f0d060",
  goldDark:     "#a07820",
  goldGrad:     "linear-gradient(135deg, #f0d060, #d4af37, #a07820)",
  rose:         "#c07858",
  roseLight:    "#e09878",
  cream:        "#f5e6c8",
  textPrimary:  "#f5e6c8",
  textSub:      "#9a7a5a",
  textFaint:    "#5a4030",
  border:       "rgba(212,175,55,0.2)",
  borderBright: "rgba(212,175,55,0.5)",
  surface:      "rgba(212,175,55,0.06)",
  surfaceHov:   "rgba(212,175,55,0.1)",
  waGreen:      "#25D366",
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
  { name: "Kavya",  emoji: "👑", role: "Co-owner & Designer"    },
  { name: "Sheela", emoji: "💎", role: "Co-owner & Finance"     },
  { name: "Madhu",  emoji: "🌸", role: "Co-owner & Operations" },
];

const FEATURES = [
  { icon: <Award   className="w-5 h-5"/>, title: "Certified Quality",   sub: "BIS hallmarked gold & silver"   },
  { icon: <Shield  className="w-5 h-5"/>, title: "Genuine Products",    sub: "100% authentic jewellery"       },
  { icon: <Truck   className="w-5 h-5"/>, title: "Home Delivery",       sub: "Free delivery in Bangalore"     },
  { icon: <Store   className="w-5 h-5"/>, title: "Visit Our Store",     sub: "Magdi Road, Bangalore City"     },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured",   label: "Featured"           },
  { value: "price_asc",  label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest",     label: "Newest"             },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function discount(orig?: number, price?: number) {
  if (!orig || !price || orig <= price) return null;
  return Math.round(((orig - price) / orig) * 100);
}

function mockRating(id: string): { rating: number; count: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const rating = 4.0 + (hash % 11) * 0.1;
  const count  = 10  + (hash % 191);
  return { rating: Math.round(rating * 10) / 10, count };
}

function buildWhatsAppUrl(text: string) {
  return `https://wa.me/919876543210?text=${encodeURIComponent(text)}`;
}

function StarRow({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ display: "flex", gap: 2 }}>
        {[1,2,3,4,5].map(i => (
          <Star key={i} className="w-3 h-3"
            style={{ color: G.gold, fill: i <= full ? G.gold : "none", opacity: i <= full ? 1 : 0.35 }}/>
        ))}
      </div>
      <span style={{ fontSize: 11, color: G.textSub }}>{rating} ({count})</span>
    </div>
  );
}

// ─── Video Card ───────────────────────────────────────────────────────────────

function VideoCard({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted,   setMuted]   = useState(true);

  const toggle = () => {
    if (!ref.current) return;
    if (playing) { ref.current.pause(); setPlaying(false); }
    else         { ref.current.play();  setPlaying(true);  }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#000" }}>
      <video ref={ref} src={src} poster={poster} muted={muted} loop playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onEnded={() => setPlaying(false)}/>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <button onClick={toggle}
          style={{ width: 48, height: 48, borderRadius: 24, background: "rgba(0,0,0,0.55)",
            border: `1.5px solid ${G.gold}`, display: "flex", alignItems: "center",
            justifyContent: "center", color: G.gold, cursor: "pointer", backdropFilter: "blur(4px)" }}>
          {playing ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>}
        </button>
      </div>
      <button onClick={() => { setMuted(m => !m); if (ref.current) ref.current.muted = !muted; }}
        style={{ position: "absolute", bottom: 10, right: 10, width: 30, height: 30, borderRadius: 15,
          background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center",
          color: G.gold, cursor: "pointer", border: `1px solid ${G.border}` }}>
        {muted ? <VolumeX className="w-3.5 h-3.5"/> : <Volume2 className="w-3.5 h-3.5"/>}
      </button>
      <div style={{ position: "absolute", top: 10, left: 10, display: "flex", alignItems: "center", gap: 5,
        padding: "4px 8px", borderRadius: 8, background: "rgba(0,0,0,0.6)", border: `1px solid ${G.border}` }}>
        <Video className="w-3 h-3" style={{ color: G.gold }}/>
        <span style={{ fontSize: 10, color: G.gold, fontWeight: 700 }}>VIDEO</span>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ p, onEdit, onDelete, isAdmin, wishlist, toggleWish, onAddToCart, onOpenDetail, onBook }: {
  p: Product;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  wishlist: Set<string>;
  toggleWish: (id: string) => void;
  onAddToCart: (p: Product) => void;
  onOpenDetail: (p: Product) => void;
  onBook: (p: Product) => void;
}) {
  const disc = discount(p.originalPrice, p.price);
  const { rating, count } = mockRating(p.id);
  const [hovered, setHovered] = useState(false);
  const wished = wishlist.has(p.id);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 18, overflow: "hidden",
        background: hovered ? G.bgCardHov : G.bgCard,
        border: `1px solid ${hovered ? G.borderBright : G.border}`,
        transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
        display: "flex", flexDirection: "column",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered ? `0 12px 40px rgba(212,175,55,0.15)` : "none",
      }}>

      {/* Image / Video */}
      <div
        onClick={() => onOpenDetail(p)}
        style={{ position: "relative", aspectRatio: "1/1", background: "#140e08",
          overflow: "hidden", cursor: "pointer" }}>

        {p.mediaUrl ? (
          p.mediaType === "video"
            ? <VideoCard src={p.mediaUrl}/>
            : <img src={p.mediaUrl} alt={p.name}
                style={{ width: "100%", height: "100%", objectFit: "cover",
                  transform: hovered ? "scale(1.06)" : "scale(1)",
                  transition: "transform 0.35s cubic-bezier(.4,0,.2,1)" }}/>
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 8 }}>
            <div style={{ fontSize: 40 }}>💍</div>
            <span style={{ fontSize: 11, color: G.textFaint }}>No image</span>
          </div>
        )}

        {/* Category badge */}
        <div style={{ position: "absolute", top: 10, left: 10, padding: "3px 9px", borderRadius: 8,
          fontSize: 10, fontWeight: 700, background: "rgba(10,8,4,0.75)",
          border: `1px solid ${G.border}`, color: G.gold, backdropFilter: "blur(6px)" }}>
          {p.category}
        </div>

        {/* Discount badge */}
        {disc && (
          <div style={{ position: "absolute", top: 10, right: 10, width: 40, height: 40,
            borderRadius: 20, background: "#dc2626", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 10, fontWeight: 800, color: "white",
            boxShadow: "0 2px 8px rgba(220,38,38,0.4)" }}>
            -{disc}%
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={e => { e.stopPropagation(); toggleWish(p.id); }}
          style={{ position: "absolute", bottom: 10, right: 10, width: 34, height: 34,
            borderRadius: 17, background: "rgba(10,8,4,0.7)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${wished ? G.rose : G.border}`, cursor: "pointer",
            transition: "all 0.15s" }}>
          <Heart className="w-4 h-4"
            style={{ color: wished ? G.roseLight : "#888", fill: wished ? G.roseLight : "none" }}/>
        </button>

        {/* Featured badge */}
        {p.featured && (
          <div style={{ position: "absolute", bottom: 10, left: 10, display: "flex", alignItems: "center",
            gap: 4, padding: "3px 8px", borderRadius: 8, fontSize: 10, fontWeight: 700,
            background: `linear-gradient(135deg,${G.gold},${G.goldDark})`, color: "#0a0804" }}>
            <Sparkles className="w-3 h-3"/>Featured
          </div>
        )}

        {/* Out of stock overlay */}
        {!p.inStock && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#f87171", padding: "6px 16px",
              borderRadius: 10, background: "rgba(0,0,0,0.75)", border: "1px solid rgba(248,113,113,0.3)" }}>
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick Add overlay on hover */}
        {hovered && p.inStock && p.mediaType !== "video" && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 12px",
            background: "linear-gradient(0deg, rgba(10,8,4,0.92) 0%, transparent 100%)" }}>
            <button
              onClick={e => { e.stopPropagation(); onAddToCart(p); }}
              style={{ width: "100%", padding: "8px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                background: G.goldGrad, border: "none", color: "#0a0804", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <ShoppingCart className="w-3.5 h-3.5"/> Quick Add to Cart
            </button>
          </div>
        )}
      </div>

      {/* Info section */}
      <div style={{ padding: "14px 14px 10px", flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>

        <StarRow rating={rating} count={count}/>

        <p
          onClick={() => onOpenDetail(p)}
          style={{ fontSize: 14, fontWeight: 700, color: G.textPrimary, lineHeight: 1.35,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden", cursor: "pointer" }}>
          {p.name}
        </p>

        <p style={{ fontSize: 11, color: G.textSub }}>{p.material}</p>

        {/* Price row */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginTop: 2 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: G.gold }}>{fmt(p.price)}</span>
          {p.originalPrice && (
            <span style={{ fontSize: 12, color: G.textFaint, textDecoration: "line-through" }}>
              {fmt(p.originalPrice)}
            </span>
          )}
          {disc && (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#4ade80" }}>{disc}% off</span>
          )}
        </div>

        {/* Stock indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: 4,
            background: p.inStock ? "#4ade80" : "#f87171" }}/>
          <span style={{ fontSize: 11, color: p.inStock ? "#4ade80" : "#f87171", fontWeight: 600 }}>
            {p.inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 4 }}>
          <button
            onClick={() => onAddToCart(p)}
            disabled={!p.inStock}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "9px", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none",
              background: p.inStock ? G.goldGrad : "rgba(255,255,255,0.05)",
              color: p.inStock ? "#0a0804" : G.textFaint,
              cursor: p.inStock ? "pointer" : "not-allowed",
              boxShadow: p.inStock ? `0 3px 12px rgba(212,175,55,0.25)` : "none" }}>
            <ShoppingCart className="w-3.5 h-3.5"/>
            {p.inStock ? "Add to Cart" : "Unavailable"}
          </button>
          <div style={{ display: "flex", gap: 7 }}>
            <button
              onClick={() => p.inStock && onBook(p)}
              disabled={!p.inStock}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                padding: "8px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: `1px solid ${G.border}`,
                background: p.inStock ? G.surface : "rgba(255,255,255,0.03)",
                color: p.inStock ? G.gold : G.textFaint,
                cursor: p.inStock ? "pointer" : "not-allowed" }}>
              <Send className="w-3 h-3"/> Book Now
            </button>
            <a
              href={buildWhatsAppUrl(`Hi! I'm interested in *${p.name}* priced at ${fmt(p.price)} from One Spot Bangles. Please share more details.`)}
              target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                padding: "8px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                background: "transparent", border: `1px solid rgba(37,211,102,0.3)`,
                color: G.waGreen, textDecoration: "none", cursor: "pointer" }}>
              <MessageCircle className="w-3 h-3"/> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Admin actions */}
      {isAdmin && (
        <div style={{ display: "flex", gap: 8, padding: "8px 14px 12px",
          borderTop: `1px solid ${G.border}` }}>
          <button onClick={() => onEdit(p)}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              gap: 6, padding: "7px", borderRadius: 8, background: "rgba(212,175,55,0.1)",
              border: `1px solid ${G.border}`, color: G.gold, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            <Edit2 className="w-3.5 h-3.5"/>Edit
          </button>
          <button onClick={() => onDelete(p.id)}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              gap: 6, padding: "7px", borderRadius: 8, background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            <Trash2 className="w-3.5 h-3.5"/>Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────

function CartDrawer({ items, onClose, onQtyChange, onRemove }: {
  items: CartItem[];
  onClose: () => void;
  onQtyChange: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
}) {
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  const waText = items.length === 0
    ? "Hi! I'd like to place an order from One Spot Bangles."
    : `Hi! I'd like to order the following from One Spot Bangles:\n\n` +
      items.map(i => `- ${i.product.name} x${i.qty} -- ${fmt(i.product.price * i.qty)}`).join("\n") +
      `\n\nTotal: ${fmt(subtotal)}\n\nPlease confirm availability and share payment details.`;

  return (
    <>
      <div onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
          zIndex: 200, backdropFilter: "blur(4px)" }}/>
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 201,
        width: 380, maxWidth: "92vw", background: "#15100a",
        borderLeft: `1px solid ${G.border}`, display: "flex", flexDirection: "column",
        boxShadow: "-12px 0 48px rgba(0,0,0,0.5)" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 20px 16px", borderBottom: `1px solid ${G.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShoppingCart className="w-5 h-5" style={{ color: G.gold }}/>
            <span style={{ fontSize: 16, fontWeight: 800, color: G.cream }}>Shopping Cart</span>
            <span style={{ fontSize: 13, color: G.textSub }}>({totalQty} items)</span>
          </div>
          <button onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 10, background: G.surface,
              border: `1px solid ${G.border}`, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", color: G.textSub }}>
            <X className="w-4 h-4"/>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px",
          display: "flex", flexDirection: "column", gap: 14 }}>
          {items.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 14, paddingTop: 60 }}>
              <ShoppingBag className="w-14 h-14" style={{ color: G.textFaint }}/>
              <p style={{ fontSize: 15, color: G.textSub, fontWeight: 600 }}>Your cart is empty</p>
              <p style={{ fontSize: 13, color: G.textFaint, textAlign: "center" }}>
                Add some beautiful bangles to get started!
              </p>
              <button onClick={onClose}
                style={{ padding: "10px 24px", borderRadius: 12, background: G.goldGrad,
                  border: "none", color: "#0a0804", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Browse Bangles
              </button>
            </div>
          ) : items.map(item => (
            <div key={item.product.id}
              style={{ display: "flex", gap: 12, padding: "12px", borderRadius: 14,
                background: G.surface, border: `1px solid ${G.border}` }}>
              <div style={{ width: 72, height: 72, borderRadius: 10, overflow: "hidden",
                flexShrink: 0, background: "#0a0804" }}>
                {item.product.mediaUrl && item.product.mediaType === "image"
                  ? <img src={item.product.mediaUrl} alt={item.product.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                  : <div style={{ width: "100%", height: "100%", display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: 24 }}>💍</div>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: G.cream, lineHeight: 1.3,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.product.name}
                </p>
                <p style={{ fontSize: 12, color: G.textSub, marginTop: 2 }}>{item.product.category}</p>
                <p style={{ fontSize: 14, fontWeight: 800, color: G.gold, marginTop: 4 }}>
                  {fmt(item.product.price * item.qty)}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <button onClick={() => onQtyChange(item.product.id, -1)}
                    style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(212,175,55,0.1)",
                      border: `1px solid ${G.border}`, color: G.gold, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                    {"−"}
                  </button>
                  <span style={{ fontSize: 14, fontWeight: 700, color: G.cream,
                    minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => onQtyChange(item.product.id, 1)}
                    style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(212,175,55,0.1)",
                      border: `1px solid ${G.border}`, color: G.gold, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                    +
                  </button>
                  <button onClick={() => onRemove(item.product.id)}
                    style={{ marginLeft: "auto", color: "#f87171", background: "none",
                      border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <X className="w-3.5 h-3.5"/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: "16px 20px 24px", borderTop: `1px solid ${G.border}`, background: "#12100a" }}>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 14, color: G.textSub }}>Subtotal</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: G.gold }}>{fmt(subtotal)}</span>
            </div>
            <a href={buildWhatsAppUrl(waText)} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", padding: "14px", borderRadius: 14, fontSize: 15, fontWeight: 700,
                background: G.waGreen, color: "white", textDecoration: "none",
                boxShadow: `0 4px 20px rgba(37,211,102,0.3)` }}>
              <MessageCircle className="w-5 h-5"/> Order via WhatsApp
            </a>
            <p style={{ fontSize: 11, color: G.textFaint, textAlign: "center", marginTop: 10 }}>
              We will confirm your order and share payment details via WhatsApp
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Product Detail Modal ─────────────────────────────────────────────────────

function ProductDetailModal({ p, wishlist, toggleWish, onAddToCart, onClose }: {
  p: Product;
  wishlist: Set<string>;
  toggleWish: (id: string) => void;
  onAddToCart: (p: Product) => void;
  onClose: () => void;
}) {
  const disc = discount(p.originalPrice, p.price);
  const { rating, count } = mockRating(p.id);
  const wished = wishlist.has(p.id);
  const waText = `Hi! I'd like to buy *${p.name}* priced at ${fmt(p.price)} from One Spot Bangles. Please share payment details.`;

  return (
    <>
      <div onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
          zIndex: 300, backdropFilter: "blur(6px)" }}/>
      <div style={{ position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)", zIndex: 301,
        width: "min(680px, 94vw)", maxHeight: "90vh", overflowY: "auto",
        background: "#15100a", border: `1px solid ${G.borderBright}`, borderRadius: 24 }}>

        {/* Close button */}
        <button onClick={onClose}
          style={{ position: "absolute", top: 14, right: 14, zIndex: 10,
            width: 36, height: 36, borderRadius: 12, background: "rgba(10,8,4,0.85)",
            border: `1px solid ${G.border}`, color: G.textSub, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)" }}>
          <X className="w-4 h-4"/>
        </button>

        {/* Media */}
        <div style={{ aspectRatio: "4/3", background: "#0a0804",
          borderRadius: "24px 24px 0 0", overflow: "hidden" }}>
          {p.mediaUrl ? (
            p.mediaType === "video"
              ? <VideoCard src={p.mediaUrl}/>
              : <img src={p.mediaUrl} alt={p.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 64 }}>💍</div>
          )}
          {disc && (
            <div style={{ position: "absolute", top: 16, left: 16, padding: "5px 12px",
              borderRadius: 10, background: "#dc2626", fontSize: 13, fontWeight: 800, color: "white" }}>
              {disc}% OFF
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "24px 28px 28px" }}>
          <div style={{ display: "flex", alignItems: "flex-start",
            justifyContent: "space-between", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8,
                  background: `${G.gold}18`, color: G.gold }}>{p.category}</span>
                {p.featured && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8,
                    background: G.goldGrad, color: "#0a0804" }}>Featured</span>
                )}
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: G.cream,
                lineHeight: 1.25, marginBottom: 8 }}>{p.name}</h2>
              <StarRow rating={rating} count={count}/>
            </div>
            <button onClick={() => toggleWish(p.id)}
              style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: wished ? `rgba(192,120,88,0.2)` : G.surface,
                border: `1px solid ${wished ? G.rose : G.border}`,
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Heart className="w-5 h-5"
                style={{ color: wished ? G.roseLight : G.textSub, fill: wished ? G.roseLight : "none" }}/>
            </button>
          </div>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "18px 0" }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: G.gold }}>{fmt(p.price)}</span>
            {p.originalPrice && (
              <span style={{ fontSize: 16, color: G.textFaint, textDecoration: "line-through" }}>
                {fmt(p.originalPrice)}
              </span>
            )}
            {disc && <span style={{ fontSize: 14, fontWeight: 700, color: "#4ade80" }}>{disc}% off</span>}
          </div>

          <p style={{ fontSize: 14, color: G.textSub, lineHeight: 1.7, marginBottom: 16 }}>
            {p.description || "Handcrafted with precision and love. This beautiful piece combines traditional artistry with modern design sensibilities."}
          </p>

          {/* Meta chips */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            {[
              { label: "Material",     value: p.material || "Premium Quality"          },
              { label: "Availability", value: p.inStock ? "In Stock" : "Out of Stock"  },
              { label: "Category",     value: p.category                               },
            ].map(m => (
              <div key={m.label} style={{ padding: "8px 14px", borderRadius: 10,
                background: G.surface, border: `1px solid ${G.border}` }}>
                <p style={{ fontSize: 10, color: G.textFaint, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.label}</p>
                <p style={{ fontSize: 13, color: G.textPrimary, fontWeight: 600, marginTop: 2 }}>
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => { onAddToCart(p); onClose(); }} disabled={!p.inStock}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, padding: "14px", borderRadius: 14, fontSize: 14, fontWeight: 700,
                background: p.inStock ? G.goldGrad : "rgba(255,255,255,0.05)",
                color: p.inStock ? "#0a0804" : G.textFaint, border: "none",
                cursor: p.inStock ? "pointer" : "not-allowed",
                boxShadow: p.inStock ? `0 4px 20px rgba(212,175,55,0.3)` : "none" }}>
              <ShoppingCart className="w-4 h-4"/> Add to Cart
            </button>
            <a href={buildWhatsAppUrl(waText)} target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, padding: "14px", borderRadius: 14, fontSize: 14, fontWeight: 700,
                background: G.waGreen, color: "white", textDecoration: "none",
                boxShadow: `0 4px 20px rgba(37,211,102,0.25)` }}>
              <MessageCircle className="w-4 h-4"/> Buy on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Toast Container ──────────────────────────────────────────────────────────

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 500,
      display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
      {toasts.map(t => (
        <div key={t.id}
          style={{ padding: "12px 18px", borderRadius: 14, fontSize: 13, fontWeight: 600,
            background: t.type === "cart" ? "#1a140c" : "#1a0e14",
            border: `1px solid ${t.type === "cart" ? G.gold : G.rose}`,
            color: t.type === "cart" ? G.gold : G.roseLight,
            display: "flex", alignItems: "center", gap: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)", backdropFilter: "blur(12px)",
            animation: "toastIn 0.3s ease" }}>
          {t.type === "cart"
            ? <ShoppingCart className="w-4 h-4"/>
            : <Heart className="w-4 h-4"/>}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const BLANK_FORM    = { name:"", description:"", price:"", originalPrice:"", category:"Gold", material:"", inStock:true, featured:false };
const BLANK_BOOKING = { customerName:"", customerPhone:"", customerEmail:"", note:"" };

export default function OneSpotBanglesPage() {
  // ── Existing state ──
  const [products,     setProducts]     = useState<Product[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterCat,    setFilterCat]    = useState<Category>("All");
  const [wishlist,     setWishlist]     = useState<Set<string>>(new Set());
  const [isAdmin,      setIsAdmin]      = useState(false);
  const [adminPass,    setAdminPass]    = useState("");
  const [showAdmin,    setShowAdmin]    = useState(false);
  const [showForm,     setShowForm]     = useState(false);
  const [editId,       setEditId]       = useState<string|null>(null);
  const [form,         setForm]         = useState(BLANK_FORM);
  const [mediaFile,    setMediaFile]    = useState<File|null>(null);
  const [mediaPreview, setMediaPreview] = useState<{url:string;type:MediaType}|null>(null);
  const [uploading,    setUploading]    = useState(false);
  const [saving,       setSaving]       = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Booking + AI state ──
  const [descGenerating, setDescGenerating] = useState(false);
  const [bookingProduct, setBookingProduct] = useState<Product|null>(null);
  const [bookingForm,    setBookingForm]    = useState(BLANK_BOOKING);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // ── New state ──
  const [cartItems,    setCartItems]    = useState<CartItem[]>([]);
  const [showCart,     setShowCart]     = useState(false);
  const [productModal, setProductModal] = useState<Product|null>(null);
  const [toasts,       setToasts]       = useState<Toast[]>([]);
  const [sort,         setSort]         = useState<SortOption>("featured");
  const [showSortDD,   setShowSortDD]   = useState(false);
  const toastIdRef = useRef(0);

  // ── Load products ──
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/one-spot-bangles3/products");
      const { products: p } = await res.json();
      setProducts(p ?? []);
    } catch { setProducts([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Wishlist persist ──
  useEffect(() => {
    try { const w = localStorage.getItem("bangle_wish"); if (w) setWishlist(new Set(JSON.parse(w))); } catch {}
  }, []);

  // ── Cart persist ──
  useEffect(() => {
    try { const c = localStorage.getItem("bangle_cart"); if (c) setCartItems(JSON.parse(c)); } catch {}
  }, []);

  const persistCart = (items: CartItem[]) => {
    try { localStorage.setItem("bangle_cart", JSON.stringify(items)); } catch {}
  };

  // ── Toast ──
  const showToast = (message: string, type: "cart" | "wish") => {
    const id = ++toastIdRef.current;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2500);
  };

  // ── Wishlist ──
  const toggleWish = (id: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      const adding = !next.has(id);
      adding ? next.add(id) : next.delete(id);
      localStorage.setItem("bangle_wish", JSON.stringify(Array.from(next)));
      showToast(adding ? "Added to wishlist" : "Removed from wishlist", "wish");
      return next;
    });
  };

  // ── Cart ──
  const addToCart = (p: Product) => {
    if (!p.inStock) return;
    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === p.id);
      const updated = existing
        ? prev.map(i => i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { product: p, qty: 1 }];
      persistCart(updated);
      return updated;
    });
    const name = p.name.length > 28 ? p.name.slice(0, 28) + "…" : p.name;
    showToast(`${name} added to cart`, "cart");
  };

  const changeQty = (productId: string, delta: number) => {
    setCartItems(prev => {
      const updated = prev
        .map(i => i.product.id === productId ? { ...i, qty: i.qty + delta } : i)
        .filter(i => i.qty > 0);
      persistCart(updated);
      return updated;
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => {
      const updated = prev.filter(i => i.product.id !== productId);
      persistCart(updated);
      return updated;
    });
  };

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  // ── Admin ──
  const tryLogin = () => {
    if (adminPass === "onespot2025" || adminPass === "admin123") { setIsAdmin(true); setShowAdmin(false); }
    else alert("Wrong password");
  };

  // ── File ──
  const handleFile = (file: File) => {
    setMediaFile(file);
    const url = URL.createObjectURL(file);
    setMediaPreview({ url, type: file.type.startsWith("video/") ? "video" : "image" });
  };

  const openForm = (p?: Product) => {
    if (p) {
      setEditId(p.id);
      setForm({ name: p.name, description: p.description, price: String(p.price),
        originalPrice: String(p.originalPrice ?? ""), category: p.category,
        material: p.material, inStock: p.inStock, featured: p.featured });
      setMediaPreview(p.mediaUrl ? { url: p.mediaUrl, type: p.mediaType } : null);
    } else {
      setEditId(null); setForm(BLANK_FORM); setMediaPreview(null); setMediaFile(null);
    }
    setShowForm(true);
  };

  const saveProduct = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      let mediaUrl: string = mediaPreview?.url ?? "";
      let mediaType: MediaType = mediaPreview?.type ?? "image";
      if (mediaFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", mediaFile);
        const res  = await fetch("/api/one-spot-bangles3/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.url) { mediaUrl = data.url; mediaType = data.type; }
        setUploading(false);
      }
      const payload = {
        ...form, price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        mediaUrl, mediaType,
      };
      if (editId) {
        await fetch(`/api/one-spot-bangles3/products/${editId}`,
          { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        await fetch("/api/one-spot-bangles3/products",
          { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }
      await load();
      setShowForm(false); setEditId(null); setForm(BLANK_FORM); setMediaFile(null); setMediaPreview(null);
    } catch (e) { alert("Error: " + String(e)); } finally { setSaving(false); }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/one-spot-bangles3/products/${id}`, { method: "DELETE" });
    await load();
  };

  const generateDescription = async () => {
    if (!form.name) return;
    setDescGenerating(true);
    setForm(f => ({ ...f, description: "" }));
    try {
      const res = await fetch("/api/one-spot-bangles3/generate-description", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, category: form.category, material: form.material, price: form.price }),
      });
      const reader = res.body?.getReader();
      const dec = new TextDecoder();
      if (!reader) return;
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try { const { text } = JSON.parse(line.slice(6)); setForm(f => ({ ...f, description: f.description + text })); } catch {}
          }
        }
      }
    } catch (e) { console.error(e); } finally { setDescGenerating(false); }
  };

  const openBooking = (p: Product) => {
    setBookingProduct(p);
    setBookingForm(BLANK_BOOKING);
    setBookingSuccess(false);
  };

  const submitBooking = async () => {
    if (!bookingProduct || !bookingForm.customerName || !bookingForm.customerPhone) return;
    setBookingLoading(true);
    try {
      const res = await fetch("/api/one-spot-bangles3/book", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: bookingProduct.id,
          productName: bookingProduct.name,
          price: bookingProduct.price,
          customerName: bookingForm.customerName,
          customerPhone: bookingForm.customerPhone,
          customerEmail: bookingForm.customerEmail || undefined,
          note: bookingForm.note || undefined,
        }),
      });
      const data = await res.json();
      if (data.ok) setBookingSuccess(true);
      else alert("Booking failed: " + (data.error || "Unknown error"));
    } catch (e) { alert("Error: " + String(e)); } finally { setBookingLoading(false); }
  };

  // ── Filter + Sort ──
  const filtered = (() => {
    let list = products.filter(p => {
      const matchCat    = filterCat === "All" || p.category === filterCat;
      const matchSearch = !search
        || p.name.toLowerCase().includes(search.toLowerCase())
        || p.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
    if (sort === "price_asc")  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "newest")     list = [...list].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sort === "featured")   list = [...list].sort((a, b) =>
      (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return list;
  })();

  const sortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label ?? "Featured";

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: G.bg, color: G.textPrimary,
      fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>

      {/* Ambient glow */}
      <div style={{ position: "fixed", top: -200, left: "50%", transform: "translateX(-50%)",
        width: 800, height: 400, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse,rgba(212,175,55,0.07) 0%,transparent 70%)" }}/>

      {/* ═══════════════════════════════════ STICKY HEADER ═══════════════════ */}
      <header style={{ position: "sticky", top: 0, zIndex: 100,
        background: G.headerBg, borderBottom: `1px solid ${G.border}`,
        backdropFilter: "blur(20px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px",
          height: 68, display: "flex", alignItems: "center", gap: 14 }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: G.goldGrad,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              boxShadow: `0 3px 14px rgba(212,175,55,0.3)` }}>💍</div>
            <span style={{ fontSize: 15, fontWeight: 900, color: G.cream,
              letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>One Spot Bangles</span>
          </div>

          {/* Search */}
          <div style={{ flex: 1, position: "relative", maxWidth: 480, margin: "0 auto" }}>
            <Search className="w-4 h-4" style={{ position: "absolute", left: 13, top: "50%",
              transform: "translateY(-50%)", color: G.textFaint }}/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search bangles, gold, silver, bridal..."
              style={{ ...inputStyle, paddingLeft: 38, borderRadius: 24, height: 40,
                background: "rgba(212,175,55,0.05)", fontSize: 13 }}/>
          </div>

          {/* Icons */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

            {/* Wishlist */}
            <div style={{ position: "relative", width: 40, height: 40, borderRadius: 12,
              background: G.surface, border: `1px solid ${G.border}`,
              display: "flex", alignItems: "center", justifyContent: "center", color: G.roseLight }}>
              <Heart className="w-4 h-4"/>
              {wishlist.size > 0 && (
                <span style={{ position: "absolute", top: -6, right: -6, minWidth: 18, height: 18,
                  borderRadius: 9, background: G.rose, color: "white", fontSize: 10,
                  fontWeight: 800, display: "flex", alignItems: "center",
                  justifyContent: "center", padding: "0 4px" }}>{wishlist.size}</span>
              )}
            </div>

            {/* Cart */}
            <button onClick={() => setShowCart(true)}
              style={{ position: "relative", width: 40, height: 40, borderRadius: 12,
                background: cartCount > 0 ? `rgba(212,175,55,0.15)` : G.surface,
                border: `1px solid ${cartCount > 0 ? G.borderBright : G.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: G.gold }}>
              <ShoppingCart className="w-4 h-4"/>
              {cartCount > 0 && (
                <span style={{ position: "absolute", top: -6, right: -6, minWidth: 18, height: 18,
                  borderRadius: 9, background: G.gold, color: "#0a0804", fontSize: 10,
                  fontWeight: 800, display: "flex", alignItems: "center",
                  justifyContent: "center", padding: "0 4px" }}>{cartCount}</span>
              )}
            </button>

            {/* Admin / Add */}
            {!isAdmin ? (
              <button onClick={() => setShowAdmin(true)}
                style={{ padding: "8px 14px", borderRadius: 12, background: G.surface,
                  border: `1px solid ${G.border}`, color: G.textSub, fontSize: 12,
                  fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                Admin
              </button>
            ) : (
              <button onClick={() => openForm()}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                  borderRadius: 12, background: G.goldGrad, border: "none", color: "#0a0804",
                  fontSize: 12, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>
                <Plus className="w-3.5 h-3.5"/> Add Bangle
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════ HERO BANNER ═════════════════════ */}
      <div style={{ position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #0a0804 0%, #1a1004 40%, #0e0c06 100%)",
        borderBottom: `1px solid ${G.border}` }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320,
          borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)" }}/>
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240,
          borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(192,120,88,0.06) 0%, transparent 70%)" }}/>

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "52px 24px 44px",
          position: "relative", zIndex: 1, textAlign: "center" }}>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px",
            borderRadius: 20, background: `rgba(212,175,55,0.12)`, border: `1px solid ${G.border}`,
            marginBottom: 20 }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: G.gold }}/>
            <span style={{ fontSize: 12, color: G.gold, fontWeight: 700, letterSpacing: "0.05em" }}>
              BANGALORE&apos;S FINEST JEWELLERY
            </span>
          </div>

          <h1 style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 900,
            letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
            <span style={{ background: `linear-gradient(135deg, ${G.goldLight}, ${G.gold}, ${G.roseLight})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Elegance in Every Bangle
            </span>
          </h1>
          <p style={{ fontSize: "clamp(14px, 2vw, 17px)", color: G.textSub, maxWidth: 520,
            margin: "0 auto 28px", lineHeight: 1.65 }}>
            Handcrafted bangles from our family to yours. Gold, silver, diamond &amp; more
            &mdash; curated with love from Bangalore.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <button
              onClick={() => {
                const el = document.getElementById("products-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 26px",
                borderRadius: 14, background: G.goldGrad, border: "none", color: "#0a0804",
                fontSize: 14, fontWeight: 800, cursor: "pointer",
                boxShadow: `0 6px 24px rgba(212,175,55,0.35)` }}>
              <Sparkles className="w-4 h-4"/> Shop Now
            </button>
            <a href="tel:+919876543210"
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 26px",
                borderRadius: 14, background: "transparent",
                border: `1.5px solid ${G.border}`, color: G.cream,
                fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              <Phone className="w-4 h-4" style={{ color: G.gold }}/> Call Us
            </a>
          </div>
        </div>

        {/* Feature pills strip */}
        <div style={{ borderTop: `1px solid ${G.border}`, padding: "18px 24px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex",
            justifyContent: "center", flexWrap: "wrap", gap: 12 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ display: "flex", alignItems: "center", gap: 10,
                padding: "10px 18px", borderRadius: 14,
                background: G.surface, border: `1px solid ${G.border}` }}>
                <span style={{ color: G.gold }}>{f.icon}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: G.cream }}>{f.title}</p>
                  <p style={{ fontSize: 10, color: G.textSub }}>{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════ CATEGORY STRIP ══════════════════ */}
      <div style={{ borderBottom: `1px solid ${G.border}`, background: "#0e0b07",
        position: "sticky", top: 68, zIndex: 90 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px",
          display: "flex", alignItems: "center", gap: 8, overflowX: "auto",
          height: 52 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              style={{ flexShrink: 0, padding: "6px 18px", borderRadius: 20, fontSize: 13,
                fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                background: filterCat === c ? G.goldGrad : "transparent",
                border: `1px solid ${filterCat === c ? G.gold : G.border}`,
                color: filterCat === c ? "#0a0804" : G.textSub, whiteSpace: "nowrap" }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════ MAIN CONTENT ════════════════════ */}
      <div id="products-section" style={{ maxWidth: 1280, margin: "0 auto",
        padding: "28px 20px 72px", position: "relative", zIndex: 1 }}>

        {/* Sort bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 14, color: G.textSub }}>
            <span style={{ color: G.cream, fontWeight: 700 }}>{filtered.length}</span> results
            {filterCat !== "All" && (
              <span> in <span style={{ color: G.gold, fontWeight: 700 }}>{filterCat}</span></span>
            )}
            {search && (
              <span> for &ldquo;<span style={{ color: G.cream }}>{search}</span>&rdquo;</span>
            )}
          </p>

          <div style={{ position: "relative" }}>
            <button onClick={() => setShowSortDD(s => !s)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
                borderRadius: 12, background: G.surface, border: `1px solid ${G.border}`,
                color: G.textPrimary, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <ArrowUpDown className="w-3.5 h-3.5" style={{ color: G.gold }}/>
              {sortLabel}
              {showSortDD ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>}
            </button>
            {showSortDD && (
              <>
                <div onClick={() => setShowSortDD(false)}
                  style={{ position: "fixed", inset: 0, zIndex: 50 }}/>
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 51,
                  background: "#1a140c", border: `1px solid ${G.borderBright}`, borderRadius: 14,
                  overflow: "hidden", minWidth: 200, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
                  {SORT_OPTIONS.map(o => (
                    <button key={o.value} onClick={() => { setSort(o.value); setShowSortDD(false); }}
                      style={{ width: "100%", padding: "11px 18px", textAlign: "left",
                        background: sort === o.value ? `rgba(212,175,55,0.12)` : "none",
                        border: "none", color: sort === o.value ? G.gold : G.textPrimary,
                        fontSize: 13, fontWeight: sort === o.value ? 700 : 400, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      {o.label}
                      {sort === o.value && <Check className="w-3.5 h-3.5"/>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Products grid */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <Loader2 className="w-8 h-8"
              style={{ color: G.gold, animation: "spin 1s linear infinite" }}/>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>💍</div>
            <p style={{ fontSize: 16, color: G.textSub, fontWeight: 600 }}>No bangles found</p>
            <p style={{ fontSize: 13, color: G.textFaint, marginTop: 8 }}>
              Try adjusting your search or category filter
            </p>
            <button onClick={() => { setSearch(""); setFilterCat("All"); }}
              style={{ marginTop: 20, padding: "10px 24px", borderRadius: 12,
                background: G.goldGrad, border: "none", color: "#0a0804",
                fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
            {filtered.map(p => (
              <ProductCard key={p.id} p={p} onEdit={openForm} onDelete={deleteProduct}
                isAdmin={isAdmin} wishlist={wishlist} toggleWish={toggleWish}
                onAddToCart={addToCart} onOpenDetail={setProductModal} onBook={openBooking}/>
            ))}
          </div>
        )}

        {/* Owners section */}
        <div style={{ marginTop: 72, borderRadius: 24, overflow: "hidden",
          border: `1px solid ${G.border}`,
          background: "linear-gradient(135deg,rgba(212,175,55,0.05) 0%,rgba(192,120,88,0.05) 100%)" }}>
          <div style={{ padding: "32px 28px 24px", textAlign: "center",
            borderBottom: `1px solid ${G.border}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: G.gold,
              textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>About Us</p>
            <h3 style={{ fontSize: 24, fontWeight: 900, color: G.cream, marginBottom: 10 }}>
              The Faces Behind One Spot Bangles
            </h3>
            <p style={{ fontSize: 13, color: G.textSub, maxWidth: 480, margin: "0 auto" }}>
              A family-run jewellery business bringing you authentic, affordable bangles from the heart of Bangalore.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            {OWNERS.map((o, i) => (
              <div key={o.name} style={{ padding: "28px 20px", textAlign: "center",
                borderRight: i < OWNERS.length - 1 ? `1px solid ${G.border}` : "none" }}>
                <div style={{ width: 68, height: 68, borderRadius: 34,
                  background: `linear-gradient(135deg,rgba(212,175,55,0.3),rgba(192,120,88,0.3))`,
                  border: `2px solid rgba(212,175,55,0.5)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 30, margin: "0 auto 14px" }}>{o.emoji}</div>
                <p style={{ fontSize: 17, fontWeight: 800, color: G.cream, marginBottom: 4 }}>{o.name}</p>
                <p style={{ fontSize: 12, color: G.textSub }}>{o.role}</p>
              </div>
            ))}
          </div>
          <div style={{ padding: "20px 28px", borderTop: `1px solid ${G.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 24, flexWrap: "wrap" }}>
            {[
              { icon: <MapPin    className="w-4 h-4"/>, text: "Magdi Road, Bangalore City — 560023" },
              { icon: <Phone     className="w-4 h-4"/>, text: "+91 98765 43210"                          },
              { icon: <Instagram className="w-4 h-4"/>, text: "@onespotbangles"                          },
            ].map(item => (
              <div key={item.text} style={{ display: "flex", alignItems: "center",
                gap: 8, color: G.textSub, fontSize: 13 }}>
                <span style={{ color: G.gold }}>{item.icon}</span>{item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, textAlign: "center",
          borderTop: `1px solid ${G.border}`, paddingTop: 28 }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>💍</div>
          <p style={{ fontSize: 18, fontWeight: 900, color: G.cream, marginBottom: 4 }}>One Spot Bangles</p>
          <p style={{ fontSize: 13, color: G.textFaint }}>
            Magdi Road, Bangalore City &middot; +91 98765 43210
          </p>
          <p style={{ fontSize: 12, color: G.textFaint, marginTop: 20 }}>
            &copy; {new Date().getFullYear()} One Spot Bangles &middot; All rights reserved
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════ CART DRAWER ═════════════════════ */}
      {showCart && (
        <CartDrawer items={cartItems} onClose={() => setShowCart(false)}
          onQtyChange={changeQty} onRemove={removeFromCart}/>
      )}

      {/* ═══════════════════════════════════ PRODUCT DETAIL ══════════════════ */}
      {productModal && (
        <ProductDetailModal p={productModal} wishlist={wishlist} toggleWish={toggleWish}
          onAddToCart={addToCart} onClose={() => setProductModal(null)}/>
      )}

      {/* ═══════════════════════════════════ ADMIN LOGIN ═════════════════════ */}
      {showAdmin && (
        <>
          <div onClick={() => setShowAdmin(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
              zIndex: 400, backdropFilter: "blur(4px)" }}/>
          <div style={{ position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)", zIndex: 401,
            background: "#1a1008", border: `1px solid ${G.borderBright}`,
            borderRadius: 20, padding: "28px 24px", width: 320 }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: G.cream, marginBottom: 16 }}>Admin Login</p>
            <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && tryLogin()}
              placeholder="Enter admin password" style={inputStyle} autoFocus/>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => setShowAdmin(false)}
                style={{ flex: 1, padding: "10px", borderRadius: 10,
                  background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`,
                  color: G.textSub, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={tryLogin}
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: G.goldGrad,
                  border: "none", color: "#0a0804", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Login
              </button>
            </div>
            <p style={{ fontSize: 11, color: G.textFaint, marginTop: 10, textAlign: "center" }}>
              Default: onespot2025
            </p>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════ ADD / EDIT FORM ═════════════════ */}
      {showForm && (
        <>
          <div onClick={() => setShowForm(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
              zIndex: 400, backdropFilter: "blur(4px)" }}/>
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 401,
            borderRadius: "24px 24px 0 0", background: "#150f07",
            border: `1px solid ${G.border}`, borderBottom: "none",
            maxHeight: "92vh", overflowY: "auto", maxWidth: 680, margin: "0 auto" }}>

            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2,
                background: "rgba(212,175,55,0.3)" }}/>
            </div>

            <div style={{ padding: "8px 20px 40px" }}>
              <div style={{ display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 20 }}>
                <p style={{ fontSize: 16, fontWeight: 800, color: G.cream }}>
                  {editId ? "Edit Product" : "Add New Bangle"}
                </p>
                <button onClick={() => setShowForm(false)}
                  style={{ width: 32, height: 32, borderRadius: 10, background: G.surface,
                    border: `1px solid ${G.border}`, display: "flex", alignItems: "center",
                    justifyContent: "center", cursor: "pointer", color: G.textSub }}>
                  <X className="w-4 h-4"/>
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Media upload */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: G.textSub,
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    display: "block", marginBottom: 8 }}>Image or Video</label>
                  <input ref={fileRef} type="file" accept="image/*,video/*"
                    style={{ display: "none" }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}/>
                  {mediaPreview ? (
                    <div style={{ position: "relative", borderRadius: 14, overflow: "hidden",
                      aspectRatio: "16/9", background: "#000" }}>
                      {mediaPreview.type === "video"
                        ? <video src={mediaPreview.url}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} controls/>
                        : <img src={mediaPreview.url} alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}/>}
                      <button onClick={() => { setMediaPreview(null); setMediaFile(null); }}
                        style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28,
                          borderRadius: 14, background: "rgba(0,0,0,0.7)", display: "flex",
                          alignItems: "center", justifyContent: "center", cursor: "pointer",
                          border: `1px solid ${G.border}`, color: G.textSub }}>
                        <X className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => fileRef.current?.click()}
                      style={{ width: "100%", aspectRatio: "16/9", borderRadius: 14,
                        background: G.surface, border: `2px dashed ${G.border}`,
                        display: "flex", flexDirection: "column", alignItems: "center",
                        justifyContent: "center", gap: 10, cursor: "pointer" }}>
                      <div style={{ display: "flex", gap: 12, color: G.gold }}>
                        <ImageIcon className="w-6 h-6"/><Video className="w-6 h-6"/>
                      </div>
                      <p style={{ fontSize: 13, color: G.textSub }}>Click to upload image or video</p>
                      <p style={{ fontSize: 11, color: G.textFaint }}>JPG, PNG, MP4, MOV &mdash; Max 50MB</p>
                    </button>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: G.textSub,
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    display: "block", marginBottom: 6 }}>Product Name *</label>
                  <input style={inputStyle} value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Gold Kundan Bangle Set"/>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: G.textSub,
                      textTransform: "uppercase", letterSpacing: "0.06em" }}>Description</label>
                    <button onClick={generateDescription} disabled={!form.name || descGenerating}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px",
                        borderRadius: 8, background: `linear-gradient(135deg,rgba(212,175,55,0.15),rgba(192,120,88,0.15))`,
                        border: `1px solid rgba(212,175,55,0.4)`, color: G.gold, fontSize: 11, fontWeight: 700,
                        cursor: !form.name || descGenerating ? "not-allowed" : "pointer",
                        opacity: !form.name || descGenerating ? 0.5 : 1 }}>
                      {descGenerating
                        ? <Loader2 className="w-3 h-3" style={{ animation: "spin 1s linear infinite" }}/>
                        : <Sparkles className="w-3 h-3"/>}
                      {descGenerating ? "Generating…" : "✨ AI Description"}
                    </button>
                  </div>
                  <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe the bangle - material, design, set size..."/>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: G.textSub,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      display: "block", marginBottom: 6 }}>Price (&#8377;) *</label>
                    <input type="number" style={inputStyle} value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0"/>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: G.textSub,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      display: "block", marginBottom: 6 }}>Original Price (&#8377;)</label>
                    <input type="number" style={inputStyle} value={form.originalPrice}
                      onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                      placeholder="0 (for discount)"/>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: G.textSub,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      display: "block", marginBottom: 6 }}>Category</label>
                    <select style={inputStyle} value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {["Gold","Silver","Diamond","Bridal","Antique","Fashion","Other"].map(c =>
                        <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: G.textSub,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      display: "block", marginBottom: 6 }}>Material</label>
                    <input style={inputStyle} value={form.material}
                      onChange={e => setForm(f => ({ ...f, material: e.target.value }))}
                      placeholder="e.g. 22K Gold"/>
                  </div>
                </div>

                {/* Toggles */}
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {([ { key: "inStock" as const, label: "In Stock" },
                       { key: "featured" as const, label: "Featured" }
                  ]).map(({ key, label }) => (
                    <label key={key} style={{ display: "flex", alignItems: "center",
                      gap: 10, cursor: "pointer" }}>
                      <div onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                        style={{ width: 44, height: 26, borderRadius: 13, position: "relative",
                          background: form[key] ? G.goldGrad : "rgba(255,255,255,0.1)",
                          cursor: "pointer" }}>
                        <div style={{ position: "absolute", top: 4, width: 18, height: 18,
                          borderRadius: 9, background: "white",
                          left: form[key] ? "22px" : "4px",
                          transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }}/>
                      </div>
                      <span style={{ fontSize: 13, color: G.textSub }}>{label}</span>
                    </label>
                  ))}
                </div>

                <button onClick={saveProduct} disabled={!form.name || !form.price || saving}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 8, padding: "15px", borderRadius: 14, fontSize: 14, fontWeight: 700,
                    border: "none",
                    background: (!form.name || !form.price) ? G.surface : G.goldGrad,
                    color: (!form.name || !form.price) ? G.textFaint : "#0a0804",
                    cursor: (!form.name || !form.price) ? "not-allowed" : "pointer",
                    opacity: saving ? 0.7 : 1,
                    boxShadow: (!form.name || !form.price) ? "none" : `0 4px 20px rgba(212,175,55,0.3)` }}>
                  {saving || uploading
                    ? <Loader2 className="w-4 h-4" style={{ animation: "spin 1s linear infinite" }}/>
                    : <Check className="w-4 h-4"/>}
                  {uploading ? "Uploading media..." : saving ? "Saving..." : editId ? "Save Changes" : "Add Bangle"}
                </button>

              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════ BOOKING MODAL ══════════════════ */}
      {bookingProduct && (
        <>
          <div onClick={() => { setBookingProduct(null); setBookingSuccess(false); }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 500, backdropFilter: "blur(4px)" }}/>
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 501,
            borderRadius: "24px 24px 0 0", background: "#150f07",
            border: `1px solid ${G.border}`, borderBottom: "none",
            maxHeight: "90vh", overflowY: "auto", maxWidth: 520, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(212,175,55,0.3)" }}/>
            </div>
            <div style={{ padding: "8px 20px 48px" }}>
              {bookingSuccess ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ width: 72, height: 72, borderRadius: 36,
                    background: G.goldGrad, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 32, margin: "0 auto 18px",
                    boxShadow: `0 6px 24px rgba(212,175,55,0.4)` }}>✓</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: G.cream, marginBottom: 10 }}>Booking Confirmed!</h3>
                  <p style={{ fontSize: 14, color: G.textSub, lineHeight: 1.7 }}>
                    Your booking for <strong style={{ color: G.gold }}>{bookingProduct.name}</strong> has been received.
                    <br/>The store owner has been notified and will contact you shortly.
                  </p>
                  <button onClick={() => { setBookingProduct(null); setBookingSuccess(false); }}
                    style={{ marginTop: 24, padding: "12px 36px", borderRadius: 14, background: G.goldGrad,
                      border: "none", color: "#0a0804", fontSize: 14, fontWeight: 700, cursor: "pointer",
                      boxShadow: `0 4px 20px rgba(212,175,55,0.3)` }}>
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 800, color: G.cream }}>Book This Bangle</p>
                      <p style={{ fontSize: 12, color: G.gold, marginTop: 3 }}>
                        {bookingProduct.name} — {fmt(bookingProduct.price)}
                      </p>
                    </div>
                    <button onClick={() => setBookingProduct(null)}
                      style={{ width: 32, height: 32, borderRadius: 10, background: G.surface,
                        border: `1px solid ${G.border}`, display: "flex", alignItems: "center",
                        justifyContent: "center", cursor: "pointer", color: G.textSub }}>
                      <X className="w-4 h-4"/>
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: G.textSub,
                        textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
                        Your Name *
                      </label>
                      <input style={inputStyle} value={bookingForm.customerName}
                        onChange={e => setBookingForm(f => ({ ...f, customerName: e.target.value }))}
                        placeholder="Full name"/>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: G.textSub,
                        textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
                        Phone Number *
                      </label>
                      <input style={inputStyle} value={bookingForm.customerPhone} type="tel"
                        onChange={e => setBookingForm(f => ({ ...f, customerPhone: e.target.value }))}
                        placeholder="+91 98765 43210"/>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: G.textSub,
                        textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
                        Email (optional)
                      </label>
                      <input style={inputStyle} value={bookingForm.customerEmail} type="email"
                        onChange={e => setBookingForm(f => ({ ...f, customerEmail: e.target.value }))}
                        placeholder="your@email.com"/>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: G.textSub,
                        textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
                        Note (optional)
                      </label>
                      <textarea style={{ ...inputStyle, minHeight: 64, resize: "vertical" }}
                        value={bookingForm.note}
                        onChange={e => setBookingForm(f => ({ ...f, note: e.target.value }))}
                        placeholder="Size, delivery address, occasion..."/>
                    </div>

                    <button onClick={submitBooking}
                      disabled={!bookingForm.customerName || !bookingForm.customerPhone || bookingLoading}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        padding: "14px", borderRadius: 14, fontSize: 14, fontWeight: 700, border: "none",
                        background: (!bookingForm.customerName || !bookingForm.customerPhone) ? G.surface : G.goldGrad,
                        color: (!bookingForm.customerName || !bookingForm.customerPhone) ? G.textFaint : "#0a0804",
                        cursor: (!bookingForm.customerName || !bookingForm.customerPhone) ? "not-allowed" : "pointer",
                        opacity: bookingLoading ? 0.7 : 1,
                        boxShadow: (!bookingForm.customerName || !bookingForm.customerPhone) ? "none" : `0 4px 20px rgba(212,175,55,0.3)` }}>
                      {bookingLoading
                        ? <Loader2 className="w-4 h-4" style={{ animation: "spin 1s linear infinite" }}/>
                        : <Send className="w-4 h-4"/>}
                      {bookingLoading ? "Sending…" : "Confirm Booking"}
                    </button>

                    <p style={{ fontSize: 11, color: G.textFaint, textAlign: "center" }}>
                      📲 The owner will be notified via Telegram and contact you shortly to confirm.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════ TOASTS ══════════════════════════ */}
      <ToastContainer toasts={toasts}/>

      <style>{`
        * { box-sizing: border-box; }
        select option { background: #1a1008; color: #f5e6c8; }
        textarea { font-family: inherit; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.25); border-radius: 4px; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
