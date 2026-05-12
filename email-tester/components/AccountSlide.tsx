"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Inbox, AlertTriangle, Mail, WifiOff, Loader2, BarChart3 } from "lucide-react";
import type { AccountResult } from "@/types";
import { EmailCard } from "./EmailCard";

interface AccountSlideProps {
  account: AccountResult;
  filter: string;
}

export function AccountSlide({ account, filter }: AccountSlideProps) {
  const filtered = account.emails.filter((email) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      email.subject.toLowerCase().includes(q) ||
      email.from.toLowerCase().includes(q) ||
      email.fromName.toLowerCase().includes(q) ||
      email.senderIp.toLowerCase().includes(q)
    );
  });

  const inboxEmails = filtered.filter((e) => e.category !== "spam");
  const spamEmails = filtered.filter((e) => e.category === "spam");
  const inboxRate = account.emails.length > 0
    ? Math.round((account.emails.filter((e) => e.category !== "spam").length / account.emails.length) * 100)
    : 0;

  if (account.status === "loading") {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm font-mono text-slate-500">Connecting to {account.email}…</p>
        <div className="flex gap-2 mt-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-48 h-20 rounded-xl shimmer" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (account.status === "offline") {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
          <WifiOff className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-base font-medium text-slate-300">{account.label}</p>
        <p className="text-sm font-mono text-red-400/80 max-w-sm text-center">{account.error ?? "Could not connect"}</p>
        <div className="mt-2 px-4 py-2 rounded-lg bg-[#1a1a28] border border-[#2a2a45]">
          <p className="text-xs font-mono text-slate-500">{account.email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Account header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e30] shrink-0">
        <div>
          <h2 className="text-base font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            {account.label}
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-0.5">{account.email}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">Inbox Rate</p>
              <p className={`text-lg font-bold font-mono ${inboxRate >= 70 ? 'text-green-400' : inboxRate >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                {inboxRate}%
              </p>
            </div>
            <div className="w-px h-10 bg-[#1e1e30]" />
          </div>

          <div className="flex gap-3">
            <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-1.5">
                <Inbox className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400 font-bold font-mono text-sm">{inboxEmails.length}</span>
              </div>
              <p className="text-[9px] font-mono text-green-600 uppercase tracking-wider mt-0.5">Inbox</p>
            </div>

            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-400 font-bold font-mono text-sm">{spamEmails.length}</span>
              </div>
              <p className="text-[9px] font-mono text-red-600 uppercase tracking-wider mt-0.5">Spam</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email list */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
            <Mail className="w-10 h-10 text-slate-700" />
            {filter ? (
              <>
                <p className="text-sm text-slate-500">No emails match your filter</p>
                <p className="text-xs font-mono text-slate-600">"{filter}"</p>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-500">No emails found</p>
                <p className="text-xs font-mono text-slate-600">Send a test email and refresh</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((email, i) => (
                <EmailCard key={email.uid} email={email} index={i} highlight={filter} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
