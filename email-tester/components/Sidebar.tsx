"use client";

import { motion } from "framer-motion";
import { Mail, Radio, Wifi, WifiOff, RefreshCw, Activity } from "lucide-react";
import type { AccountResult } from "@/types";
import clsx from "clsx";

interface SidebarProps {
  accounts: AccountResult[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastChecked?: string;
}

export function Sidebar({
  accounts,
  activeIndex,
  onSelect,
  onRefresh,
  isRefreshing,
  lastChecked,
}: SidebarProps) {
  const onlineCount = accounts.filter((a) => a.status === "online").length;

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full border-r border-[#1e1e30] bg-[#0f0f17] relative z-10">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#1e1e30]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center glow-cyan">
            <Radio className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-display text-white font-bold text-sm tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
              SeedRadar
            </h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Deliverability</p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-4 py-3 border-b border-[#1e1e30] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3 text-cyan-400" />
          <span className="text-[11px] font-mono text-slate-400">
            <span className="text-cyan-400 font-semibold">{onlineCount}</span>/{accounts.length} online
          </span>
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 rounded-md hover:bg-[#1a1a28] text-slate-400 hover:text-cyan-400 transition-all disabled:opacity-50"
          title="Refresh all accounts"
        >
          <RefreshCw className={clsx("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
        </button>
      </div>

      {/* Account list */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest px-2 py-2">
          Seed Accounts
        </p>
        <div className="flex flex-col gap-1">
          {accounts.map((account, index) => {
            const isActive = index === activeIndex;
            const inboxCount = account.emails.filter((e) => e.category !== "spam").length;
            const spamCount = account.emails.filter((e) => e.category === "spam").length;

            return (
              <motion.button
                key={account.accountId}
                onClick={() => onSelect(index)}
                whileHover={{ x: 2 }}
                className={clsx(
                  "w-full text-left px-3 py-2.5 rounded-lg transition-all group relative",
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20 text-white"
                    : "hover:bg-[#1a1a28] text-slate-400 border border-transparent hover:border-[#2a2a45]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-cyan-400 rounded-full"
                    style={{ left: "-1px" }}
                  />
                )}

                <div className="flex items-center gap-2.5">
                  {/* Status indicator */}
                  <div className="relative shrink-0">
                    {account.status === "loading" ? (
                      <div className="w-2 h-2 rounded-full bg-yellow-400 status-pulse" />
                    ) : account.status === "online" ? (
                      <div className="w-2 h-2 rounded-full bg-green-400 status-pulse" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={clsx("text-xs font-medium truncate", isActive ? "text-white" : "text-slate-300")}>
                        {account.label}
                      </span>
                      {account.status === "online" && account.emails.length > 0 && (
                        <div className="flex items-center gap-1 shrink-0">
                          {inboxCount > 0 && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                              {inboxCount}
                            </span>
                          )}
                          {spamCount > 0 && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                              {spamCount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-slate-600 truncate mt-0.5">{account.email}</p>
                  </div>
                </div>

                {account.error && (
                  <p className="text-[9px] text-red-400/70 font-mono mt-1 truncate">{account.error}</p>
                )}
              </motion.button>
            );
          })}

          {accounts.length === 0 && (
            <div className="px-3 py-8 text-center">
              <Mail className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-600">No seed accounts configured</p>
              <p className="text-[10px] text-slate-700 mt-1">Add SEED_ACCOUNTS to .env</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {lastChecked && (
        <div className="px-4 py-3 border-t border-[#1e1e30]">
          <p className="text-[10px] font-mono text-slate-700">
            Last checked: {new Date(lastChecked).toLocaleTimeString()}
          </p>
        </div>
      )}
    </aside>
  );
}
