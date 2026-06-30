import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Trophy,
  MessageSquare,
  ShoppingCart,
  Search,
  Sparkles,
  Wifi,
  CloudLightning,
  AlertCircle,
  X,
  Book,
  Flame,
  CheckCircle2,
  BookmarkCheck,
  LogOut,
  Lock,
  ShieldAlert,
  Shield,
  User as UserIcon
} from "lucide-react";
import { ThemeMode, User } from "./types";
import { DatabaseService, AuthService, INITIAL_BOOKS, getCoverGradient } from "./utils";
import Dashboard from "./components/Dashboard";
import Library from "./components/Library";
import SocialFeed from "./components/SocialFeed";
import Leaderboards from "./components/Leaderboards";
import PriceEngine from "./components/PriceEngine";
import AdminPanel from "./components/AdminPanel";
import AiAssistant from "./components/AiAssistant";
import StreakTracker from "./components/StreakTracker";
import AuthView from "./components/AuthView";
import BookDetailPage from "./components/BookDetailPage";
import UserProfile from "./components/UserProfile";
import AuthorPage from "./components/AuthorPage";
import PublisherPage from "./components/PublisherPage";

// Exact HEX Design tokens from Section 2.1
const THEMES = {
  light: {
    bg: "#FFFFFF",
    surface: "#F7FAFC",
    text: "#1A202C",
    border: "#E2E8F0",
    accent: "#4F46E5",
    accentText: "#FFFFFF"
  },
  dark: {
    bg: "#1A202C",
    surface: "#2D3748",
    text: "#EDF2F7",
    border: "#4A5568",
    accent: "#818CF8",
    accentText: "#1A202C"
  },
  sepia: {
    bg: "#F4ECD8",
    surface: "#EADFC9",
    text: "#5B4636",
    border: "#DCCEB3",
    accent: "#5B4636",
    accentText: "#F4ECD8"
  },
  oled: {
    bg: "#000000",
    surface: "#121212",
    text: "#F5F5F5",
    border: "#27272A",
    accent: "#F5F5F5",
    accentText: "#000000"
  },
  bookish: {
    bg: "#F4EFE6",
    surface: "#FAF6EE",
    text: "#322314",
    border: "#D1C2A5",
    accent: "#322314",
    accentText: "#FAF6EE"
  }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTheme, setActiveTheme] = useState<ThemeMode>("bookish");
  const [activeView, setActiveView] = useState<"dashboard" | "library" | "social" | "leaderboards" | "pricing" | "admin" | "book-detail" | "profile" | "author" | "publisher">("dashboard");
  const [previousView, setPreviousView] = useState<any>("dashboard");
  const [viewHistory, setViewHistory] = useState<any[]>([]);

  const navigateToView = (newView: any, prevVal?: any) => {
    const mainViews = ["dashboard", "library", "social", "leaderboards", "pricing", "admin"];
    const historySource = prevVal || activeView;
    
    if (mainViews.includes(newView)) {
      setViewHistory([]);
      setPreviousView("dashboard");
    } else {
      setViewHistory((prev) => [...prev, historySource]);
      setPreviousView(historySource);
    }
    setActiveView(newView);
  };

  const handleGoBack = () => {
    if (viewHistory.length > 0) {
      const updated = [...viewHistory];
      const prev = updated.pop();
      setViewHistory(updated);
      setActiveView(prev);
      setPreviousView(updated.length > 0 ? updated[updated.length - 1] : "dashboard");
    } else {
      setActiveView("dashboard");
      setPreviousView("dashboard");
    }
  };

  const [selectedBookDetail, setSelectedBookDetail] = useState<any | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [selectedPublisher, setSelectedPublisher] = useState<string | null>(null);
  
  // App-wide state
  const [books, setBooks] = useState<any[]>([]);
  const [activeBookForReader, setActiveBookForReader] = useState<any | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // AI Assistant trigger context
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiBookContext, setAiBookContext] = useState<any | null>(null);
  const [aiHighlightedText, setAiHighlightedText] = useState<string | null>(null);

  // Sync state (Section 4.0 offline resiliency)
  const [syncStatus, setSyncStatus] = useState<"synced" | "pending" | "syncing">("synced");

  // Profile and restriction states
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [restrictionModal, setRestrictionModal] = useState<{ isOpen: boolean; feature: string } | null>(null);

  useEffect(() => {
    // Load user session
    const activeUser = AuthService.getCurrentUser();
    if (activeUser) {
      setCurrentUser(activeUser);
      const token = localStorage.getItem("companion_access_token");
      if (token) {
        DatabaseService.syncFromBackend(token).then(() => {
          setBooks(DatabaseService.getBooks());
        });
      }
    }

    // Sync theme with system or initial local setting
    const savedTheme = localStorage.getItem("companion_active_theme") as ThemeMode;
    if (savedTheme) {
      setActiveTheme(savedTheme);
    } else {
      setActiveTheme("bookish");
    }
    setBooks(DatabaseService.getBooks());

    // Setup periodic polling sync check every 30 seconds (Section 4.0)
    const syncInterval = setInterval(() => {
      const queue = JSON.parse(localStorage.getItem("companion_sync_queue") || "[]");
      if (queue.length > 0) {
        setSyncStatus("syncing");
        DatabaseService.sweepSyncQueue().then((res) => {
          if (res.success) {
            setSyncStatus("synced");
            console.log("30-second sweep complete. Synced items:", res.syncedItems);
          }
        });
      }
    }, 30000);

    // Listen to local storage modifications to update sync state immediately
    const handleStorageChange = () => {
      const queue = JSON.parse(localStorage.getItem("companion_sync_queue") || "[]");
      if (queue.length > 0) {
        setSyncStatus("pending");
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleThemeChange = (mode: ThemeMode) => {
    setActiveTheme(mode);
    localStorage.setItem("companion_active_theme", mode);
  };

  const handleOpenAiAssistantWithHighlight = (text: string, book: any) => {
    setAiHighlightedText(text);
    setAiBookContext(book);
    setIsAiOpen(true);
  };

  const handleSearchSelect = (book: any) => {
    setGlobalSearchQuery("");
    setIsSearchActive(false);
    setSelectedBookDetail(book);
    navigateToView("book-detail");
  };

  // Fetch search results from backend with debounce
  useEffect(() => {
    if (!globalSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/books/search?q=${encodeURIComponent(globalSearchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          // Map backend BookSearchResponse to frontend Book structure
          const mapped = data.map((b: any) => ({
            id: b.google_books_id,
            title: b.title,
            author: b.authors.join(", "),
            coverUrl: b.thumbnail_url || "",
            description: b.description || "",
            totalPages: 300,
            category: "Plan to Read",
            currentPage: 0,
            genre: "General"
          }));
          setSearchResults(mapped);
        }
      } catch (err) {
        console.error("Failed to search books:", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [globalSearchQuery]);
  const themeColors = THEMES[activeTheme];

  const handleActionRestricted = (feature: string) => {
    setRestrictionModal({ isOpen: true, feature });
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setProfileDropdownOpen(false);
  };

  if (!currentUser) {
    return (
      <AuthView
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setActiveView("dashboard");
        }}
        activeTheme={activeTheme}
      />
    );
  }

  // Navigation Links items
  const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: BookOpen },
    { id: "library", label: "Library", icon: BookmarkCheck },
    { id: "social", label: "Social Feed", icon: MessageSquare },
    { id: "leaderboards", label: "Leaderboards", icon: Trophy },
    { id: "pricing", label: "Price Engine", icon: ShoppingCart },
    ...(currentUser?.isAdmin ? [{ id: "admin", label: "Admin Panel", icon: Shield }] : [])
  ];

  return (
    <div
      style={{
        backgroundColor: themeColors.bg,
        color: themeColors.text,
        transition: "background-color 0.3s ease, color 0.3s ease",
        ["--theme-bg" as any]: themeColors.bg,
        ["--theme-surface" as any]: themeColors.surface,
        ["--theme-border" as any]: themeColors.border,
        ["--theme-text" as any]: themeColors.text,
        ["--theme-accent" as any]: themeColors.accent,
        ["--theme-accent-text" as any]: themeColors.accentText,
        ["--theme-text-muted" as any]: activeTheme === "bookish" ? "#5C4D3C" : activeTheme === "sepia" ? "#705C4E" : activeTheme === "dark" ? "#A0AEC0" : "#718096"
      } as React.CSSProperties}
      className="min-h-screen flex flex-col font-sans antialiased select-none relative"
    >
      {/* Decorative background pattern matching the sign-in page for bookish theme */}
      {activeTheme === "bookish" && (
        <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-multiply bg-[radial-gradient(#322314_1px,transparent_1px)] [background-size:16px_16px] z-0"></div>
      )}
      {/* 2.2 Shell Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-screen z-10">
        {/* Desktop Sidebar (>1024px) */}
        <aside
          style={{
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border
          }}
          className="hidden lg:flex lg:flex-col lg:w-64 border-r p-5 shrink-0 select-none"
        >
          {/* Logo Heading */}
          <button
            onClick={() => {
              navigateToView("dashboard");
              setActiveBookForReader(null);
            }}
            className="flex items-center gap-2.5 mb-8 text-left hover:opacity-80 transition-opacity cursor-pointer w-full focus:outline-none"
          >
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md">
              <BookOpen className="h-5.5 w-5.5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm tracking-tight uppercase leading-none">
                Sarangsho
              </h1>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                v1.0 (PWA/Capacitor)
              </span>
            </div>
          </button>

          {/* Navigation Controls */}
          <nav className="flex-1 space-y-1.5 select-none">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigateToView(item.id);
                    if (item.id !== "library") {
                      setActiveBookForReader(null);
                    }
                  }}
                  style={{
                    backgroundColor: isActive ? themeColors.accent : "transparent",
                    color: isActive ? themeColors.accentText : themeColors.text
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "shadow-lg shadow-black/10"
                      : "opacity-80 hover:bg-black/5 dark:hover:bg-white/5 hover:opacity-100"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Stats Summary footer */}
          <div
            style={{ borderColor: themeColors.border }}
            className="pt-4 border-t space-y-2 select-none"
          >
            <div className="flex items-center justify-between text-xs font-bold text-gray-400 font-mono">
              <span>SYNC QUEUE</span>
              {syncStatus === "synced" ? (
                <span className="text-emerald-500 flex items-center gap-1">● SYNCED</span>
              ) : syncStatus === "syncing" ? (
                <span className="text-indigo-400 flex items-center gap-1 animate-pulse">○ SWEEPING</span>
              ) : (
                <span className="text-amber-500 flex items-center gap-1">▲ PENDING</span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 leading-normal">
              Continuous 30s background sync sweep tracks offline progress logs safely.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
          {/* Persistent Screen Header with search and flame metric */}
          <header
            style={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border
            }}
            className="px-6 py-3 border-b flex items-center justify-between gap-4 sticky top-0 z-40"
          >
            {/* Left Header content */}
            <button
              onClick={() => {
                navigateToView("dashboard");
                setActiveBookForReader(null);
              }}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none"
            >
              <span className="lg:hidden p-1.5 bg-indigo-600 text-white rounded-lg shadow-sm">
                <BookOpen className="h-4 w-4" />
              </span>
              <span className="font-display font-bold text-sm tracking-tight text-indigo-600 dark:text-indigo-400 uppercase lg:hidden">
                Sarangsho
              </span>
            </button>

            {/* Middle Floating Global Search bar */}
            <div className="flex-1 max-w-md relative select-none">
              <div className="relative flex items-center bg-gray-50 dark:bg-zinc-950/60 rounded-xl border border-gray-200/50 dark:border-zinc-800/80 p-1.5">
                <Search className="h-4 w-4 text-gray-400 ml-2" />
                <input
                  type="text"
                  value={globalSearchQuery}
                  onChange={(e) => {
                    setGlobalSearchQuery(e.target.value);
                    setIsSearchActive(e.target.value.length > 0);
                  }}
                  placeholder="Query books, authors, or genres..."
                  className="w-full text-xs py-1 px-3 bg-transparent outline-none text-gray-900 dark:text-white"
                />
                {globalSearchQuery && (
                  <button
                    onClick={() => {
                      setGlobalSearchQuery("");
                      setIsSearchActive(false);
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Floating search dropdown panel */}
              {isSearchActive && (
                <div className="absolute top-full inset-x-0 mt-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl shadow-2xl z-50 p-2 max-h-60 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <div className="p-3 text-xs text-gray-400 text-center">No matching books found.</div>
                  ) : (
                    searchResults.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handleSearchSelect(b)}
                        className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-zinc-800/60 rounded-lg flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <div className={`book-cover-template w-8 h-12 rounded bg-gradient-to-br ${getCoverGradient(b.title)} flex-shrink-0 shadow-sm`} />
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white">{b.title}</h4>
                          <p className="text-[10px] text-gray-400">{b.author} • {b.genre}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Right Flame Streak Widget triggers */}
            <div className="flex items-center gap-3">
              <StreakTracker standalone={false} activeTheme={activeTheme} />

              {/* Instant Assistant click toggle */}
              <button
                onClick={() => setIsAiOpen(!isAiOpen)}
                className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-indigo-200/50"
                title="AI Companion"
              >
                <Sparkles className="h-4.5 w-4.5 fill-current animate-pulse" />
              </button>

              {/* Profile Avatar & Sign Out Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-all cursor-pointer bg-white dark:bg-zinc-900"
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.username}
                    referrerPolicy="no-referrer"
                    className="h-7 w-7 rounded-full object-cover shadow-inner"
                  />
                  {currentUser.isGuest && (
                    <span
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--theme-accent, #4F46E5) 12%, transparent)",
                        color: "var(--theme-accent, #4F46E5)",
                        borderColor: "color-mix(in srgb, var(--theme-accent, #4F46E5) 25%, transparent)"
                      }}
                      className="hidden sm:inline text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border font-mono scale-90"
                    >
                      Guest
                    </span>
                  )}
                </button>

                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-gray-800 dark:text-zinc-200">
                      <div
                        id="user-profile-trigger"
                        onClick={() => {
                          navigateToView("profile");
                          setProfileDropdownOpen(false);
                        }}
                        className="px-2.5 py-2 border-b border-gray-100 dark:border-zinc-800/80 mb-2 hover:bg-slate-50 dark:hover:bg-zinc-800/40 rounded-lg cursor-pointer transition-all duration-200 group flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-black text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {currentUser.username}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">
                            {currentUser.isGuest ? "Temporary Guest Card" : currentUser.email}
                          </p>
                        </div>
                        <UserIcon className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:scale-110 transition-all shrink-0" />
                      </div>

                      {/* App Theme Selector */}
                      <div className="px-2.5 py-1.5 mb-2 border-b border-gray-100 dark:border-zinc-800/80">
                        <p className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                          App Shell Theme
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(["bookish", "light", "sepia", "dark"] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => handleThemeChange(t)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold capitalize transition-all border text-center cursor-pointer ${
                                activeTheme === t
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                  : "bg-slate-50 dark:bg-zinc-800/40 border-gray-100 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out Library Card</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Active Router Views Body Wrapper */}
          <div className="flex-1 p-5 md:p-6 lg:p-8 overflow-y-auto">
            {activeView === "dashboard" && (
              <Dashboard
                onReadNow={(book) => {
                  setActiveBookForReader(book);
                  navigateToView("library");
                }}
                onSelectBook={(book) => {
                  setSelectedBookDetail(book);
                  navigateToView("book-detail", "dashboard");
                }}
                onSelectAuthor={(authorName) => {
                  setSelectedAuthor(authorName);
                  navigateToView("author", "dashboard");
                }}
                onSelectPublisher={(pubName) => {
                  setSelectedPublisher(pubName);
                  navigateToView("publisher", "dashboard");
                }}
                activeTheme={activeTheme}
              />
            )}
            {activeView === "library" && (
              <Library
                onOpenChatWithHighlight={handleOpenAiAssistantWithHighlight}
                activeTheme={activeTheme}
                onThemeChange={handleThemeChange}
                onActiveBookChange={setActiveBookForReader}
                currentUser={currentUser}
                onActionRestricted={handleActionRestricted}
                initialActiveBook={activeBookForReader}
              />
            )}
            {activeView === "social" && (
              <SocialFeed
                currentUser={currentUser}
                onActionRestricted={handleActionRestricted}
              />
            )}
            {activeView === "leaderboards" && (
              <Leaderboards />
            )}
            {activeView === "pricing" && (
              <PriceEngine
                currentUser={currentUser}
                onActionRestricted={handleActionRestricted}
              />
            )}
            {activeView === "book-detail" && selectedBookDetail && (
              <BookDetailPage
                book={books.find((b) => b.id === selectedBookDetail.id) || selectedBookDetail}
                onBack={handleGoBack}
                onReadNow={(book) => {
                  setActiveBookForReader(book);
                  navigateToView("library");
                }}
                onSelectAuthor={(authorName) => {
                  setSelectedAuthor(authorName);
                  navigateToView("author", "book-detail");
                }}
                onSelectPublisher={(pubName) => {
                  setSelectedPublisher(pubName);
                  navigateToView("publisher", "book-detail");
                }}
                activeTheme={activeTheme}
                onUpdateBook={(updatedBook) => {
                  const updatedBooks = books.map(b => b.id === updatedBook.id ? updatedBook : b);
                  setBooks(updatedBooks);
                  DatabaseService.saveBooks(updatedBooks);
                }}
              />
            )}
            {activeView === "admin" && currentUser?.isAdmin && (
              <AdminPanel
                currentUser={currentUser}
                activeTheme={activeTheme}
                onActionRestricted={handleActionRestricted}
                onBookSelect={(b) => {
                  setSelectedBookDetail(b);
                  navigateToView("book-detail", "admin");
                }}
                onAuthorSelect={(authorName) => {
                  setSelectedAuthor(authorName);
                  navigateToView("author", "admin");
                }}
                onPublisherSelect={(pubName) => {
                  setSelectedPublisher(pubName);
                  navigateToView("publisher", "admin");
                }}
              />
            )}
            {activeView === "profile" && currentUser && (
              <UserProfile
                currentUser={currentUser}
                onUpdateUser={(updatedUser) => {
                  setCurrentUser(updatedUser);
                  localStorage.setItem("companion_current_user", JSON.stringify(updatedUser));
                }}
                onBack={handleGoBack}
                activeTheme={activeTheme}
              />
            )}
            {activeView === "author" && selectedAuthor && (
              <AuthorPage
                authorName={selectedAuthor}
                onBack={handleGoBack}
                onSelectBook={(book) => {
                  setSelectedBookDetail(book);
                  navigateToView("book-detail", "author");
                }}
                activeTheme={activeTheme}
              />
            )}
            {activeView === "publisher" && selectedPublisher && (
              <PublisherPage
                publisherName={selectedPublisher}
                onBack={handleGoBack}
                onSelectBook={(book) => {
                  setSelectedBookDetail(book);
                  navigateToView("book-detail", "publisher");
                }}
                activeTheme={activeTheme}
              />
            )}
          </div>
        </main>
      </div>

      {/* 2.2 Mobile bottom sticky panel layout (<1024px) */}
      <nav
        style={{
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border
        }}
        className="fixed bottom-0 inset-x-0 h-16 border-t flex items-center justify-around px-4 lg:hidden z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                navigateToView(item.id);
                if (item.id !== "library") {
                  setActiveBookForReader(null);
                }
              }}
              style={{
                color: isActive ? themeColors.accent : "var(--theme-text-muted, #5C4D3C)"
              }}
              className={`flex flex-col items-center justify-center gap-1 cursor-pointer py-1.5 px-3 rounded-lg transition-all ${
                isActive ? "font-bold scale-105" : "opacity-80 hover:opacity-100"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-[9px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right-hand slide-out layout drawer Overlay */}
      <AiAssistant
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        bookContext={aiBookContext}
        highlightedText={aiHighlightedText}
        onClearHighlight={() => {
          setAiHighlightedText(null);
          setAiBookContext(null);
        }}
        currentUser={currentUser}
        onActionRestricted={handleActionRestricted}
      />

      {/* 2.2 Restriction Overlay Modal for Guests */}
      {restrictionModal?.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-[#FAF6EE] border-2 border-[#D1C2A5] rounded-2xl max-w-sm w-full p-6 text-center shadow-[6px_6px_0px_0px_rgba(50,35,20,0.15)] text-[#322314]">
            <div className="inline-flex p-3 bg-amber-50 border border-amber-200 text-amber-600 rounded-full mb-4">
              <ShieldAlert className="h-6 w-6" />
            </div>
            
            <h3 className="font-serif text-lg font-black tracking-tight mb-2">
              Registration Required
            </h3>
            
            <p className="text-xs text-[#5C4D3C] leading-relaxed mb-6">
              To utilize <span className="font-bold underline">{restrictionModal.feature}</span>, you must first register a full library card account or log in with an existing card.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setRestrictionModal(null);
                  handleLogout();
                }}
                className="w-full py-2.5 px-4 bg-[#322314] hover:bg-[#4E3924] text-[#FAF6EE] font-serif font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" />
                <span>Issue Free Library Card</span>
              </button>
              
              <button
                onClick={() => setRestrictionModal(null)}
                className="w-full py-2 px-4 bg-transparent hover:bg-black/5 text-[#5C4D3C] font-semibold rounded-xl text-xs transition-all cursor-pointer"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
