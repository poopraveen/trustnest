"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Brain, ArrowRight, RefreshCw, Loader2, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"] as const;
const SUITS = ["♠","♥","♦","♣"] as const;
type Rank = typeof RANKS[number];
type Suit = typeof SUITS[number];

interface Card { id: string; rank: Rank; suit: Suit; }

type TabId = "hand" | "strategy" | "probability" | "opponents" | "stats" | "training" | "livegame";
type RiskLevel = "Low" | "Medium" | "High";
type TrainingMode = "Beginner" | "Intermediate" | "Expert";

interface NearComplete { cards: Card[]; needing: string; type: string; }

interface Analysis {
  pureSeqs: Card[][];
  impureSeqs: Card[][];
  sets: Card[][];
  deadwood: Card[];
  deadwoodPts: number;
  bestDiscard: Card | null;
  bestPickup: "open" | "closed";
  canDeclare: boolean;
  riskLevel: RiskLevel;
  estTurns: number;
  nearComplete: NearComplete[];
}

interface SessionRecord {
  hand: Card[];
  result: "win" | "loss" | "ongoing";
  score: number;
  date: string;
}

interface StatsData {
  wins: number;
  losses: number;
  avgScore: number;
  sessions: number;
}

// ─── Pure Logic Functions ──────────────────────────────────────────────────

function deckCount(players: number): number {
  if (players <= 5) return 2;
  if (players <= 7) return 3;
  return 4; // 8–9 players need 4 decks
}

// Printed Joker (the actual joker card in the deck) is stored as rank "PJ"
const isPJ = (c: Card) => (c.rank as string) === "PJ";
// A card is any joker (wild rank OR printed joker)
const isAnyJoker = (c: Card, jokerRank: Rank | null) =>
  isPJ(c) || (jokerRank !== null && c.rank === jokerRank);

function rankVal(r: Rank): number {
  return RANKS.indexOf(r) + 1; // A=1, 2=2, ...K=13
}

function cardPts(r: Rank): number {
  if ((r as string) === "PJ") return 0; // printed joker = 0 pts
  if (r === "A") return 1;
  if (r === "J" || r === "Q" || r === "K") return 10;
  return parseInt(r, 10);
}

function cardKey(c: Card): string {
  return `${c.rank}${c.suit}`;
}

function sameGroup(a: Card[], b: Card[]): boolean {
  if (a.length !== b.length) return false;
  const aKeys = a.map(cardKey).sort().join(",");
  const bKeys = b.map(cardKey).sort().join(",");
  return aKeys === bKeys;
}

function findPureSequences(hand: Card[], jokerRank: Rank | null): Card[][] {
  const seqs: Card[][] = [];
  const bySuit: Record<string, Card[]> = { "♠": [], "♥": [], "♦": [], "♣": [] };

  for (const c of hand) {
    if (isAnyJoker(c, jokerRank)) continue;
    bySuit[c.suit].push(c);
  }

  for (const suit of SUITS) {
    const cards = bySuit[suit].sort((a, b) => rankVal(a.rank) - rankVal(b.rank));
    if (cards.length < 3) continue;

    // Standard consecutive runs
    let run: Card[] = [cards[0]];
    for (let i = 1; i < cards.length; i++) {
      const prev = cards[i - 1];
      const curr = cards[i];
      if (rankVal(curr.rank) === rankVal(prev.rank) + 1) {
        run.push(curr);
      } else if (rankVal(curr.rank) === rankVal(prev.rank)) {
        // duplicate rank — skip
        continue;
      } else {
        if (run.length >= 3) seqs.push([...run]);
        run = [curr];
      }
    }
    if (run.length >= 3) seqs.push([...run]);

    // Check Q-K-A (high ace wrap)
    const hasA = cards.find(c => c.rank === "A");
    const hasQ = cards.find(c => c.rank === "Q");
    const hasK = cards.find(c => c.rank === "K");
    if (hasA && hasQ && hasK) {
      const qka: Card[] = [hasQ, hasK, hasA];
      if (!seqs.some(s => sameGroup(s, qka))) seqs.push(qka);
    }
  }

  return seqs;
}

function findImpureSequences(hand: Card[], jokerRank: Rank | null, maxJokers: number): Card[][] {
  const seqs: Card[][] = [];
  const jokers = hand.filter(c => isAnyJoker(c, jokerRank));
  const nonJokers = hand.filter(c => !isAnyJoker(c, jokerRank));

  const bySuit: Record<string, Card[]> = { "♠": [], "♥": [], "♦": [], "♣": [] };
  for (const c of nonJokers) bySuit[c.suit].push(c);

  for (const suit of SUITS) {
    const cards = bySuit[suit].sort((a, b) => rankVal(a.rank) - rankVal(b.rank));
    if (cards.length < 2) continue;

    // Try all pairs with joker fill
    for (let start = 0; start < cards.length - 1; start++) {
      for (let end = start + 1; end < cards.length; end++) {
        const slice = cards.slice(start, end + 1);
        const minVal = rankVal(slice[0].rank);
        const maxVal = rankVal(slice[slice.length - 1].rank);
        const span = maxVal - minVal + 1;
        const gaps = span - slice.length;
        if (gaps > 0 && gaps <= Math.min(maxJokers, jokers.length) && span >= 3) {
          const seq: Card[] = [...slice, ...jokers.slice(0, gaps)];
          if (!seqs.some(s => sameGroup(s, seq))) seqs.push(seq);
        }
      }
    }

    // Runs of 2 that need joker extension to 3
    let run: Card[] = [cards[0]];
    for (let i = 1; i < cards.length; i++) {
      if (rankVal(cards[i].rank) === rankVal(cards[i - 1].rank) + 1) {
        run.push(cards[i]);
      } else {
        if (run.length === 2 && jokers.length >= 1) {
          const ext = [...run, jokers[0]];
          if (!seqs.some(s => sameGroup(s, ext))) seqs.push(ext);
        }
        run = [cards[i]];
      }
    }
    if (run.length === 2 && jokers.length >= 1) {
      const ext = [...run, jokers[0]];
      if (!seqs.some(s => sameGroup(s, ext))) seqs.push(ext);
    }
  }

  return seqs;
}

function findSets(hand: Card[], jokerRank: Rank | null): Card[][] {
  const sets: Card[][] = [];
  const jokers = hand.filter(c => isAnyJoker(c, jokerRank));
  const nonJokers = hand.filter(c => !isAnyJoker(c, jokerRank));

  const byRank: Record<string, Card[]> = {};
  for (const r of RANKS) byRank[r] = [];
  for (const c of nonJokers) byRank[c.rank].push(c);

  for (const rank of RANKS) {
    const cards = byRank[rank];
    const seenSuits = new Set<string>();
    const uniq: Card[] = [];
    for (const c of cards) {
      if (!seenSuits.has(c.suit)) { uniq.push(c); seenSuits.add(c.suit); }
    }
    if (uniq.length >= 3) {
      sets.push(uniq.slice(0, 3)); // natural 3-card set
      if (uniq.length >= 4) sets.push(uniq.slice(0, 4)); // natural 4-card set
      if (uniq.length === 3 && jokers.length >= 1) sets.push([...uniq, jokers[0]]); // 3-real + 1-joker = 4-card set
    } else if (uniq.length === 2 && jokers.length >= 1) {
      sets.push([...uniq, jokers[0]]);
      if (jokers.length >= 2) sets.push([...uniq, jokers[0], jokers[1]]); // 2-real + 2-joker = 4-card set
    }
  }

  return sets;
}

function calcProbability(needing: string[], knownGone: Card[], decks: number = 2): number {
  const totalCards = 52 * decks;
  const remaining = Math.max(1, totalCards - knownGone.length);
  let probNotGetting = 1;
  for (const need of needing) {
    const gone = knownGone.filter(c => c.rank === need).length;
    const available = Math.max(0, decks * 4 - gone);
    probNotGetting *= Math.max(0, 1 - available / remaining);
  }
  return 1 - probNotGetting;
}

function analyzeHand(hand: Card[], jokerRank: Rank | null, openPileTop: Card | null): Analysis {
  const jokerCount = hand.filter(c => isAnyJoker(c, jokerRank)).length;
  const pureSeqs = findPureSequences(hand, jokerRank);
  const impureSeqs = findImpureSequences(hand, jokerRank, jokerCount);
  const sets = findSets(hand, jokerRank);

  // Determine used cards (greedy: pure first, then impure, then sets)
  const usedIds = new Set<string>();
  for (const seq of pureSeqs) for (const c of seq) usedIds.add(c.id);
  for (const seq of impureSeqs) {
    if (!seq.some(c => usedIds.has(c.id))) for (const c of seq) usedIds.add(c.id);
  }
  for (const set of sets) {
    if (!set.some(c => usedIds.has(c.id))) for (const c of set) usedIds.add(c.id);
  }

  const deadwood = hand.filter(c => !usedIds.has(c.id));
  const deadwoodPts = deadwood.reduce((sum, c) => sum + cardPts(c.rank), 0);
  const sortedDead = [...deadwood].sort((a, b) => cardPts(b.rank) - cardPts(a.rank));
  const bestDiscard = sortedDead[0] ?? null;

  // Near-complete combinations
  const nearComplete: NearComplete[] = [];

  for (const suit of SUITS) {
    const suitCards = hand
      .filter(c => c.suit === suit && !isAnyJoker(c, jokerRank))
      .sort((a, b) => rankVal(a.rank) - rankVal(b.rank));

    for (let i = 0; i < suitCards.length - 1; i++) {
      const a = suitCards[i];
      const b = suitCards[i + 1];
      const diff = rankVal(b.rank) - rankVal(a.rank);
      if (diff === 1) {
        const options: string[] = [];
        const beforeIdx = rankVal(a.rank) - 2;
        const afterIdx = rankVal(b.rank);
        if (beforeIdx >= 0) options.push(RANKS[beforeIdx]);
        if (afterIdx < 13) options.push(RANKS[afterIdx]);
        if (options.length > 0) nearComplete.push({ cards: [a, b], needing: options.join(" or "), type: "Pure Sequence" });
      } else if (diff === 2) {
        nearComplete.push({ cards: [a, b], needing: RANKS[rankVal(a.rank)], type: "Pure Sequence (gap)" });
      }
    }
  }

  const byRank: Record<string, Card[]> = {};
  for (const c of hand) {
    if (isAnyJoker(c, jokerRank)) continue;
    if (!byRank[c.rank]) byRank[c.rank] = [];
    byRank[c.rank].push(c);
  }
  for (const rank of RANKS) {
    const cards = byRank[rank] ?? [];
    const uniqSuits = Array.from(new Set(cards.map(c => c.suit)));
    if (uniqSuits.length === 2) {
      const neededSuits = SUITS.filter(s => !uniqSuits.includes(s));
      nearComplete.push({
        cards: cards.slice(0, 2),
        needing: `${rank} of ${neededSuits.join(" or ")}`,
        type: "Set",
      });
    }
  }

  // Pickup recommendation
  let bestPickup: "open" | "closed" = "closed";
  if (openPileTop) {
    const completes = nearComplete.some(nc =>
      nc.needing.includes(openPileTop.rank) ||
      nc.cards.some(c => c.suit === openPileTop.suit && Math.abs(rankVal(c.rank) - rankVal(openPileTop.rank)) === 1)
    );
    if (completes) bestPickup = "open";
  }

  const hasPure = pureSeqs.length >= 1;
  const canDeclare = hasPure && deadwoodPts === 0;

  let riskLevel: RiskLevel = "Low";
  if (deadwoodPts > 40) riskLevel = "High";
  else if (deadwoodPts > 20) riskLevel = "Medium";

  const estTurns = Math.max(0, Math.ceil(deadwoodPts / 10) + (hasPure ? 0 : 3));

  return { pureSeqs, impureSeqs, sets, deadwood, deadwoodPts, bestDiscard, bestPickup, canDeclare, riskLevel, estTurns, nearComplete };
}

// ─── Card UI Component ────────────────────────────────────────────────────

function CardUI({
  card,
  selected,
  onClick,
  small = false,
  highlight = false,
  dimmed = false,
}: {
  card: Card;
  selected?: boolean;
  onClick?: () => void;
  small?: boolean;
  highlight?: boolean;
  dimmed?: boolean;
}) {
  const isRed = card.suit === "♥" || card.suit === "♦";
  const isPrinted = isPJ(card);
  if (isPrinted) {
    return (
      <div onClick={onClick} style={{
        display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        width: small ? 32 : 48, height: small ? 44 : 68,
        background: "linear-gradient(135deg,#7c3aed,#a855f7)",
        border: selected ? "2px solid #22c55e" : highlight ? "2px solid #f59e0b" : "2px solid #c084fc",
        borderRadius: 6, cursor: onClick ? "pointer" : "default",
        boxShadow: selected ? "0 0 8px rgba(34,197,94,0.6)" : "0 0 8px rgba(168,85,247,0.5)",
        opacity: dimmed ? 0.4 : 1, transition: "all 0.15s", userSelect: "none", flexShrink: 0,
      }}>
        <span style={{ fontSize: small ? 14 : 22, lineHeight: 1 }}>🃏</span>
        {!small && <span style={{ fontSize: 8, fontWeight: 800, color: "#e9d5ff", lineHeight: 1 }}>JOKER</span>}
      </div>
    );
  }
  return (
    <div
      onClick={onClick}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        width: small ? 32 : 48,
        height: small ? 44 : 68,
        background: "#ffffff",
        border: selected
          ? "2px solid #22c55e"
          : highlight
          ? "2px solid #f59e0b"
          : "1.5px solid #e2e8f0",
        borderRadius: 6,
        padding: small ? "2px 3px" : "3px 5px",
        cursor: onClick ? "pointer" : "default",
        boxShadow: selected
          ? "0 0 8px rgba(34,197,94,0.6)"
          : highlight
          ? "0 0 8px rgba(245,158,11,0.6)"
          : "0 1px 3px rgba(0,0,0,0.2)",
        opacity: dimmed ? 0.4 : 1,
        transition: "all 0.15s",
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: small ? 9 : 12, fontWeight: 700, color: isRed ? "#dc2626" : "#1e293b", lineHeight: 1 }}>
        {card.rank}
      </span>
      <span style={{ fontSize: small ? 11 : 16, color: isRed ? "#dc2626" : "#1e293b", lineHeight: 1 }}>
        {card.suit}
      </span>
      <span style={{ fontSize: small ? 9 : 12, fontWeight: 700, color: isRed ? "#dc2626" : "#1e293b", lineHeight: 1, transform: "rotate(180deg)" }}>
        {card.rank}
      </span>
    </div>
  );
}

// ─── Probability Bar ──────────────────────────────────────────────────────

function ProbBar({ label, prob, color }: { label: string; prob: number; color: string }) {
  const pct = Math.round(prob * 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 4, height: 6, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, background: color, height: "100%", borderRadius: 4, transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

// ─── Helper Sub-Components ────────────────────────────────────────────────

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: 16 }}>
      <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 4px" }}>{title}</p>
      <p style={{ fontSize: 22, fontWeight: 800, color, margin: 0 }}>{value}</p>
    </div>
  );
}

function EmptyState({ msg, icon }: { msg: string; icon: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 14 }}>{msg}</p>
    </div>
  );
}

function GroupBox({
  title, color, count, collapsed, onToggle, children,
}: {
  title: string; color: string; count: number;
  collapsed?: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
      <button
        type="button"
        onClick={onToggle}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "transparent", border: "none", cursor: "pointer" }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color }}>
          {title} <span style={{ opacity: 0.7 }}>({count})</span>
        </span>
        {collapsed
          ? <ChevronDown style={{ width: 14, height: 14, color }} />
          : <ChevronUp style={{ width: 14, height: 14, color }} />
        }
      </button>
      {!collapsed && (
        <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────

export default function RummyProPage() {
  const [hand, setHand] = useState<Card[]>([]);
  const [jokerRank, setJokerRank] = useState<Rank | null>(null);
  const [openPileTop, setOpenPileTop] = useState<Card | null>(null);
  const [opponentDiscards, setOpponentDiscards] = useState<Card[][]>([[], [], [], [], [], [], [], []]);
  const [playerCount, setPlayerCount] = useState(4);
  const [activeTab, setActiveTab] = useState<TabId>("hand");
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [stats, setStats] = useState<StatsData>({ wins: 0, losses: 0, avgScore: 0, sessions: 0 });
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [trainingMode, setTrainingMode] = useState<TrainingMode>("Beginner");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [selectingOpenPile, setSelectingOpenPile] = useState(false);
  const [selectingOpponent, setSelectingOpponent] = useState<number | null>(null);
  const [pickingJoker, setPickingJoker] = useState(false);
  const [handSort, setHandSort] = useState<"groups" | "suit" | "value">("groups");

  // Live Game tab state
  const [lgTurn, setLgTurn] = useState(1);
  const [lgPhase, setLgPhase] = useState<"pick" | "discard">("pick");
  const [lgAdvice, setLgAdvice] = useState("");
  const [lgAdviceLoading, setLgAdviceLoading] = useState(false);
  const [lgDiscardCard, setLgDiscardCard] = useState<Card | null>(null);
  const [lgLog, setLgLog] = useState<{ turn: number; picked: string; discarded: string }[]>([]);
  const [lgPickingFromOpen, setLgPickingFromOpen] = useState(false);
  const [lgPickingFromDeck, setLgPickingFromDeck] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("rummy_stats");
      if (s) setStats(JSON.parse(s));
      const h = localStorage.getItem("rummy_history");
      if (h) setHistory(JSON.parse(h));
    } catch { /* ignore */ }
  }, []);

  const saveStats = useCallback((newStats: StatsData, newHistory: SessionRecord[]) => {
    setStats(newStats);
    setHistory(newHistory);
    localStorage.setItem("rummy_stats", JSON.stringify(newStats));
    localStorage.setItem("rummy_history", JSON.stringify(newHistory));
  }, []);

  const recordResult = (result: "win" | "loss", score: number) => {
    const newHistory: SessionRecord[] = [
      { hand: [...hand], result, score, date: new Date().toLocaleDateString() },
      ...history.slice(0, 49),
    ];
    const wins = result === "win" ? stats.wins + 1 : stats.wins;
    const losses = result === "loss" ? stats.losses + 1 : stats.losses;
    const sessions = stats.sessions + 1;
    const avgScore = Math.round((stats.avgScore * stats.sessions + score) / sessions);
    saveStats({ wins, losses, avgScore, sessions }, newHistory);
  };

  const analysis = hand.length > 0 ? analyzeHand(hand, jokerRank, openPileTop) : null;

  const countInHand = (rank: Rank, suit: Suit) =>
    hand.filter(c => c.rank === rank && c.suit === suit).length;

  const toggleCard = (rank: Rank, suit: Suit) => {
    const baseId = `${rank}${suit}`;
    const copies = hand.filter(c => c.rank === rank && c.suit === suit);
    const maxCopies = deckCount(playerCount);

    if (pickingJoker) {
      setJokerRank(rank);
      setPickingJoker(false);
      return;
    }
    if (selectingOpenPile) {
      setOpenPileTop(copies.length > 0 ? null : { id: baseId, rank, suit });
      setSelectingOpenPile(false);
      return;
    }
    if (selectingOpponent !== null) {
      const card: Card = { id: `${baseId}_opp${selectingOpponent}_${Date.now()}`, rank, suit };
      setOpponentDiscards(prev => prev.map((arr, i) => i === selectingOpponent ? [...arr, card] : arr));
      setSelectingOpponent(null);
      return;
    }

    if (copies.length >= maxCopies || (copies.length > 0 && hand.length >= 14)) {
      // Remove the most recently added copy
      const lastCopy = copies[copies.length - 1];
      setHand(h => { const idx = h.findIndex(c => c.id === lastCopy.id); return h.filter((_, i) => i !== idx); });
    } else if (hand.length < 14) {
      // Add a new copy with a unique ID
      const newId = `${baseId}_${copies.length + 1}`;
      setHand(h => [...h, { id: newId, rank, suit }]);
    }
  };

  const resetHand = () => {
    setHand([]);
    setJokerRank(null);
    setOpenPileTop(null);
    setAiText("");
    setPickingJoker(false);
    setSelectingOpenPile(false);
    setSelectingOpponent(null);
  };

  const quickDeal = () => {
    const deck = deckCount(playerCount);
    const pool: Card[] = [];
    for (let d = 0; d < deck; d++) {
      for (const s of SUITS) {
        for (const r of RANKS) {
          pool.push({ id: `${r}${s}_d${d}`, rank: r, suit: s });
        }
      }
      pool.push({ id: `pj_d${d}_1`, rank: "PJ" as unknown as Rank, suit: "🃏" as unknown as Suit });
      pool.push({ id: `pj_d${d}_2`, rank: "PJ" as unknown as Rank, suit: "🃏" as unknown as Suit });
    }
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const randomJoker = RANKS[Math.floor(Math.random() * RANKS.length)];
    setJokerRank(randomJoker);
    setHand(pool.slice(0, 13));
    setOpenPileTop(pool[13]);
    setAiText("");
  };

  const removeCard = (id: string) => setHand(h => h.filter(c => c.id !== id));

  const getAiAnalysis = async () => {
    if (!analysis) return;
    setAiLoading(true);
    setAiText("");
    try {
      const res = await fetch("/api/rummy-pro/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hand, jokerRank, analysis, openPileTop, playerCount }),
      });
      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const d = JSON.parse(line.slice(6));
              if (d.text) setAiText(t => t + d.text);
            } catch { /* ignore */ }
          }
        }
      }
    } catch {
      setAiText("Error getting AI analysis. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const allKnownGone: Card[] = [
    ...(openPileTop ? [openPileTop] : []),
    ...opponentDiscards.flat(),
  ];

  const BG = "#0a0f1a";
  const ACCENT = "#22c55e";
  const SURFACE = "rgba(255,255,255,0.05)";
  const BORDER = "rgba(34,197,94,0.2)";

  const tabDef: { id: TabId; label: string; icon: string }[] = [
    { id: "hand", label: "Hand", icon: "🃏" },
    { id: "livegame", label: "Live Game", icon: "⚡" },
    { id: "strategy", label: "Strategy", icon: "🧠" },
    { id: "probability", label: "Probability", icon: "📊" },
    { id: "opponents", label: "Opponents", icon: "👥" },
    { id: "stats", label: "Stats", icon: "📈" },
    { id: "training", label: "Training", icon: "📚" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "rgba(34,197,94,0.08)", borderBottom: `1px solid ${BORDER}`, padding: "16px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: ACCENT, margin: 0 }}>🃏 Rummy Pro AI</h1>
            <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>Indian Rummy — 13-Card / {deckCount(playerCount)} Decks ({playerCount} Players) Strategy Assistant</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 12px" }}>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>Players:</span>
              {[2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <button key={n} type="button" onClick={() => setPlayerCount(n)} style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: playerCount === n ? ACCENT : "rgba(255,255,255,0.08)",
                  color: playerCount === n ? "#000" : "#e2e8f0",
                  border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
                }}>{n}</button>
              ))}
            </div>
            <button type="button" onClick={quickDeal} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
              background: "rgba(34,197,94,0.15)", border: `1px solid ${BORDER}`,
              borderRadius: 8, color: ACCENT, cursor: "pointer", fontSize: 13, fontWeight: 600,
            }}>
              🎲 Quick Deal
            </button>
            <button type="button" onClick={resetHand} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8, color: "#f87171", cursor: "pointer", fontSize: 13, fontWeight: 600,
            }}>
              <RefreshCw style={{ width: 14, height: 14 }} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ background: "rgba(0,0,0,0.3)", borderBottom: `1px solid ${BORDER}`, overflowX: "auto" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex" }}>
          {tabDef.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} style={{
              padding: "12px 18px", fontSize: 13, fontWeight: 600, border: "none",
              background: "transparent", cursor: "pointer", whiteSpace: "nowrap",
              color: activeTab === tab.id ? ACCENT : "#64748b",
              borderBottom: activeTab === tab.id ? `2px solid ${ACCENT}` : "2px solid transparent",
              transition: "all 0.15s",
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Always-visible status bar ── */}
      {hand.length > 0 && analysis && (
        <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${BORDER}`, padding: "8px 16px", overflowX: "auto" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 12, alignItems: "center", flexWrap: "nowrap", minWidth: "max-content" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: analysis.pureSeqs.length > 0 ? ACCENT : "#f87171", padding: "3px 8px", background: analysis.pureSeqs.length > 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", borderRadius: 6, whiteSpace: "nowrap" }}>
              {analysis.pureSeqs.length > 0 ? `✓ Pure ×${analysis.pureSeqs.length}` : "✗ No Pure Seq!"}
            </span>
            <span style={{ fontSize: 11, color: "#60a5fa", padding: "3px 8px", background: "rgba(96,165,250,0.08)", borderRadius: 6, whiteSpace: "nowrap" }}>
              Impure ×{analysis.impureSeqs.length}
            </span>
            <span style={{ fontSize: 11, color: "#f59e0b", padding: "3px 8px", background: "rgba(245,158,11,0.08)", borderRadius: 6, whiteSpace: "nowrap" }}>
              Sets ×{analysis.sets.length}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: analysis.deadwoodPts === 0 ? ACCENT : analysis.deadwoodPts > 40 ? "#f87171" : "#f59e0b", padding: "3px 8px", background: "rgba(255,255,255,0.05)", borderRadius: 6, whiteSpace: "nowrap" }}>
              Deadwood: {analysis.deadwoodPts} pts
            </span>
            <span style={{ fontSize: 11, color: analysis.riskLevel === "Low" ? ACCENT : analysis.riskLevel === "Medium" ? "#f59e0b" : "#f87171", padding: "3px 8px", background: "rgba(255,255,255,0.05)", borderRadius: 6, whiteSpace: "nowrap" }}>
              Risk: {analysis.riskLevel}
            </span>
            {analysis.canDeclare && (
              <span style={{ fontSize: 12, fontWeight: 800, color: "#000", padding: "3px 10px", background: ACCENT, borderRadius: 6, whiteSpace: "nowrap", animation: "pulse 1s ease-in-out infinite" }}>
                🏆 DECLARE NOW!
              </span>
            )}
            {analysis.bestDiscard && (
              <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>
                Suggest discard: <span style={{ color: "#f59e0b", fontWeight: 700 }}>{cardKey(analysis.bestDiscard)}</span>
              </span>
            )}
            {jokerRank && (
              <span style={{ fontSize: 11, color: "#fbbf24", padding: "3px 8px", background: "rgba(251,191,36,0.08)", borderRadius: 6, whiteSpace: "nowrap" }}>
                Joker: {jokerRank}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>

        {/* ── HAND TAB ── */}
        {activeTab === "hand" && (
          <div>
            {/* Status Pills */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, color: "#94a3b8" }}>Hand: {hand.length}/13</span>
              {jokerRank && (
                <span style={{ padding: "3px 10px", background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 20, fontSize: 12, color: "#fbbf24", fontWeight: 600 }}>
                  Wild Joker: {jokerRank}
                </span>
              )}
              {openPileTop && (
                <span style={{ padding: "3px 10px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 20, fontSize: 12, color: "#818cf8", fontWeight: 600 }}>
                  Open Pile: {cardKey(openPileTop)}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <button type="button" onClick={() => { setPickingJoker(v => !v); setSelectingOpenPile(false); setSelectingOpponent(null); }} style={{
                padding: "8px 14px", borderRadius: 8, border: `1px solid ${pickingJoker ? "#fbbf24" : BORDER}`,
                background: pickingJoker ? "rgba(251,191,36,0.15)" : SURFACE,
                color: pickingJoker ? "#fbbf24" : "#94a3b8", cursor: "pointer", fontSize: 13, fontWeight: 600,
              }}>
                {pickingJoker ? "⚡ Click a card rank as Joker" : "🃏 Set Wild Joker"}
              </button>
              <button type="button" onClick={() => { setSelectingOpenPile(v => !v); setPickingJoker(false); setSelectingOpponent(null); }} style={{
                padding: "8px 14px", borderRadius: 8, border: `1px solid ${selectingOpenPile ? "#818cf8" : BORDER}`,
                background: selectingOpenPile ? "rgba(99,102,241,0.15)" : SURFACE,
                color: selectingOpenPile ? "#818cf8" : "#94a3b8", cursor: "pointer", fontSize: 13, fontWeight: 600,
              }}>
                {selectingOpenPile ? "⚡ Click open pile card" : "📤 Set Open Pile Top"}
              </button>
              {jokerRank && (
                <button type="button" onClick={() => setJokerRank(null)} style={{
                  padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)",
                  background: "rgba(239,68,68,0.1)", color: "#f87171", cursor: "pointer", fontSize: 13, fontWeight: 600,
                }}>
                  × Clear Joker
                </button>
              )}
            </div>

            {/* Card Picker Grid */}
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12, margin: "0 0 12px" }}>
                {pickingJoker ? "Click any rank to set as Wild Joker:" : selectingOpenPile ? "Click a card to set as Open Pile Top:" : `Click to add a copy (up to ${deckCount(playerCount)}× per card). Click again at max to remove. Selected: ${hand.length}/14`}
              </p>

              {/* ── Printed Joker row ── */}
              {!pickingJoker && !selectingOpenPile && (() => {
                const pjCount = hand.filter(isPJ).length;
                const maxPJ = deckCount(playerCount) * 2;
                const atMax = pjCount >= maxPJ;
                const handFull = hand.length >= 14 && pjCount === 0;
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "10px 12px", borderRadius: 8, background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.3)" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#c084fc", flexShrink: 0 }}>🃏 Joker Card</span>
                    <span style={{ fontSize: 11, color: "#64748b", flex: 1 }}>The printed joker in the deck (0 pts, can sub any card)</span>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button type="button"
                        disabled={handFull}
                        onClick={() => {
                          if (!atMax && hand.length < 14) {
                            setHand(h => [...h, { id: `pj_${Date.now()}`, rank: "PJ" as unknown as Rank, suit: "🃏" as unknown as Suit }]);
                          }
                        }}
                        style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(168,85,247,0.5)", background: atMax ? "rgba(255,255,255,0.04)" : "rgba(168,85,247,0.2)", color: atMax ? "#475569" : "#c084fc", cursor: atMax || handFull ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        +
                      </button>
                      <span style={{ fontSize: 16, fontWeight: 800, color: pjCount > 0 ? "#c084fc" : "#475569", minWidth: 24, textAlign: "center" }}>{pjCount}</span>
                      <button type="button"
                        disabled={pjCount === 0}
                        onClick={() => {
                          const last = [...hand].reverse().find(isPJ);
                          if (last) setHand(h => { const idx = h.findIndex(c => c.id === last.id); return h.filter((_, i) => i !== idx); });
                        }}
                        style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(239,68,68,0.4)", background: pjCount === 0 ? "rgba(255,255,255,0.04)" : "rgba(239,68,68,0.15)", color: pjCount === 0 ? "#475569" : "#f87171", cursor: pjCount === 0 ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        −
                      </button>
                    </div>
                    <span style={{ fontSize: 11, color: "#475569" }}>max {maxPJ}</span>
                  </div>
                );
              })()}

              {SUITS.map(suit => (
                <div key={suit} style={{ display: "flex", gap: 3, marginBottom: 5, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 14, color: (suit === "♥" || suit === "♦") ? "#f87171" : "#94a3b8", width: 20, textAlign: "center", flexShrink: 0 }}>{suit}</span>
                  {RANKS.map(rank => {
                    const count = countInHand(rank, suit);
                    const maxCopies = deckCount(playerCount);
                    const isJR = jokerRank === rank;
                    const atMax = count >= maxCopies;
                    const disabled = !pickingJoker && !selectingOpenPile && hand.length >= 14 && count === 0;
                    return (
                      <div
                        key={rank}
                        onClick={() => !disabled && toggleCard(rank, suit)}
                        style={{
                          position: "relative",
                          display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                          width: 34, height: 48,
                          background: count > 0 ? `rgba(34,197,94,${0.15 + count * 0.08})` : isJR ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.04)",
                          border: count > 0 ? `1.5px solid ${atMax ? "#f59e0b" : ACCENT}` : isJR ? "1.5px solid #fbbf24" : "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 6, cursor: disabled ? "not-allowed" : "pointer",
                          opacity: disabled ? 0.25 : 1, transition: "all 0.1s",
                        }}
                      >
                        <span style={{ fontSize: 9, fontWeight: 700, color: (suit === "♥" || suit === "♦") ? "#f87171" : "#e2e8f0", lineHeight: 1 }}>{rank}</span>
                        <span style={{ fontSize: 12, color: (suit === "♥" || suit === "♦") ? "#f87171" : "#e2e8f0", lineHeight: 1 }}>{suit}</span>
                        {count > 1 && (
                          <span style={{
                            position: "absolute", top: -5, right: -5,
                            fontSize: 8, fontWeight: 800, lineHeight: 1,
                            background: atMax ? "#f59e0b" : ACCENT,
                            color: "#000", borderRadius: 4, padding: "1px 3px",
                          }}>×{count}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* ── Hand Display ── */}
            {hand.length > 0 && analysis ? (
              <div>
                {/* Sort toggle + header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>
                    Your Hand ({hand.length} cards)
                  </h3>
                  <div style={{ display: "flex", gap: 6 }}>
                    {(["groups", "suit", "value"] as const).map(s => (
                      <button key={s} type="button" onClick={() => setHandSort(s)} style={{
                        padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none",
                        background: handSort === s ? ACCENT : "rgba(255,255,255,0.08)",
                        color: handSort === s ? "#000" : "#94a3b8",
                      }}>{s === "groups" ? "By Groups" : s === "suit" ? "By Suit" : "By Value"}</button>
                    ))}
                  </div>
                </div>

                {/* Flat view (suit / value sort) */}
                {handSort !== "groups" && (() => {
                  const usedIds = new Set<string>();
                  for (const g of [...analysis.pureSeqs, ...analysis.impureSeqs, ...analysis.sets]) for (const c of g) usedIds.add(c.id);
                  const sorted = [...hand].sort((a, b) => {
                    if (handSort === "suit") {
                      const si = SUITS.indexOf(a.suit as Suit) - SUITS.indexOf(b.suit as Suit);
                      return si !== 0 ? si : rankVal(a.rank) - rankVal(b.rank);
                    }
                    return rankVal(a.rank) - rankVal(b.rank);
                  });
                  return (
                    <div style={{ background: "rgba(0,100,0,0.15)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: "16px 12px", marginBottom: 16, overflowX: "auto" }}>
                      <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 10px" }}>Tap a card to remove it from your hand</p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {sorted.map(c => (
                          <div key={c.id} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                            <CardUI card={c} highlight={c.id === analysis.bestDiscard?.id} onClick={() => removeCard(c.id)} />
                            <span style={{ fontSize: 9, color: usedIds.has(c.id) ? ACCENT : "#64748b", fontWeight: 700 }}>
                              {usedIds.has(c.id) ? "✓grp" : `${cardPts(c.rank)}pt`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Groups view */}
                {handSort === "groups" && (
                  <div>
                    {/* Fan-style hand row */}
                    <div style={{ background: "rgba(0,100,0,0.15)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: "16px 12px", marginBottom: 12, overflowX: "auto" }}>
                      <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 10px" }}>Tap a card to remove it • Green glow = in a group • Orange = suggested discard</p>
                      <div style={{ display: "flex", gap: 4, flexWrap: "nowrap", overflowX: "auto", paddingBottom: 4 }}>
                        {(() => {
                          const usedIds = new Set<string>();
                          for (const g of [...analysis.pureSeqs, ...analysis.impureSeqs, ...analysis.sets]) for (const c of g) usedIds.add(c.id);
                          return hand.map(c => (
                            <div key={c.id} style={{ position: "relative", flexShrink: 0 }}>
                              <CardUI
                                card={c}
                                selected={usedIds.has(c.id)}
                                highlight={c.id === analysis.bestDiscard?.id}
                                onClick={() => removeCard(c.id)}
                              />
                              {c.id === analysis.bestDiscard?.id && (
                                <span style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", fontSize: 9, background: "#f59e0b", color: "#000", borderRadius: 4, padding: "1px 4px", fontWeight: 800, whiteSpace: "nowrap" }}>DISCARD</span>
                              )}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    {analysis.pureSeqs.length > 0 && (
                      <GroupBox title="Pure Sequences" color="#22c55e" count={analysis.pureSeqs.length}
                        collapsed={!!collapsed["pure"]} onToggle={() => setCollapsed(c => ({ ...c, pure: !c.pure }))}>
                        {analysis.pureSeqs.map((seq, i) => (
                          <div key={i} style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {seq.map(c => <CardUI key={c.id} card={c} small onClick={() => removeCard(c.id)} />)}
                          </div>
                        ))}
                      </GroupBox>
                    )}
                    {analysis.impureSeqs.length > 0 && (
                      <GroupBox title="Impure Sequences (with Joker)" color="#60a5fa" count={analysis.impureSeqs.length}
                        collapsed={!!collapsed["impure"]} onToggle={() => setCollapsed(c => ({ ...c, impure: !c.impure }))}>
                        {analysis.impureSeqs.map((seq, i) => (
                          <div key={i} style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {seq.map(c => <CardUI key={c.id} card={c} small onClick={() => removeCard(c.id)} />)}
                          </div>
                        ))}
                      </GroupBox>
                    )}
                    {analysis.sets.length > 0 && (
                      <GroupBox title="Sets" color="#f59e0b" count={analysis.sets.length}
                        collapsed={!!collapsed["sets"]} onToggle={() => setCollapsed(c => ({ ...c, sets: !c.sets }))}>
                        {analysis.sets.map((set, i) => (
                          <div key={i} style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {set.map(c => <CardUI key={c.id} card={c} small onClick={() => removeCard(c.id)} />)}
                          </div>
                        ))}
                      </GroupBox>
                    )}
                    {analysis.deadwood.length > 0 && (
                      <GroupBox title="Deadwood — tap to remove" color="#f87171" count={analysis.deadwood.length}
                        collapsed={!!collapsed["dead"]} onToggle={() => setCollapsed(c => ({ ...c, dead: !c.dead }))}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {analysis.deadwood.map(c => (
                            <div key={c.id} style={{ position: "relative" }}>
                              <CardUI card={c} small highlight={c.id === analysis.bestDiscard?.id} onClick={() => removeCard(c.id)} />
                              {c.id === analysis.bestDiscard?.id && (
                                <span style={{ position: "absolute", top: -6, right: -6, fontSize: 8, background: "#f59e0b", color: "#000", borderRadius: 4, padding: "1px 3px", fontWeight: 700 }}>DROP</span>
                              )}
                            </div>
                          ))}
                        </div>
                        <p style={{ fontSize: 11, color: "#f87171", marginTop: 6 }}>Total deadwood: {analysis.deadwoodPts} pts</p>
                      </GroupBox>
                    )}

                    {/* Quick insight card */}
                    {analysis.nearComplete.length > 0 && (
                      <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 10, padding: "10px 14px", marginTop: 8 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", margin: "0 0 6px" }}>⚡ One card away</p>
                        {analysis.nearComplete.slice(0, 3).map((nc, i) => (
                          <p key={i} style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0" }}>
                            → {nc.type}: need <span style={{ color: "#fbbf24", fontWeight: 700 }}>{nc.needing}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>🃏</p>
                <p style={{ color: "#475569", fontSize: 14, marginBottom: 16 }}>Add cards manually or click <strong style={{ color: ACCENT }}>🎲 Quick Deal</strong> to start instantly</p>
                <button type="button" onClick={quickDeal} style={{ padding: "12px 28px", background: "rgba(34,197,94,0.15)", border: `1px solid ${BORDER}`, borderRadius: 10, color: ACCENT, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
                  🎲 Deal Me 13 Cards
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STRATEGY TAB ── */}
        {activeTab === "strategy" && (
          <div>
            {!analysis || hand.length < 3 ? (
              <EmptyState msg="Add at least 3 cards to see strategy" icon="🧠" />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                <StatCard title="Can Declare?" value={analysis.canDeclare ? "✅ Yes!" : "❌ Not yet"} color={analysis.canDeclare ? ACCENT : "#f87171"} />
                <StatCard title="Risk Level" value={analysis.riskLevel} color={analysis.riskLevel === "Low" ? ACCENT : analysis.riskLevel === "Medium" ? "#f59e0b" : "#ef4444"} />
                <StatCard title="Deadwood Points" value={String(analysis.deadwoodPts)} color={analysis.deadwoodPts === 0 ? ACCENT : analysis.deadwoodPts < 20 ? "#f59e0b" : "#ef4444"} />
                <StatCard title="Est. Turns to Declare" value={`~${analysis.estTurns}`} color="#60a5fa" />

                {/* Best Discard */}
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f87171", marginBottom: 12 }}>🗑️ Best Discard</h3>
                  {analysis.bestDiscard ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <CardUI card={analysis.bestDiscard} highlight />
                      <div>
                        <p style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 700, margin: 0 }}>{cardKey(analysis.bestDiscard)}</p>
                        <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>{cardPts(analysis.bestDiscard.rank)} pts freed</p>
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: "#64748b" }}>No deadwood — hand looks complete!</p>
                  )}
                </div>

                {/* Best Draw */}
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#60a5fa", marginBottom: 12 }}>🎯 Best Draw</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 32 }}>{analysis.bestPickup === "open" ? "📤" : "🂠"}</div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>
                        {analysis.bestPickup === "open" ? "Take Open Pile" : "Draw Closed Pile"}
                      </p>
                      {analysis.bestPickup === "open" && openPileTop && (
                        <p style={{ fontSize: 12, color: "#60a5fa", margin: "2px 0 0" }}>{cardKey(openPileTop)} completes a group!</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Waiting Cards — what to wait for */}
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16, gridColumn: "1 / -1" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b", marginBottom: 4 }}>🎯 Cards to Wait For</h3>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px" }}>Pick or keep these cards to complete a group</p>
                  {analysis.nearComplete.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {analysis.nearComplete.slice(0, 8).map((nc, i) => {
                        const needing = nc.needing.split(" or ");
                        const prob = calcProbability(needing, allKnownGone, deckCount(playerCount));
                        const pct = Math.round(prob * 100);
                        const probColor = pct >= 60 ? "#22c55e" : pct >= 35 ? "#f59e0b" : "#f87171";
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(245,158,11,0.06)", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(245,158,11,0.15)" }}>
                            <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                              {nc.cards.map(c => <CardUI key={c.id} card={c} small />)}
                            </div>
                            <ArrowRight style={{ width: 14, height: 14, color: "#f59e0b", flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24" }}>
                                  Wait for: {nc.needing}
                                </span>
                                <span style={{ fontSize: 11, color: "#64748b" }}>→ {nc.type}</span>
                              </div>
                              <div style={{ marginTop: 4, background: "rgba(255,255,255,0.08)", borderRadius: 4, height: 5, overflow: "hidden", width: "100%" }}>
                                <div style={{ width: `${pct}%`, background: probColor, height: "100%", borderRadius: 4, transition: "width 0.4s" }} />
                              </div>
                              <span style={{ fontSize: 10, color: probColor, fontWeight: 700 }}>{pct}% chance to draw it</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: "#475569" }}>No single-card completions found. Add more cards to your hand.</p>
                  )}
                </div>

                {/* AI Analysis */}
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16, gridColumn: "1 / -1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: ACCENT, margin: 0 }}>🤖 AI Strategic Advice</h3>
                    <button type="button" onClick={getAiAnalysis} disabled={aiLoading} style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                      background: aiLoading ? "rgba(34,197,94,0.08)" : "rgba(34,197,94,0.15)",
                      border: `1px solid ${BORDER}`, borderRadius: 8, color: ACCENT,
                      cursor: aiLoading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600,
                    }}>
                      {aiLoading
                        ? <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                        : <Brain style={{ width: 14, height: 14 }} />
                      }
                      {aiLoading ? "Analyzing..." : "Get AI Explanation"}
                    </button>
                  </div>
                  {aiText ? (
                    <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.75, whiteSpace: "pre-wrap", background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: 12 }}>
                      {aiText}
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>Click "Get AI Explanation" for detailed strategic advice powered by Claude AI.</p>
                  )}
                </div>

                {/* Record Result */}
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 12 }}>📝 Record Result</h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => recordResult("win", analysis.deadwoodPts)} style={{
                      flex: 1, padding: "10px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)",
                      borderRadius: 8, color: ACCENT, cursor: "pointer", fontWeight: 700, fontSize: 13,
                    }}>🏆 Won!</button>
                    <button type="button" onClick={() => recordResult("loss", analysis.deadwoodPts)} style={{
                      flex: 1, padding: "10px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                      borderRadius: 8, color: "#f87171", cursor: "pointer", fontWeight: 700, fontSize: 13,
                    }}>💀 Lost ({analysis.deadwoodPts} pts)</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PROBABILITY TAB ── */}
        {activeTab === "probability" && (
          <div>
            {!analysis || hand.length < 3 ? (
              <EmptyState msg="Add cards to see probability analysis" icon="📊" />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: ACCENT, marginBottom: 16 }}>Group Completion Probabilities</h3>
                  {analysis.nearComplete.length > 0 ? (
                    analysis.nearComplete.slice(0, 8).map((nc, i) => {
                      const needing = nc.needing.split(" or ");
                      const prob = calcProbability(needing, allKnownGone, deckCount(playerCount));
                      return (
                        <ProbBar key={i} label={`${nc.type}: need ${nc.needing}`} prob={prob}
                          color={prob > 0.5 ? ACCENT : prob > 0.25 ? "#f59e0b" : "#ef4444"} />
                      );
                    })
                  ) : (
                    <p style={{ fontSize: 13, color: "#475569" }}>No near-complete groups found.</p>
                  )}
                </div>

                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#60a5fa", marginBottom: 16 }}>Useful Draw Probability</h3>
                  {(() => {
                    const neededRanks = Array.from(new Set(
                      analysis.nearComplete.flatMap(nc => nc.needing.split(" or "))
                    ));
                    const decks = deckCount(playerCount);
                    const remaining = Math.max(1, 52 * decks - allKnownGone.length);
                    const prob = neededRanks.length > 0
                      ? 1 - neededRanks.reduce((p, r) => {
                          const gone = allKnownGone.filter(c => c.rank === r).length;
                          return p * (1 - Math.max(0, decks * 4 - gone) / remaining);
                        }, 1)
                      : 0;
                    return (
                      <>
                        <ProbBar label="Drawing a useful card next turn" prob={prob} color={prob > 0.4 ? ACCENT : "#f59e0b"} />
                        <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
                          Based on {allKnownGone.length} known cards gone, ~{remaining} remaining
                        </p>
                      </>
                    );
                  })()}
                </div>

                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b", marginBottom: 16 }}>
                    Cards Known Gone ({allKnownGone.length})
                  </h3>
                  {allKnownGone.length > 0 ? (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {allKnownGone.map((c, i) => <CardUI key={i} card={c} small dimmed />)}
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: "#475569" }}>Set open pile top and opponent discards to track gone cards.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── OPPONENTS TAB ── */}
        {activeTab === "opponents" && (
          <div>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
              Track what opponents discard to infer their hand strategy. ({playerCount - 1} opponents in a {playerCount}-player game)
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              {Array.from({ length: playerCount - 1 }, (_, i) => {
                const discards = opponentDiscards[i] ?? [];
                const suitCounts: Record<string, number> = { "♠": 0, "♥": 0, "♦": 0, "♣": 0 };
                discards.forEach(c => { suitCounts[c.suit] = (suitCounts[c.suit] ?? 0) + 1; });
                const maxSuit = Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0];
                const safeRanks = Array.from(new Set(discards.map(c => c.rank)));

                return (
                  <div key={i} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Opponent {i + 1}</h3>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectingOpponent(selectingOpponent === i ? null : i);
                          setPickingJoker(false);
                          setSelectingOpenPile(false);
                        }}
                        style={{
                          padding: "4px 10px", fontSize: 11, fontWeight: 600, borderRadius: 6,
                          background: selectingOpponent === i ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.08)",
                          border: `1px solid ${selectingOpponent === i ? "#818cf8" : "rgba(255,255,255,0.1)"}`,
                          color: selectingOpponent === i ? "#818cf8" : "#94a3b8", cursor: "pointer",
                        }}
                      >
                        {selectingOpponent === i ? "⚡ Click card picker" : "+ Add Discard"}
                      </button>
                    </div>
                    {selectingOpponent === i && (
                      <p style={{ fontSize: 11, color: "#818cf8", marginBottom: 8 }}>Go to Hand tab and click a card, or use the grid below...</p>
                    )}
                    {discards.length > 0 ? (
                      <>
                        <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 8 }}>
                          {discards.map((c, j) => (
                            <div key={j} style={{ position: "relative" }}>
                              <CardUI card={c} small />
                              <button
                                type="button"
                                onClick={() => setOpponentDiscards(prev => prev.map((arr, idx) => idx === i ? arr.filter((_, k) => k !== j) : arr))}
                                style={{ position: "absolute", top: -5, right: -5, width: 14, height: 14, background: "#ef4444", border: "none", borderRadius: "50%", cursor: "pointer", fontSize: 9, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                              >×</button>
                            </div>
                          ))}
                        </div>
                        {maxSuit && maxSuit[1] > 0 && (
                          <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0" }}>
                            Mostly discarding {maxSuit[0]} — likely avoids that suit
                          </p>
                        )}
                        {safeRanks.length > 0 && (
                          <p style={{ fontSize: 12, color: ACCENT, margin: "4px 0" }}>
                            Safe to discard: {safeRanks.join(", ")}
                          </p>
                        )}
                      </>
                    ) : (
                      <p style={{ fontSize: 12, color: "#475569" }}>No discards yet. Click "+ Add Discard" then pick a card from the Hand tab grid.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STATS TAB ── */}
        {activeTab === "stats" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
              <StatCard title="Win Rate" value={stats.sessions > 0 ? `${Math.round((stats.wins / stats.sessions) * 100)}%` : "—"} color={ACCENT} />
              <StatCard title="Total Wins" value={String(stats.wins)} color={ACCENT} />
              <StatCard title="Total Losses" value={String(stats.losses)} color="#f87171" />
              <StatCard title="Avg Deadwood Score" value={String(stats.avgScore)} color="#60a5fa" />
              <StatCard title="Sessions Played" value={String(stats.sessions)} color="#f59e0b" />
            </div>

            {history.length > 0 ? (
              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}` }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Session History</h3>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "rgba(0,0,0,0.2)" }}>
                        {["Date", "Result", "Deadwood Score", "Cards"].map(h => (
                          <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "#64748b", fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((r, i) => (
                        <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "10px 16px", color: "#94a3b8" }}>{r.date}</td>
                          <td style={{ padding: "10px 16px" }}>
                            <span style={{
                              padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700,
                              background: r.result === "win" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                              color: r.result === "win" ? ACCENT : "#f87171",
                            }}>
                              {r.result === "win" ? "✓ Win" : "✗ Loss"}
                            </span>
                          </td>
                          <td style={{ padding: "10px 16px", color: "#e2e8f0", fontWeight: 600 }}>{r.score}</td>
                          <td style={{ padding: "10px 16px", color: "#94a3b8" }}>{r.hand.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyState msg="No sessions recorded yet. Go to Strategy tab and record a result!" icon="📈" />
            )}
          </div>
        )}

        {/* ── TRAINING TAB ── */}
        {activeTab === "training" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {(["Beginner", "Intermediate", "Expert"] as TrainingMode[]).map(mode => (
                <button key={mode} type="button" onClick={() => setTrainingMode(mode)} style={{
                  padding: "8px 16px", borderRadius: 8, border: `1px solid ${trainingMode === mode ? ACCENT : BORDER}`,
                  background: trainingMode === mode ? "rgba(34,197,94,0.15)" : SURFACE,
                  color: trainingMode === mode ? ACCENT : "#94a3b8", cursor: "pointer", fontWeight: 600, fontSize: 13,
                }}>{mode}</button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: ACCENT, marginBottom: 10 }}>📖 Pure Sequence</h3>
                <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>
                  {trainingMode === "Beginner"
                    ? "A pure sequence is 3+ cards of the SAME SUIT in order, with NO jokers. Example: 5♥ 6♥ 7♥. You MUST have at least one pure sequence to declare — this is the most important rule!"
                    : trainingMode === "Intermediate"
                    ? "Pure sequences are critical — without one, you can't declare. Both A-2-3 (low ace) and Q-K-A (high ace) are valid. In 2-deck games, duplicate ranks within the same suit in one sequence are not allowed."
                    : "Strategy: prioritize pure seq formation with middle cards (5-9) — they offer more connectivity. Statistically, middle ranks have higher probability of completing sequences than high/low cards. Hold potential pure seq starters even at higher early-game deadwood cost."}
                </p>
              </div>

              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#60a5fa", marginBottom: 10 }}>🃏 Wild Joker Usage</h3>
                <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>
                  {trainingMode === "Beginner"
                    ? "Wild jokers (cards of the random joker rank) can replace ANY card. Use them in impure sequences or sets. A joker fills gaps — e.g., 4♠ JOKER 6♠ is a valid impure sequence (joker acts as 5♠)."
                    : trainingMode === "Intermediate"
                    ? "Prioritize jokers in impure sequences over sets — sequences are harder to form. Never use jokers to 'complete' a pure sequence (it becomes impure). Save your second joker — use first on the most needed group."
                    : "Advanced: joker value is highest when bridging a critical gap. If you have both a pure seq and impure seq candidate, use joker on the one that unblocks more deadwood. Track joker ranks in opponent discards — opponents rarely discard their wild joker rank cards."}
                </p>
              </div>

              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b", marginBottom: 10 }}>⚠️ Hand Analysis</h3>
                {analysis ? (
                  <ul style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8, paddingLeft: 16, margin: 0 }}>
                    {analysis.pureSeqs.length === 0 && (
                      <li style={{ color: "#f87171" }}>No pure sequence! Cannot declare without one — prioritize forming one immediately.</li>
                    )}
                    {analysis.deadwoodPts > 40 && (
                      <li style={{ color: "#f87171" }}>Very high deadwood ({analysis.deadwoodPts} pts). Drop high-value isolated cards first.</li>
                    )}
                    {analysis.deadwood.some(c => c.rank === "J" || c.rank === "Q" || c.rank === "K") && (
                      <li style={{ color: "#f59e0b" }}>Face cards (J/Q/K) in deadwood — each worth 10 pts if opponent declares first.</li>
                    )}
                    {analysis.pureSeqs.length >= 1 && analysis.deadwoodPts === 0 && (
                      <li style={{ color: ACCENT }}>Hand is complete! Declare on your next turn.</li>
                    )}
                    {analysis.pureSeqs.length >= 1 && analysis.deadwoodPts > 0 && analysis.deadwoodPts <= 10 && (
                      <li style={{ color: "#f59e0b" }}>Almost there! Only {analysis.deadwoodPts} deadwood pts left.</li>
                    )}
                    {analysis.nearComplete.length > 2 && (
                      <li>Multiple near-complete groups — focus on the easiest to complete first.</li>
                    )}
                  </ul>
                ) : (
                  <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>Add cards to your hand for personalized analysis.</p>
                )}
              </div>

              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fb923c", marginBottom: 10 }}>🃏 Sets &amp; Multi-Deck Rules</h3>
                <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>
                  {trainingMode === "Beginner"
                    ? "A set is 3–4 cards of the SAME RANK but DIFFERENT SUITS. Example: 7♠ 7♥ 7♦ (3-card set) or 7♠ 7♥ 7♦ 7♣ (4-card set). With a wild joker you can make a 4-card set: 7♠ 7♥ 7♦ + JOKER."
                    : trainingMode === "Intermediate"
                    ? `In ${playerCount}-player games, ${deckCount(playerCount)} decks are used. More decks mean more copies of each card (${deckCount(playerCount)}×4 per rank), so completing sets and sequences becomes more likely. A 4-card set uses the same rank in all 4 suits or 3 suits + a wild joker.`
                    : `With ${deckCount(playerCount)} decks in play, probability of completing a group is higher than 2-deck games. 4-card sets are worth considering mid-game — they lock 4 cards but eliminate deadwood completely. However, in the late game, prefer 3-card groups to keep hand flexibility for regrouping.`}
                </p>
              </div>

              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#c084fc", marginBottom: 10 }}>🎯 Point System (Indian Rummy)</h3>
                <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 8px" }}>
                    <span>Ace (A)</span><span style={{ color: "#e2e8f0" }}>1 point</span>
                    <span>2 – 10</span><span style={{ color: "#e2e8f0" }}>Face value</span>
                    <span>J / Q / K</span><span style={{ color: "#e2e8f0" }}>10 pts each</span>
                    <span>Wild Joker</span><span style={{ color: "#e2e8f0" }}>0 points</span>
                    <span>Max penalty</span><span style={{ color: "#f87171" }}>80 points</span>
                    <span>Wrong declare</span><span style={{ color: "#f87171" }}>80 points</span>
                  </div>
                  {trainingMode !== "Beginner" && (
                    <p style={{ marginTop: 10, marginBottom: 0 }}>
                      If opponent declares first, your penalty = sum of unmatched card points (capped at 80). Cards in valid groups count 0. Always minimize deadwood to reduce risk.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── LIVE GAME TAB ── */}
        {activeTab === "livegame" && (() => {
          const lgAnalysis = hand.length > 0 ? analyzeHand(hand, jokerRank, openPileTop) : null;

          const getLgAdvice = async (phase: "pick" | "discard", drawnCard?: Card) => {
            setLgAdviceLoading(true);
            setLgAdvice("");
            const apiKey = true; // always try, server handles missing key
            try {
              const res = await fetch("/api/rummy-pro/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  hand,
                  jokerRank,
                  analysis: lgAnalysis,
                  openPileTop,
                  playerCount,
                  liveGameMode: true,
                  livePhase: phase,
                  turnNumber: lgTurn,
                  drawnCard: drawnCard ?? null,
                }),
              });
              if (!res.body) throw new Error("No stream");
              const reader = res.body.getReader();
              const decoder = new TextDecoder();
              let buf = "";
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buf += decoder.decode(value, { stream: true });
                const lines = buf.split("\n");
                buf = lines.pop() ?? "";
                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    try {
                      const d = JSON.parse(line.slice(6));
                      if (d.text) setLgAdvice(t => t + d.text);
                    } catch { /* ignore */ }
                  }
                }
              }
            } catch {
              setLgAdvice("Could not get AI advice. Based on your hand analysis:\n\n" +
                (phase === "pick"
                  ? `• ${lgAnalysis?.bestPickup === "open" && openPileTop ? `Take open pile (${openPileTop.rank}${openPileTop.suit}) — it helps your groups` : "Draw from closed deck — open pile card not useful"}`
                  : `• Discard: ${lgAnalysis?.bestDiscard ? `${lgAnalysis.bestDiscard.rank}${lgAnalysis.bestDiscard.suit} (${cardPts(lgAnalysis.bestDiscard.rank)} pts, no group)` : "No clear discard — remove highest deadwood"}`
                )
              );
            } finally {
              setLgAdviceLoading(false);
            }
          };

          const handlePickOpen = () => {
            if (!openPileTop) return;
            const card = { ...openPileTop, id: `${openPileTop.rank}${openPileTop.suit}_drawn` };
            setHand(h => [...h, card]);
            setOpenPileTop(null);
            setLgPhase("discard");
            getLgAdvice("discard", card);
          };

          const handlePickDeck = () => {
            // Simulate drawing unknown card — user picks from card grid
            setLgPickingFromDeck(true);
            setLgAdvice("Click any card in the grid below to represent the card you drew from the closed deck.");
          };

          const handleDiscardCard = (card: Card) => {
            setLgDiscardCard(card);
            setHand(h => h.filter(c => c.id !== card.id));
            const newOpenPile = card;
            setOpenPileTop(newOpenPile);
            setLgLog(log => [{ turn: lgTurn, picked: lgPickingFromOpen ? `Open pile` : "Closed deck", discarded: `${card.rank}${card.suit}` }, ...log]);
            setLgTurn(t => t + 1);
            setLgPhase("pick");
            setLgPickingFromDeck(false);
            setLgPickingFromOpen(false);
            getLgAdvice("pick");
          };

          const handleDeckCardPicked = (rank: Rank, suit: Suit) => {
            if (!lgPickingFromDeck) return;
            const card: Card = { id: `${rank}${suit}_drawn_${Date.now()}`, rank, suit };
            setHand(h => [...h, card]);
            setLgPickingFromDeck(false);
            setLgPhase("discard");
            getLgAdvice("discard", card);
          };

          return (
            <div>
              {hand.length < 13 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#94a3b8" }}>Set up your hand first</p>
                  <p style={{ fontSize: 13, color: "#475569", marginTop: 6 }}>Go to the Hand tab, pick 13 cards, set Wild Joker and Open Pile Top, then come back here to play turn-by-turn.</p>
                  <button type="button" onClick={() => setActiveTab("hand")} style={{
                    marginTop: 16, padding: "10px 24px", borderRadius: 8, fontWeight: 700, fontSize: 14,
                    background: "rgba(34,197,94,0.15)", border: `1px solid ${BORDER}`, color: ACCENT, cursor: "pointer",
                  }}>Go to Hand Tab →</button>
                </div>
              ) : (
                <div>
                  {/* Turn header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: ACCENT }}>Turn {lgTurn}</span>
                      <span style={{
                        padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                        background: lgPhase === "pick" ? "rgba(99,102,241,0.2)" : "rgba(239,68,68,0.2)",
                        color: lgPhase === "pick" ? "#818cf8" : "#f87171",
                        border: lgPhase === "pick" ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(239,68,68,0.4)",
                      }}>
                        {lgPhase === "pick" ? "📥 Your turn to PICK" : "📤 Now DISCARD a card"}
                      </span>
                    </div>
                    <button type="button" onClick={() => { setLgTurn(1); setLgPhase("pick"); setLgAdvice(""); setLgLog([]); setLgPickingFromDeck(false); }} style={{
                      padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                      background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", cursor: "pointer",
                    }}>↺ Reset Game</button>
                  </div>

                  {/* AI Advice box */}
                  <div style={{ background: "rgba(34,197,94,0.06)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <Brain style={{ width: 16, height: 16, color: ACCENT }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>AI Coach</span>
                      {lgAdviceLoading && <Loader2 style={{ width: 13, height: 13, color: ACCENT, animation: "spin 1s linear infinite" }} />}
                    </div>
                    {lgAdvice ? (
                      <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{lgAdvice}</div>
                    ) : lgAdviceLoading ? (
                      <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>Thinking...</p>
                    ) : (
                      <div>
                        <p style={{ fontSize: 13, color: "#475569", margin: "0 0 10px" }}>
                          {lgPhase === "pick"
                            ? "Ready for your turn! Choose to take the open pile card or draw from the closed deck."
                            : "You've drawn a card. Now choose which card to discard."}
                        </p>
                        {lgPhase === "pick" && lgAnalysis && (
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            Quick tip: {lgAnalysis.bestPickup === "open" && openPileTop
                              ? `✅ Open pile (${openPileTop.rank}${openPileTop.suit}) looks useful — take it!`
                              : "🂠 Draw from closed deck — open pile card doesn't help your groups"}
                          </div>
                        )}
                        <button type="button" onClick={() => getLgAdvice(lgPhase)} style={{
                          marginTop: 10, padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                          background: "rgba(34,197,94,0.1)", border: `1px solid ${BORDER}`, color: ACCENT, cursor: "pointer",
                        }}>
                          <Brain style={{ width: 11, height: 11, display: "inline", marginRight: 4 }} />
                          Get full AI advice
                        </button>
                      </div>
                    )}
                  </div>

                  {/* PICK phase */}
                  {lgPhase === "pick" && !lgPickingFromDeck && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                      <button type="button" onClick={handlePickOpen} disabled={!openPileTop} style={{
                        padding: "20px 12px", borderRadius: 12, border: openPileTop ? "2px solid #818cf8" : `1px solid ${BORDER}`,
                        background: openPileTop ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.03)",
                        color: openPileTop ? "#a5b4fc" : "#475569", cursor: openPileTop ? "pointer" : "not-allowed",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all 0.15s",
                      }}>
                        <span style={{ fontSize: 32 }}>📤</span>
                        <span style={{ fontSize: 15, fontWeight: 700 }}>Take Open Pile</span>
                        {openPileTop
                          ? <span style={{ fontSize: 22, fontWeight: 800, color: (openPileTop.suit === "♥" || openPileTop.suit === "♦") ? "#f87171" : "#e2e8f0" }}>{openPileTop.rank}{openPileTop.suit}</span>
                          : <span style={{ fontSize: 12, color: "#475569" }}>No card set</span>
                        }
                      </button>
                      <button type="button" onClick={handlePickDeck} style={{
                        padding: "20px 12px", borderRadius: 12, border: `2px solid rgba(34,197,94,0.4)`,
                        background: "rgba(34,197,94,0.08)", color: ACCENT,
                        cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                      }}>
                        <span style={{ fontSize: 32 }}>🂠</span>
                        <span style={{ fontSize: 15, fontWeight: 700 }}>Draw from Deck</span>
                        <span style={{ fontSize: 12, color: "#64748b" }}>Unknown card</span>
                      </button>
                    </div>
                  )}

                  {/* Draw from deck — mini card picker */}
                  {lgPickingFromDeck && (
                    <div style={{ background: SURFACE, border: `2px solid ${ACCENT}`, borderRadius: 12, padding: 14, marginBottom: 20 }}>
                      <p style={{ fontSize: 13, color: ACCENT, fontWeight: 700, margin: "0 0 10px" }}>Which card did you draw? Click it:</p>
                      {SUITS.map(suit => (
                        <div key={suit} style={{ display: "flex", gap: 3, marginBottom: 4, flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ fontSize: 13, color: (suit === "♥" || suit === "♦") ? "#f87171" : "#94a3b8", width: 18, flexShrink: 0 }}>{suit}</span>
                          {RANKS.map(rank => (
                            <div key={rank} onClick={() => handleDeckCardPicked(rank, suit)} style={{
                              display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                              width: 30, height: 42, borderRadius: 5, cursor: "pointer", transition: "all 0.1s",
                              background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)",
                            }}>
                              <span style={{ fontSize: 8, fontWeight: 700, color: (suit === "♥" || suit === "♦") ? "#f87171" : "#e2e8f0" }}>{rank}</span>
                              <span style={{ fontSize: 11, color: (suit === "♥" || suit === "♦") ? "#f87171" : "#e2e8f0" }}>{suit}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* DISCARD phase — current hand, click to discard */}
                  {lgPhase === "discard" && (
                    <div style={{ background: SURFACE, border: "2px solid rgba(239,68,68,0.4)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#f87171", margin: "0 0 4px" }}>Tap the card you want to DISCARD:</p>
                      <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 12px" }}>
                        {lgAnalysis?.bestDiscard ? `AI suggests discarding ${lgAnalysis.bestDiscard.rank}${lgAnalysis.bestDiscard.suit} (${cardPts(lgAnalysis.bestDiscard.rank)} pts)` : "Choose your discard"}
                      </p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {hand.map(card => {
                          const isSuggested = lgAnalysis?.bestDiscard?.id === card.id;
                          const isRed = card.suit === "♥" || card.suit === "♦";
                          return (
                            <div key={card.id} onClick={() => handleDiscardCard(card)} style={{ position: "relative", cursor: "pointer" }}>
                              <div style={{
                                display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between",
                                width: 44, height: 62, background: "#fff",
                                border: isSuggested ? "2px solid #f59e0b" : "2px solid rgba(239,68,68,0.4)",
                                borderRadius: 7, padding: "3px 4px",
                                boxShadow: isSuggested ? "0 0 12px rgba(245,158,11,0.6)" : "0 2px 6px rgba(239,68,68,0.2)",
                                transition: "all 0.15s",
                              }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: isRed ? "#dc2626" : "#1e293b", lineHeight: 1 }}>{card.rank}</span>
                                <span style={{ fontSize: 18, color: isRed ? "#dc2626" : "#1e293b", lineHeight: 1 }}>{card.suit}</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: isRed ? "#dc2626" : "#1e293b", lineHeight: 1, transform: "rotate(180deg)" }}>{card.rank}</span>
                              </div>
                              {isSuggested && (
                                <span style={{ position: "absolute", top: -7, right: -7, fontSize: 8, background: "#f59e0b", color: "#000", borderRadius: 4, padding: "1px 3px", fontWeight: 800 }}>DROP</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Current hand summary */}
                  {lgAnalysis && (
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12, marginBottom: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: "#64748b" }}>Cards: <strong style={{ color: "#e2e8f0" }}>{hand.length}</strong></span>
                      <span style={{ fontSize: 12, color: "#64748b" }}>Pure Seq: <strong style={{ color: ACCENT }}>{lgAnalysis.pureSeqs.length}</strong></span>
                      <span style={{ fontSize: 12, color: "#64748b" }}>Deadwood: <strong style={{ color: lgAnalysis.deadwoodPts > 30 ? "#f87171" : "#f59e0b" }}>{lgAnalysis.deadwoodPts} pts</strong></span>
                      <span style={{ fontSize: 12, color: "#64748b" }}>Risk: <strong style={{ color: lgAnalysis.riskLevel === "Low" ? ACCENT : lgAnalysis.riskLevel === "Medium" ? "#f59e0b" : "#f87171" }}>{lgAnalysis.riskLevel}</strong></span>
                      {lgAnalysis.canDeclare && (
                        <span style={{ padding: "2px 10px", borderRadius: 12, fontSize: 11, fontWeight: 800, background: "rgba(34,197,94,0.2)", color: ACCENT, border: `1px solid ${BORDER}` }}>✅ CAN DECLARE!</span>
                      )}
                    </div>
                  )}

                  {/* Turn log */}
                  {lgLog.length > 0 && (
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ padding: "8px 14px", borderBottom: `1px solid ${BORDER}`, fontSize: 12, fontWeight: 700, color: "#64748b" }}>Turn History</div>
                      {lgLog.map((l, i) => (
                        <div key={i} style={{ display: "flex", gap: 16, padding: "8px 14px", borderTop: i > 0 ? `1px solid rgba(255,255,255,0.05)` : undefined, fontSize: 12 }}>
                          <span style={{ color: "#475569", width: 52, flexShrink: 0 }}>Turn {l.turn}</span>
                          <span style={{ color: "#818cf8" }}>📥 {l.picked}</span>
                          <span style={{ color: "#f87171" }}>📤 Discarded {l.discarded}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
      `}</style>
    </div>
  );
}
