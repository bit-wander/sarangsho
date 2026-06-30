import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  CheckCircle, 
  Bookmark, 
  Flame, 
  Sparkles, 
  Award, 
  FileText, 
  TrendingUp, 
  Heart, 
  Clock, 
  ChevronRight, 
  Check, 
  Edit2
} from "lucide-react";
import { Book, User as UserType, ThemeMode } from "../types";
import { DatabaseService, getCoverGradient } from "../utils";
import { motion } from "motion/react";

interface UserProfileProps {
  currentUser: UserType;
  onUpdateUser: (updatedUser: UserType) => void;
  onBack: () => void;
  activeTheme?: ThemeMode;
}

export default function UserProfile({ 
  currentUser, 
  onUpdateUser, 
  onBack, 
  activeTheme = "bookish" 
}: UserProfileProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  
  // Editable fields
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(currentUser.username);
  const [editedBio, setEditedBio] = useState(
    localStorage.getItem(`companion_bio_${currentUser.id}`) || 
    "Avid bibliophile exploring worlds one sentence at a time. Always seeking wisdom through literary adventures."
  );
  const [editedGenre, setEditedGenre] = useState(
    localStorage.getItem(`companion_genre_${currentUser.id}`) || 
    "Fiction & Science"
  );

  useEffect(() => {
    setBooks(DatabaseService.getBooks());
    setStreakCount(DatabaseService.getStreakCount());
  }, []);

  // Compute overall reading stats
  const totalBooks = books.length;
  const currentlyReadingBooks = books.filter(b => b.category === "Currently Reading");
  const completedBooks = books.filter(b => b.category === "Already Finished");
  const planToReadBooks = books.filter(b => b.category === "Plan to Read");

  const totalPagesRead = books.reduce((acc, book) => acc + (book.currentPage || 0), 0);
  const totalBookPages = books.reduce((acc, book) => acc + (book.totalPages || 0), 0);
  const overallProgressPercent = totalBookPages > 0 ? Math.round((totalPagesRead / totalBookPages) * 100) : 0;

  const totalHighlights = books.reduce((acc, book) => acc + (book.highlights?.length || 0), 0);
  const totalNotes = books.reduce((acc, book) => acc + (book.notes?.length || 0), 0);

  // Calculate highest reading milestone or award
  const getAwardLevel = () => {
    if (completedBooks.length >= 10) return { title: "Grandmaster Scholar", desc: "Finished 10+ books", icon: Award, color: "text-amber-500 bg-amber-500/10" };
    if (completedBooks.length >= 5) return { title: "Voracious Reader", desc: "Finished 5+ books", icon: Award, color: "text-purple-500 bg-purple-500/10" };
    if (completedBooks.length >= 2) return { title: "Dedicated Scholar", desc: "Finished 2+ books", icon: Award, color: "text-indigo-500 bg-indigo-500/10" };
    return { title: "Novice Explorer", desc: "Started your literary journey", icon: BookOpen, color: "text-emerald-500 bg-emerald-500/10" };
  };
  const award = getAwardLevel();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedName.trim()) return;

    const updatedUser: UserType = {
      ...currentUser,
      username: editedName
    };
    
    // Save metadata
    localStorage.setItem(`companion_bio_${currentUser.id}`, editedBio);
    localStorage.setItem(`companion_genre_${currentUser.id}`, editedGenre);
    
    // Propagate up to main application state
    onUpdateUser(updatedUser);
    setIsEditing(false);
  };

  // Get current date formatting for User's library card registration
  const getFormattedJoinedDate = () => {
    const d = currentUser.createdAt ? new Date(currentUser.createdAt) : new Date();
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  // Theme-specific styles mapping
  const getThemeStyles = () => {
    switch (activeTheme) {
      case "bookish":
        return {
          cardBg: "bg-[#FAF6EE] border-[#D1C2A5]",
          headerText: "text-[#322314]",
          subtext: "text-[#5C4D3C]",
          accentBtn: "bg-[#322314] hover:bg-[#4E3923] text-[#FAF6EE]",
          pillActive: "bg-[#322314] text-[#FAF6EE]",
          statLabel: "text-[#5C4D3C]/70",
          accentText: "text-[#322314]"
        };
      case "sepia":
        return {
          cardBg: "bg-[#EADFC9] border-[#DCCEB3]",
          headerText: "text-[#5B4636]",
          subtext: "text-[#705C4E]",
          accentBtn: "bg-[#5B4636] hover:bg-[#725B49] text-[#F4ECD8]",
          pillActive: "bg-[#5B4636] text-[#F4ECD8]",
          statLabel: "text-[#705C4E]/70",
          accentText: "text-[#5B4636]"
        };
      case "dark":
        return {
          cardBg: "bg-[#2D3748] border-[#4A5568]",
          headerText: "text-[#EDF2F7]",
          subtext: "text-[#A0AEC0]",
          accentBtn: "bg-indigo-600 hover:bg-indigo-700 text-[#EDF2F7]",
          pillActive: "bg-indigo-600 text-white",
          statLabel: "text-[#A0AEC0]/70",
          accentText: "text-indigo-400"
        };
      case "oled":
        return {
          cardBg: "bg-[#121212] border-[#27272A]",
          headerText: "text-[#F5F5F5]",
          subtext: "text-[#718096]",
          accentBtn: "bg-[#F5F5F5] hover:bg-zinc-200 text-[#000000]",
          pillActive: "bg-[#F5F5F5] text-[#000000]",
          statLabel: "text-[#718096]/70",
          accentText: "text-white"
        };
      case "light":
      default:
        return {
          cardBg: "bg-white border-gray-100",
          headerText: "text-gray-900",
          subtext: "text-gray-500",
          accentBtn: "bg-indigo-600 hover:bg-indigo-700 text-white",
          pillActive: "bg-indigo-600 text-white",
          statLabel: "text-gray-500",
          accentText: "text-indigo-600"
        };
    }
  };

  const themeStyles = getThemeStyles();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in select-none">
      {/* Header back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Library</span>
        </button>
        <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
          Secured Library ID • #{currentUser.id.substring(0, 8)}
        </span>
      </div>

      {/* Main Grid: Left column (Profile Card), Right column (Stats & achievements) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Side: Profile Info Card (4 columns) */}
        <div className="md:col-span-5 space-y-6">
          <div className={`p-6 border rounded-2xl shadow-sm ${themeStyles.cardBg} transition-all`}>
            
            {/* Visual Header Block */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.username}
                  referrerPolicy="no-referrer"
                  className="h-24 w-24 rounded-full object-cover shadow-md border-4 border-white dark:border-zinc-800"
                />
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <span className="text-[10px] text-white font-bold uppercase tracking-wider">Default</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center gap-1.5">
                  <h2 className={`font-sans font-extrabold text-xl tracking-tight ${themeStyles.headerText}`}>
                    {currentUser.username}
                  </h2>
                  {currentUser.isGuest && (
                    <span className="bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-amber-200/50">
                      Guest
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                  <Mail className="h-3 w-3 shrink-0" /> {currentUser.isGuest ? "Temporary Guest Session" : currentUser.email}
                </p>
              </div>

              {/* Joined Date Badge */}
              <div className="w-full pt-4 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 dark:text-zinc-400">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <span>Card Issued: {getFormattedJoinedDate()}</span>
              </div>
            </div>

            {/* Profile Editing Form / Presentation */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800/80 space-y-4">
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                      Biography
                    </span>
                    <p className={`text-xs leading-relaxed italic ${themeStyles.subtext}`}>
                      "{editedBio}"
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                      Favorite Genre
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-1 rounded-lg">
                      <Heart className="h-3 w-3 fill-current" /> {editedGenre}
                    </span>
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full py-2 px-3 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-gray-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-all cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit Profile Details
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full p-2 text-xs border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                      placeholder="Enter username"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                      Biography
                    </label>
                    <textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      rows={3}
                      className="w-full p-2 text-xs border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white leading-relaxed resize-none"
                      placeholder="Write a brief intro..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                      Favorite Genre
                    </label>
                    <input
                      type="text"
                      value={editedGenre}
                      onChange={(e) => setEditedGenre(e.target.value)}
                      className="w-full p-2 text-xs border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                      placeholder="e.g. Science Fiction, Classics"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-2 text-xs font-bold rounded-lg border border-gray-200 dark:border-zinc-800 text-gray-500 hover:bg-slate-50 dark:hover:bg-zinc-800/40 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" /> Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>

          {/* Current Milestone / Badges */}
          <div className={`p-5 border rounded-2xl shadow-sm ${themeStyles.cardBg} flex items-center gap-4`}>
            <div className={`p-3 rounded-2xl shrink-0 ${award.color}`}>
              <award.icon className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                Highest Achievement Award
              </span>
              <h4 className={`font-sans font-extrabold text-sm ${themeStyles.headerText} mt-0.5`}>
                {award.title}
              </h4>
              <p className="text-[10px] text-gray-400 mt-0.5">{award.desc}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Overall Reading Statistics Dashboard (7 columns) */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Main 2x2 Reading Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* Stat 1: Books in shelf */}
            <div className={`p-4 border rounded-xl bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between h-28`}>
              <div className="flex items-center justify-between">
                <BookOpen className="h-4.5 w-4.5 text-indigo-500" />
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">Catalog</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-2">
                  {totalBooks}
                </h3>
                <p className="text-[10px] text-gray-400 font-medium">Total Library Books</p>
              </div>
            </div>

            {/* Stat 2: Reading Streak */}
            <div className={`p-4 border rounded-xl bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between h-28`}>
              <div className="flex items-center justify-between">
                <Flame className={`h-4.5 w-4.5 ${streakCount > 0 ? "text-orange-500 fill-orange-500" : "text-gray-400"}`} />
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">Streak</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-2 flex items-baseline gap-1">
                  {streakCount} <span className="text-xs font-bold text-gray-400">days</span>
                </h3>
                <p className="text-[10px] text-gray-400 font-medium">Consecutive Reading</p>
              </div>
            </div>

            {/* Stat 3: In-Book Highlights */}
            <div className={`p-4 border rounded-xl bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between h-28`}>
              <div className="flex items-center justify-between">
                <Sparkles className="h-4.5 w-4.5 text-amber-500" />
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">Clippings</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-2">
                  {totalHighlights}
                </h3>
                <p className="text-[10px] text-gray-400 font-medium">Total Highlights Made</p>
              </div>
            </div>

            {/* Stat 4: Personal Notes */}
            <div className={`p-4 border rounded-xl bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between h-28`}>
              <div className="flex items-center justify-between">
                <FileText className="h-4.5 w-4.5 text-emerald-500" />
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">Scribbles</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-2">
                  {totalNotes}
                </h3>
                <p className="text-[10px] text-gray-400 font-medium">Total Written Notes</p>
              </div>
            </div>

          </div>

          {/* Detailed Shelf Breakdown Chart & Progress */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-400 font-mono uppercase tracking-wider">
                Overall Shelf Allocation
              </h3>
              <p className="text-[11px] text-gray-400 mt-1">
                Visual analysis of your reading lists and categories.
              </p>
            </div>

            {/* 3-Part Category Bar Visualizer */}
            <div className="space-y-4">
              <div className="h-3 w-full bg-gray-100 dark:bg-zinc-800/80 rounded-full flex overflow-hidden">
                {completedBooks.length > 0 && (
                  <div 
                    style={{ width: `${(completedBooks.length / totalBooks) * 100}%` }}
                    className="h-full bg-emerald-500 transition-all duration-500" 
                    title={`Finished: ${completedBooks.length}`}
                  />
                )}
                {currentlyReadingBooks.length > 0 && (
                  <div 
                    style={{ width: `${(currentlyReadingBooks.length / totalBooks) * 100}%` }}
                    className="h-full bg-indigo-500 transition-all duration-500" 
                    title={`Currently Reading: ${currentlyReadingBooks.length}`}
                  />
                )}
                {planToReadBooks.length > 0 && (
                  <div 
                    style={{ width: `${(planToReadBooks.length / totalBooks) * 100}%` }}
                    className="h-full bg-amber-500 transition-all duration-500" 
                    title={`Plan to Read: ${planToReadBooks.length}`}
                  />
                )}
              </div>

              {/* Legend with individual book stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col p-2.5 bg-emerald-50/20 dark:bg-emerald-950/5 border border-emerald-100/30 dark:border-emerald-900/10 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-gray-600 dark:text-zinc-300">Finished</span>
                  </div>
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                    {completedBooks.length} <span className="text-[9px] font-normal text-gray-400">books</span>
                  </p>
                </div>

                <div className="flex flex-col p-2.5 bg-indigo-50/20 dark:bg-indigo-950/5 border border-indigo-100/30 dark:border-indigo-900/10 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-bold text-gray-600 dark:text-zinc-300">Reading</span>
                  </div>
                  <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
                    {currentlyReadingBooks.length} <span className="text-[9px] font-normal text-gray-400">books</span>
                  </p>
                </div>

                <div className="flex flex-col p-2.5 bg-amber-50/20 dark:bg-amber-950/5 border border-amber-100/30 dark:border-amber-900/10 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-[10px] font-bold text-gray-600 dark:text-zinc-300">To Read</span>
                  </div>
                  <p className="text-sm font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
                    {planToReadBooks.length} <span className="text-[9px] font-normal text-gray-400">books</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Overall Pages read status bar */}
            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700 dark:text-zinc-300">Overall Pages Progress</span>
                <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">{overallProgressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-zinc-800/60 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${overallProgressPercent}%` }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" 
                />
              </div>
              <p className="text-[10px] text-gray-400 text-right">
                {totalPagesRead.toLocaleString()} of {totalBookPages.toLocaleString()} pages completed
              </p>
            </div>
          </div>

          {/* Current Progress log of active reading items */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold text-gray-400 font-mono uppercase tracking-wider">
                Active Reading List progress
              </h3>
              <p className="text-[11px] text-gray-400 mt-1">
                Live page completion updates for items currently in your reading focus.
              </p>
            </div>

            {currentlyReadingBooks.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-gray-100 dark:border-zinc-800 rounded-xl text-xs text-gray-400">
                No books are currently flagged as "Currently Reading". Change statuses inside book details!
              </div>
            ) : (
              <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                {currentlyReadingBooks.map((book) => {
                  const pct = Math.round((book.currentPage / book.totalPages) * 100);
                  return (
                    <div key={book.id} className="flex items-center justify-between gap-4 p-2 hover:bg-slate-50 dark:hover:bg-zinc-800/30 rounded-xl transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`book-cover-template w-8 h-12 rounded bg-gradient-to-br ${getCoverGradient(book.title)} flex-shrink-0 shadow-sm flex items-center justify-center text-white text-[8px] font-bold text-center p-0.5 truncate`} />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{book.title}</h4>
                          <p className="text-[10px] text-gray-400 truncate">{book.author} • {book.genre}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right space-y-1">
                        <span className="text-[11px] font-mono font-bold text-gray-800 dark:text-zinc-200">{pct}%</span>
                        <div className="w-20 h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div style={{ width: `${pct}%` }} className="h-full bg-indigo-500" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
