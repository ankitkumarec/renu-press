"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Headphones,
  X,
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Loader2,
  Circle,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Smile,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = {
  id: string;
  role: string;
  content: string;
  messageType?: string;
  metadata?: string | null;
  createdAt: string;
};

const EMOJIS = ["👍", "🙏", "😊", "📦", "🎨", "OK", "✅"];

const SESSION_KEY = "rp_support_session";

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
  const [online] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [booting, setBooting] = useState(false);
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
        setMessages((m) => [
          ...m.filter((x) => x.id !== optimistic.id),
          { ...optimistic, id: `c_${Date.now()}` },
          {
            id: data.message.id,
            role: "agent",
            content: data.reply,
            messageType: "text",
            createdAt: data.message.createdAt,
          },
        ]);
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
        setMessages((m) => [
          ...m,
          {
            id: `ar_${Date.now()}`,
            role: "agent",
            content: data.reply,
            messageType: "text",
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
              "flex flex-col overflow-hidden border shadow-2xl",
              embedded
                ? "relative h-[min(720px,75dvh)] w-full rounded-2xl"
                : "bottom-safe fixed z-[60]",
              !embedded &&
                (expanded
                  ? "inset-3 sm:inset-6 rounded-2xl"
                  : "right-3 left-3 h-[min(640px,78dvh)] rounded-2xl sm:right-6 sm:left-auto sm:w-[400px]"),
              dark
                ? "border-white/10 bg-[#0b1220] text-slate-100"
                : "border-slate-200 bg-white text-slate-900",
            )}
            style={
              embedded || expanded
                ? undefined
                : { bottom: "max(1rem, env(safe-area-inset-bottom, 1rem))" }
            }
          >
            {/* Header */}
            <div
              className={cn(
                "flex items-center gap-3 border-b px-4 py-3",
                dark
                  ? "border-white/10 bg-gradient-to-r from-violet-600/30 via-fuchsia-600/20 to-orange-500/20"
                  : "border-slate-100 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-orange-50",
              )}
            >
              <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-orange-500 text-white shadow-lg">
                <Headphones className="h-5 w-5" />
                {online ? (
                  <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-[#0b1220] bg-emerald-400" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">RENU PRESS Support Team</div>
                <div className={cn("flex items-center gap-1.5 text-[11px]", dark ? "text-emerald-300/90" : "text-emerald-600")}>
                  <Circle className="h-2 w-2 fill-current" />
                  Online · Digital Support Desk
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                className={cn("rounded-lg p-2", dark ? "hover:bg-white/10" : "hover:bg-slate-100")}
                aria-label="Toggle theme"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              {!embedded ? (
                <button
                  type="button"
                  onClick={() => setExpanded((e) => !e)}
                  className={cn("rounded-lg p-2", dark ? "hover:bg-white/10" : "hover:bg-slate-100")}
                  aria-label="Expand"
                >
                  {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              ) : null}
              {!embedded ? (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={cn("rounded-lg p-2", dark ? "hover:bg-white/10" : "hover:bg-slate-100")}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            {/* Messages */}
            <div
              className={cn(
                "relative flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-4",
                dark ? "bg-[#070d18]" : "bg-slate-50",
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
                <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> Connecting support desk…
                </div>
              ) : null}

              {messages.map((m) => {
                const mine = m.role === "customer";
                const system = m.role === "system" || m.role === "admin";
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex", mine ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap shadow-sm",
                        mine
                          ? "rounded-br-md bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white"
                          : system
                            ? dark
                              ? "border border-amber-500/30 bg-amber-500/10 text-amber-100"
                              : "border border-amber-200 bg-amber-50 text-amber-900"
                            : dark
                              ? "rounded-bl-md border border-white/10 bg-white/8 text-slate-100"
                              : "rounded-bl-md border border-slate-200 bg-white text-slate-800",
                      )}
                    >
                      {!mine && !system ? (
                        <div className={cn("mb-1 text-[10px] font-bold tracking-wide uppercase", dark ? "text-violet-300" : "text-violet-600")}>
                          Support Team
                        </div>
                      ) : null}
                      {m.messageType === "file" || m.messageType === "image" ? (
                        <div className="mb-1 flex items-center gap-1.5 text-xs opacity-90">
                          {m.messageType === "image" ? <ImageIcon className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                        </div>
                      ) : null}
                      {m.content}
                    </div>
                  </motion.div>
                );
              })}

              {typing ? (
                <div className="flex justify-start">
                  <div
                    className={cn(
                      "flex items-center gap-1 rounded-2xl rounded-bl-md border px-4 py-3",
                      dark ? "border-white/10 bg-white/8" : "border-slate-200 bg-white",
                    )}
                  >
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fuchsia-400 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400 [animation-delay:300ms]" />
                  </div>
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>

            {/* Composer */}
            <div className={cn("border-t p-3", dark ? "border-white/10 bg-[#0c1424]" : "border-slate-200 bg-white")}>
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
                  className={cn("rounded-xl p-2.5", dark ? "hover:bg-white/10 text-slate-300" : "hover:bg-slate-100 text-slate-600")}
                  aria-label="Attach file"
                  disabled={busy}
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.webp,.heic,.pdf,.psd,.ai,.cdr,.svg,.doc,.docx,.zip,.rar,.mp4,.webm,.mp3,.wav,.ogg,.m4a,image/*,application/pdf,audio/*,video/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadFile(f);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowEmoji((s) => !s)}
                  className={cn("rounded-xl p-2.5", dark ? "hover:bg-white/10 text-slate-300" : "hover:bg-slate-100 text-slate-600")}
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
                  placeholder="Type your requirement… (Hinglish OK)"
                  className={cn(
                    "max-h-28 min-h-[42px] flex-1 resize-none rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500/40",
                    dark
                      ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400",
                  )}
                />
                <button
                  type="button"
                  disabled={busy || !input.trim()}
                  onClick={() => void sendText(input)}
                  className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-orange-500 text-white shadow-lg disabled:opacity-40"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
              <p className={cn("mt-2 text-center text-[10px]", dark ? "text-slate-500" : "text-slate-400")}>
                Official RENU PRESS desk · Final quote by team only · Drag & drop files
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
          className="bottom-safe fixed left-3 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 px-4 py-3 text-sm font-bold text-white shadow-2xl shadow-violet-500/40 transition hover:scale-[1.02] active:scale-95 sm:left-6 sm:px-5"
          style={{ bottom: "max(5.5rem, calc(env(safe-area-inset-bottom, 1rem) + 4.5rem))" }}
          aria-label="Open Support Desk"
        >
          <span className="relative grid h-8 w-8 place-items-center rounded-full bg-white/20">
            <Headphones className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-violet-700" />
          </span>
          <span className="hidden sm:inline">Support Desk</span>
        </button>
      ) : null}

      {embedded ? panel : <AnimatePresence>{panel}</AnimatePresence>}
    </>
  );
}
