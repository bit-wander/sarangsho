import React, { useState, useEffect } from "react";
import { BookOpen, CheckCircle, Clock, BookMarked, Settings, Edit2, AlertCircle, Sparkles, Check, Star, Plus, Minus } from "lucide-react";
import { Book, ThemeMode } from "../types";
import { DatabaseService, getCoverGradient } from "../utils";

interface DashboardProps {
  onReadNow?: (book: Book) => void;
  onSelectBook?: (book: Book) => void;
  onSelectAuthor?: (authorName: string) => void;
  onSelectPublisher?: (publisherName: string) => void;
  activeTheme?: ThemeMode;
}

export default function Dashboard({ onReadNow, onSelectBook, onSelectAuthor, onSelectPublisher, activeTheme = "bookish" }: DashboardProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState<"Currently Reading" | "Already Finished" | "Plan to Read">("Currently Reading");
  
  // Progress bottom sheet states
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [stepperPage, setStepperPage] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Rate & Review Popup States
  const [reviewingBook, setReviewingBook] = useState<Book | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>("");

  useEffect(() => {
    setBooks(DatabaseService.getBooks());
  }, []);

  const handleUpdateProgressClick = (book: Book, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBook(book);
    setStepperPage(book.currentPage);
  };

  const handleSaveProgress = () => {
    if (!editingBook) return;
    
    setIsSyncing(true);
    
    // Simulate minor network sync latency
    setTimeout(() => {
      let finalCategory = editingBook.category;
      let finalCurrent = Math.min(stepperPage, editingBook.totalPages);
      const wasCompleted = editingBook.currentPage >= editingBook.totalPages;
      const isCompletedNow = finalCurrent >= editingBook.totalPages;
      
      // Auto move to "Already Finished" if current page reaches total page
      if (isCompletedNow) {
        finalCategory = "Already Finished";
        finalCurrent = editingBook.totalPages;
      }

      const updatedBook: Book = {
        ...editingBook,
        currentPage: finalCurrent,
        category: finalCategory,
        // Default rating/review if completed, but we will prompt immediately
        ...(finalCategory === "Already Finished" && !editingBook.rating ? { rating: 5, review: "Great read! Formulated amazing habits." } : {})
      };

      const updatedList = books.map((b) => (b.id === editingBook.id ? updatedBook : b));
      setBooks(updatedList);
      DatabaseService.saveBooks(updatedList);
      
      setEditingBook(null);
      setIsSyncing(false);

      // Trigger Rate & Review Popup if book just reached 100% completion
      if (isCompletedNow && !wasCompleted) {
        setReviewingBook(updatedBook);
        setReviewRating(updatedBook.rating || 5);
        setReviewText(updatedBook.review || "");
      }
      
      // Trigger background sweep simulation
      DatabaseService.sweepSyncQueue().then((res) => {
        if (res.success) {
          console.log("Offline sync swept pending progress updates.");
        }
      });
    }, 600);
  };

  const handleCategorySwitch = (bookId: string, newCategory: Book["category"]) => {
    let triggeredBook: Book | null = null;
    const updatedList = books.map((b) => {
      if (b.id === bookId) {
        const wasCompleted = b.currentPage >= b.totalPages && b.category === "Already Finished";
        const isCompletedNow = newCategory === "Already Finished";
        const updated = {
          ...b,
          category: newCategory,
          currentPage: newCategory === "Already Finished" ? b.totalPages : newCategory === "Plan to Read" ? 0 : b.currentPage
        };
        if (isCompletedNow && !wasCompleted) {
          triggeredBook = updated;
        }
        return updated;
      }
      return b;
    });
    setBooks(updatedList);
    DatabaseService.saveBooks(updatedList);

    if (triggeredBook) {
      setReviewingBook(triggeredBook);
      setReviewRating(5);
      setReviewText("");
    }
  };

  const handleSaveReview = () => {
    if (!reviewingBook) return;

    const updatedList = books.map((b) => {
      if (b.id === reviewingBook.id) {
        return {
          ...b,
          rating: reviewRating,
          review: reviewText,
          currentPage: b.totalPages,
          category: "Already Finished" as const
        };
      }
      return b;
    });

    setBooks(updatedList);
    DatabaseService.saveBooks(updatedList);
    setReviewingBook(null);
    setReviewRating(5);
    setReviewText("");
  };

  const handleRatingChange = (bookId: string, rating: number) => {
    const updatedList = books.map((b) => {
      if (b.id === bookId) {
        return { ...b, rating };
      }
      return b;
    });
    setBooks(updatedList);
    DatabaseService.saveBooks(updatedList);
  };

  const filteredBooks = books.filter((b) => b.category === activeTab);

  const getPercentage = (current: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
  };

  return (
    <div id="dashboard-container" className="space-y-6">
      {/* Sliding horizontal segmented switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800 pb-2">
        <div>
          <h2 className="font-sans font-bold text-gray-900 dark:text-white text-xl flex items-center gap-2">
            <BookMarked className="h-5.5 w-5.5 text-indigo-500" /> Reading Tracker
          </h2>
          <p className="text-xs text-gray-400 dark:text-zinc-500">Track and refine your reading habits and completed benchmarks</p>
        </div>

        {/* Sliding horizontal switcher tabs */}
        <div className="flex p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl max-w-md">
          {(["Currently Reading", "Already Finished", "Plan to Read"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4.5 rounded-lg text-xs font-bold transition-all relative cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Asymmetrical Fluid Card Grid architecture (Section 3.1) */}
      {filteredBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl bg-gray-50/30 text-center text-gray-400 p-6">
          <BookOpen className="h-10 w-10 opacity-30 mb-2 text-indigo-500" />
          <p className="text-sm font-semibold text-gray-600 dark:text-zinc-300">No books found in this workspace category.</p>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Visit your Digital Library Shelf to upload or select a book to read.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {filteredBooks.map((book, idx) => {
            const isLargeCard = idx % 3 === 0; // Asymmetrical visual layout
            const percentage = getPercentage(book.currentPage, book.totalPages);

            return (
              <div
                key={book.id}
                className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-zinc-800/80 hover:shadow-md transition-all flex flex-col justify-between ${
                  isLargeCard ? "md:col-span-8" : "md:col-span-4"
                }`}
              >
                <div 
                  onClick={() => onSelectBook?.(book)}
                  className="cursor-pointer group/card focus:outline-none"
                >
                  <div className="flex gap-4 items-start">
                    {/* CSS Custom Cover graphics */}
                    <div className={`book-cover-template w-16 h-24 rounded bg-gradient-to-br ${getCoverGradient(book.title)} flex flex-col justify-between p-2.5 text-white shadow-md shrink-0 group-hover/card:scale-105 transition-transform duration-300`}>
                      <BookOpen className="h-4 w-4 opacity-80" />
                      <span className="text-[8px] font-mono tracking-widest font-black uppercase truncate">{book.genre}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                          {book.genre}
                        </span>
                        {activeTab === "Currently Reading" && (
                          <span className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold">
                            {percentage}% completed
                          </span>
                        )}
                      </div>

                      <h3 className="font-sans font-bold text-gray-950 dark:text-white group-hover/card:text-indigo-600 dark:group-hover/card:text-indigo-400 text-base leading-tight truncate transition-colors">
                        {book.title}
                      </h3>
                      <p 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAuthor?.(book.author);
                        }}
                        className="text-xs text-gray-400 mt-0.5 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium cursor-pointer inline-block transition-colors"
                      >
                        by <span className="hover:underline">{book.author}</span>
                      </p>
                      {book.publisher && (
                        <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                          <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">Publisher:</span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectPublisher?.(book.publisher!);
                            }}
                            className="text-[10px] text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold cursor-pointer hover:underline transition-colors"
                          >
                            {book.publisher}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-4 leading-relaxed line-clamp-2">
                    {book.description}
                  </p>
                </div>

                {/* Tab specific components */}
                <div className="mt-5 pt-4 border-t border-gray-50 dark:border-zinc-800 space-y-3">
                  {/* Currently Reading View controls */}
                  {activeTab === "Currently Reading" && (
                    <div className="space-y-3">
                      {/* Linear progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                          <span>Progress: {book.currentPage} / {book.totalPages} pages</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Manual "Update Progress" link */}
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={(e) => handleUpdateProgressClick(book, e)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 cursor-pointer bg-indigo-50 dark:bg-indigo-950/30 py-1.5 px-3 rounded-lg hover:scale-105 transition-all"
                        >
                          <Edit2 className="h-3 w-3" /> Update Progress
                        </button>

                        {onReadNow && (
                          <button
                            onClick={() => onReadNow(book)}
                            className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 py-1.5 px-3.5 rounded-lg hover:scale-105 transition-all cursor-pointer shadow-sm active:scale-95"
                          >
                            Read Now
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Already Finished view reviews submitted */}
                  {activeTab === "Already Finished" && (
                    <div className="space-y-2.5">
                      <div className="flex gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRatingChange(book.id, star)}
                            className="cursor-pointer hover:scale-110 transition-transform"
                          >
                            <Star className={`h-4.5 w-4.5 ${star <= (book.rating || 0) ? "fill-current" : "text-gray-200 dark:text-zinc-800"}`} />
                          </button>
                        ))}
                      </div>

                      {book.review && (
                        <blockquote className="text-[11px] leading-relaxed italic text-gray-500 dark:text-zinc-400 border-l-2 border-slate-200 dark:border-zinc-800 pl-3.5 py-0.5">
                          "{book.review}"
                        </blockquote>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCategorySwitch(book.id, "Currently Reading")}
                          className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                        >
                          Re-read Book
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Plan to Read category triggers */}
                  {activeTab === "Plan to Read" && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-gray-400 font-mono">Status: Awaiting Start</span>
                      <button
                        onClick={() => handleCategorySwitch(book.id, "Currently Reading")}
                        className="text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 dark:bg-zinc-800 dark:hover:bg-indigo-600 py-1.5 px-3.5 rounded-lg hover:scale-105 transition-all cursor-pointer shadow-sm"
                      >
                        Start Reading Book
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SMOOTH BOTTOM SHEET PROGRESS MODAL (Section 3.1) */}
      {editingBook && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-50 flex items-end justify-center select-none animate-fade-in">
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={() => setEditingBook(null)} />

          <div className="relative bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 rounded-t-3xl w-full max-w-lg p-6 shadow-2xl z-10 animate-slide-up select-none">
            {/* Header */}
            <div className="flex justify-between items-center mb-5 border-b border-gray-50 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-sans font-bold text-base text-gray-900 dark:text-white leading-tight">Update Reading Progress</h3>
                <p className="text-xs text-gray-400 dark:text-zinc-500 max-w-[280px] truncate mt-0.5">"${editingBook.title}" by ${editingBook.author}</p>
              </div>
              <button
                onClick={() => setEditingBook(null)}
                className="text-xs font-semibold text-gray-500 hover:text-indigo-600 cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Stepper container */}
            <div className="space-y-6">
              {/* Page indicator info */}
              <div className="flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-zinc-400 px-2">
                <span>Completed Page Goal:</span>
                <span>Current Goal: <strong className="text-indigo-600 font-mono text-sm">{getPercentage(stepperPage, editingBook.totalPages)}%</strong></span>
              </div>

              {/* Number Stepper Dial Form (Section 3.1) */}
              <div className="flex items-center justify-center gap-6 py-4 bg-gray-50 dark:bg-zinc-950/40 rounded-2xl border border-gray-100 dark:border-zinc-900/60">
                <button
                  type="button"
                  onClick={() => setStepperPage((p) => Math.max(0, p - 5))}
                  className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-600 dark:text-zinc-300 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm font-bold font-mono"
                  title="Subtract 5 pages"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => setStepperPage((p) => Math.max(0, p - 1))}
                  className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-zinc-200 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md"
                  title="Subtract 1 page"
                >
                  <Minus className="h-5 w-5" />
                </button>

                <div className="text-center w-28">
                  {/* Scrollable Stepper display */}
                  <input
                    type="number"
                    min="0"
                    max={editingBook.totalPages}
                    value={stepperPage}
                    onChange={(e) => setStepperPage(Math.min(editingBook.totalPages, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full text-center font-mono text-3xl font-black text-gray-950 dark:text-white bg-transparent outline-none border-b-2 border-indigo-500/30 focus:border-indigo-600 pb-1"
                  />
                  <div className="text-[10px] text-gray-400 font-bold uppercase mt-1.5">Max {editingBook.totalPages} Pages</div>
                </div>

                <button
                  type="button"
                  onClick={() => setStepperPage((p) => Math.min(editingBook.totalPages, p + 1))}
                  className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-zinc-200 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md"
                  title="Add 1 page"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setStepperPage((p) => Math.min(editingBook.totalPages, p + 5))}
                  className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-600 dark:text-zinc-300 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm font-bold font-mono"
                  title="Add 5 pages"
                >
                  +5
                </button>
              </div>

              {/* Progress Slider */}
              <div className="px-2">
                <input
                  type="range"
                  min="0"
                  max={editingBook.totalPages}
                  value={stepperPage}
                  onChange={(e) => setStepperPage(parseInt(e.target.value))}
                  className={`w-full h-2 rounded-lg cursor-pointer transition-all ${
                    activeTheme === "bookish" ? "accent-[#322314] bg-[#D1C2A5]/50" :
                    activeTheme === "sepia" ? "accent-[#5B4636] bg-[#DCCEB3]/50" :
                    activeTheme === "dark" ? "accent-indigo-500 bg-gray-700" :
                    activeTheme === "oled" ? "accent-white bg-zinc-800 border border-zinc-700" :
                    "accent-indigo-600 bg-gray-200"
                  }`}
                />
              </div>

              {/* Save trigger buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => setEditingBook(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProgress}
                  disabled={isSyncing}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                >
                  {isSyncing ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" /> Save Page Updates
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RATE AND REVIEW POPUP DIALOG */}
      {reviewingBook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-50 flex items-center justify-center p-4 animate-fade-in select-none">
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={() => setReviewingBook(null)} />

          <div className="relative bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 animate-scale-in text-center">
            {/* Celebration Icon */}
            <div className="mx-auto w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 rounded-full flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-7 w-7 animate-bounce" />
            </div>

            <h3 className="font-serif font-black text-xl text-gray-950 dark:text-white leading-tight">
              Congratulations! 🎉
            </h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono uppercase tracking-widest font-black mt-1">
              Book Completed 100%
            </p>

            <div className="my-4 p-3 bg-slate-50 dark:bg-zinc-950/30 rounded-xl border border-gray-100 dark:border-zinc-800/80">
              <h4 className="font-sans font-bold text-sm text-gray-900 dark:text-white truncate">
                {reviewingBook.title}
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">by {reviewingBook.author}</p>
            </div>

            <div className="space-y-4 text-left mt-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Your Rating
                </label>
                <div className="flex gap-2 justify-center py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="cursor-pointer hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= reviewRating
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-200 dark:text-zinc-800"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Write a Review
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your thoughts on this book..."
                  rows={4}
                  className="w-full text-xs p-3 rounded-xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setReviewingBook(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                Skip & Close
              </button>
              <button
                type="button"
                onClick={handleSaveReview}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:shadow-indigo-500/20 cursor-pointer hover:scale-[1.02] transition-all"
              >
                <Check className="h-4 w-4" /> Save Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
