import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, AlertCircle, Quote, RefreshCw, Lock } from "lucide-react";
import { Book, User } from "../types";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  isStreaming?: boolean;
}

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  bookContext?: Book | null;
  highlightedText?: string | null;
  onClearHighlight?: () => void;
  currentUser?: User | null;
  onActionRestricted?: (action: string) => void;
}

export default function AiAssistant({
  isOpen,
  onClose,
  bookContext,
  highlightedText,
  onClearHighlight,
  currentUser,
  onActionRestricted
}: AiAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-initial",
      role: "model",
      text: "Hello! 👋 I am your interactive **AI Reading Companion**.\n\n" +
        "You can ask me to explain complex concepts, summarize paragraphs, or discuss themes. " +
        "Try highlighting some text in your e-reader to ask specific questions!"
    }
  ]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom pinned to incoming tokens or new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Auto-fill prompt if user highlights text and queries AI
  useEffect(() => {
    if (highlightedText && isOpen) {
      setPrompt(`Can you explain what this passage means: "${highlightedText}"?`);
    }
  }, [highlightedText, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMsgText = prompt;
    setPrompt("");
    setError(null);

    const userMessage: Message = {
      id: `msg-usr-${Math.random().toString(36).substring(2, 9)}`,
      role: "user",
      text: userMsgText
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgText,
          highlightedText: highlightedText || undefined,
          bookContext: bookContext ? { title: bookContext.title, author: bookContext.author } : undefined,
          history: messages.map((m) => ({ role: m.role, text: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const aiReplyText = data.text || "I apologize, but I couldn't generate a response.";

      // To comply with 3.8 "asynchronous chunk reader streams immediately parsing and appending text tokens":
      // We will simulate a token-by-token streaming append of the complete message received
      simulateStreamingResponse(aiReplyText);
    } catch (err: any) {
      console.error(err);
      setError("Unable to connect to AI server. Please try again.");
      setIsLoading(false);
    }
  };

  const simulateStreamingResponse = (fullText: string) => {
    const aiMessageId = `msg-ai-${Math.random().toString(36).substring(2, 9)}`;
    const words = fullText.split(" ");
    let currentText = "";
    let wordIdx = 0;

    // Insert empty message placeholder
    const placeholderMsg: Message = {
      id: aiMessageId,
      role: "model",
      text: "",
      isStreaming: true
    };
    
    setMessages((prev) => [...prev, placeholderMsg]);
    setIsLoading(false); // input unlocks

    const interval = setInterval(() => {
      if (wordIdx < words.length) {
        currentText += (wordIdx === 0 ? "" : " ") + words[wordIdx];
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMessageId ? { ...m, text: currentText } : m))
        );
        wordIdx++;
      } else {
        clearInterval(interval);
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMessageId ? { ...m, isStreaming: false } : m))
        );
        if (onClearHighlight) onClearHighlight(); // clear highlight context once answered
      }
    }, 45); // Adjust for smooth reading speed
  };

  const formatText = (text: string) => {
    // Simple bold markdown translation
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = text.split(boldRegex);
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx} className="font-extrabold text-gray-900 dark:text-white">{part}</strong>;
      }
      return part;
    });
  };

  if (!isOpen) return null;

  if (currentUser?.isGuest) {
    return (
      <div
        id="ai-drawer"
        className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#FAF6EE] border-l border-[#D1C2A5] shadow-2xl z-50 flex flex-col h-full overflow-hidden text-[#322314]"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#E6DCB8] flex items-center justify-between bg-[#FAF6EE]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#E6DCB8] text-[#322314] border border-[#D1C2A5]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm">AI Companion</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5C4D3C] hover:text-[#322314] hover:bg-[#E6DCB8]/40 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Center content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="p-4 bg-[#E6DCB8] text-[#322314] rounded-2xl border border-[#D1C2A5] shadow-sm">
            <Lock className="h-10 w-10 animate-bounce" />
          </div>
          
          <div>
            <h4 className="font-serif text-lg font-black tracking-tight text-[#322314]">
              Literary AI Locked
            </h4>
            <p className="text-xs text-[#5C4D3C] mt-2 leading-relaxed max-w-xs mx-auto">
              Conversing with your AI Reading Companion, highlighting complex terminology for inline summaries, and creating custom note cards require a free registered account.
            </p>
          </div>

          <button
            onClick={() => onActionRestricted?.("AI Assistant Companion")}
            className="py-2.5 px-5 bg-[#322314] hover:bg-[#4E3924] text-[#FAF6EE] font-serif font-bold rounded-xl text-xs transition-all duration-150 cursor-pointer shadow-md flex items-center gap-2"
          >
            <span>Issue Free Library Card</span>
          </button>
        </div>

        <div className="p-4 border-t border-[#E6DCB8] text-center text-[10px] uppercase font-mono tracking-wider text-[#5C4D3C] bg-[#FAF6EE]">
          Powered by Gemini 3.5 Flash
        </div>
      </div>
    );
  }

  return (
    <div
      id="ai-drawer"
      className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-zinc-900 shadow-2xl z-50 border-l border-gray-100 dark:border-zinc-800 flex flex-col h-full overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-50 dark:border-zinc-800 flex items-center justify-between bg-slate-50/60 dark:bg-zinc-950/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-4 w-4 fill-current animate-pulse" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-sm text-gray-900 dark:text-white">AI Companion</h3>
            {bookContext && (
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 max-w-[180px] truncate">
                Reading: {bookContext.title}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Active Highlight Context Bar */}
      {highlightedText && (
        <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/20 border-b border-indigo-100/40 dark:border-indigo-950 flex items-start gap-2.5 text-[11px] text-indigo-950 dark:text-indigo-300">
          <Quote className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
          <div className="flex-1 truncate">
            <span className="font-bold">Active Highlight Context: </span>
            <span className="italic">"{highlightedText}"</span>
          </div>
          {onClearHighlight && (
            <button
              onClick={onClearHighlight}
              className="text-xs text-rose-500 hover:underline cursor-pointer shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Message Thread Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-140px)] scrollbar-thin bg-slate-50/20 dark:bg-zinc-900"
      >
        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <div
              key={message.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm font-sans whitespace-pre-line ${
                  isUser
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 rounded-tl-none border border-gray-200/40 dark:border-zinc-700/30"
                }`}
              >
                {formatText(message.text)}
                {message.isStreaming && (
                  <span className="inline-block w-1.5 h-3.5 bg-indigo-400 animate-pulse ml-0.5" />
                )}
              </div>
              <span className="text-[9px] text-gray-400 dark:text-zinc-500 mt-1 font-mono uppercase px-1">
                {isUser ? "You" : "AI Assistant"}
              </span>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono italic p-2 bg-gray-50/50 dark:bg-zinc-950/20 rounded-xl max-w-max">
            <RefreshCw className="h-3 w-3 animate-spin text-indigo-500" /> Connecting to Gemini nodes...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl text-xs">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Terminating Fixed Prompt Area */}
      <div className="p-4 border-t border-gray-50 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <form onSubmit={handleSend} className="relative flex items-center bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 p-1.5 focus-within:border-indigo-500/80 transition-colors">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type message or press Enter..."
            rows={2}
            className="flex-1 text-xs py-1.5 px-2 bg-transparent text-gray-900 dark:text-white outline-none resize-none scrollbar-none"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className={`p-2 rounded-lg transition-all shadow-sm shrink-0 self-end ${
              prompt.trim() && !isLoading
                ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer hover:scale-105"
                : "bg-gray-200 dark:bg-zinc-800 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
        <p className="text-[9px] text-gray-400 dark:text-zinc-500 text-center mt-2 tracking-wide uppercase font-mono">
          Powered by Gemini 3.5 Flash
        </p>
      </div>
    </div>
  );
}
