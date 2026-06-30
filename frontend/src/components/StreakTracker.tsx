import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Info, Check, Calendar } from "lucide-react";
import { DatabaseService } from "../utils";
import { ThemeMode } from "../types";

interface StreakTrackerProps {
  onStreakUpdate?: (count: number) => void;
  standalone?: boolean;
  activeTheme?: ThemeMode;
}

export default function StreakTracker({ onStreakUpdate, standalone = false, activeTheme = "bookish" }: StreakTrackerProps) {
  const [logs, setLogs] = useState<Record<string, boolean>>({});
  const [streak, setStreak] = useState(0);
  const [isOpen, setIsOpen] = useState(standalone);
  const [showFireAnimation, setShowFireAnimation] = useState(false);

  useEffect(() => {
    const loadedLogs = DatabaseService.getStreakLogs();
    setLogs(loadedLogs);
    const count = DatabaseService.getStreakCount();
    setStreak(count);
    if (onStreakUpdate) {
      onStreakUpdate(count);
    }
  }, []);

  const getDaysInCurrentMonth = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 1; i <= numDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const days = getDaysInCurrentMonth();
  const currentMonthName = new Date().toLocaleString("default", { month: "long" });
  const currentYear = new Date().getFullYear();

  const toggleDay = (dateStr: string) => {
    const updated = { ...logs };
    if (updated[dateStr]) {
      delete updated[dateStr];
    } else {
      updated[dateStr] = true;
      // Trigger flame celebration if we completed today
      const todayStr = new Date().toISOString().split("T")[0];
      if (dateStr === todayStr) {
        setShowFireAnimation(true);
        setTimeout(() => setShowFireAnimation(false), 3000);
      }
    }
    
    DatabaseService.saveStreakLogs(updated);
    setLogs(updated);
    
    // Recalculate streak
    setTimeout(() => {
      const newStreak = DatabaseService.getStreakCount();
      setStreak(newStreak);
      if (onStreakUpdate) {
        onStreakUpdate(newStreak);
      }
    }, 50);
  };

  const getThemeStyles = (theme: ThemeMode) => {
    switch (theme) {
      case "bookish":
        return {
          cardBg: "bg-[#FAF6EE] border-[#D1C2A5]",
          textTitle: "text-[#322314]",
          textMuted: "text-[#5C4D3C]/85",
          innerCardBg: "bg-[#F4EFE6]/60 border-[#D1C2A5]/50",
          heatmapHeader: "text-[#5C4D3C]",
          cellActive: "bg-[#322314] hover:bg-[#322314]/90 border-[#322314]",
          cellInactive: "bg-[#FAF6EE] hover:bg-[#F4EFE6] border-[#D1C2A5]/40",
          statusBox: "bg-[#F4EFE6] border-[#D1C2A5]/50 text-[#322314]",
          closeBtn: "text-[#5C4D3C] hover:bg-[#F4EFE6]"
        };
      case "sepia":
        return {
          cardBg: "bg-[#EADFC9] border-[#DCCEB3]",
          textTitle: "text-[#5B4636]",
          textMuted: "text-[#705C4E]/85",
          innerCardBg: "bg-[#F4ECD8]/60 border-[#DCCEB3]/50",
          heatmapHeader: "text-[#705C4E]",
          cellActive: "bg-[#5B4636] hover:bg-[#5B4636]/90 border-[#5B4636]",
          cellInactive: "bg-[#EADFC9] hover:bg-[#F4ECD8] border-[#DCCEB3]/40",
          statusBox: "bg-[#F4ECD8] border-[#DCCEB3]/50 text-[#5B4636]",
          closeBtn: "text-[#705C4E] hover:bg-[#F4ECD8]"
        };
      case "dark":
        return {
          cardBg: "bg-[#2D3748] border-[#4A5568]",
          textTitle: "text-[#EDF2F7]",
          textMuted: "text-[#A0AEC0]/85",
          innerCardBg: "bg-[#1A202C]/60 border-[#4A5568]/50",
          heatmapHeader: "text-[#A0AEC0]",
          cellActive: "bg-[#818CF8] hover:bg-[#818CF8]/90 border-[#818CF8]",
          cellInactive: "bg-[#2D3748] hover:bg-[#1A202C] border-[#4A5568]/40",
          statusBox: "bg-[#1A202C] border-[#4A5568]/50 text-[#EDF2F7]",
          closeBtn: "text-[#A0AEC0] hover:bg-[#1A202C]"
        };
      case "oled":
        return {
          cardBg: "bg-[#121212] border-[#27272A]",
          textTitle: "text-[#F5F5F5]",
          textMuted: "text-[#718096]/85",
          innerCardBg: "bg-[#000000]/60 border-[#27272A]/50",
          heatmapHeader: "text-[#718096]",
          cellActive: "bg-[#F5F5F5] hover:bg-[#F5F5F5]/90 border-[#F5F5F5]",
          cellInactive: "bg-[#121212] hover:bg-[#000000] border-[#27272A]/40",
          statusBox: "bg-[#000000] border-[#27272A]/50 text-[#F5F5F5]",
          closeBtn: "text-[#718096] hover:bg-[#000000]"
        };
      case "light":
      default:
        return {
          cardBg: "bg-white border-[#E2E8F0]",
          textTitle: "text-[#1A202C]",
          textMuted: "text-[#718096]/85",
          innerCardBg: "bg-[#F7FAFC]/60 border-[#E2E8F0]/50",
          heatmapHeader: "text-[#718096]",
          cellActive: "bg-[#4F46E5] hover:bg-[#4F46E5]/90 border-[#4F46E5]",
          cellInactive: "bg-[#FFFFFF] hover:bg-[#F7FAFC] border-[#E2E8F0]/40",
          statusBox: "bg-[#F7FAFC] border-[#E2E8F0]/50 text-[#1A202C]",
          closeBtn: "text-[#718096] hover:bg-[#F7FAFC]"
        };
    }
  };

  const tStyles = getThemeStyles(activeTheme);

  const getCellClasses = (dateStr: string) => {
    if (logs[dateStr]) {
      return tStyles.cellActive;
    }
    return tStyles.cellInactive;
  };

  const getCellTextClasses = (dateStr: string) => {
    const isLogged = logs[dateStr];
    if (isLogged) {
      if (activeTheme === "light" || activeTheme === "dark") {
        return "text-white font-black opacity-100";
      } else if (activeTheme === "bookish") {
        return "text-[#FAF6EE] font-black opacity-100";
      } else if (activeTheme === "sepia") {
        return "text-[#F4ECD8] font-black opacity-100";
      } else if (activeTheme === "oled") {
        return "text-[#000000] font-black opacity-100";
      }
      return "text-white font-black opacity-100";
    }
    
    switch (activeTheme) {
      case "bookish":
        return "text-[#322314] opacity-70 font-bold";
      case "sepia":
        return "text-[#5B4636] opacity-70 font-bold";
      case "dark":
        return "text-[#EDF2F7] opacity-70 font-bold";
      case "oled":
        return "text-[#F5F5F5] opacity-70 font-bold";
      case "light":
      default:
        return "text-[#1A202C] opacity-70 font-bold";
    }
  };

  return (
    <div id="streak-tracker-widget" className="relative">
      {/* Persistent Screen Header Trigger Icon (if not standalone) */}
      {!standalone && (
        <button
          id="streak-header-trigger"
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm border border-transparent"
        >
          <Flame className={`h-5 w-5 ${streak > 0 ? "fill-white text-white animate-pulse" : "text-white/80"}`} />
          <span className="font-mono text-base font-bold">{streak}</span>
          <span className="text-xs font-semibold tracking-wide uppercase opacity-90 hidden sm:inline">Daily Streak</span>
        </button>
      )}

      {/* Slide banner for PWA SW Notification push permission hook (First Onboarding) */}
      <AnimatePresence>
        {!standalone && (
          <OnboardingBanner />
        )}
      </AnimatePresence>

      {/* Modal / Popover grid tracking container */}
      <AnimatePresence>
        {isOpen && (
          <div className={`${standalone ? "" : "absolute right-0 mt-3 z-50 w-80 sm:w-96"}`}>
            <motion.div
              initial={{ opacity: 0, y: standalone ? 0 : 10, scale: standalone ? 1 : 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`p-5 rounded-2xl border shadow-xl ${tStyles.cardBg}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
                    <Flame className="h-5 w-5 fill-current" />
                  </div>
                  <div>
                    <h3 className={`font-sans font-bold text-base ${tStyles.textTitle}`}>Reading Commitment</h3>
                    <p className={`text-xs ${tStyles.textMuted}`}>{currentMonthName} {currentYear}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-2xl font-black text-orange-500">{streak} Days</div>
                  <div className={`text-xs ${tStyles.textMuted}`}>Current streak</div>
                </div>
              </div>

              {/* Github-style Grid */}
              <div className={`p-4 rounded-xl border mb-4 ${tStyles.innerCardBg}`}>
                <div className={`flex items-center justify-between text-xs font-semibold mb-2 ${tStyles.heatmapHeader}`}>
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Commit Heatmap</span>
                  <span>Click cell to toggle log</span>
                </div>
                
                {/* 5 rows (weeks) layout or standard 7x5 flex wrap */}
                <div className="grid grid-cols-7 gap-2">
                  {days.map((day) => {
                    const dateStr = day.toISOString().split("T")[0];
                    const isToday = dateStr === new Date().toISOString().split("T")[0];
                    return (
                      <button
                        key={dateStr}
                        onClick={() => toggleDay(dateStr)}
                        className={`aspect-square rounded-md transition-all hover:scale-110 active:scale-95 relative group cursor-pointer border ${getCellClasses(dateStr)}`}
                        title={`${day.toLocaleDateString()}: ${logs[dateStr] ? "Completed reading goal" : "No record"}`}
                      >
                        <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-mono ${getCellTextClasses(dateStr)}`}>
                          {day.getDate()}
                        </span>
                        {isToday && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border border-white dark:border-zinc-900" />
                        )}
                        {/* Tooltip */}
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-zinc-800 text-white dark:text-zinc-200 text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                          {day.getDate()} {day.toLocaleString("default", { month: "short" })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Info */}
              <div className={`flex gap-2 p-2.5 rounded-lg text-xs border ${tStyles.statusBox}`}>
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  Streak continues as long as you log your reading progress daily. Read today to fuel the flame!
                </p>
              </div>

              {!standalone && (
                <button
                  onClick={() => setIsOpen(false)}
                  className={`w-full mt-4 py-1.5 px-3 rounded-lg text-center text-xs transition-all font-medium cursor-pointer ${tStyles.closeBtn}`}
                >
                  Close Panel
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hardware-accelerated Fire Animation Overlay */}
      <AnimatePresence>
        {showFireAnimation && (
          <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center bg-black/15 backdrop-blur-[1px]">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* SVG Fire effect */}
                <svg viewBox="0 0 100 100" className="w-full h-full animate-bounce">
                  <defs>
                    <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#EA580C" />
                      <stop offset="50%" stopColor="#F97316" />
                      <stop offset="100%" stopColor="#FACC15" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M50 15C50 15 35 35 35 55C35 70 45 80 50 80C55 80 65 70 65 55C65 35 50 15 50 15ZM50 35C50 35 43 45 43 58C43 68 47 72 50 72C53 72 57 68 57 58C57 45 50 35 50 35Z"
                    fill="url(#fireGrad)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Flame className="h-10 w-10 text-white fill-current animate-pulse" />
                </div>
              </div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-lg text-lg flex items-center gap-1.5"
              >
                <Check className="h-5 w-5 stroke-[3]" /> Streak Maintained!
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// First onboarding dismissal push notifications banner (as per Section 3.4)
function OnboardingBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const bannerDismissed = localStorage.getItem("companion_banner_dismissed");
    if (!bannerDismissed) {
      // Trigger short delay after load
      const timer = setTimeout(() => {
        setShow(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleRegister = () => {
    localStorage.setItem("companion_banner_dismissed", "true");
    setShow(false);
    // Mimic standard browser push setup
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission preference registered: ", permission);
      });
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("companion_banner_dismissed", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="fixed bottom-16 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 p-4 rounded-xl bg-slate-900 text-white shadow-2xl z-50 border border-slate-800"
    >
      <div className="flex gap-3">
        <div className="p-2 bg-orange-500 text-white rounded-lg self-start">
          <Calendar className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-sans font-bold text-sm text-white">Turn on Daily Reminders</h4>
          <p className="text-xs text-slate-300 mt-1">
            Register for background reminders to lock in your daily reading streaks and commitment goals.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleRegister}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              Enable Notifications
            </button>
            <button
              onClick={handleDismiss}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
