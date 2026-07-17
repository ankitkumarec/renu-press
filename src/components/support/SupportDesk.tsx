"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  X,
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Loader2,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Smile,
  BadgeCheck,
  Check,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { parseRecMetadata, ProductCards } from "./ProductCards";
import { parsePrintReport, PrintReadinessCard } from "./PrintReadinessCard";
import {
  CHAT_ATTACH_HINT,
  CHAT_PLACEHOLDER,
  SUPPORT_DISPLAY_NAME,
  SUPPORT_STATUS_LINE,
  SUPPORT_VERIFIED,
  WELCOME_QUICK_REPLIES,
} from "@/lib/support/constants";

type Msg = {
  id: string;
  role: string;
  content: string;
  messageType?: string;
  metadata?: string | null;
  createdAt: string;
};

const EMOJIS = ["👍", "🙏", "😊", "📦", "🎨", "OK", "✅"];

/** Bump key when welcome UX changes so users get fresh greeting */
const SESSION_KEY = "rp_support_session_v3";

export function SupportDeskWidget({
  defaultOpen = false,
  embedded = false,
}: {
  defaultOpen?: boolean;
  /** Full-page embed without floating launcher */
  embedded?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen || embedded);
  const [expanded, setExpanded] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [booting, setBooting] = useState(false);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const scrollDown = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollDown();
  }, [messages, typing, scrollDown]);

  const boot = useCallback(async () => {
    if (sessionId && messages.length) return;
    setBooting(true);
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem(SESSION_KEY) : null;
      const res = await fetch("/api/support/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: stored }),
      });
      const data = await res.json();
      if (data.ok) {
        setSessionId(data.sessionId);
        localStorage.setItem(SESSION_KEY, data.sessionId);
        setMessages(
          (data.messages || []).map((m: Msg) => ({
            ...m,
            createdAt: m.createdAt,
          })),
        );
      }
    } catch {
      /* ignore */
    } finally {
      setBooting(false);
    }
  }, [sessionId, messages.length]);

  useEffect(() => {
    if (open) void boot();
  }, [open, boot]);

  async function sendText(text: string) {
    if (!sessionId || !text.trim() || busy) return;
    const optimistic: Msg = {
      id: `tmp_${Date.now()}`,
      role: "customer",
      content: text.trim(),
      messageType: "text",
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    setInput("");
    setBusy(true);
    setTyping(true);
    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        const custId = `c_${Date.now()}`;
        setMessages((m) => [
          ...m.filter((x) => x.id !== optimistic.id),
          { ...optimistic, id: custId },
          {
            id: data.message.id,
            role: "agent",
            content: data.reply,
            messageType: data.message.messageType || "text",
            metadata: data.message.metadata || (data.recommendation ? JSON.stringify(data.recommendation) : null),
            createdAt: data.message.createdAt,
          },
        ]);
        setSeenIds((s) => new Set(s).add(custId));
      } else {
        setMessages((m) => [
          ...m,
          {
            id: `err_${Date.now()}`,
            role: "system",
            content: data.message || "Message nahi gaya. Dobara try karein.",
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `err_${Date.now()}`,
          role: "system",
          content: "Network issue. Please try again.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setTyping(false);
      setBusy(false);
    }
  }

  async function uploadFile(file: File) {
    if (!sessionId || busy) return;
    setBusy(true);
    setTyping(true);
    setMessages((m) => [
      ...m,
      {
        id: `up_${Date.now()}`,
        role: "customer",
        content: `📎 ${file.name}`,
        messageType: file.type.startsWith("image/") ? "image" : "file",
        createdAt: new Date().toISOString(),
      },
    ]);
    try {
      const fd = new FormData();
      fd.set("sessionId", sessionId);
      fd.set("file", file);
      const res = await fetch("/api/support/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) {
        const meta =
          data.printReport
            ? JSON.stringify({
                type: "print_readiness_report",
                report: data.printReport,
                inspectionId: data.inspectionId,
                recommendation: data.recommendation,
              })
            : data.recommendation
              ? JSON.stringify(data.recommendation)
              : null;
        setMessages((m) => [
          ...m,
          {
            id: `ar_${Date.now()}`,
            role: "agent",
            content: data.reply,
            messageType: data.printReport ? "print_report" : data.recommendation ? "recommendations" : "text",
            metadata: meta,
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          {
            id: `err_${Date.now()}`,
            role: "system",
            content: data.message || "Upload failed",
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `err_${Date.now()}`,
          role: "system",
          content: "Upload failed. Max 8MB. Allowed: images, PDF, design files, zip, voice.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setTyping(false);
      setBusy(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void uploadFile(f);
  }

  const dark = theme === "dark";

  const panel = open ? (
          <motion.div
            initial={embedded ? false : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className={cn(
              "flex flex-col overflow-hidden border shadow-2xl backdrop-blur-2xl",
              embedded
                ? "relative h-[min(740px,78dvh)] w-full rounded-3xl"
                : "bottom-safe fixed z-[60]",
              !embedded &&
                (expanded
                  ? "inset-3 sm:inset-6 rounded-3xl"
                  : "right-3 left-3 h-[min(680px,82dvh)] rounded-3xl sm:right-6 sm:left-auto sm:w-[420px]"),
              dark
                ? "border-white/15 bg-[#0a0f1a]/92 text-slate-100 shadow-violet-950/40"
                : "border-white/60 bg-white/90 text-slate-900 shadow-slate-300/50",
            )}
            style={
              embedded || expanded
                ? undefined
                : { bottom: "max(1rem, env(safe-area-inset-bottom, 1rem))" }
            }
          >
            {/* Premium header — Intercom / WhatsApp Business style */}
            <div
              className={cn(
                "relative border-b px-4 py-3.5",
                dark
                  ? "border-white/10 bg-gradient-to-br from-[#1a1030]/95 via-[#121a2e]/90 to-[#0c1424]/95"
                  : "border-slate-100/80 bg-gradient-to-br from-white via-violet-50/80 to-orange-50/60",
              )}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent" />
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 via-violet-600 to-orange-500 text-white shadow-lg shadow-violet-500/30">
                    <Heart className="h-5 w-5 fill-white/90" />
                  </div>
                  <span className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#0a0f1a] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="truncate text-[15px] font-bold tracking-tight">{SUPPORT_DISPLAY_NAME}</div>
                  <div className={cn("mt-0.5 text-[11px] font-medium", dark ? "text-emerald-300" : "text-emerald-600")}>
                    {SUPPORT_STATUS_LINE}
                  </div>
                  <div className={cn("mt-1 inline-flex items-center gap-1 text-[10px] font-semibold", dark ? "text-cyan-300/90" : "text-cyan-700")}>
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {SUPPORT_VERIFIED}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                    className={cn("rounded-xl p-2", dark ? "hover:bg-white/10" : "hover:bg-black/5")}
                    aria-label="Toggle theme"
                  >
                    {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                  {!embedded ? (
                    <button
                      type="button"
                      onClick={() => setExpanded((e) => !e)}
                      className={cn("rounded-xl p-2", dark ? "hover:bg-white/10" : "hover:bg-black/5")}
                      aria-label="Expand"
                    >
                      {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </button>
                  ) : null}
                  {!embedded ? (
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className={cn("rounded-xl p-2", dark ? "hover:bg-white/10" : "hover:bg-black/5")}
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              className={cn(
                "relative flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-4",
                dark
                  ? "bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.08),_transparent_50%),#070b14]"
                  : "bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.06),_transparent_50%),#f8fafc]",
                dragOver && "ring-2 ring-inset ring-violet-500",
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              {booting ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
                  <span>Connecting to support…</span>
                </div>
              ) : null}

              {messages.map((m, msgIndex) => {
                const mine = m.role === "customer";
                const system = m.role === "system" || m.role === "admin";
                const printR = !mine ? parsePrintReport(m.metadata) : null;
                let welcomeChips: { id: string; label: string; send: string }[] | null = null;
                if (!mine && m.metadata) {
                  try {
                    const j = JSON.parse(m.metadata) as {
                      type?: string;
                      quickReplies?: { id: string; label: string; send: string }[];
                    };
                    if (j.type === "welcome" && j.quickReplies?.length) welcomeChips = j.quickReplies;
                  } catch {
                    /* ignore */
                  }
                }
                // Fallback chips on first agent message if no metadata (old sessions)
                const onlyWelcome =
                  !mine &&
                  msgIndex === 0 &&
                  messages.filter((x) => x.role === "customer").length === 0 &&
                  !welcomeChips;
                if (onlyWelcome) {
                  welcomeChips = WELCOME_QUICK_REPLIES.map((q) => ({
                    id: q.id,
                    label: q.label,
                    send: q.send,
                  }));
                }
                let rec = !mine && !printR ? parseRecMetadata(m.metadata) : null;
                // recommendation may be nested inside print report meta
                if (!rec && m.metadata) {
                  try {
                    const j = JSON.parse(m.metadata) as { recommendation?: unknown };
                    if (j.recommendation) rec = parseRecMetadata(JSON.stringify(j.recommendation));
                  } catch {
                    /* ignore */
                  }
                }
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex", mine ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-md backdrop-blur-sm",
                        printR || rec ? "sm:max-w-[100%]" : "whitespace-pre-wrap",
                        mine
                          ? "rounded-br-md bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 text-white whitespace-pre-wrap shadow-violet-500/20"
                          : system
                            ? dark
                              ? "border border-amber-500/30 bg-amber-500/10 text-amber-100 whitespace-pre-wrap"
                              : "border border-amber-200 bg-amber-50 text-amber-900 whitespace-pre-wrap"
                            : dark
                              ? "rounded-bl-md border border-white/12 bg-white/[0.07] text-slate-100"
                              : "rounded-bl-md border border-slate-200/80 bg-white/90 text-slate-800",
                      )}
                    >
                      {!mine && !system ? (
                        <div className={cn("mb-1 flex items-center gap-1 text-[10px] font-bold tracking-wide", dark ? "text-rose-300/90" : "text-rose-600")}>
                          <Heart className="h-3 w-3 fill-current" />
                          RENU PRESS Support
                        </div>
                      ) : null}
                      {m.messageType === "file" || m.messageType === "image" ? (
                        <div className="mb-1 flex items-center gap-1.5 text-xs opacity-90">
                          {m.messageType === "image" ? <ImageIcon className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                        </div>
                      ) : null}
                      {printR ? (
                        <>
                          <PrintReadinessCard
                            report={printR}
                            dark={dark}
                            onFix={(_id, label) =>
                              void sendText(
                                `Please help with: ${label}. Original file rakhna — improved copy chahiye.`,
                              )
                            }
                          />
                          {rec ? (
                            <ProductCards data={rec} dark={dark} onSelect={(name) => void sendText(name)} />
                          ) : null}
                        </>
                      ) : rec ? (
                        <>
                          <p className="whitespace-pre-wrap text-[12px] leading-relaxed opacity-95">
                            {m.content.split("\n").slice(0, 4).join("\n")}
                          </p>
                          <ProductCards data={rec} dark={dark} onSelect={(name) => void sendText(name)} />
                        </>
                      ) : (
                        <span className="whitespace-pre-wrap">{m.content}</span>
                      )}
                      {welcomeChips && messages.filter((x) => x.role === "customer").length === 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {welcomeChips.map((chip) => (
                            <button
                              key={chip.id}
                              type="button"
                              disabled={busy}
                              onClick={() => void sendText(chip.send)}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-[12px] font-semibold transition active:scale-[0.98]",
                                dark
                                  ? "border-white/15 bg-white/10 text-white hover:border-violet-400/40 hover:bg-violet-500/20"
                                  : "border-slate-200 bg-slate-50 text-slate-800 hover:border-violet-300 hover:bg-violet-50",
                              )}
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      ) : null}
                      {mine ? (
                        <div className="mt-1 flex items-center justify-end gap-0.5 text-[10px] text-white/70">
                          {seenIds.has(m.id) || !m.id.startsWith("tmp_") ? (
                            <CheckCheck className="h-3.5 w-3.5 text-sky-200" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                );
              })}

              {typing ? (
                <div className="flex justify-start">
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-2xl rounded-bl-md border px-4 py-3 backdrop-blur",
                      dark ? "border-white/10 bg-white/[0.07]" : "border-slate-200 bg-white",
                    )}
                  >
                    <span className="text-[10px] font-semibold text-slate-400">Team is typing</span>
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fuchsia-400 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400 [animation-delay:300ms]" />
                    </span>
                  </div>
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>

            {/* Composer — WhatsApp / Intercom style */}
            <div
              className={cn(
                "border-t p-3 backdrop-blur-xl",
                dark ? "border-white/10 bg-[#0c1220]/95" : "border-slate-200/80 bg-white/95",
              )}
            >
              {showEmoji ? (
                <div className="mb-2 flex flex-wrap gap-1">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      className={cn("rounded-lg px-2 py-1 text-sm", dark ? "hover:bg-white/10" : "hover:bg-slate-100")}
                      onClick={() => {
                        setInput((v) => v + e);
                        setShowEmoji(false);
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    "rounded-xl p-2.5 transition",
                    dark ? "text-slate-300 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100",
                  )}
                  aria-label="Attach file"
                  disabled={busy}
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.webp,.heic,.bmp,.tif,.tiff,.pdf,.psd,.ai,.eps,.cdr,.svg,.doc,.docx,.zip,.rar,.mp4,.webm,.mp3,.wav,.ogg,.m4a,image/*,application/pdf,audio/*,video/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadFile(f);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowEmoji((s) => !s)}
                  className={cn(
                    "rounded-xl p-2.5",
                    dark ? "text-slate-300 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  <Smile className="h-5 w-5" />
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendText(input);
                    }
                  }}
                  rows={1}
                  placeholder={CHAT_PLACEHOLDER}
                  className={cn(
                    "max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500/40",
                    dark
                      ? "border-white/12 bg-white/[0.06] text-white placeholder:text-slate-500"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400",
                  )}
                />
                <button
                  type="button"
                  disabled={busy || !input.trim()}
                  onClick={() => void sendText(input)}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 text-white shadow-lg shadow-violet-500/30 disabled:opacity-40"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
              <p className={cn("mt-2 text-center text-[10px] font-medium", dark ? "text-slate-500" : "text-slate-400")}>
                {CHAT_ATTACH_HINT}
              </p>
              <p className={cn("mt-0.5 text-center text-[9px]", dark ? "text-slate-600" : "text-slate-400")}>
                Drag & drop files · Quotation only after team review
              </p>
            </div>
          </motion.div>
  ) : null;

  return (
    <>
      {!embedded && !open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bottom-safe fixed left-3 z-50 flex items-center gap-2.5 rounded-full border border-white/20 bg-gradient-to-r from-rose-500 via-violet-600 to-orange-500 px-4 py-3 text-sm font-bold text-white shadow-2xl shadow-violet-500/40 transition hover:scale-[1.03] active:scale-95 sm:left-6 sm:px-5"
          style={{ bottom: "max(5.5rem, calc(env(safe-area-inset-bottom, 1rem) + 4.5rem))" }}
          aria-label="Open RENU PRESS Support"
        >
          <span className="relative grid h-8 w-8 place-items-center rounded-full bg-white/20">
            <Heart className="h-4 w-4 fill-white" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-violet-700" />
          </span>
          <span className="hidden flex-col items-start leading-tight sm:flex">
            <span className="text-[13px]">Support Team</span>
            <span className="text-[10px] font-semibold text-white/85">Online now</span>
          </span>
        </button>
      ) : null}

      {embedded ? panel : <AnimatePresence>{panel}</AnimatePresence>}
    </>
  );
}
