"use client";

import { motion } from "framer-motion";
import { Inbox, AlertTriangle, Globe, User, Calendar, Hash } from "lucide-react";
import type { FetchedEmail } from "@/types";
import clsx from "clsx";

interface EmailCardProps {
  email: FetchedEmail;
  index: number;
  highlight?: string;
}

export function EmailCard({ email, index, highlight }: EmailCardProps) {
  const isSpam = email.category === "spam";

  function highlightText(text: string): React.ReactNode {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={i} className="bg-cyan-400/20 text-cyan-300 rounded px-0.5">{part}</mark>
      ) : (
        part
      )
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={clsx(
        "email-card rounded-xl p-4 cursor-default",
        isSpam
          ? "bg-red-950/20 border-red-900/30 hover:border-red-700/40"
          : "bg-[#13131e] hover:bg-[#1a1a28]"
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={clsx(
              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
              isSpam ? "bg-red-500/10" : "bg-green-500/10"
            )}
          >
            {isSpam ? (
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Inbox className="w-3.5 h-3.5 text-green-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate leading-tight">
              {highlightText(email.subject || "(no subject)")}
            </p>
          </div>
        </div>

        <span
          className={clsx(
            "shrink-0 text-[10px] font-mono font-semibold px-2 py-1 rounded-md uppercase tracking-wider",
            isSpam
              ? "bg-red-500/15 text-red-400 border border-red-500/20"
              : "bg-green-500/15 text-green-400 border border-green-500/20"
          )}
        >
          {isSpam ? "SPAM" : "INBOX"}
        </span>
      </div>

      {/* Meta rows */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <User className="w-3 h-3 text-slate-600 shrink-0" />
          <span className="text-[11px] font-mono text-slate-400 truncate">
            {highlightText(email.fromName || email.from)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 min-w-0">
          <Globe className="w-3 h-3 text-slate-600 shrink-0" />
          <span className="text-[11px] font-mono text-slate-400 truncate">
            {highlightText(email.senderIp)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 min-w-0 col-span-2">
          <Hash className="w-3 h-3 text-slate-600 shrink-0" />
          <span className="text-[11px] font-mono text-slate-500 truncate">
            {highlightText(email.from)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 min-w-0 col-span-2">
          <Calendar className="w-3 h-3 text-slate-600 shrink-0" />
          <span className="text-[11px] font-mono text-slate-500">
            {new Date(email.date).toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
