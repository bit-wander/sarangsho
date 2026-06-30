import { useState, useRef, useEffect } from "react";
import { Award, Trophy, Clock, BookOpen, MessageSquare, ChevronUp, ChevronDown } from "lucide-react";
import { MOCK_LEADERBOARDS } from "../utils";
import { LeaderboardEntry } from "../types";

export default function Leaderboards() {
  const [activeTab, setActiveTab] = useState<"volume" | "reviews" | "readingTime">("volume");
  const [readingTimeFilter, setReadingTimeFilter] = useState<"Daily" | "Weekly" | "All-Time">("Weekly");
  const [isUserCardVisible, setIsUserCardVisible] = useState(true);
  
  const userCardRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get correct dataset based on selection
  const getActiveData = (): LeaderboardEntry[] => {
    if (activeTab === "volume") return MOCK_LEADERBOARDS.volume;
    if (activeTab === "reviews") return MOCK_LEADERBOARDS.reviews;
    // Reading time has sub-filters
    return MOCK_LEADERBOARDS.readingTime[readingTimeFilter];
  };

  const currentData = getActiveData();
  const currentUserEntry = currentData.find(e => e.isCurrentUser);

  // Intersection Observer to detect if the user's score card is visible in the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsUserCardVisible(entry.isIntersecting);
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.2, // Trigger when less than 20% visible
      }
    );

    const currentRef = userCardRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [activeTab, readingTimeFilter, currentData]);

  // Render Podium badge vector
  const renderPodiumBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 text-amber-600 border border-amber-300 shadow-sm font-bold font-sans text-sm relative group">
            🥇
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mb-1">
              1st Place
            </span>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 text-slate-500 border border-slate-300 shadow-sm font-bold font-sans text-sm relative group">
            🥈
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mb-1">
              2nd Place
            </span>
          </div>
        );
      case 3:
        return (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shadow-sm font-bold font-sans text-sm relative group">
            🥉
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mb-1">
              3rd Place
            </span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-7 w-7 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 font-semibold font-mono text-xs">
            {rank}
          </div>
        );
    }
  };

  const getMetricLabel = () => {
    if (activeTab === "volume") return "books";
    if (activeTab === "reviews") return "reviews";
    return "minutes";
  };

  return (
    <div id="leaderboard-panel" className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-sm relative">
      {/* Header & Tabs */}
      <div className="p-5 border-b border-gray-50 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/50 text-yellow-600 dark:text-yellow-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-sans font-bold text-gray-900 dark:text-white text-lg leading-tight">Global Readerboard</h2>
            <p className="text-xs text-gray-400 dark:text-zinc-500">Compete with readers around the world</p>
          </div>
        </div>

        {/* Primary Tabs */}
        <div className="flex p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl">
          <button
            onClick={() => setActiveTab("volume")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "volume"
                ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Volume</span>
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "reviews"
                ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Top Reviews</span>
          </button>
          <button
            onClick={() => setActiveTab("readingTime")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "readingTime"
                ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Reading Time</span>
          </button>
        </div>

        {/* Secondary Sub-navigation Bar for Reading Time */}
        {activeTab === "readingTime" && (
          <div className="flex gap-2 mt-3 p-0.5 bg-gray-200/50 dark:bg-zinc-900 rounded-lg">
            {(["Daily", "Weekly", "All-Time"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setReadingTimeFilter(filter)}
                className={`flex-1 py-1 px-2 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  readingTimeFilter === filter
                    ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard List (Scrollable) */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[400px] scrollbar-thin"
      >
        {currentData.map((entry) => {
          const isCurrentUser = entry.isCurrentUser;
          return (
            <div
              key={`${entry.name}-${entry.rank}`}
              ref={isCurrentUser ? userCardRef : null}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                isCurrentUser
                  ? "bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-200/60 dark:border-indigo-900/40 shadow-sm"
                  : "bg-white dark:bg-zinc-900/60 border-gray-100 dark:border-zinc-800/80 hover:border-gray-200 dark:hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Rank Badge */}
                <div className="w-8 flex justify-center">
                  {renderPodiumBadge(entry.rank)}
                </div>

                {/* Avatar */}
                <img
                  src={entry.avatar}
                  alt={entry.name}
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 rounded-full object-cover border border-gray-100 dark:border-zinc-800 shadow-sm"
                />

                {/* Name */}
                <div>
                  <h4 className={`font-sans text-sm font-semibold leading-tight ${
                    isCurrentUser ? "text-indigo-900 dark:text-indigo-200" : "text-gray-800 dark:text-zinc-200"
                  }`}>
                    {entry.name}
                    {isCurrentUser && (
                      <span className="ml-1.5 text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full font-bold">
                        YOU
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500">Rank #{entry.rank}</p>
                </div>
              </div>

              {/* Score Metric Value */}
              <div className="text-right">
                <span className="font-mono text-sm font-bold text-gray-950 dark:text-white">
                  {entry.value.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500 ml-1">
                  {getMetricLabel()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* FIXED STICKY FOOTER DUPLICATE FOR LOGGED-IN USER */}
      {currentUserEntry && !isUserCardVisible && (
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-indigo-500/10 to-indigo-500/0 border-t border-indigo-200 dark:border-indigo-900 bg-white dark:bg-zinc-900 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-10 animate-slide-up">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
            <div className="flex items-center gap-3">
              <div className="w-8 flex justify-center">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-600 text-white font-mono text-xs font-bold shadow">
                  {currentUserEntry.rank}
                </div>
              </div>
              <img
                src={currentUserEntry.avatar}
                alt="You"
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full object-cover border border-indigo-300 dark:border-indigo-700 shadow-sm"
              />
              <div>
                <h4 className="font-sans text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  {currentUserEntry.name}
                  <span className="ml-1.5 text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded-full">
                    STICKY VIEW
                  </span>
                </h4>
                <p className="text-[9px] text-indigo-400">Position locked at the bottom</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs font-bold text-indigo-950 dark:text-white">
                {currentUserEntry.value.toLocaleString()}
              </span>
              <span className="text-[9px] text-indigo-400 ml-1">
                {getMetricLabel()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
