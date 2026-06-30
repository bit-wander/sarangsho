import React from "react";
import { ArrowLeft, BookOpen, Calendar, Hash, Star, AlertCircle, BookMarked, Sparkles, Check, Building } from "lucide-react";
import { Book, ThemeMode } from "../types";
import { getCoverGradient } from "../utils";

interface BookDetailPageProps {
  book: Book;
  onBack: () => void;
  onReadNow: (book: Book) => void;
  onSelectAuthor?: (authorName: string) => void;
  onSelectPublisher?: (publisherName: string) => void;
  activeTheme?: ThemeMode;
  onUpdateBook?: (book: Book) => void;
}

export default function BookDetailPage({
  book,
  onBack,
  onReadNow,
  onSelectAuthor,
  onSelectPublisher,
  activeTheme = "bookish",
  onUpdateBook
}: BookDetailPageProps) {
  // Calculate percentage of reading completion
  const percentage = Math.min(Math.round((book.currentPage / book.totalPages) * 100), 100);

  const handleStatusChange = (newCategory: "Plan to Read" | "Currently Reading" | "Already Finished") => {
    const updatedBook: Book = {
      ...book,
      category: newCategory,
      currentPage: newCategory === "Already Finished" ? book.totalPages : newCategory === "Plan to Read" ? 0 : book.currentPage
    };
    if (onUpdateBook) {
      onUpdateBook(updatedBook);
    }
  };

  const getButtonStyles = (status: "Plan to Read" | "Currently Reading" | "Already Finished") => {
    const isActive = book.category === status;
    switch (activeTheme) {
      case "bookish":
        return isActive
          ? "bg-[#322314] border-[#322314] text-[#FAF6EE] shadow-sm"
          : "bg-[#FAF6EE] border-[#D1C2A5]/50 text-[#5C4D3C] hover:bg-[#F4EFE6]";
      case "sepia":
        return isActive
          ? "bg-[#5B4636] border-[#5B4636] text-[#F4ECD8] shadow-sm"
          : "bg-[#EADFC9] border-[#DCCEB3]/50 text-[#705C4E] hover:bg-[#F4ECD8]";
      case "dark":
        return isActive
          ? "bg-indigo-600 border-indigo-600 text-[#EDF2F7] shadow-sm"
          : "bg-[#1A202C] border-[#4A5568]/50 text-[#A0AEC0] hover:bg-[#2D3748]";
      case "oled":
        return isActive
          ? "bg-[#F5F5F5] border-[#F5F5F5] text-[#000000] shadow-sm"
          : "bg-[#000000] border-[#27272A]/50 text-[#718096] hover:bg-[#121212]";
      case "light":
      default:
        return isActive
          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
          : "bg-slate-50 border-gray-100 text-gray-600 hover:bg-slate-100";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in select-none">
      {/* Back button and navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-3.5 py-2 rounded-xl hover:scale-105 transition-all cursor-pointer focus:outline-none"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Previous
        </button>

        <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-widest bg-gray-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800 px-3 py-1 rounded-full">
          Book Dossier
        </span>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side: Cover and Metadata (4 Columns) */}
        <div className="md:col-span-4 flex flex-col items-center md:items-stretch space-y-6">
          {/* Cover Graphic */}
          <div className="relative group w-48 h-72 md:w-full md:h-96 max-w-sm rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className={`w-full h-full bg-gradient-to-br ${getCoverGradient(book.title)} flex flex-col justify-between p-6 text-white`}>
              <div className="flex justify-between items-start">
                <BookOpen className="h-8 w-8 opacity-80" />
                <span className="bg-white/20 backdrop-blur-sm text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-full">
                  {book.genre}
                </span>
              </div>
              <div>
                <span 
                  onClick={() => onSelectAuthor?.(book.author)}
                  className="text-[10px] font-mono tracking-widest font-black uppercase opacity-80 hover:opacity-100 hover:underline cursor-pointer block mb-1 transition-opacity"
                >
                  {book.author}
                </span>
                <h2 className="font-serif font-black text-xl md:text-2xl leading-tight line-clamp-3">
                  {book.title}
                </h2>
              </div>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-sm">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-2">
              Book Details
            </h4>
            
            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-zinc-300">
              <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Published</p>
                <p className="font-bold">{book.publishedYear}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-zinc-300">
              <BookMarked className="h-4 w-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Page Count</p>
                <p className="font-bold">{book.totalPages} pages</p>
              </div>
            </div>

            {book.isbn && (
              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-zinc-300">
                <Hash className="h-4 w-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">ISBN Code</p>
                  <p className="font-bold font-mono text-[11px]">{book.isbn}</p>
                </div>
              </div>
            )}

            {book.publisher && (
              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-zinc-300">
                <Building className="h-4 w-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Publisher</p>
                  <button
                    onClick={() => onSelectPublisher?.(book.publisher!)}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline text-left cursor-pointer transition-colors focus:outline-none"
                  >
                    {book.publisher}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Repositioned Read Now Action block */}
          <div className="w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            {book.isOnlineAvailable !== false ? (
              <div className="flex flex-col gap-3">
                <div>
                  <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                    Online E-Reader
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                    Dive directly into the interactive reading canvas to continue reading, highlight passages, and ask the AI Companion.
                  </p>
                </div>
                <button
                  onClick={() => onReadNow(book)}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-500/25 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                >
                  <BookOpen className="h-4 w-4" /> Read Now
                </button>
              </div>
            ) : (
              <div className="flex gap-3 items-start p-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-sans font-bold text-xs text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                    Unavailable
                  </h4>
                  <p className="text-[11px] text-amber-600/90 dark:text-amber-400/80 mt-1 leading-relaxed">
                    The e-reading license for this edition is currently offline. You can track your reading progress manually.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Description, Reviews, Actions (8 Columns) */}
        <div className="md:col-span-8 space-y-6">
          {/* Header Title Information */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
            <div>
              <span className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                {book.category}
              </span>
              <h1 className="font-serif font-black text-2xl md:text-3.5xl text-gray-950 dark:text-white leading-tight mt-3">
                {book.title}
              </h1>
              <p className="text-sm md:text-base text-gray-500 dark:text-zinc-400 mt-1">
                by{" "}
                <span 
                  onClick={() => onSelectAuthor?.(book.author)}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer transition-colors"
                >
                  {book.author}
                </span>
              </p>
            </div>

            {/* Reading Status Selector */}
            <div className="pt-4 border-t border-gray-50 dark:border-zinc-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider block">
                  Select Reading Status
                </span>
                <span className="text-[10px] font-mono text-gray-400">
                  Updates your live Dashboard
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(["Plan to Read", "Currently Reading", "Already Finished"] as const).map((status) => {
                  const isActive = book.category === status;
                  return (
                    <button
                      key={status}
                      id={`status-btn-${status.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => handleStatusChange(status)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none ${getButtonStyles(status)}`}
                    >
                      {isActive && <Check className="h-3.5 w-3.5 shrink-0" />}
                      <span>{status}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reading progress bar */}
            {book.category !== "Plan to Read" && (
              <div className="space-y-2 pt-2 border-t border-gray-50 dark:border-zinc-800/80">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Reading Progress</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-black">{percentage}% Completed</span>
                </div>
                <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-mono text-right">
                  {book.currentPage} of {book.totalPages} pages read
                </p>
              </div>
            )}
          </div>

          {/* Book Summary */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
            <h3 className="font-serif font-black text-lg text-gray-950 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" /> Book Summary
            </h3>
            <p className="text-xs md:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed text-justify">
              {book.description}
            </p>
          </div>

          {/* Rating and Review section */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-50 dark:border-zinc-800/50 pb-4">
              <div>
                <h3 className="font-serif font-black text-lg text-gray-950 dark:text-white">
                  Overall Readers Rating & Reviews
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Aggregated thoughts and feedback from members who completed this book.
                </p>
              </div>
              <span className="self-start sm:self-center text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/40 dark:border-indigo-900/40 font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                Verified Reviews
              </span>
            </div>

            {(() => {
              // Peer reviews database mapping
              const COMMUNITY_REVIEWS: Record<string, { id: string; readerName: string; avatarColor: string; rating: number; reviewText: string; date: string; isCurrentUser?: boolean; }[]> = {
                "Atomic Habits": [
                  {
                    id: "ah-1",
                    readerName: "Elena Rostova",
                    avatarColor: "from-pink-500 to-rose-500",
                    rating: 5,
                    reviewText: "This book completely transformed my morning routine. Starting small really works. The aggregation of marginal gains is a powerful concept!",
                    date: "2 months ago"
                  },
                  {
                    id: "ah-2",
                    readerName: "Ji-Hoon Park",
                    avatarColor: "from-blue-500 to-indigo-500",
                    rating: 4,
                    reviewText: "Highly actionable advice. The 2-minute rule has been a game-changer for my daily writing practice. Deducted 1 star because it gets a bit repetitive.",
                    date: "1 month ago"
                  },
                  {
                    id: "ah-3",
                    readerName: "Aaliyah Jackson",
                    avatarColor: "from-emerald-500 to-teal-500",
                    rating: 5,
                    reviewText: "Clear, practical, and backed by neuroscience. It doesn't just tell you what to do, it explains why you do it and how to reprogram your environment.",
                    date: "3 weeks ago"
                  }
                ],
                "Project Hail Mary": [
                  {
                    id: "phm-1",
                    readerName: "Sarah Jenkins",
                    avatarColor: "from-amber-500 to-orange-500",
                    rating: 5,
                    reviewText: "The best science fiction I have read in a decade! The friendship between the protagonist and Rocky is heartwarming and brilliant. Unputdownable!",
                    date: "3 months ago"
                  },
                  {
                    id: "phm-2",
                    readerName: "Michael Chang",
                    avatarColor: "from-purple-500 to-fuchsia-500",
                    rating: 5,
                    reviewText: "Pure nerd-heaven. Andy Weir has done it again. The physics, chemistry, and biology are explained in a way that keeps you on the edge of your seat.",
                    date: "1 month ago"
                  },
                  {
                    id: "phm-3",
                    readerName: "David Miller",
                    avatarColor: "from-cyan-500 to-blue-500",
                    rating: 4,
                    reviewText: "Outstanding pacing and story. Rocky steals the show. A classic space adventure filled with extreme optimism and problem-solving.",
                    date: "2 weeks ago"
                  }
                ],
                "Sapiens": [
                  {
                    id: "sap-1",
                    readerName: "Chloe Lefevre",
                    avatarColor: "from-teal-500 to-green-500",
                    rating: 5,
                    reviewText: "Mind-bending analysis of how shared imaginary realities structured human civilization. It completely shifts how you view history, currencies, and religion.",
                    date: "4 months ago"
                  },
                  {
                    id: "sap-2",
                    readerName: "Tariq Al-Jamil",
                    avatarColor: "from-red-500 to-orange-500",
                    rating: 4,
                    reviewText: "Incredibly broad and ambitious. Some sections feel a bit overgeneralized, but Harari's storytelling makes human history feel like an epic novel.",
                    date: "2 months ago"
                  },
                  {
                    id: "sap-3",
                    readerName: "Siddharth Mehta",
                    avatarColor: "from-violet-500 to-purple-500",
                    rating: 5,
                    reviewText: "A sweeping narrative of our species. The transition from hunter-gatherers to agricultural societies was described in a truly fascinating, contrarian light.",
                    date: "1 month ago"
                  }
                ],
                "Deep Work": [
                  {
                    id: "dw-1",
                    readerName: "Liam O'Connor",
                    avatarColor: "from-sky-500 to-blue-500",
                    rating: 4,
                    reviewText: "An essential manual for the modern distracted knowledge worker. Already implementing 90-minute quiet focus blocks with great results.",
                    date: "3 months ago"
                  },
                  {
                    id: "dw-2",
                    readerName: "Priya Nair",
                    avatarColor: "from-fuchsia-500 to-pink-500",
                    rating: 5,
                    reviewText: "Cal Newport hits the nail on the head. In an economy that rewards rare and valuable skills, the ability to focus deeply is a superpower.",
                    date: "1 month ago"
                  },
                  {
                    id: "dw-3",
                    readerName: "Alex Mercer",
                    avatarColor: "from-yellow-500 to-amber-500",
                    rating: 4,
                    reviewText: "Extremely practical strategies to manage digital clutter. I have turned off almost all push notifications since reading this.",
                    date: "3 weeks ago"
                  }
                ],
                "Dune": [
                  {
                    id: "dun-1",
                    readerName: "Arthur Pendleton",
                    avatarColor: "from-yellow-600 to-amber-700",
                    rating: 5,
                    reviewText: "The absolute pinnacle of speculative fiction. The ecological, religious, and political layers of Arrakis are deeply thought-provoking and unmatched.",
                    date: "6 months ago"
                  },
                  {
                    id: "dun-2",
                    readerName: "Jessica Vance",
                    avatarColor: "from-purple-600 to-indigo-700",
                    rating: 5,
                    reviewText: "Herbert's prose is hypnotic. The tension between the Great Houses and the ecological struggle of the Fremen makes this a masterpiece for the ages.",
                    date: "2 months ago"
                  },
                  {
                    id: "dun-3",
                    readerName: "Markus K.",
                    avatarColor: "from-gray-600 to-slate-700",
                    rating: 5,
                    reviewText: "A rich tapestry of philosophy, human power dynamics, and environmentalism. Dune remains as relevant today as it was in 1965.",
                    date: "1 month ago"
                  }
                ],
                "Thinking, Fast and Slow": [
                  {
                    id: "tfs-1",
                    readerName: "Dr. Robert Chen",
                    avatarColor: "from-emerald-600 to-teal-700",
                    rating: 5,
                    reviewText: "A monumental achievement in cognitive science. Understanding System 1 (fast, intuitive) and System 2 (slow, analytical) will change how you make decisions.",
                    date: "5 months ago"
                  },
                  {
                    id: "tfs-2",
                    readerName: "Emma Watson",
                    avatarColor: "from-pink-600 to-rose-700",
                    rating: 4,
                    reviewText: "Absolutely packed with insights on human bias, risk aversion, and happiness. It's quite dense and academic, but profoundly rewarding if you take your time.",
                    date: "3 months ago"
                  }
                ]
              };

              const getCommunityReviewsForBook = (bookTitle: string): { id: string; readerName: string; avatarColor: string; rating: number; reviewText: string; date: string; isCurrentUser?: boolean; }[] => {
                if (COMMUNITY_REVIEWS[bookTitle]) {
                  return COMMUNITY_REVIEWS[bookTitle];
                }
                return [
                  {
                    id: `gen-1-${bookTitle}`,
                    readerName: "Sophia Carter",
                    avatarColor: "from-indigo-500 to-purple-500",
                    rating: 5,
                    reviewText: `Absolutely loved reading "${bookTitle}"! It is a very refreshing perspective and holds some incredibly valuable takeaways.`,
                    date: "1 month ago"
                  },
                  {
                    id: `gen-2-${bookTitle}`,
                    readerName: "Jameson Reynolds",
                    avatarColor: "from-sky-500 to-cyan-500",
                    rating: 4,
                    reviewText: "Very solid narrative structure and highly engaging. Definitely recommend picking this up if you are interested in the subject matter.",
                    date: "2 weeks ago"
                  }
                ];
              };

              const peerReviews = getCommunityReviewsForBook(book.title);
              const userReview = book.rating ? {
                id: "user-review-current",
                readerName: "You (Library Member)",
                avatarColor: "from-indigo-600 to-violet-600",
                rating: book.rating,
                reviewText: book.review || "Rated without written review.",
                date: "Just now",
                isCurrentUser: true
              } : null;

              const allReviews = userReview ? [userReview, ...peerReviews] : peerReviews;
              const totalReviewsCount = allReviews.length;
              const sumRatingsValue = allReviews.reduce((sum, r) => sum + r.rating, 0);
              const averageRatingValue = totalReviewsCount > 0 ? Math.round((sumRatingsValue / totalReviewsCount) * 10) / 10 : 0;

              // Rating breakdown counting
              const ratingCountsMap = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
              allReviews.forEach((r) => {
                const rounded = Math.min(Math.max(Math.round(r.rating), 1), 5) as 1 | 2 | 3 | 4 | 5;
                ratingCountsMap[rounded] = (ratingCountsMap[rounded] || 0) + 1;
              });

              return (
                <div className="space-y-6">
                  {/* Aggregated ratings header board */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 bg-slate-50/50 dark:bg-zinc-950/20 border border-gray-100 dark:border-zinc-800/60 rounded-2xl">
                    {/* Average Display */}
                    <div className="md:col-span-4 flex flex-col items-center justify-center text-center py-2 md:border-r border-gray-100 dark:border-zinc-800/60">
                      <span className="font-serif font-black text-4.5xl text-gray-950 dark:text-white leading-none">
                        {averageRatingValue.toFixed(1)}
                      </span>
                      <div className="flex gap-0.5 my-2.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4.5 w-4.5 ${
                              star <= Math.round(averageRatingValue)
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-200 dark:text-zinc-800"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">
                        Based on {totalReviewsCount} reader reviews
                      </span>
                    </div>

                    {/* Star Breakdown bars */}
                    <div className="md:col-span-8 space-y-1.5">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = ratingCountsMap[star as 1|2|3|4|5] || 0;
                        const pct = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
                        return (
                          <div key={star} className="flex items-center gap-3 text-xs">
                            <span className="w-12 font-mono font-bold text-gray-400 text-right shrink-0 flex items-center justify-end gap-1">
                              {star} <Star className="h-3 w-3 text-amber-400 fill-amber-400 inline" />
                            </span>
                            <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                              <div
                                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-8 text-[10px] font-mono font-bold text-gray-400 text-right shrink-0">
                              {pct}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Individual review list */}
                  <div className="space-y-4">
                    <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                      All Readers Feedback
                    </h4>

                    <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                      {allReviews.map((review) => {
                        const initials = review.readerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2);

                        return (
                          <div
                            key={review.id}
                            className={`p-4 rounded-xl border transition-all ${
                              review.isCurrentUser
                                ? "bg-indigo-50/25 dark:bg-indigo-950/10 border-indigo-200/50 dark:border-indigo-900/40 shadow-sm"
                                : "bg-white dark:bg-zinc-900/40 border-gray-100 dark:border-zinc-800/60 hover:bg-gray-50/50 dark:hover:bg-zinc-900/60"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                {/* Colored avatar bubble */}
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${review.avatarColor} flex items-center justify-center text-white text-xs font-black shrink-0`}>
                                  {initials}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h5 className="font-sans font-bold text-xs text-gray-900 dark:text-white">
                                      {review.readerName}
                                    </h5>
                                    {review.isCurrentUser && (
                                      <span className="bg-indigo-600 text-white font-mono text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider scale-90">
                                        Your Review
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-gray-400 font-mono">{review.date}</p>
                                </div>
                              </div>

                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3.5 w-3.5 ${
                                      star <= review.rating
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-gray-200 dark:text-zinc-800"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            <p className="mt-3 text-xs text-gray-600 dark:text-zinc-300 leading-relaxed italic pl-1 border-l-2 border-gray-100 dark:border-zinc-800">
                              "{review.reviewText}"
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
