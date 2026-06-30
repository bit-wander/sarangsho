import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  BookOpen, 
  MapPin, 
  Award, 
  Calendar, 
  Sparkles, 
  Star, 
  Quote, 
  Globe, 
  ArrowUpRight,
  TrendingUp,
  FileText
} from "lucide-react";
import { Book, ThemeMode } from "../types";
import { DatabaseService, getCoverGradient } from "../utils";

interface AuthorPageProps {
  authorName: string;
  onBack: () => void;
  onSelectBook?: (book: Book) => void;
  activeTheme?: ThemeMode;
}

interface AuthorMetadata {
  bio: string;
  birthPlace: string;
  era: string;
  keyThemes: string[];
  achievements: string[];
  quote: string;
  website?: string;
  avatarPlaceholderColor: string;
}

const AUTHOR_REGISTRY: Record<string, AuthorMetadata> = {
  "James Clear": {
    bio: "James Clear is an American author and entrepreneur, best known for his work on habit formation, continuous self-improvement, and decision making. He is the author of the #1 New York Times bestseller Atomic Habits, which has sold over 15 million copies worldwide and has been translated into more than 50 languages.",
    birthPlace: "Hamilton, Ohio, USA",
    era: "Contemporary (1986 - present)",
    keyThemes: ["Habits", "Behavioral Psychology", "Systems Design", "Continuous Improvement"],
    achievements: [
      "Author of #1 NYT Bestseller 'Atomic Habits'",
      "Founder of the Habits Academy",
      "Grew weekly newsletter to over 2 million active subscribers"
    ],
    quote: "You do not rise to the level of your goals. You fall to the level of your systems.",
    website: "https://jamesclear.com",
    avatarPlaceholderColor: "from-amber-500 to-orange-600"
  },
  "Andy Weir": {
    bio: "Andy Weir is an American novelist and former software engineer whose debut novel, The Martian, was adapted into an Oscar-nominated film directed by Ridley Scott. Known for his rigorous scientific accuracy and engaging, humorous narration style, Weir has established himself as a premier voice in modern hard science fiction.",
    birthPlace: "Davis, California, USA",
    era: "Contemporary (1972 - present)",
    keyThemes: ["Hard Science Fiction", "Survivalism", "Astrophysics", "Optimistic Problem Solving"],
    achievements: [
      "John W. Campbell Award for Best New Writer",
      "Audie Award for Science Fiction for 'Project Hail Mary'",
      "Adapted into highly acclaimed blockbuster film 'The Martian'"
    ],
    quote: "Yes, of course duct tape works in a near-vacuum. Duct tape works anywhere. Duct tape is magic and should be worshiped.",
    website: "http://www.andyweirauthor.com",
    avatarPlaceholderColor: "from-blue-500 to-indigo-700"
  },
  "Yuval Noah Harari": {
    bio: "Yuval Noah Harari is an Israeli public intellectual, historian, and a professor in the Department of History at the Hebrew University of Jerusalem. He is the author of the international bestsellers Sapiens: A Brief History of Humankind, Homo Deus: A Brief History of Tomorrow, and 21 Lessons for the 21st Century.",
    birthPlace: "Kiryat Ata, Israel",
    era: "Contemporary (1976 - present)",
    keyThemes: ["World History", "Evolutionary Biology", "Technological Philosophy", "Macro-History"],
    achievements: [
      "Two-time winner of the Polonsky Prize for Creativity and Originality",
      "Over 40 million books sold worldwide",
      "Keynote speaker at the World Economic Forum in Davos"
    ],
    quote: "History is something that very few people have been making while everyone else was ploughing fields and carrying water buckets.",
    website: "https://www.ynharari.com",
    avatarPlaceholderColor: "from-emerald-500 to-teal-700"
  },
  "Cal Newport": {
    bio: "Cal Newport is an Associate Professor of Computer Science at Georgetown University and the author of several self-improvement and productivity books. He is best known for coinng the term 'deep work' and advocating for digital minimalism in an increasingly distracted world.",
    birthPlace: "Washington, D.C., USA",
    era: "Contemporary (1982 - present)",
    keyThemes: ["Productivity", "Deep Focus", "Digital Minimalism", "Career Mastery"],
    achievements: [
      "Associate Professor of Computer Science at Georgetown University",
      "Introduced widely accepted concepts like 'Deep Work' and 'Digital Minimalism'",
      "Prolific writer for the New Yorker on technology and culture"
    ],
    quote: "To produce at your peak level you need to work for extended periods with full concentration on a single task free from distraction.",
    website: "https://calnewport.com",
    avatarPlaceholderColor: "from-rose-500 to-red-700"
  },
  "Frank Herbert": {
    bio: "Frank Herbert was an American science fiction writer best known for his 1965 novel Dune and its five sequels. Although he was also a journalist, photographer, book reviewer, ecological consultant, and lecturer, Dune remains the best-selling science fiction novel in history and the blueprint of high-concept science fiction.",
    birthPlace: "Tacoma, Washington, USA",
    era: "Mid-20th Century (1920 - 1986)",
    keyThemes: ["Ecology", "Political Philosophy", "Human Evolution", "Messianism", "Space Feudalism"],
    achievements: [
      "Winner of Hugo Award for Best Novel",
      "Winner of Nebula Award for Best Novel",
      "Creator of Dune, widely considered the greatest science-fiction novel of all time"
    ],
    quote: "Fear is the mind-killer. Fear is the little-death that brings total obliteration. I will face my fear.",
    avatarPlaceholderColor: "from-amber-600 to-yellow-800"
  },
  "Daniel Kahneman": {
    bio: "Daniel Kahneman was an Israeli-American psychologist and economist notable for his work on the psychology of judgment and decision-making, as well as behavioral economics, for which he was awarded the 2002 Nobel Memorial Prize in Economic Sciences. His empirical findings challenge the assumption of human rationality.",
    birthPlace: "Tel Aviv, Mandatory Palestine",
    era: "Late 20th - Early 21st Century (1934 - 2024)",
    keyThemes: ["Cognitive Biases", "Heuristics", "Prospect Theory", "Dual-Process Brain Theory"],
    achievements: [
      "Awarded the Nobel Memorial Prize in Economic Sciences (2002)",
      "Received the Presidential Medal of Freedom (2013)",
      "Ranked by Economist as one of the world's most influential economists"
    ],
    quote: "Nothing in life is as important as you think it is, while you are thinking about it.",
    avatarPlaceholderColor: "from-zinc-500 to-slate-700"
  }
};

const DEFAULT_METADATA: AuthorMetadata = {
  bio: "A prolific and highly respected writer whose literary contributions have captured the imaginations and stimulated the intellects of readers across the globe. Their written works represent a deep commitment to excellence in their craft.",
  birthPlace: "International",
  era: "Contemporary Author",
  keyThemes: ["Literature", "Thought Leadership", "Storytelling", "Insight Enrichment"],
  achievements: [
    "Published outstanding works in their genre",
    "Fostered deep intellectual dialogue through active publishing",
    "Recognized globally for contributions to catalog advancement"
  ],
  quote: "The written word endures, linking minds across time, spaces, and diverse perspectives.",
  avatarPlaceholderColor: "from-indigo-500 to-purple-600"
};

export default function AuthorPage({ 
  authorName, 
  onBack, 
  onSelectBook, 
  activeTheme = "bookish" 
}: AuthorPageProps) {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    // Get books from database
    const allBooks = DatabaseService.getBooks();
    // Filter books by this author
    const authorBooks = allBooks.filter(
      (b) => b.author.toLowerCase().trim() === authorName.toLowerCase().trim()
    );
    setBooks(authorBooks);
  }, [authorName]);

  const metadata = AUTHOR_REGISTRY[authorName] || {
    ...DEFAULT_METADATA,
    bio: `${authorName} is a notable author represented in our Digital Library. Their literature provides readers with deep perspective, thought-provoking concepts, and creative storytelling in modern publishing circles.`
  };

  // Theme styling helpers
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

  // Pick initials of author for a high-fidelity visual avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in select-none">
      {/* Upper header back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors focus:outline-none"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go Back</span>
        </button>
        <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
          Author Dossier • Verified Profile
        </span>
      </div>

      {/* Main Grid: Info Header block (Asymmetric styling) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Photo/Initials and Fast Metadata (4 Columns) */}
        <div className="md:col-span-4 space-y-6">
          <div className={`p-6 border rounded-2xl shadow-sm ${themeStyles.cardBg} transition-all flex flex-col items-center text-center`}>
            
            {/* Visual Portrait Card */}
            <div className={`h-28 w-28 rounded-2xl bg-gradient-to-br ${metadata.avatarPlaceholderColor} text-white flex items-center justify-center shadow-lg border-4 border-white dark:border-zinc-800 mb-4`}>
              <span className="font-serif font-black text-3xl tracking-widest">
                {getInitials(authorName)}
              </span>
            </div>

            <h2 className={`font-sans font-extrabold text-xl tracking-tight ${themeStyles.headerText}`}>
              {authorName}
            </h2>
            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mt-1">
              Featured Author
            </p>

            {/* Geographical Birth and Era Meta */}
            <div className="w-full pt-5 mt-5 border-t border-gray-100 dark:border-zinc-800/80 space-y-3.5 text-left">
              <div className="flex gap-3 text-xs text-gray-600 dark:text-zinc-300">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-gray-400">Birthplace / Base</p>
                  <p className="font-bold">{metadata.birthPlace}</p>
                </div>
              </div>

              <div className="flex gap-3 text-xs text-gray-600 dark:text-zinc-300">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-gray-400">Timeline / Era</p>
                  <p className="font-bold">{metadata.era}</p>
                </div>
              </div>

              {metadata.website && (
                <div className="flex gap-3 text-xs text-gray-600 dark:text-zinc-300">
                  <Globe className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-gray-400">Official Web</p>
                    <a 
                      href={metadata.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                    >
                      Visit Website <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Key themes tags */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-gray-400 dark:text-zinc-500">
              Key Focus Themes
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {metadata.keyThemes.map((theme) => (
                <span 
                  key={theme}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg border bg-slate-50 dark:bg-zinc-950/20 border-gray-100 dark:border-zinc-800 text-gray-600 dark:text-zinc-300"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Long Bio, Literary Achievements, and Books Shelf (8 Columns) */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Biography Block */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <h3 className="font-serif font-black text-lg text-gray-950 dark:text-white">
                Biographical Narrative
              </h3>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed text-justify">
              {metadata.bio}
            </p>
          </div>

          {/* Inspiring quote block */}
          {metadata.quote && (
            <div className={`p-6 border rounded-2xl shadow-sm ${themeStyles.cardBg} space-y-3 relative overflow-hidden`}>
              <Quote className="absolute top-4 right-4 h-16 w-16 text-gray-400/10 rotate-180 pointer-events-none" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                Signature Philosophical Quote
              </span>
              <p className={`font-serif italic text-sm md:text-base leading-relaxed font-bold ${themeStyles.headerText}`}>
                "{metadata.quote}"
              </p>
              <p className="text-[10px] text-gray-400">— {authorName}</p>
            </div>
          )}

          {/* Achievements Checklist */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <h3 className="font-serif font-black text-lg text-gray-950 dark:text-white">
                Notable Career Milestones
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metadata.achievements.map((item, idx) => (
                <div 
                  key={idx}
                  className="flex gap-2.5 items-start p-3 bg-slate-50/50 dark:bg-zinc-800/20 border border-slate-100/40 dark:border-zinc-800/40 rounded-xl"
                >
                  <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0 mt-0.5">
                    <Star className="h-3 w-3 fill-current" />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-zinc-300 font-medium leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Book Catalog list by this Author */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-serif font-black text-lg text-gray-950 dark:text-white">
                Works in Library Card Catalog
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Explore books authored by {authorName} loaded inside your Digital Companion.
              </p>
            </div>

            {books.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-gray-100 dark:border-zinc-800 rounded-2xl text-xs text-gray-400">
                No cataloged books found for {authorName} in this account.
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
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">{book.genre} • {book.publishedYear}</p>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <span className="bg-slate-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 text-[9px] font-bold px-2 py-0.5 rounded-md border border-slate-100 dark:border-zinc-700">
                            {book.category}
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
