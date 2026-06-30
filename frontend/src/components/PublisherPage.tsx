import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  BookOpen, 
  MapPin, 
  Award, 
  Calendar, 
  Sparkles, 
  Building, 
  Quote, 
  Globe, 
  ArrowUpRight,
  ShieldAlert,
  Layers
} from "lucide-react";
import { Book, ThemeMode } from "../types";
import { DatabaseService, getCoverGradient } from "../utils";

interface PublisherPageProps {
  publisherName: string;
  onBack: () => void;
  onSelectBook?: (book: Book) => void;
  activeTheme?: ThemeMode;
}

interface PublisherMetadata {
  about: string;
  address: string;
  foundedYear: string;
  globalCatalogCount: string;
  focalGenres: string[];
  keyHighlights: string[];
  motto: string;
  website?: string;
  brandColor: string; // Tailwind gradient
}

const PUBLISHER_REGISTRY: Record<string, PublisherMetadata> = {
  "Avery": {
    about: "Avery is an esteemed imprint of Penguin Random House specializing in cutting-edge non-fiction books that address everyday life. Avery publishes ground-breaking titles in wellness, nutrition, cognitive behavior, productivity, personal growth, and healthy living.",
    address: "375 Hudson Street, New York, NY 10014, United States",
    foundedYear: "1976",
    globalCatalogCount: "3,500+ active publications",
    focalGenres: ["Self-Improvement", "Behavioral Science", "Health & Wellness", "Psychology"],
    keyHighlights: [
      "Publisher of international mega-bestseller 'Atomic Habits'",
      "Renowned leader in evidence-based lifestyle literature",
      "Features Nobel laureates and leading cognitive behavioral experts"
    ],
    motto: "Publishing books that help people live healthier, more productive, and more meaningful lives.",
    website: "https://www.penguinrandomhouse.com/imprints/avery",
    brandColor: "from-amber-500 to-orange-700"
  },
  "Ballantine Books": {
    about: "Ballantine Books is one of the most distinguished, historic, and largest publishers in the United States. Founded in 1952 by Ian and Betty Ballantine, it pioneered the high-quality paperback market. It is now a prominent division of the Random House Publishing Group, specializing in world-class commercial fiction, history, memoir, and premier science fiction.",
    address: "1745 Broadway, New York, NY 10019, United States",
    foundedYear: "1952",
    globalCatalogCount: "12,000+ active publications",
    focalGenres: ["Science Fiction", "General Fiction", "Memoirs", "Narrative Non-Fiction"],
    keyHighlights: [
      "Pioneered the mass-market paperback revolution in the US",
      "Publisher of Andy Weir's sci-fi sensation 'Project Hail Mary'",
      "Consistently produces dozens of NYT Bestsellers annually"
    ],
    motto: "Connecting readers with authors who define contemporary reading cultures.",
    website: "https://www.penguinrandomhouse.com/imprints/ballantine-books",
    brandColor: "from-blue-600 to-cyan-800"
  },
  "Harper": {
    about: "Harper (an imprint of HarperCollins) is a legendary global publishing house with a rich history spanning more than two centuries. Founded by the Harper brothers in 1817, it has been home to some of the greatest writers in history, specializing in award-winning literary fiction, history, science, biography, and contemporary world thought.",
    address: "195 Broadway, New York, NY 10007, United States",
    foundedYear: "1817",
    globalCatalogCount: "25,000+ active publications",
    focalGenres: ["Anthropology", "World History", "Biographies", "Philosophical Essays"],
    keyHighlights: [
      "Over 200 years of active publishing excellence",
      "Publisher of Yuval Noah Harari's revolutionary 'Sapiens'",
      "One of the 'Big Five' global publishing powerhouses"
    ],
    motto: "Championing the voices that shape global intellectual conversations.",
    website: "https://www.harpercollins.com",
    brandColor: "from-emerald-500 to-teal-800"
  },
  "Grand Central Publishing": {
    about: "Grand Central Publishing (GCP), formerly Warner Books, is a premier division of Hachette Book Group. GCP publishes a highly diverse list of national bestsellers in fiction and non-fiction, ranging from commercial thrillers and romance to deep focus, science, business development, and cultural history.",
    address: "1290 Avenue of the Americas, New York, NY 10104, United States",
    foundedYear: "1970 (as Warner Books)",
    globalCatalogCount: "7,500+ active publications",
    focalGenres: ["Business & Economics", "Productivity", "Thrillers", "Personal Development"],
    keyHighlights: [
      "Publisher of Cal Newport's industry-shaping 'Deep Work'",
      "Known for outstanding distribution network and author-first support",
      "Top-tier presence on the New York Times Bestseller list"
    ],
    motto: "Excellence in storytelling and transformative ideas for a global audience.",
    website: "https://www.hachettebookgroup.com/imprint/grand-central-publishing",
    brandColor: "from-rose-500 to-indigo-700"
  },
  "Ace Books": {
    about: "Ace Books is the oldest continuously operating science fiction and fantasy publisher in the United States. Founded in 1952 by Donald A. Wollheim, Ace became iconic for its unique 'double books' format. Today, it is part of Penguin Random House and remains the gold standard for high-concept spec fiction, hard sci-fi, and space opera.",
    address: "375 Hudson Street, New York, NY 10014, United States",
    foundedYear: "1952",
    globalCatalogCount: "8,200+ active publications",
    focalGenres: ["Science Fiction", "Epic Fantasy", "Speculative Fiction", "Classic Sci-Fi"],
    keyHighlights: [
      "Publisher of Frank Herbert's masterpiece 'Dune'",
      "Originator of the legendary Ace Double paperbacks",
      "Awarded numerous Hugo and Nebula awards throughout its history"
    ],
    motto: "The definitive home of science fiction and visionary speculative writing.",
    website: "https://www.penguinrandomhouse.com",
    brandColor: "from-purple-600 to-orange-600"
  },
  "Farrar, Straus and Giroux": {
    about: "Farrar, Straus and Giroux (FSG) is an American book publishing company founded in 1946 by Roger W. Straus and John C. Farrar. Renowned for its extraordinary literary standards, FSG's catalog includes many of the world's most celebrated authors, boasting over 20 Nobel Prize winners and dozens of Pulitzer Prizes.",
    address: "120 Broadway, New York, NY 10271, United States",
    foundedYear: "1946",
    globalCatalogCount: "6,000+ active publications",
    focalGenres: ["Psychology & Neuroscience", "Literary Fiction", "Poetry", "Academic Essays"],
    keyHighlights: [
      "Publisher of Nobel laureate Daniel Kahneman's 'Thinking, Fast and Slow'",
      "Unparalleled prestige in Nobel and Pulitzer history",
      "Affiliated with Macmillan, ensuring vast global distribution"
    ],
    motto: "Where literary quality meets enduring global influence.",
    website: "https://us.macmillan.com/fsg",
    brandColor: "from-slate-600 to-zinc-800"
  }
};

const DEFAULT_METADATA: PublisherMetadata = {
  about: "A prestigious global publishing imprint dedicated to delivering outstanding literary and educational experiences to readers worldwide. Our published collections embrace high-fidelity storytelling, rigorous academic research, and transformational concepts.",
  address: "International Book Plaza, New York, NY, United States",
  foundedYear: "Mid-20th Century",
  globalCatalogCount: "1,200+ active publications",
  focalGenres: ["General Literature", "Educational Development", "Thought Leadership"],
  keyHighlights: [
    "Respected catalog of diverse contemporary titles",
    "Committed to rigorous standards of editorial craft",
    "Global distribution spanning online and offline bookstores"
  ],
  motto: "Connecting authors and audiences through the power of the written word.",
  website: "https://www.penguinrandomhouse.com",
  brandColor: "from-indigo-500 to-purple-600"
};

export default function PublisherPage({ 
  publisherName, 
  onBack, 
  onSelectBook, 
  activeTheme = "bookish" 
}: PublisherPageProps) {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    // Fetch books dynamically from system
    const allBooks = DatabaseService.getBooks();
    // Filter books published by this publisher
    const publisherBooks = allBooks.filter(
      (b) => b.publisher && b.publisher.toLowerCase().trim() === publisherName.toLowerCase().trim()
    );
    setBooks(publisherBooks);
  }, [publisherName]);

  const metadata = PUBLISHER_REGISTRY[publisherName] || {
    ...DEFAULT_METADATA,
    about: `${publisherName} is a distinguished partner publisher represented in our library catalog. They specialize in publishing premium materials that elevate readers' understanding, entertain the imagination, and provoke constructive thought.`
  };

  const getThemeStyles = () => {
    switch (activeTheme) {
      case "bookish":
        return {
          cardBg: "bg-[#FAF6EE] border-[#D1C2A5]",
          headerText: "text-[#322314]",
          subtext: "text-[#5C4D3C]",
          accentBtn: "bg-[#322314] hover:bg-[#4E3923] text-[#FAF6EE]",
          pillActive: "bg-[#322314] text-[#FAF6EE] border-[#322314]",
          pillInactive: "bg-[#FAF6EE] text-[#5C4D3C] border-[#D1C2A5]/50",
          accentText: "text-[#322314]"
        };
      case "sepia":
        return {
          cardBg: "bg-[#EADFC9] border-[#DCCEB3]",
          headerText: "text-[#5B4636]",
          subtext: "text-[#705C4E]",
          accentBtn: "bg-[#5B4636] hover:bg-[#725B49] text-[#F4ECD8]",
          pillActive: "bg-[#5B4636] text-[#F4ECD8] border-[#5B4636]",
          pillInactive: "bg-[#EADFC9] text-[#705C4E] border-[#DCCEB3]/50",
          accentText: "text-[#5B4636]"
        };
      case "dark":
        return {
          cardBg: "bg-[#2D3748] border-[#4A5568]",
          headerText: "text-[#EDF2F7]",
          subtext: "text-[#A0AEC0]",
          accentBtn: "bg-indigo-600 hover:bg-indigo-700 text-[#EDF2F7]",
          pillActive: "bg-indigo-600 text-white border-indigo-600",
          pillInactive: "bg-gray-800 text-gray-400 border-gray-700",
          accentText: "text-indigo-400"
        };
      case "oled":
        return {
          cardBg: "bg-[#121212] border-[#27272A]",
          headerText: "text-[#F5F5F5]",
          subtext: "text-[#718096]",
          accentBtn: "bg-[#F5F5F5] hover:bg-zinc-200 text-[#000000]",
          pillActive: "bg-[#F5F5F5] text-[#000000] border-white",
          pillInactive: "bg-black text-[#718096] border-[#27272A]",
          accentText: "text-white"
        };
      case "light":
      default:
        return {
          cardBg: "bg-white border-gray-100",
          headerText: "text-gray-900",
          subtext: "text-gray-500",
          accentBtn: "bg-indigo-600 hover:bg-indigo-700 text-white",
          pillActive: "bg-indigo-600 text-white border-indigo-600",
          pillInactive: "bg-gray-50 text-gray-500 border-gray-200",
          accentText: "text-indigo-600"
        };
    }
  };

  const themeStyles = getThemeStyles();

  // Pick initials of publisher for logo
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 3)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in select-none">
      {/* Navigation & Header Status */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors focus:outline-none"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go Back</span>
        </button>
        <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1">
          <Building className="h-3 w-3" /> Publisher Profile
        </span>
      </div>

      {/* Main Grid: Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Brand Logo, Contact info (4 Columns) */}
        <div className="md:col-span-4 space-y-6">
          <div className={`p-6 border rounded-2xl shadow-sm ${themeStyles.cardBg} transition-all flex flex-col items-center text-center`}>
            
            {/* Publisher Visual Logo Emblem */}
            <div className={`h-28 w-28 rounded-3xl bg-gradient-to-br ${metadata.brandColor} text-white flex items-center justify-center shadow-lg border-4 border-white dark:border-zinc-800 mb-4`}>
              <span className="font-sans font-black text-2xl tracking-widest">
                {getInitials(publisherName)}
              </span>
            </div>

            <h2 className={`font-sans font-extrabold text-xl tracking-tight ${themeStyles.headerText}`}>
              {publisherName}
            </h2>
            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mt-1">
              Imprint House
            </p>

            {/* Address and Fast Metadata */}
            <div className="w-full pt-5 mt-5 border-t border-gray-100 dark:border-zinc-800/80 space-y-3.5 text-left">
              <div className="flex gap-3 text-xs text-gray-600 dark:text-zinc-300">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-gray-400">Headquarters</p>
                  <p className="font-bold">{metadata.address}</p>
                </div>
              </div>

              <div className="flex gap-3 text-xs text-gray-600 dark:text-zinc-300">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-gray-400">Founded</p>
                  <p className="font-bold">Year {metadata.foundedYear}</p>
                </div>
              </div>

              <div className="flex gap-3 text-xs text-gray-600 dark:text-zinc-300">
                <BookOpen className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-gray-400">Global Catalog Size</p>
                  <p className="font-bold">{metadata.globalCatalogCount}</p>
                </div>
              </div>

              {metadata.website && (
                <div className="flex gap-3 text-xs text-gray-600 dark:text-zinc-300">
                  <Globe className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-gray-400">Official Web Presence</p>
                    <a 
                      href={metadata.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                    >
                      Visit Imprint Site <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Core Genres Tag list */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-gray-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-500" />
              Focal Genres
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {metadata.focalGenres.map((genre) => (
                <span 
                  key={genre}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg border bg-slate-50 dark:bg-zinc-950/20 border-gray-100 dark:border-zinc-800 text-gray-600 dark:text-zinc-300"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: About Narrative, Achievements, and Catalog shelf (8 Columns) */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Detailed Narrative block */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <h3 className="font-serif font-black text-lg text-gray-950 dark:text-white">
                About the Imprint House
              </h3>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed text-justify">
              {metadata.about}
            </p>
          </div>

          {/* Inspirational motto block */}
          {metadata.motto && (
            <div className={`p-6 border rounded-2xl shadow-sm ${themeStyles.cardBg} space-y-3 relative overflow-hidden`}>
              <Quote className="absolute top-4 right-4 h-16 w-16 text-gray-400/10 rotate-180 pointer-events-none" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                Publisher Philosophy
              </span>
              <p className={`font-serif italic text-sm md:text-base leading-relaxed font-bold ${themeStyles.headerText}`}>
                "{metadata.motto}"
              </p>
              <p className="text-[10px] text-gray-400">— Official Mission Statement</p>
            </div>
          )}

          {/* Imprint Highlights */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <h3 className="font-serif font-black text-lg text-gray-950 dark:text-white">
                Key Editorial Milestones
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {metadata.keyHighlights.map((item, idx) => (
                <div 
                  key={idx}
                  className="flex gap-2.5 items-start p-3 bg-slate-50/50 dark:bg-zinc-800/20 border border-slate-100/40 dark:border-zinc-800/40 rounded-xl"
                >
                  <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0 mt-0.5">
                    <Sparkles className="h-3 w-3 text-indigo-500" />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-zinc-300 font-medium leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Catalog items in our database */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-black text-lg text-gray-950 dark:text-white">
                  Titles In Current Library Database
                </h3>
                <span className="px-2.5 py-1 text-[10px] font-mono rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold">
                  {books.length} {books.length === 1 ? "Book" : "Books"} Listed
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Click any cataloged title below to view full details and interactive features.
              </p>
            </div>

            {books.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-gray-100 dark:border-zinc-800 rounded-2xl text-xs text-gray-400">
                No cataloged books found for {publisherName} in this account.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {books.map((book) => {
                  return (
                    <div 
                      key={book.id}
                      onClick={() => onSelectBook?.(book)}
                      className="group/book p-4 border border-gray-100 dark:border-zinc-800 hover:border-indigo-100 dark:hover:border-zinc-700 hover:shadow-md rounded-2xl flex gap-4 cursor-pointer transition-all bg-white dark:bg-zinc-900"
                    >
                      {/* Book Cover Design */}
                      <div className={`w-14 h-20 rounded-lg bg-gradient-to-br ${getCoverGradient(book.title)} flex-shrink-0 shadow-sm flex flex-col justify-between p-2 text-white group-hover/book:scale-105 transition-transform duration-300`}>
                        <BookOpen className="h-3 w-3 opacity-80" />
                        <span className="text-[7px] font-mono truncate">{book.genre}</span>
                      </div>

                      <div className="min-w-0 flex flex-col justify-between py-0.5">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover/book:text-indigo-600 dark:group-hover/book:text-indigo-400 transition-colors">
                            {book.title}
                          </h4>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">by {book.author}</p>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <span className="bg-slate-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 text-[9px] font-bold px-2 py-0.5 rounded-md border border-slate-100 dark:border-zinc-700">
                            {book.genre}
                          </span>
                          <span className="text-[9px] font-mono text-gray-400">
                            {book.totalPages} pages
                          </span>
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
