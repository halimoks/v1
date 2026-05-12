"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox, AlertTriangle, Globe, User, Calendar, Hash, Mail, X } from "lucide-react";
import type { FetchedEmail } from "@/types";
import clsx from "clsx";

interface EmailCardProps {
  email: FetchedEmail;
  index: number;
  highlight?: string;
}

export function EmailCard({ email, index, highlight }: EmailCardProps) {
  const isSpam = email.category === "spam";
  const [open, setOpen] = useState(false);

  function highlightText(text: string): React.ReactNode {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={i} className="bg-cyan-400/20 text-cyan-300 rounded px-0.5">{part}</mark>
      ) : (part)
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.3 }}
        className={clsx(
          "email-card rounded-xl p-4 cursor-default",
          isSpam ? "bg-red-950/20 border-red-900/30 hover:border-red-700/40" : "bg-[#13131e] hover:bg-[#1a1a28]"
        )}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={clsx("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", isSpam ? "bg-red-500/10" : "bg-green-500/10")}>
              {isSpam ? <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> : <Inbox className="w-3.5 h-3.5 text-green-400" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate leading-tight">
                {highlightText(email.subject || "(no subject)")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {email.htmlBody && (
              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/20 hover:bg-blue-500/25 transition-colors"
              >
                <Mail className="w-3 h-3" />
                Open Email
              </button>
            )}
            <span className={clsx(
              "text-[10px] font-mono font-semibold px-2 py-1 rounded-md uppercase tracking-wider",
              isSpam ? "bg-red-500/15 text-red-400 border border-red-500/20" : "bg-green-500/15 text-green-400 border border-green-500/20"
            )}>
              {isSpam ? "SPAM" : "INBOX"}
            </span>
          </div>
        </div>

        {/* Meta rows */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <User className="w-3 h-3 text-slate-600 shrink-0" />
            <span className="text-[11px] font-mono text-slate-400 truncate">{highlightText(email.fromName || email.from)}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <Globe className="w-3 h-3 text-slate-600 shrink-0" />
            <span className="text-[11px] font-mono text-slate-400 truncate">{highlightText(email.senderIp)}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0 col-span-2">
            <Hash className="w-3 h-3 text-slate-600 shrink-0" />
            <span className="text-[11px] font-mono text-slate-500 truncate">{highlightText(email.from)}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0 col-span-2">
            <Calendar className="w-3 h-3 text-slate-600 shrink-0" />
            <span className="text-[11px] font-mono text-slate-500">{new Date(email.date).toLocaleString()}</span>
          </div>
        </div>
      </motion.div>

      {/* Email viewer modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl bg-[#0e0e1a] border border-white/10 shadow-2xl overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-start justify-between gap-3 p-4 border-b border-white/10">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{email.subject || "(no subject)"}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{email.fromName} &lt;{email.from}&gt;</p>
                  <p className="text-xs text-slate-500">{new Date(email.date).toLocaleString()}</p>
                </div>
                <button onClick={() => setOpen(false)} className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              {/* Email body */}
              <div className="flex-1 overflow-auto bg-white">
                <iframe
                  srcDoc={email.htmlBody}
                  sandbox="allow-same-origin"
                  className="w-full h-full min-h-[500px] border-0"
                  title={email.subject}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
