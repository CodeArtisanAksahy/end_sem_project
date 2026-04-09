"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";

/* ── Markdown-lite renderer ───────────────────────────────── */
function renderMarkdown(text: string) {
  // Split into lines and process
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Empty line → spacer
    if (line.trim() === "") {
      elements.push(<div key={key++} className="h-2" />);
      continue;
    }

    // Heading lines (### or **)
    const h3Match = line.match(/^###\s+(.+)/);
    if (h3Match) {
      elements.push(
        <h3 key={key++} className="font-bold text-sm mt-3 mb-1 text-[#2f3334]">
          {inlineFormat(h3Match[1])}
        </h3>
      );
      continue;
    }

    // Bullet points
    const bulletMatch = line.match(/^[•\-\*]\s+(.+)/);
    if (bulletMatch) {
      elements.push(
        <div key={key++} className="flex gap-2 items-start ml-1 my-0.5">
          <span className="text-[#5a7d95] mt-0.5 text-xs">●</span>
          <span className="flex-1 text-sm leading-relaxed">{inlineFormat(bulletMatch[1])}</span>
        </div>
      );
      continue;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      elements.push(
        <div key={key++} className="flex gap-2 items-start ml-1 my-0.5">
          <span className="text-[#5a7d95] font-semibold text-xs min-w-[18px]">{numMatch[1]}.</span>
          <span className="flex-1 text-sm leading-relaxed">{inlineFormat(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Arrow lines (→)
    if (line.trim().startsWith("→") || line.trim().startsWith("➡️") || line.trim().startsWith("⏸️") || line.trim().startsWith("⬅️")) {
      elements.push(
        <div key={key++} className="ml-4 text-sm text-[#4a6a7d] my-0.5 leading-relaxed">
          {inlineFormat(line.trim())}
        </div>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={key++} className="text-sm leading-relaxed my-0.5">
        {inlineFormat(line)}
      </p>
    );
  }

  return <>{elements}</>;
}

/* ── Inline formatting: **bold**, *italic*, `code` ─────── */
function inlineFormat(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Process **bold**, then *italic*, then `code`
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Push text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(
        <strong key={key++} className="font-semibold text-[#2f3334]">
          {match[2]}
        </strong>
      );
    } else if (match[4]) {
      // *italic*
      parts.push(
        <em key={key++} className="italic text-[#5a7d95]">
          {match[4]}
        </em>
      );
    } else if (match[6]) {
      // `code`
      parts.push(
        <code key={key++} className="bg-[#e8edf0] text-[#3e637f] px-1.5 py-0.5 rounded text-xs font-mono">
          {match[6]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/* ── Main Component ───────────────────────────────────────── */
export default function AICompanionPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/companion/chat").then(res => res.json()).then(data => {
      if (data.messages) setMessages(data.messages);
    });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || loading) return;
    const newMsg = {
      id: Date.now(),
      sender: "user",
      text: msgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setLoading(true);
    inputRef.current?.focus();

    try {
      const res = await fetch("/api/companion/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msgText })
      });
      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, data.reply]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: "ai",
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
    setLoading(false);
  };

  const quickActions = [
    { icon: "healing", label: "I need to vent", color: "#e74c3c" },
    { icon: "self_improvement", label: "Suggest an exercise", color: "#27ae60" },
    { icon: "mood", label: "Log my mood", color: "#f39c12" },
    { icon: "lightbulb", label: "Weekly insight", color: "#3498db" },
    { icon: "bedtime", label: "Help me sleep", color: "#8e44ad" },
    { icon: "show_chart", label: "Show my progress", color: "#1abc9c" },
  ];

  return (
    <>
      {/* ── Sidebar (Desktop) ── */}
      <aside className="fixed left-0 top-0 w-72 flex flex-col p-6 space-y-8 bg-[#f2f4f4] h-[calc(100vh-2rem)] my-4 ml-4 rounded-r-[3rem] shadow-[0_12px_32px_rgba(47,51,52,0.06)] hidden md:flex font-['Plus_Jakarta_Sans'] tracking-wide z-40">
        <div className="px-4">
          <h1 className="font-['Manrope'] font-bold text-[#2f3334] text-2xl">Serene Sanctuary</h1>
          <p className="text-[#5b6061] text-sm mt-1">Your Digital Deep Breath</p>
        </div>
        <nav className="flex-1 space-y-2">
          <a className="text-[#5b6061] px-6 py-3 hover:bg-white/50 rounded-full flex items-center gap-4 transition-all hover:translate-x-1 duration-300" href="/">
            <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
            <span>Home</span>
          </a>
          <a className="bg-white text-[#3e637f] rounded-full px-6 py-3 font-semibold shadow-sm flex items-center gap-4" href="/companion">
            <span className="material-symbols-outlined" data-icon="psychology" style={{ fontVariationSettings: `'FILL' 1` }}>psychology</span>
            <span>Companion</span>
          </a>
          <a className="text-[#5b6061] px-6 py-3 hover:bg-white/50 rounded-full flex items-center gap-4 transition-all hover:translate-x-1 duration-300" href="/exercises">
            <span className="material-symbols-outlined" data-icon="spa">spa</span>
            <span>Library</span>
          </a>
          <a className="text-[#5b6061] px-6 py-3 hover:bg-white/50 rounded-full flex items-center gap-4 transition-all hover:translate-x-1 duration-300" href="/insights">
            <span className="material-symbols-outlined" data-icon="auto_graph">auto_graph</span>
            <span>Stats</span>
          </a>
        </nav>
        <div className="mt-auto px-4 pb-4">
          <button onClick={() => router.push('/exercises')} className="w-full bg-gradient-to-r from-[#3e637f] to-[#5a7d95] text-white py-4 rounded-xl font-semibold shadow-lg transition-transform active:scale-95 duration-200">
            Start Meditation
          </button>
        </div>
      </aside>

      {/* ── Main Chat Area ── */}
      <main className="md:ml-80 min-h-screen flex flex-col relative" style={{ background: "linear-gradient(180deg, #f8fafb 0%, #eef2f5 100%)" }}>

        {/* ── Header ── */}
        <header className="fixed top-0 right-0 left-0 md:left-80 z-30 h-20 flex justify-between items-center px-8 font-['Manrope']" style={{ background: "rgba(248,250,251,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3e637f, #5a7d95)" }}>
              <span className="material-symbols-outlined text-white text-xl" data-icon="psychology" style={{ fontVariationSettings: `'FILL' 1` }}>psychology</span>
            </div>
            <div>
              <h2 className="text-[#2f3334] font-bold text-lg">Serene Guide</h2>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-[#5b6061] text-xs font-medium">{loading ? "Thinking..." : "Online • Ready to listen"}</span>
              </div>
            </div>
          </div>
          <a href="/" className="text-[#5b6061] hover:text-[#3e637f] transition-colors text-sm font-semibold flex items-center gap-2">
            Logout <span className="material-symbols-outlined text-lg" data-icon="logout">logout</span>
          </a>
        </header>

        {/* ── Chat Messages ── */}
        <div className="flex-1 mt-24 mb-48 px-4 md:px-10 flex flex-col gap-5 max-w-4xl mx-auto w-full">

          {/* Date pill */}
          <div className="flex justify-center my-4">
            <span className="bg-white/80 px-5 py-1.5 rounded-full text-xs text-[#5b6061] font-semibold tracking-wider shadow-sm border border-[#e0e4e7]">TODAY</span>
          </div>

          {/* Welcome if empty */}
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center flex-1 py-20 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "linear-gradient(135deg, #3e637f, #5a7d95)" }}>
                <span className="material-symbols-outlined text-white text-4xl" data-icon="psychology" style={{ fontVariationSettings: `'FILL' 1` }}>psychology</span>
              </div>
              <h3 className="font-['Manrope'] font-bold text-xl text-[#2f3334] mb-2">Welcome to Serene Guide</h3>
              <p className="text-[#5b6061] text-sm max-w-md mb-8">Your AI wellness companion powered by ML. I can help with mood tracking, breathing exercises, personalized insights, and more.</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {quickActions.slice(0, 4).map(action => (
                  <button key={action.label} onClick={() => sendMessage(action.label)} className="px-4 py-2.5 bg-white hover:bg-[#f0f3f5] text-[#3e637f] rounded-2xl text-sm font-medium transition-all shadow-sm border border-[#e0e4e7] hover:shadow-md hover:-translate-y-0.5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base" data-icon={action.icon}>{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Message Bubbles ── */}
          {messages.map((msg: any) => msg.sender === 'ai' ? (
            /* ── AI Message ── */
            <div key={msg.id} className="flex items-start gap-3 max-w-[88%] animate-[fadeUp_0.3s_ease-out]">
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center mt-1" style={{ background: "linear-gradient(135deg, #3e637f, #5a7d95)" }}>
                <span className="material-symbols-outlined text-white text-base" data-icon="spa">spa</span>
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-[#3e637f] text-xs tracking-wide">SERENE GUIDE</span>
                  {msg.time && <span className="text-[#9ca3af] text-[10px]">{msg.time}</span>}
                </div>
                <div className="bg-white p-5 rounded-2xl rounded-tl-md shadow-sm border border-[#e8edf0] text-[#374151] leading-relaxed">
                  {renderMarkdown(msg.text)}
                </div>
              </div>
            </div>
          ) : (
            /* ── User Message ── */
            <div key={msg.id} className="flex items-start gap-3 max-w-[80%] ml-auto flex-row-reverse animate-[fadeUp_0.2s_ease-out]">
              <div className="w-9 h-9 rounded-full flex-shrink-0 mt-1 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                <span className="text-white text-sm font-bold">J</span>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <div className="flex items-center gap-2 mb-0.5">
                  {msg.time && <span className="text-[#9ca3af] text-[10px]">{msg.time}</span>}
                  <span className="font-semibold text-[#6366f1] text-xs tracking-wide">YOU</span>
                </div>
                <div className="p-4 rounded-2xl rounded-tr-md shadow-sm text-white leading-relaxed text-sm" style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}

          {/* ── Typing Indicator ── */}
          {loading && (
            <div className="flex items-start gap-3 max-w-[88%] animate-[fadeUp_0.3s_ease-out]">
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center mt-1" style={{ background: "linear-gradient(135deg, #3e637f, #5a7d95)" }}>
                <span className="material-symbols-outlined text-white text-base animate-pulse" data-icon="spa">spa</span>
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-md shadow-sm border border-[#e8edf0]">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3e637f] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#5a7d95] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#7a9aad] animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="text-xs text-[#9ca3af] ml-2">Serene Guide is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* ── Sticky Footer ── */}
        <div className="fixed bottom-0 right-0 left-0 md:left-80 z-30 px-4 md:px-10 pb-6 pt-3" style={{ background: "linear-gradient(0deg, rgba(238,242,245,1) 60%, rgba(238,242,245,0) 100%)" }}>
          <div className="max-w-4xl mx-auto w-full space-y-3">

            {/* Quick Actions */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {quickActions.map(action => (
                <button
                  key={action.label}
                  onClick={() => sendMessage(action.label)}
                  disabled={loading}
                  className="whitespace-nowrap px-4 py-2 bg-white hover:bg-[#f0f3f5] text-[#374151] rounded-full text-xs font-medium transition-all border border-[#e0e4e7] flex items-center gap-2 disabled:opacity-40 hover:shadow-sm hover:-translate-y-0.5 active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm" style={{ color: action.color }} data-icon={action.icon}>{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="relative flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  className="w-full h-14 pl-6 pr-16 bg-white border border-[#d1d5db] rounded-2xl focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] transition-all text-[#374151] placeholder:text-[#9ca3af] shadow-sm text-sm font-medium outline-none"
                  placeholder="Share your thoughts..."
                  type="text"
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
              >
                <span className="material-symbols-outlined text-white text-xl" data-icon="send" style={{ fontVariationSettings: `'FILL' 1` }}>send</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Decorative Blurs ── */}
        <div className="fixed top-0 right-0 -z-10 opacity-10 pointer-events-none">
          <div className="w-[500px] h-[500px] bg-[#3e637f] blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="fixed bottom-0 left-80 -z-10 opacity-10 pointer-events-none">
          <div className="w-[400px] h-[400px] bg-[#7c3aed] blur-[130px] rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl flex justify-around items-center px-4 z-50 border-t border-[#e0e4e7]">
        <button onClick={() => router.push('/')} className="flex flex-col items-center gap-1 text-[#5b6061]">
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#3e637f]">
          <span className="material-symbols-outlined" data-icon="psychology" style={{ fontVariationSettings: `'FILL' 1` }}>psychology</span>
        </button>
        <button onClick={() => router.push('/exercises')} className="flex flex-col items-center gap-1 text-[#5b6061]">
          <span className="material-symbols-outlined" data-icon="spa">spa</span>
        </button>
        <button onClick={() => router.push('/insights')} className="flex flex-col items-center gap-1 text-[#5b6061]">
          <span className="material-symbols-outlined" data-icon="auto_graph">auto_graph</span>
        </button>
      </nav>

      {/* ── Animations ── */}
      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}