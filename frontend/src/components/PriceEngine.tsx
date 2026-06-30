import { useState } from "react";
import { ShoppingCart, Star, HelpCircle, ArrowRight, ExternalLink, Activity as TelemetryIcon, BookCheck } from "lucide-react";
import { INITIAL_BOOKS, MOCK_PRICES, getCoverGradient } from "../utils";
import { Book, PriceOption, User } from "../types";

interface PriceEngineProps {
  currentUser?: User | null;
  onActionRestricted?: (action: string) => void;
}

export default function PriceEngine({ currentUser, onActionRestricted }: PriceEngineProps) {
  const [selectedBook, setSelectedBook] = useState<Book>(INITIAL_BOOKS[0]);
  const [telemetryLogs, setTelemetryLogs] = useState<any[]>([]);

  const handleBookChange = (bookId: string) => {
    const found = INITIAL_BOOKS.find((b) => b.id === bookId);
    if (found) {
      setSelectedBook(found);
    }
  };

  const getPricingList = (): PriceOption[] => {
    return MOCK_PRICES[selectedBook.title] || [];
  };

  const prices = getPricingList();

  // Redirection Sequence and Telemetry Event Logging
  const triggerPurchaseRedirection = (option: PriceOption) => {
    if (currentUser?.isGuest) {
      onActionRestricted?.("outbound affiliate checkout");
      return;
    }

    const timestamp = new Date().toISOString();
    const event = {
      eventId: `telemetry-evt-${Math.random().toString(36).substring(2, 9)}`,
      timestamp,
      bookTitle: selectedBook.title,
      platform: option.platform,
      price: option.price,
      isBestValue: option.isBestValue,
      referrerDomain: window.location.origin,
      clientHeaders: {
        userAgent: navigator.userAgent,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        language: navigator.language
      }
    };

    // Append to internal telemetry list
    setTelemetryLogs((prev) => [event, ...prev].slice(0, 10));

    // Show beautiful telemetry logging popover before the redirection
    const logDetails = JSON.stringify(event, null, 2);
    console.log("Telemetry outbound tracking log captured successfully:", event);
    
    // Simulate redirection timeout to let user see client-side tracking event trigger
    alert(
      `[Affiliate Tracking Event Captured!]\n\n` +
      `Platform: ${option.platform}\n` +
      `Book: "${selectedBook.title}"\n` +
      `Price: $${option.price}\n` +
      `Best Value: ${option.isBestValue ? "YES" : "NO"}\n\n` +
      `Redirecting securely to ${option.platform}...`
    );

    // Clean redirection sequence into an independent external browser window
    window.open(option.affiliateUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div id="price-engine-container" className="space-y-6">
      {/* Selector Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="font-sans font-bold text-gray-900 dark:text-white text-xl flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-emerald-500" /> Physical Price Engine
          </h2>
          <p className="text-xs text-gray-400 dark:text-zinc-500">
            Compare live physical pricing, web-scraped real-time and select the absolute lowest tier
          </p>
        </div>

        {/* Dropdown selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">
            Select Book:
          </label>
          <select
            value={selectedBook.id}
            onChange={(e) => handleBookChange(e.target.value)}
            className="text-xs font-semibold py-2 px-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          >
            {INITIAL_BOOKS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} ({b.author})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Split-screen desktop detail view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Heavy cover art card */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-slate-100 dark:from-zinc-900 dark:to-zinc-950/40 border border-gray-100 dark:border-zinc-800/80">
          <div
            className={`w-48 h-72 rounded-xl bg-gradient-to-br ${getCoverGradient(
              selectedBook.title
            )} shadow-2xl relative flex flex-col justify-between p-5 text-white overflow-hidden group`}
          >
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start">
              <span className="text-[9px] uppercase font-mono tracking-widest bg-white/20 px-2 py-0.5 rounded-full font-bold">
                {selectedBook.genre}
              </span>
              <BookCheck className="h-4 w-4 text-white/80" />
            </div>
            <div>
              <h3 className="font-serif font-black text-lg leading-tight tracking-tight text-white mb-1 drop-shadow-md">
                {selectedBook.title}
              </h3>
              <p className="font-sans text-xs text-white/90 drop-shadow-sm font-medium">
                by {selectedBook.author}
              </p>
            </div>
            <div className="w-1.5 h-full bg-white/20 absolute left-0 top-0 bottom-0" />
          </div>
          <p className="text-[11px] font-mono text-gray-400 mt-4">
            ISBN-13: {selectedBook.isbn || "Unavailable"}
          </p>
        </div>

        {/* Right: Titles, metadata descriptors & Aggregated community evaluation block */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30 font-mono">
                {selectedBook.publishedYear} Publication
              </span>
              <span className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                {selectedBook.totalPages} pages
              </span>
            </div>
            
            <h1 className="font-sans font-bold text-gray-900 dark:text-white text-2xl tracking-tight">
              {selectedBook.title}
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 mt-0.5">
              Written by <span className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedBook.author}</span>
            </p>

            <p className="text-xs text-gray-600 dark:text-zinc-300 mt-3 leading-relaxed">
              {selectedBook.description}
            </p>
          </div>

          {/* Aggregated community evaluation block */}
          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-zinc-950/30 border border-amber-200/50 dark:border-zinc-800/60 flex items-center gap-4">
            <div className="text-center shrink-0 pr-4 border-r border-gray-200 dark:border-zinc-800">
              <div className="text-3xl font-black text-gray-900 dark:text-white font-mono leading-none">4.8</div>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase mt-1">Community Score</p>
            </div>
            <div className="flex-1">
              <div className="flex gap-0.5 text-amber-500 mb-1">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-sans leading-snug">
                Highly rated across physical distributing platforms, especially for strong system-building takeaways and conceptual density.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing comparison structured grid spreadsheet */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-gray-50 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-sans font-bold text-sm text-gray-900 dark:text-white">Scraped Distribution Matrix</h3>
          <span className="text-[10px] text-emerald-600 font-semibold font-mono animate-pulse">● LIVE PRICING STABLE</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-950/40 text-gray-400 dark:text-zinc-500 font-bold font-mono tracking-wide uppercase border-b border-gray-100 dark:border-zinc-800">
                <th className="py-3 px-5">Platform Distributor</th>
                <th className="py-3 px-4">Quality Format</th>
                <th className="py-3 px-4">Estimated Delivery</th>
                <th className="py-3 px-4">Retail Price</th>
                <th className="py-3 px-4 text-right">Affiliate Checkout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
              {prices.map((option, idx) => (
                <tr
                  key={`${option.platform}-${idx}`}
                  className={`hover:bg-slate-50/50 dark:hover:bg-zinc-950/20 transition-all ${
                    option.isBestValue ? "bg-emerald-50/10 dark:bg-emerald-950/5" : ""
                  }`}
                >
                  <td className="py-3 px-5 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {option.platform}
                    {option.isBestValue && (
                      <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-wide uppercase shadow-sm">
                        Best Value
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      option.condition === "New"
                        ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                        : option.condition === "Used"
                        ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400"
                        : "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400"
                    }`}>
                      {option.condition}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-zinc-400 font-sans">{option.delivery}</td>
                  <td className="py-3 px-4 font-mono font-bold text-gray-900 dark:text-white text-sm">
                    ${option.price.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => triggerPurchaseRedirection(option)}
                      className="inline-flex items-center gap-1 bg-gray-900 hover:bg-emerald-600 text-white dark:bg-zinc-800 dark:hover:bg-emerald-600 px-3 py-1.5 rounded-lg transition-all font-semibold text-xs cursor-pointer group shadow-sm active:scale-95"
                    >
                      <span>Checkout</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Telemetry Log Viewer */}
      {telemetryLogs.length > 0 && (
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-slate-300 space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-slate-400">
            <span className="flex items-center gap-1.5"><TelemetryIcon className="h-4 w-4 text-emerald-400 animate-pulse" /> Local Client Telemetry Logs</span>
            <span>Recent Events (Pre-redirection capture)</span>
          </div>
          <div className="max-h-28 overflow-y-auto font-mono text-[10px] space-y-2 scrollbar-thin divide-y divide-slate-800/80">
            {telemetryLogs.map((log) => (
              <div key={log.eventId} className="pt-2 flex flex-col gap-1 text-slate-400">
                <div className="flex justify-between font-bold text-emerald-400">
                  <span>{log.eventId}</span>
                  <span>{log.timestamp}</span>
                </div>
                <p>
                  Outbound Click: <span className="text-white">"{log.bookTitle}"</span> to <span className="text-amber-400 font-semibold">{log.platform}</span> @ <span className="text-white">${log.price}</span> (BestValue: {String(log.isBestValue)})
                </p>
                <p className="opacity-75 text-[9px]">
                  Payload Ref: {log.referrerDomain} | UA: {log.clientHeaders.userAgent.substring(0, 50)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
