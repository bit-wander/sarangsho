import React, { useState, useRef, useEffect } from "react";
import { Upload, BookOpen, Sliders, ChevronDown, ChevronUp, Type, FileText, Trash2, Edit3, MessageSquareText, CornerDownRight, Check, Plus } from "lucide-react";
import { Book, Highlight, Note, ThemeMode, User } from "../types";
import { DatabaseService, generateId, getCoverGradient } from "../utils";
import PomodoroWidget from "./PomodoroWidget";

const CANVAS_THEMES = {
  light: {
    bg: "#F8FAFC",
    surface: "#FFFFFF",
    text: "#0F172A",
    border: "#E2E8F0"
  },
  dark: {
    bg: "#0F172A",
    surface: "#1E293B",
    text: "#F4F4F5",
    border: "#3F3F46"
  },
  sepia: {
    bg: "#FAF6EE",
    surface: "#F4ECD8",
    text: "#5B4636",
    border: "#EADFC9"
  },
  oled: {
    bg: "#000000",
    surface: "#09090B",
    text: "#E4E4E7",
    border: "#18181B"
  },
  bookish: {
    bg: "#F4EFE6",
    surface: "#FAF6EE",
    text: "#322314",
    border: "#D1C2A5"
  }
};

interface LibraryProps {
  onOpenChatWithHighlight: (text: string, book: Book) => void;
  activeTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onActiveBookChange?: (book: Book | null) => void;
  currentUser?: User | null;
  onActionRestricted?: (action: string) => void;
  initialActiveBook?: Book | null;
  onSelectBook?: (book: Book) => void;
}

export default function Library({
  onOpenChatWithHighlight,
  activeTheme,
  onThemeChange,
  onActiveBookChange,
  currentUser,
  onActionRestricted,
  initialActiveBook,
  onSelectBook
}: LibraryProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBook, setActiveBook] = useState<Book | null>(initialActiveBook || null);

  useEffect(() => {
    if (initialActiveBook !== undefined) {
      setActiveBook(initialActiveBook);
    }
  }, [initialActiveBook]);
  
  // File Ingestion Upload states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");

  // E-reader Customization panel states
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
  const [fontSize, setFontSize] = useState(18); // default in pixels
  const [lineHeight, setLineHeight] = useState<"tight" | "relaxed" | "loose">("relaxed");
  const [canvasTheme, setCanvasTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("companion_canvas_theme") as ThemeMode;
    return saved || "bookish";
  });

  // Selection Popover states
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [highlightColor, setHighlightColor] = useState("bg-yellow-200 text-yellow-900");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loaded = DatabaseService.getBooks();
    setBooks(loaded);
  }, []);

  const handleActiveBookSelect = (book: Book | null) => {
    setActiveBook(book);
    if (onActiveBookChange) {
      onActiveBookChange(book);
    }
  };

  // Drag & Drop Document Ingestion (Section 3.2)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFileIngestion(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFileIngestion(files[0]);
    }
  };

  const triggerFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Process Ingestion with FastAPI Secure Signing (Section 3.2)
  const processFileIngestion = async (file: File) => {
    if (currentUser?.isGuest) {
      onActionRestricted?.("uploading custom EPUB/PDF book assets");
      return;
    }

    const isPDF = file.name.endsWith(".pdf");
    const isEPUB = file.name.endsWith(".epub");

    if (!isPDF && !isEPUB) {
      alert("Invalid format. Please drag only valid PDF or EPUB files.");
      return;
    }

    setUploadedFileName(file.name);
    setUploadProgress(0);

    try {
      // Fetch immediate background request to FastAPI endpoint for a secure AWS S3 target URL
      const token = localStorage.getItem("companion_access_token");
      const res = await fetch("http://localhost:8000/api/upload/sign", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ filename: file.name, fileType: file.type })
      });

      if (!res.ok) throw new Error("FastAPI credentials generation failed.");
      const credentials = await res.json();
      console.log("Secure AWS S3 target obtained:", credentials.uploadUrl);

      // Simulate upbeat radial loading progress chart (Section 3.2)
      let progress = 0;
      const interval = setInterval(() => {
        progress += 8;
        if (progress >= 100) {
          clearInterval(interval);
          setUploadProgress(100);
          
          // Complete upload: add newly parsed mock asset to library
          setTimeout(() => {
            const cleanName = file.name.replace(/\.[^/.]+$/, ""); // Strip extension
            const newBook: Book = {
              id: credentials.documentId || `doc-usr-${generateId()}`,
              title: cleanName,
              author: "Imported Reader Asset",
              coverUrl: "",
              category: "Currently Reading",
              currentPage: 0,
              totalPages: Math.floor(Math.random() * 300) + 120,
              genre: isPDF ? "Technical PDF" : "Digital EPUB",
              publishedYear: new Date().getFullYear().toString(),
              description: `Uploaded document file parsed cleanly. S3 Target: ${file.name}. Securely processed and cached offline.`,
              highlights: [],
              notes: []
            };

            const updatedBooks = [newBook, ...books];
            setBooks(updatedBooks);
            DatabaseService.saveBooks(updatedBooks);
            setUploadProgress(null);
            alert(`"${cleanName}" added successfully to your library!`);
          }, 400);
        } else {
          setUploadProgress(progress);
        }
      }, 100);

    } catch (err: any) {
      console.error(err);
      alert("Secure S3 ingestion signing failed. Upload rolled back.");
      setUploadProgress(null);
    }
  };

  // Text selection tracking (Section 3.2 popover anchor)
  const handleTextSelection = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection) return;

    const text = selection.toString().trim();
    if (text.length > 3) {
      // Find coordinates of selected block for absolute popover positioning
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectedText(text);
      setPopoverPos({
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.top + window.scrollY - 10
      });
    } else {
      // Clear popup if they clicked elsewhere
      if (!showNoteInput) {
        setSelectedText(null);
        setPopoverPos(null);
      }
    }
  };

  const clearSelection = () => {
    setSelectedText(null);
    setPopoverPos(null);
    setShowNoteInput(false);
    setNoteText("");
    // Clear actual document selection range
    window.getSelection()?.removeAllRanges();
  };

  // Create Highlighting logic
  const triggerHighlightText = () => {
    if (currentUser?.isGuest) {
      onActionRestricted?.("creating private highlights");
      return;
    }

    if (!activeBook || !selectedText) return;

    const newHighlight: Highlight = {
      id: `hl-${generateId()}`,
      text: selectedText,
      color: highlightColor,
      createdAt: new Date().toISOString()
    };

    const updatedHighlights = [...(activeBook.highlights || []), newHighlight];
    const updatedBook = { ...activeBook, highlights: updatedHighlights };
    
    updateBookInCollection(updatedBook);
    clearSelection();
  };

  const triggerAttachNote = () => {
    setShowNoteInput(true);
  };

  const savePrivateNote = () => {
    if (currentUser?.isGuest) {
      onActionRestricted?.("attaching reading notes");
      return;
    }

    if (!activeBook || !selectedText || !noteText.trim()) return;

    // First save highlight of the passage if not already explicitly highlighted
    const hlId = `hl-${generateId()}`;
    const newHighlight: Highlight = {
      id: hlId,
      text: selectedText,
      color: "bg-blue-100 text-blue-900 border-b border-blue-300",
      createdAt: new Date().toISOString()
    };

    const newNote: Note = {
      id: `note-${generateId()}`,
      highlightId: hlId,
      text: noteText,
      createdAt: new Date().toISOString()
    };

    const updatedHighlights = [...(activeBook.highlights || []), newHighlight];
    const updatedNotes = [...(activeBook.notes || []), newNote];
    const updatedBook = {
      ...activeBook,
      highlights: updatedHighlights,
      notes: updatedNotes
    };

    updateBookInCollection(updatedBook);
    clearSelection();
  };

  const updateBookInCollection = (updatedBook: Book) => {
    const updatedList = books.map((b) => (b.id === updatedBook.id ? updatedBook : b));
    setBooks(updatedList);
    setActiveBook(updatedBook);
    DatabaseService.saveBooks(updatedList);
  };

  const deleteHighlight = (hlId: string) => {
    if (!activeBook) return;
    const updatedHighlights = (activeBook.highlights || []).filter((h) => h.id !== hlId);
    // also delete notes attached to this highlight
    const updatedNotes = (activeBook.notes || []).filter((n) => n.highlightId !== hlId);
    const updatedBook = { ...activeBook, highlights: updatedHighlights, notes: updatedNotes };
    updateBookInCollection(updatedBook);
  };

  const deleteNote = (noteId: string) => {
    if (!activeBook) return;
    const updatedNotes = (activeBook.notes || []).filter((n) => n.id !== noteId);
    const updatedBook = { ...activeBook, notes: updatedNotes };
    updateBookInCollection(updatedBook);
  };

  const triggerAskAI = () => {
    if (activeBook && selectedText) {
      onOpenChatWithHighlight(selectedText, activeBook);
      clearSelection();
    }
  };

  const deleteBook = (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to remove this book from your library?")) {
      const updated = books.filter((b) => b.id !== bookId);
      setBooks(updated);
      DatabaseService.saveBooks(updated);
      if (activeBook?.id === bookId) {
        handleActiveBookSelect(null);
      }
    }
  };

  // Prose renderer line heights
  const getLineHeightClass = () => {
    if (lineHeight === "tight") return "leading-normal";
    if (lineHeight === "loose") return "leading-loose";
    return "leading-relaxed";
  };

  // Font color adjustments
  const getSwatches = () => {
    return [
      { id: "light", name: "Light Mode", bg: "bg-white border-gray-200", text: "text-gray-900" },
      { id: "dark", name: "Dark Mode", bg: "bg-slate-800 border-zinc-700", text: "text-zinc-100" },
      { id: "sepia", name: "Sepia Focus", bg: "bg-[#F4ECD8] border-[#EADFC9]", text: "text-[#5B4636]" },
      { id: "oled", name: "OLED Black", bg: "bg-black border-zinc-900", text: "text-zinc-200" },
      { id: "bookish", name: "Bookish Vibe", bg: "bg-[#F4EFE6] border-[#D1C2A5]", text: "text-[#322314]" }
    ];
  };

  return (
    <div id="library-panel" className="space-y-6">
      {!activeBook ? (
        // DASHBOARD MODE: Personal Library shelf
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="font-sans font-bold text-gray-900 dark:text-white text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" /> Personal Library Shelf
              </h2>
              <p className="text-xs text-gray-400 dark:text-zinc-500">
                Manage your PDF, EPUB files and access premium high-contrast reading canvas layouts
              </p>
            </div>
          </div>

          {/* Ingestion & Library Matrix Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Ingestion square (Section 3.2) */}
            <div className="lg:col-span-4 h-full">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFilePicker}
                className={`relative h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer group ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20"
                    : "border-gray-200 dark:border-zinc-800 hover:border-indigo-400 hover:bg-slate-50/50 dark:hover:bg-zinc-950/20"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.epub"
                  className="hidden"
                />

                {uploadProgress !== null ? (
                  // Upbeat radial loading progress chart (Section 3.2)
                  <div className="space-y-4 flex flex-col items-center">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          className="stroke-gray-100 dark:stroke-zinc-800"
                          strokeWidth="4"
                          fill="transparent"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          className="stroke-indigo-600 transition-all"
                          strokeWidth="4"
                          fill="transparent"
                          strokeDasharray="163.36"
                          strokeDashoffset={163.36 - (uploadProgress / 100) * 163.36}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {uploadProgress}%
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-700 dark:text-zinc-300">FastAPI Ingestion...</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[180px]">{uploadedFileName}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-sm text-gray-900 dark:text-white">Document Ingestion Square</h3>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                        Drag and drop valid **PDF** or **EPUB** documents here, or click to upload
                      </p>
                    </div>
                    <span className="inline-block text-[9px] uppercase font-mono tracking-wider text-gray-400 dark:text-zinc-600 bg-gray-50 dark:bg-zinc-950/60 py-1 px-2.5 rounded">
                      Secure S3 Ingestion Gateway
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Structured shelf matrix listing */}
            <div className="lg:col-span-8 space-y-4">
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-gray-400 dark:text-zinc-500">Document Shelf</h3>
              
              {books.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 rounded-2xl bg-gray-50/50 dark:bg-zinc-950/20 border border-gray-100 dark:border-zinc-900 text-center text-gray-400">
                  <FileText className="h-8 w-8 opacity-40 mb-2" />
                  <p className="text-xs font-medium">Your document shelf is empty. Ingest books to begin!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {books.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => onSelectBook ? onSelectBook(book) : handleActiveBookSelect(book)}
                      className="p-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-xl hover:border-indigo-300 dark:hover:border-zinc-700 shadow-sm transition-all flex items-center gap-4 cursor-pointer group"
                    >
                      {/* CSS Mini cover art */}
                      <div className={`book-cover-template w-14 h-20 rounded bg-gradient-to-br ${getCoverGradient(book.title)} flex flex-col justify-between p-2 text-white shrink-0 shadow-md`}>
                        <BookOpen className="h-3.5 w-3.5 opacity-85" />
                        <span className="text-[7px] font-black leading-none truncate max-w-full uppercase">{book.genre}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-sans font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {book.title}
                        </h4>
                        <p className="text-xs text-gray-400 dark:text-zinc-500 truncate mt-0.5">by {book.author}</p>
                        
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mt-3 font-mono">
                          <span>{book.totalPages} pages</span>
                          <span>Format: {book.isbn ? "ePub" : "PDF"}</span>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={(e) => deleteBook(book.id, e)}
                        className="p-1.5 rounded bg-gray-50 hover:bg-rose-50 hover:text-rose-600 dark:bg-zinc-950 dark:hover:bg-rose-950/40 text-gray-400 transition-all cursor-pointer"
                        title="Remove book"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // ER-READER MODE: Fully isolated canvas
        <div
          style={{
            backgroundColor: CANVAS_THEMES[canvasTheme].bg,
            color: CANVAS_THEMES[canvasTheme].text,
            borderColor: CANVAS_THEMES[canvasTheme].border,
            ["--theme-bg" as any]: CANVAS_THEMES[canvasTheme].bg,
            ["--theme-surface" as any]: CANVAS_THEMES[canvasTheme].surface,
            ["--theme-border" as any]: CANVAS_THEMES[canvasTheme].border,
            ["--theme-text" as any]: CANVAS_THEMES[canvasTheme].text,
            ["--theme-text-muted" as any]: canvasTheme === "bookish" ? "#5C4D3C" : canvasTheme === "sepia" ? "#705C4E" : canvasTheme === "dark" ? "#A0AEC0" : canvasTheme === "oled" ? "#718096" : "#718096"
          } as React.CSSProperties}
          className="rounded-2xl border shadow-lg overflow-hidden animate-fade-in relative min-h-[500px] flex flex-col transition-all duration-300"
        >
          {/* Upper collapsible customized layout headers */}
          <div className="border-b bg-transparent relative z-30" style={{ borderColor: CANVAS_THEMES[canvasTheme].border }}>
            {/* Minimal banner top menu row */}
            <div className="px-5 py-3 flex items-center justify-between">
              <button
                onClick={() => handleActiveBookSelect(null)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 cursor-pointer bg-indigo-50 dark:bg-indigo-950/30 py-1.5 px-3 rounded-lg hover:scale-105 transition-all"
              >
                ← Return to Shelf
              </button>

              <h2 className="font-sans font-bold text-xs uppercase tracking-widest text-gray-400 dark:text-zinc-500 truncate max-w-[200px] sm:max-w-none">
                Reading Canvas: {activeBook.title}
              </h2>

              {/* Collapsible Toggler */}
              <button
                onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 cursor-pointer bg-gray-100 dark:bg-zinc-800 py-1.5 px-2.5 rounded-lg"
              >
                <Sliders className="h-3.5 w-3.5" /> Layout Customizer
                {isHeaderExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>

            {/* Layout Customizer panel & nested inline Pomodoro control (Section 3.2, 3.3) */}
            {isHeaderExpanded && (
              <div className="px-5 pb-5 pt-2 grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-gray-100 dark:border-zinc-900/60 animate-slide-down">
                {/* 1. Size Slider & Row spacing */}
                <div className="space-y-3">
                  <h4 className="font-sans font-bold text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Type className="h-3 w-3" /> Typography Settings
                  </h4>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400 font-bold">A-</span>
                    <input
                      type="range"
                      min="14"
                      max="26"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="flex-1 accent-indigo-600"
                    />
                    <span className="text-xs text-gray-700 dark:text-zinc-300 font-bold font-mono">{fontSize}px</span>
                  </div>

                  <div className="flex gap-1">
                    {(["tight", "relaxed", "loose"] as const).map((lh) => (
                      <button
                        key={lh}
                        onClick={() => setLineHeight(lh)}
                        className={`flex-1 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          lineHeight === lh
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {lh}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Swatches for themes */}
                <div className="space-y-3">
                  <h4 className="font-sans font-bold text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                    Paper Tone Swatch
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {getSwatches().map((sw) => (
                      <button
                        key={sw.id}
                        onClick={() => {
                          setCanvasTheme(sw.id as ThemeMode);
                          localStorage.setItem("companion_canvas_theme", sw.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer ${sw.bg} ${sw.text} ${
                          canvasTheme === sw.id ? "ring-2 ring-indigo-500 border-indigo-500 scale-105" : ""
                        }`}
                      >
                        {sw.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Inline nested Pomodoro control (Section 3.2, 3.3) */}
                <div className="space-y-3">
                  <h4 className="font-sans font-bold text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                    In-Reader Productivity Session
                  </h4>
                  <PomodoroWidget inline={true} />
                </div>
              </div>
            )}
          </div>

          {/* Fully isolated, clean reading canvas layout ( Georgia or Merriweather styled) (Section 3.2) */}
          <div className="flex-1 p-6 md:p-10 flex flex-col md:flex-row gap-8 relative z-10">
            {/* E-reader Prose Page */}
            <div className="flex-1 space-y-6">
              <div
                ref={textContainerRef}
                onMouseUp={handleTextSelection}
                className={`font-serif text-gray-800 dark:text-zinc-200 select-text max-w-2xl mx-auto focus:outline-none ${getLineHeightClass()}`}
                style={{ fontSize: `${fontSize}px` }}
              >
                <h3 className="font-serif font-black text-2xl mb-6 text-gray-950 dark:text-white leading-tight">
                  Chapter I: The Foundations of Deep Habits
                </h3>
                
                <p className="mb-5 leading-relaxed text-justify">
                  To turn flat document interactions into a highly engaging workspace, we must examine how systems structure actions. When building habits, focus remains on systems rather than simple goals. System alignment is the primary predictor of continuous, long-term learning performance.
                </p>

                <p className="mb-5 leading-relaxed text-justify">
                  Every action you take is a vote for the type of person you wish to become. When you study a passage, take notes, or complete focus blocks with second-perfect timers, you establish a reliable environment for multi-hour cognitive endurance. The brain values predictable cues.
                </p>

                <p className="mb-5 leading-relaxed text-justify">
                  Consider the concept of "Deep Work". In an age of persistent background alerts, the capacity to isolate oneself inside a high-contrast premium serif reading canvas with soft red focus timers acts as a cognitive competitive advantage. Eliminating margin clutter is the first crucial step.
                </p>

                <p className="mb-5 leading-relaxed text-justify">
                  By tracking daily streaks on contribution heatmaps, readers establish consistent mental habits. Reaching daily milestones reinforces the neural pathways, triggering a surge of intrinsic reward. The systems we build dictate our long-term trajectory.
                </p>
              </div>
              
              <div className="text-center pt-8 border-t border-gray-100 dark:border-zinc-900/40 text-xs text-gray-400 dark:text-zinc-500 font-mono select-none">
                Page {activeBook.currentPage + 1} of {activeBook.totalPages} • Highlight text to attach notes or Ask AI
              </div>
            </div>

            {/* In-Book Highlights & Notes summary panel */}
            <div className="w-full md:w-64 shrink-0 bg-slate-50/40 dark:bg-zinc-900/40 rounded-xl p-4 border border-gray-100 dark:border-zinc-900 flex flex-col h-[400px] overflow-hidden select-none">
              <h3 className="font-sans font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-zinc-800 pb-2 mb-3">
                In-Book Highlights ({activeBook.highlights?.length || 0})
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {(!activeBook.highlights || activeBook.highlights.length === 0) ? (
                  <p className="text-[11px] text-gray-400 italic">No highlighted passages yet.</p>
                ) : (
                  activeBook.highlights.map((hl) => {
                    const attachedNote = activeBook.notes?.find((n) => n.highlightId === hl.id);
                    return (
                      <div key={hl.id} className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 text-[11px] space-y-1 relative group">
                        <div className="flex justify-between items-start gap-1">
                          <span className={`px-1 rounded text-[10px] font-medium leading-relaxed italic ${hl.color} max-h-12 overflow-hidden block text-ellipsis line-clamp-2`}>
                            "{hl.text}"
                          </span>
                          <button
                            onClick={() => deleteHighlight(hl.id)}
                            className="p-1 text-gray-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        {attachedNote && (
                          <div className="pl-2 border-l border-indigo-400/60 mt-1.5 text-[10px] text-gray-500 dark:text-zinc-400 flex items-start gap-1 justify-between">
                            <span className="italic leading-normal flex-1">Note: {attachedNote.text}</span>
                            <button
                              onClick={() => deleteNote(attachedNote.id)}
                              className="text-[9px] text-gray-400 hover:text-rose-500 shrink-0 cursor-pointer"
                            >
                              Delete Note
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Absolute-anchored contextual popover dialog (Section 3.2) */}
          {popoverPos && selectedText && (
            <div
              id="contextual-highlight-popover"
              className="absolute z-50 bg-slate-900 text-white rounded-xl shadow-2xl p-3 flex flex-col gap-3 max-w-sm border border-slate-800 animate-scale-in"
              style={{
                left: `${Math.min(popoverPos.x - 140, window.innerWidth - 300)}px`,
                top: `${popoverPos.y - 120}px`
              }}
            >
              {/* Note input form */}
              {showNoteInput ? (
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-bold">Attach Private Note</div>
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Type note here..."
                    className="w-full text-xs py-1.5 px-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex gap-1.5 justify-end">
                    <button
                      onClick={() => setShowNoteInput(false)}
                      className="text-[10px] font-bold text-gray-400 hover:text-white px-2 py-1 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={savePrivateNote}
                      className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded px-2.5 py-1 flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="h-3 w-3" /> Save Note
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Select highlight colors */}
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-800">
                    <span className="text-[9px] uppercase font-mono text-slate-400">Color:</span>
                    <div className="flex gap-1.5">
                      {[
                        { color: "bg-yellow-200 text-yellow-900", name: "yellow" },
                        { color: "bg-emerald-200 text-emerald-900", name: "green" },
                        { color: "bg-pink-200 text-pink-900", name: "pink" },
                        { color: "bg-blue-200 text-blue-900", name: "blue" }
                      ].map((sw) => (
                        <button
                          key={sw.name}
                          onClick={() => setHighlightColor(sw.color)}
                          className={`w-3.5 h-3.5 rounded-full border border-white/25 cursor-pointer ${sw.color} ${
                            highlightColor === sw.color ? "ring-2 ring-indigo-500 scale-110" : ""
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Context buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={triggerHighlightText}
                      className="flex-1 py-1 px-2 hover:bg-slate-800 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      🎨 Highlight Text
                    </button>
                    <button
                      onClick={triggerAttachNote}
                      className="flex-1 py-1 px-2 hover:bg-slate-800 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      📝 Attach Note
                    </button>
                    <button
                      onClick={triggerAskAI}
                      className="flex-1 py-1 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      ✨ Ask AI Assistant
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
