"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { WifiOff, Loader2, Mail, Globe, ChevronLeft, ChevronRight, Inbox, AlertTriangle } from "lucide-react";
import type { AccountResult, FetchedEmail, EmailCategory } from "@/types";
import clsx from "clsx";

// ─── Category config ──────────────────────────────────────────────────────────
export const CAT_CONFIG: Record<EmailCategory, { label: string; bg: string; text: string; border: string; dot: string }> = {
  primary:    { label: "Primary Inbox", bg: "bg-green-500/20",  text: "text-green-300",  border: "border-green-500/40",  dot: "bg-green-400"  },
  promotions: { label: "Promotions",    bg: "bg-orange-500/20", text: "text-orange-300", border: "border-orange-500/40", dot: "bg-orange-400" },
  updates:    { label: "Updates",       bg: "bg-blue-500/20",   text: "text-blue-300",   border: "border-blue-500/40",   dot: "bg-blue-400"   },
  forums:     { label: "Forums",        bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/40", dot: "bg-purple-400" },
  social:     { label: "Social",        bg: "bg-pink-500/20",   text: "text-pink-300",   border: "border-pink-500/40",   dot: "bg-pink-400"   },
  spam:       { label: "Spam",          bg: "bg-red-500/20",    text: "text-red-400",    border: "border-red-500/40",    dot: "bg-red-400"    },
  inbox:      { label: "Inbox",         bg: "bg-green-500/20",  text: "text-green-300",  border: "border-green-500/40",  dot: "bg-green-400"  },
  unknown:    { label: "Unknown",       bg: "bg-slate-500/20",  text: "text-slate-400",  border: "border-slate-500/40",  dot: "bg-slate-500"  },
};

function CategoryBadge({ category }: { category: EmailCategory }) {
  const c = CAT_CONFIG[category] ?? CAT_CONFIG.unknown;
  return (
    <span className={clsx(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap",
      c.bg, c.text, c.border
    )}>
      <span className={clsx("w-1.5 h-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 5)  return "just now";
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function EmailCell({ email, filter, isNew }: { email: FetchedEmail; filter: string; isNew?: boolean }) {
  function hl(text: string) {
    if (!filter) return <>{text}</>;
    const safe = filter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${safe})`, "gi"));
    return <>{parts.map((p, i) => p.toLowerCase() === filter.toLowerCase()
      ? <mark key={i} className="bg-cyan-400/25 text-cyan-200 rounded-sm">{p}</mark> : p)}</>;
  }

  const isSpam = email.category === "spam";
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={clsx(
        "w-[195px] shrink-0 rounded-lg border p-2.5 flex flex-col gap-1.5 cursor-default relative",
        isSpam ? "bg-red-950/30 border-red-900/40 hover:border-red-700/50" : "bg-[#13131e] border-[#242438] hover:border-[#2e2e55]",
        "transition-colors"
      )}
    >
      {/* NEW badge */}
      {isNew && (
        <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold bg-cyan-500 text-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
          NEW
        </span>
      )}

      {/* Sender name + from */}
      <div>
        <p className="text-[12px] font-semibold text-white truncate leading-tight">
          {hl(email.fromName || email.from)}
        </p>
        <p className="text-[10px] text-slate-600 truncate font-mono">
          {hl(email.from)}
        </p>
      </div>

      {/* Subject */}
      <p className="text-[11px] text-slate-300 leading-tight line-clamp-2">
        {hl(email.subject || "(no subject)")}
      </p>

      {/* Sender IP — large & prominent */}
      <div className={clsx(
        "flex items-center gap-1.5 px-2 py-1.5 rounded-md font-mono",
        email.senderIp === "N/A"
          ? "bg-slate-800/50 text-slate-600"
          : "bg-cyan-950/60 border border-cyan-800/40 text-cyan-300"
      )}>
        <Globe className="w-3 h-3 shrink-0" />
        <span className="text-[12px] font-bold tracking-wide">{hl(email.senderIp)}</span>
      </div>

      {/* Category + time */}
      <div className="flex items-center justify-between gap-1 mt-auto">
        <CategoryBadge category={email.category} />
        <span className="text-[10px] font-mono text-slate-600 shrink-0 ml-1">{timeAgo(email.date)}</span>
      </div>
    </motion.div>
  );
}

// ─── Scrollable row with left/right arrows ────────────────────────────────────
function AccountRow({
  account, filter, catFilter,
}: {
  account: AccountResult;
  filter: string;
  catFilter: EmailCategory | "all";
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 420 : -420, behavior: "smooth" });
  }, []);

  const emails = account.emails.filter(e => {
    if (catFilter !== "all" && e.category !== catFilter) return false;
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      e.subject.toLowerCase().includes(q) ||
      e.from.toLowerCase().includes(q) ||
      e.fromName.toLowerCase().includes(q) ||
      e.senderIp.toLowerCase().includes(q)
    );
  });

  const inboxCount = account.emails.filter(e => e.category !== "spam").length;
  const spamCount  = account.emails.filter(e => e.category === "spam").length;
  const total      = account.emails.length;
  const rate       = total > 0 ? Math.round((inboxCount / total) * 100) : null;

  return (
    <div className="flex items-stretch border-b border-[#14142a] last:border-0 min-h-[120px]">
      {/* Account label — fixed left column */}
      <div className="w-[175px] shrink-0 px-3 py-3 border-r border-[#14142a] flex flex-col justify-between bg-[#0c0c18]">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className={clsx("w-2 h-2 rounded-full shrink-0 mt-px",
              account.status === "loading" ? "bg-yellow-400 animate-pulse" :
              account.status === "online"  ? "bg-green-400" : "bg-red-500"
            )} />
            <p className="text-[12px] font-semibold text-white truncate leading-tight">{account.label}</p>
          </div>
          <p className="text-[10px] font-mono text-slate-600 truncate pl-4">{account.email}</p>
        </div>
        {account.status === "online" && (
          <div className="flex flex-wrap gap-1 mt-2 pl-0">
            <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
              <Inbox className="w-2.5 h-2.5" />{inboxCount}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertTriangle className="w-2.5 h-2.5" />{spamCount}
            </span>
            {rate !== null && (
              <span className={clsx("text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                rate >= 70 ? "text-green-400 bg-green-500/10" :
                rate >= 40 ? "text-yellow-400 bg-yellow-500/10" : "text-red-400 bg-red-500/10"
              )}>{rate}%</span>
            )}
          </div>
        )}
        {account.status === "offline" && (
          <p className="text-[9px] font-mono text-red-400/60 mt-1 line-clamp-2 pl-0">{account.error}</p>
        )}
      </div>

      {/* Scroll arrows + email strip */}
      <div className="flex-1 flex items-center min-w-0 relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 z-10 h-full w-7 flex items-center justify-center bg-gradient-to-r from-[#08080f] to-transparent hover:from-[#12122a] transition-all group shrink-0"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
        </button>

        {/* Emails strip */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto scrollbar-hide px-8"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex gap-2 py-2.5 items-start" style={{ minWidth: "max-content" }}>
            {account.status === "loading" && (
              <div className="flex items-center gap-2 px-3 py-6 text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                <span className="text-xs font-mono">Connecting…</span>
              </div>
            )}
            {account.status === "offline" && (
              <div className="flex items-center gap-2 px-3 py-6 text-slate-700">
                <WifiOff className="w-4 h-4 text-red-500/40" />
                <span className="text-xs font-mono text-red-400/40">Offline</span>
              </div>
            )}
            {account.status === "online" && emails.length === 0 && (
              <div className="flex items-center gap-2 px-3 py-6 text-slate-700">
                <Mail className="w-4 h-4" />
                <span className="text-xs font-mono">{filter || catFilter !== "all" ? "No matches" : "No emails yet"}</span>
              </div>
            )}
            {account.status === "online" && emails.map((email, i) => (
              <EmailCell key={email.uid} email={email} filter={filter} isNew={email.isNew} />
            ))}
          </div>
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 z-10 h-full w-7 flex items-center justify-center bg-gradient-to-l from-[#08080f] to-transparent hover:from-[#12122a] transition-all group shrink-0"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
        </button>
      </div>
    </div>
  );
}

// ─── Main GridView ─────────────────────────────────────────────────────────────
interface GridViewProps {
  accounts: AccountResult[];
  filter: string;
  catFilter: EmailCategory | "all";
}

export function GridView({ accounts, filter, catFilter }: GridViewProps) {
  if (!accounts.length) return null;

  const allIps = Array.from(new Set(
    accounts.flatMap(a => a.emails.map(e => e.senderIp)).filter(ip => ip && ip !== "N/A")
  ));
  const totalInbox = accounts.reduce((s, a) => s + a.emails.filter(e => e.category !== "spam").length, 0);
  const totalSpam  = accounts.reduce((s, a) => s + a.emails.filter(e => e.category === "spam").length, 0);
  const totalAll   = totalInbox + totalSpam;
  const rate = totalAll > 0 ? Math.round((totalInbox / totalAll) * 100) : null;

  return (
    <div className="flex flex-col h-full">
      {/* Summary strip */}
      <div className="flex items-center gap-4 px-4 py-1.5 border-b border-[#14142a] bg-[#0a0a12] shrink-0 overflow-x-auto">
        <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono">
          <span className="text-slate-600">TOTAL</span>
          <span className="text-white font-bold">{totalAll}</span>
          <span className="text-green-400 font-bold">{totalInbox} inbox</span>
          <span className="text-red-400 font-bold">{totalSpam} spam</span>
          {rate !== null && (
            <span className={clsx("font-bold px-2 py-0.5 rounded",
              rate >= 70 ? "text-green-400 bg-green-500/10" :
              rate >= 40 ? "text-yellow-400 bg-yellow-500/10" : "text-red-400 bg-red-500/10"
            )}>{rate}% inbox rate</span>
          )}
        </div>
        {allIps.length > 0 && (
          <>
            <div className="w-px h-4 bg-[#1e1e30] shrink-0" />
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
              <Globe className="w-3 h-3 text-cyan-500 shrink-0" />
              <span className="text-[11px] font-mono text-slate-600 mr-0.5">Sender IPs:</span>
              {allIps.map(ip => (
                <span key={ip} className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300">{ip}</span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Column header */}
      <div className="flex border-b border-[#14142a] bg-[#0a0a12] shrink-0">
        <div className="w-[175px] shrink-0 px-3 py-1 border-r border-[#14142a]">
          <span className="text-[9px] font-mono text-slate-700 uppercase tracking-widest">Account</span>
        </div>
        <div className="flex-1 px-8 py-1">
          <span className="text-[9px] font-mono text-slate-700 uppercase tracking-widest">Emails — newest first →</span>
        </div>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {accounts.map(account => (
          <AccountRow key={account.accountId} account={account} filter={filter} catFilter={catFilter} />
        ))}
      </div>
    </div>
  );
}
