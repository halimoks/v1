"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, RefreshCw, Zap, Mail, Radio, ChevronDown } from "lucide-react";
import type { AccountResult, EmailCategory } from "@/types";
import { Sidebar } from "./Sidebar";
import { GridView, CAT_CONFIG } from "./GridView";
import clsx from "clsx";

const AUTO_REFRESH_SECS = 10;

interface DashboardData { results: AccountResult[]; checkedAt: string; }

type CatFilter = EmailCategory | "all";

const CATEGORY_OPTIONS: { value: CatFilter; label: string; icon: string }[] = [
  { value: "all",        label: "All Categories", icon: "▦" },
  { value: "primary",    label: "Primary",         icon: "★" },
  { value: "promotions", label: "Promotions",      icon: "🏷" },
  { value: "social",     label: "Social",          icon: "👥" },
  { value: "updates",    label: "Updates",         icon: "🔔" },
  { value: "forums",     label: "Forums",          icon: "💬" },
  { value: "spam",       label: "Spam",            icon: "🚫" },
];

export function Dashboard() {
  const [data, setData]           = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter]       = useState("");
  const [catFilter, setCatFilter] = useState<CatFilter>("all");
  const [catOpen, setCatOpen]     = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError]         = useState<string | null>(null);
  const [countdown, setCountdown] = useState(AUTO_REFRESH_SECS);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const prevEmailsRef = useRef<Map<string, Set<number>>>(new Map());
  const catRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/check", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: DashboardData = await res.json();

      // Mark newly arrived emails
      json.results = json.results.map(account => {
        const prev = prevEmailsRef.current.get(account.accountId) ?? new Set<number>();
        const emails = account.emails.map(e => ({
          ...e,
          isNew: prev.size > 0 && !prev.has(e.uid),
        }));
        prevEmailsRef.current.set(account.accountId, new Set(account.emails.map(e => e.uid)));
        return { ...account, emails };
      });

      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setIsLoading(false);
      setCountdown(AUTO_REFRESH_SECS);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { fetchData(); return AUTO_REFRESH_SECS; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchData]);

  const accounts = data?.results ?? [];
  const selectedCat = CATEGORY_OPTIONS.find(o => o.value === catFilter)!;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#08080f]">
      <Sidebar accounts={accounts} activeIndex={activeIndex} onSelect={setActiveIndex}
        onRefresh={fetchData} isRefreshing={isLoading} lastChecked={data?.checkedAt} />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* ── Top bar ── */}
        <header className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1a1a2e] shrink-0 bg-[#0d0d18]">

          {/* Search */}
          <div className="flex-1 relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
            <input
              type="text" value={filter} onChange={e => setFilter(e.target.value)}
              placeholder="Search by address, domain, subject or IP…"
              className="w-full bg-[#13131e] border border-[#1e1e30] rounded-lg pl-9 pr-8 py-2 text-sm font-mono text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500/40 transition-all"
            />
            {filter && (
              <button onClick={() => setFilter("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category dropdown */}
          <div className="relative shrink-0" ref={catRef}>
            <button
              onClick={() => setCatOpen(v => !v)}
              className={clsx(
                "flex items-center gap-2 px-3 py-2 rounded-lg border text-[12px] font-mono transition-all",
                catFilter !== "all"
                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                  : "bg-[#13131e] border-[#1e1e30] text-slate-400 hover:border-[#2a2a45] hover:text-slate-200"
              )}
            >
              <span>{selectedCat.icon}</span>
              <span>{selectedCat.label}</span>
              <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform", catOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {catOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full mt-1.5 right-0 w-52 bg-[#13131e] border border-[#1e1e30] rounded-xl shadow-2xl shadow-black/60 z-50 py-1 overflow-hidden"
                >
                  {CATEGORY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setCatFilter(opt.value); setCatOpen(false); }}
                      className={clsx(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-mono transition-all text-left",
                        opt.value === catFilter
                          ? "bg-cyan-500/10 text-cyan-300"
                          : "text-slate-400 hover:bg-[#1a1a28] hover:text-white"
                      )}
                    >
                      <span className="text-base w-5 text-center">{opt.icon}</span>
                      <span className="flex-1">{opt.label}</span>
                      {opt.value !== "all" && (
                        <span className={clsx(
                          "w-2 h-2 rounded-full",
                          CAT_CONFIG[opt.value as EmailCategory]?.dot ?? "bg-slate-500"
                        )} />
                      )}
                      {opt.value === catFilter && (
                        <span className="text-cyan-400 text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Live / Paused toggle */}
          <button
            onClick={() => setAutoRefresh(v => !v)}
            className={clsx(
              "flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-[11px] font-mono transition-all shrink-0",
              autoRefresh
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-slate-800/50 border-slate-700 text-slate-500 hover:text-slate-300"
            )}
          >
            <Radio className={clsx("w-3 h-3", autoRefresh && "animate-pulse")} />
            {autoRefresh ? `Live · ${countdown}s` : "Paused"}
          </button>

          {/* Manual refresh */}
          <button
            onClick={fetchData} disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all disabled:opacity-50 text-[11px] font-mono shrink-0"
          >
            <RefreshCw className={clsx("w-3.5 h-3.5", isLoading && "animate-spin")} />
            {isLoading ? "Checking…" : "Refresh"}
          </button>
        </header>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="px-5 py-1.5 bg-red-900/20 border-b border-red-900/30 text-[11px] font-mono text-red-400 shrink-0">
              ⚠ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="flex-1 min-h-0">
          {isLoading && accounts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-5">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
                <span className="text-sm font-mono text-slate-500">Connecting to seed accounts…</span>
              </div>
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-44 h-28 rounded-lg shimmer" style={{ animationDelay: `${i * 0.08}s` }} />
                ))}
              </div>
            </div>
          ) : accounts.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Mail className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No seed accounts configured</p>
                <p className="text-slate-700 text-xs mt-1 font-mono">Add SEED_ACCOUNTS to your .env.local</p>
              </div>
            </div>
          ) : (
            <GridView accounts={accounts} filter={filter} catFilter={catFilter} />
          )}
        </div>
      </div>
    </div>
  );
}
