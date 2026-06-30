import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  BookOpen, 
  Building, 
  PenTool, 
  Search, 
  Sparkles, 
  Check, 
  X, 
  AlertCircle, 
  Info, 
  Globe, 
  MapPin, 
  Calendar, 
  Award, 
  Lock, 
  UserCheck, 
  Hash, 
  ExternalLink 
} from "lucide-react";
import { Book, Author, Publisher, User, ThemeMode } from "../types";
import { DatabaseService, AuthService, generateId, getCoverGradient } from "../utils";

interface AdminPanelProps {
  currentUser: User;
  activeTheme?: ThemeMode;
  onSelectBook?: (book: Book) => void;
  onSelectAuthor?: (authorName: string) => void;
  onSelectPublisher?: (publisherName: string) => void;
  onBooksUpdated?: () => void;
}

type AdminTab = "books" | "authors" | "publishers" | "users";

export default function AdminPanel({ 
  currentUser, 
  activeTheme = "bookish", 
  onSelectBook, 
  onSelectAuthor, 
  onSelectPublisher,
  onBooksUpdated
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("books");
  
  // Lists
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [users, setUsers] = useState<any[]>([]); // holds password too for admin view

  // Searches
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // name for author/publisher, id for book/user
  
  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form Fields
  // Book Form Fields
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookPublisher, setBookPublisher] = useState("");
  const [bookCategory, setBookCategory] = useState<Book["category"]>("Currently Reading");
  const [bookCurrentPage, setBookCurrentPage] = useState(0);
  const [bookTotalPages, setBookTotalPages] = useState(100);
  const [bookDescription, setBookDescription] = useState("");
  const [bookGenre, setBookGenre] = useState("");
  const [bookPublishedYear, setBookPublishedYear] = useState("");
  const [bookIsbn, setBookIsbn] = useState("");
  const [bookIsOnlineAvailable, setBookIsOnlineAvailable] = useState(false);
  
  // Author Form Fields
  const [authorName, setAuthorName] = useState("");
  const [authorBio, setAuthorBio] = useState("");
  const [authorBirthPlace, setAuthorBirthPlace] = useState("");
  const [authorEra, setAuthorEra] = useState("");
  const [authorKeyThemes, setAuthorKeyThemes] = useState(""); // comma-separated
  const [authorAchievements, setAuthorAchievements] = useState(""); // newline-separated
  const [authorQuote, setAuthorQuote] = useState("");
  const [authorWebsite, setAuthorWebsite] = useState("");
  const [authorColor, setAuthorColor] = useState("from-indigo-500 to-purple-600");

  // Publisher Form Fields
  const [publisherName, setPublisherName] = useState("");
  const [publisherAbout, setPublisherAbout] = useState("");
  const [publisherAddress, setPublisherAddress] = useState("");
  const [publisherFoundedYear, setPublisherFoundedYear] = useState("");
  const [publisherGlobalCatalog, setPublisherGlobalCatalog] = useState("");
  const [publisherGenres, setPublisherGenres] = useState(""); // comma-separated
  const [publisherHighlights, setPublisherHighlights] = useState(""); // newline-separated
  const [publisherMotto, setPublisherMotto] = useState("");
  const [publisherWebsite, setPublisherWebsite] = useState("");
  const [publisherColor, setPublisherColor] = useState("from-indigo-500 to-purple-600");

  // User Form Fields
  const [userUsername, setUserUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState("");

  // Load database entities
  const loadEntities = async () => {
    try {
      const [booksData, authorsData, usersData] = await Promise.all([
        DatabaseService.adminGetBooks(),
        DatabaseService.adminGetAuthors(),
        AuthService.adminGetUsers()
      ]);
      setBooks(booksData);
      setAuthors(authorsData);
      setUsers(usersData);
      setPublishers(DatabaseService.getPublishers());
    } catch (err) {
      console.error("Failed to load admin entities:", err);
    }
  };

  useEffect(() => {
    loadEntities();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Helper lists of color options
  const GRADIENT_OPTIONS = [
    { label: "Indigo & Purple", value: "from-indigo-500 to-purple-600" },
    { label: "Amber & Orange", value: "from-amber-500 to-orange-600" },
    { label: "Blue & Indigo", value: "from-blue-500 to-indigo-700" },
    { label: "Emerald & Teal", value: "from-emerald-500 to-teal-700" },
    { label: "Rose & Red", value: "from-rose-500 to-red-700" },
    { label: "Amber & Yellow", value: "from-amber-600 to-yellow-800" },
    { label: "Zinc & Slate", value: "from-zinc-500 to-slate-700" },
    { label: "Slate & Zinc", value: "from-slate-600 to-zinc-800" }
  ];

  // Open Form for Adding
  const handleAddNew = () => {
    setEditingId(null);
    setIsFormOpen(true);
    
    // Reset all fields
    setBookTitle("");
    setBookAuthor("");
    setBookPublisher("");
    setBookCategory("Currently Reading");
    setBookCurrentPage(0);
    setBookTotalPages(100);
    setBookDescription("");
    setBookGenre("");
    setBookPublishedYear("");
    setBookIsbn("");
    setBookIsOnlineAvailable(false);

    setAuthorName("");
    setAuthorBio("");
    setAuthorBirthPlace("");
    setAuthorEra("");
    setAuthorKeyThemes("");
    setAuthorAchievements("");
    setAuthorQuote("");
    setAuthorWebsite("");
    setAuthorColor("from-indigo-500 to-purple-600");

    setPublisherName("");
    setPublisherAbout("");
    setPublisherAddress("");
    setPublisherFoundedYear("");
    setPublisherGlobalCatalog("");
    setPublisherGenres("");
    setPublisherHighlights("");
    setPublisherMotto("");
    setPublisherWebsite("");
    setPublisherColor("from-indigo-500 to-purple-600");

    setUserUsername("");
    setUserEmail("");
    setUserPassword("");
    setUserIsAdmin(false);
    setUserAvatarUrl("");
  };

  // Open Form for Editing
  const handleEdit = (entity: any) => {
    setIsFormOpen(true);

    if (activeTab === "books") {
      const b = entity as Book;
      setEditingId(b.id);
      setBookTitle(b.title);
      setBookAuthor(b.author);
      setBookPublisher(b.publisher || "");
      setBookCategory(b.category);
      setBookCurrentPage(b.currentPage);
      setBookTotalPages(b.totalPages);
      setBookDescription(b.description || "");
      setBookGenre(b.genre || "");
      setBookPublishedYear(b.publishedYear || "");
      setBookIsbn(b.isbn || "");
      setBookIsOnlineAvailable(!!b.isOnlineAvailable);
    } 
    else if (activeTab === "authors") {
      const a = entity as Author;
      setEditingId(a.name);
      setAuthorName(a.name);
      setAuthorBio(a.bio);
      setAuthorBirthPlace(a.birthPlace);
      setAuthorEra(a.era);
      setAuthorKeyThemes(a.keyThemes ? a.keyThemes.join(", ") : "");
      setAuthorAchievements(a.achievements ? a.achievements.join("\n") : "");
      setAuthorQuote(a.quote);
      setAuthorWebsite(a.website || "");
      setAuthorColor(a.avatarPlaceholderColor || "from-indigo-500 to-purple-600");
    } 
    else if (activeTab === "publishers") {
      const p = entity as Publisher;
      setEditingId(p.name);
      setPublisherName(p.name);
      setPublisherAbout(p.about);
      setPublisherAddress(p.address);
      setPublisherFoundedYear(p.foundedYear);
      setPublisherGlobalCatalog(p.globalCatalogCount);
      setPublisherGenres(p.focalGenres ? p.focalGenres.join(", ") : "");
      setPublisherHighlights(p.keyHighlights ? p.keyHighlights.join("\n") : "");
      setPublisherMotto(p.motto || "");
      setPublisherWebsite(p.website || "");
      setPublisherColor(p.brandColor || "from-indigo-500 to-purple-600");
    } 
    else if (activeTab === "users") {
      setEditingId(entity.id);
      setUserUsername(entity.username);
      setUserEmail(entity.email);
      setUserPassword(entity.password || "••••••••");
      setUserIsAdmin(!!entity.isAdmin);
      setUserAvatarUrl(entity.avatarUrl || "");
    }
  };

  // Delete Entity
  const handleDelete = async (idOrName: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) {
      return;
    }

    try {
      if (activeTab === "books") {
        await DatabaseService.adminDeleteBook(idOrName);
        showToast("Book deleted successfully!");
        onBooksUpdated?.();
      } 
      else if (activeTab === "authors") {
        await DatabaseService.adminDeleteAuthor(idOrName);
        showToast("Author metadata deleted successfully!");
      } 
      else if (activeTab === "publishers") {
        const updated = publishers.filter(p => p.name !== idOrName);
        DatabaseService.savePublishers(updated);
        showToast("Publisher metadata deleted successfully!");
      } 
      else if (activeTab === "users") {
        if (idOrName === currentUser.id) {
          throw new Error("You cannot delete your own administrative account!");
        }
        await AuthService.adminDeleteUser(idOrName);
        showToast("User card revoked successfully!");
      }
      await loadEntities();
    } catch (err: any) {
      showToast(err.message || "Deletion failed", "error");
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (activeTab === "books") {
        if (!bookTitle.trim() || !bookAuthor.trim()) {
          throw new Error("Title and Author are required fields!");
        }

        const bookData: Book = {
          id: editingId || "",
          title: bookTitle.trim(),
          author: bookAuthor.trim(),
          publisher: bookPublisher.trim() || undefined,
          category: bookCategory,
          currentPage: bookCategory === "Already Finished" ? Number(bookTotalPages) : Number(bookCurrentPage),
          totalPages: Number(bookTotalPages),
          description: bookDescription.trim(),
          genre: bookGenre.trim() || "Literature",
          publishedYear: bookPublishedYear.trim() || new Date().getFullYear().toString(),
          isbn: bookIsbn.trim() || undefined,
          isOnlineAvailable: bookIsOnlineAvailable,
          coverUrl: ""
        };
        await DatabaseService.adminSaveBook(bookData, !!editingId);
        showToast(editingId ? "Book updated successfully!" : "New book cataloged successfully!");
        onBooksUpdated?.();
      } 
      else if (activeTab === "authors") {
        if (!authorName.trim()) {
          throw new Error("Author Name is required!");
        }

        const authorData: Author = {
          name: authorName.trim(),
          bio: authorBio.trim() || "Biographical notes pending compilation.",
          birthPlace: authorBirthPlace.trim() || "Unknown",
          era: authorEra.trim() || "Contemporary",
          keyThemes: authorKeyThemes.split(",").map(t => t.trim()).filter(Boolean),
          achievements: authorAchievements.split("\n").map(a => a.trim()).filter(Boolean),
          quote: authorQuote.trim() || "The written word endures.",
          website: authorWebsite.trim() || undefined,
          avatarPlaceholderColor: authorColor
        };
        await DatabaseService.adminSaveAuthor(authorData, !!editingId, editingId || undefined);
        showToast(editingId ? "Author records revised!" : "New author registered!");
      } 
      else if (activeTab === "publishers") {
        if (!publisherName.trim()) {
          throw new Error("Publisher Name is required!");
        }

        const allPublishers = [...publishers];
        const newPublisher: Publisher = {
          name: publisherName.trim(),
          about: publisherAbout.trim() || "No public profile compiled yet.",
          address: publisherAddress.trim() || "Global HQ",
          foundedYear: publisherFoundedYear.trim() || "Unknown",
          globalCatalogCount: publisherGlobalCatalog.trim() || "In-process",
          focalGenres: publisherGenres.split(",").map(g => g.trim()).filter(Boolean),
          keyHighlights: publisherHighlights.split("\n").map(h => h.trim()).filter(Boolean),
          motto: publisherMotto.trim() || undefined,
          website: publisherWebsite.trim() || undefined,
          brandColor: publisherColor
        };

        if (editingId) {
          const idx = allPublishers.findIndex(p => p.name.toLowerCase().trim() === editingId.toLowerCase().trim());
          if (idx !== -1) {
            allPublishers[idx] = newPublisher;
          }
          showToast("Publisher credentials updated!");
        } else {
          if (allPublishers.some(p => p.name.toLowerCase().trim() === publisherName.toLowerCase().trim())) {
            throw new Error("A publisher with this name already exists in the ledger.");
          }
          allPublishers.push(newPublisher);
          showToast("New publisher inducted!");
        }
        DatabaseService.savePublishers(allPublishers);
      } 
      else if (activeTab === "users") {
        if (!userUsername.trim() || !userEmail.trim()) {
          throw new Error("Username and Email are required!");
        }

        if (editingId) {
          const userData = {
            id: editingId,
            username: userUsername.trim(),
            email: userEmail.trim(),
            isAdmin: userIsAdmin,
            avatarUrl: userAvatarUrl.trim() || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
          };
          await AuthService.adminSaveUser(userData, true);
          showToast("User card details revised!");
        } else {
          const res = await fetch("http://localhost:8000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: userUsername.trim(),
              email: userEmail.trim(),
              password: userPassword || "password123",
              avatar_url: userAvatarUrl.trim() || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
              full_name: userUsername.trim(),
              role: userIsAdmin ? "ADMIN" : "USER"
            })
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || "Failed to register user card.");
          }
          showToast("New user card printed!");
        }
      }

      setIsFormOpen(false);
      await loadEntities();
    } catch (err: any) {
      showToast(err.message || "Operation failed", "error");
    }
  };

  // Filters based on search
  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAuthors = authors.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.era.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPublishers = publishers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-xs font-semibold animate-fade-in ${
            toast.type === "success" 
              ? "bg-[#F3FAF7] text-emerald-800 border-emerald-200" 
              : "bg-[#FDF2F2] text-red-800 border-red-200"
          }`}
        >
          {toast.type === "success" ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-[#FAF6EE] border-2 border-[#D1C2A5] shadow-[4px_4px_0px_0px_rgba(50,35,20,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#E6DCB8] text-[#322314] rounded-xl border border-[#D1C2A5]">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-[#322314]">Administrative Chamber</h1>
            <p className="text-xs text-[#5C4D3C] mt-0.5">Logged in as <span className="font-mono font-bold text-indigo-600">{currentUser.username} (Librarian)</span></p>
          </div>
        </div>

        <button
          onClick={handleAddNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#322314] hover:bg-[#4E3924] text-[#FAF6EE] font-bold rounded-xl text-xs shadow transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New {activeTab.slice(0, -1).toUpperCase()}</span>
        </button>
      </div>

      {/* Library Snapshot Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Book Titles", val: books.length, icon: BookOpen, col: "text-amber-600 bg-amber-50" },
          { label: "Managed Authors", val: authors.length, icon: PenTool, col: "text-emerald-600 bg-emerald-50" },
          { label: "Partner Publishers", val: publishers.length, icon: Building, col: "text-indigo-600 bg-indigo-50" },
          { label: "Registered Cards", val: users.length, icon: Users, col: "text-rose-600 bg-rose-50" }
        ].map((st, i) => (
          <div key={i} className="bg-[#FAF6EE] p-4 rounded-xl border border-[#D1C2A5] shadow-sm flex items-center gap-4">
            <div className={`p-2.5 rounded-lg border border-[#D1C2A5]/40 ${st.col}`}>
              <st.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-[#5C4D3C]/70 uppercase tracking-wider font-bold">{st.label}</p>
              <p className="text-xl font-serif font-bold text-[#322314]">{st.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Entity Tabs & Search Bar Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Navigation Tabs */}
        <div className="flex bg-[#E6DCB8]/50 p-1 rounded-xl border border-[#D1C2A5]/60 overflow-x-auto whitespace-nowrap self-start">
          {[
            { id: "books", label: "Catalog (Books)", icon: BookOpen },
            { id: "authors", label: "Authors Ledger", icon: PenTool },
            { id: "publishers", label: "Publishers Press", icon: Building },
            { id: "users", label: "Reader Cards", icon: Users }
          ].map(tb => (
            <button
              key={tb.id}
              onClick={() => {
                setActiveTab(tb.id as AdminTab);
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tb.id
                  ? "bg-[#FAF6EE] text-[#322314] shadow-sm border border-[#D1C2A5]/50"
                  : "text-[#5C4D3C] hover:text-[#322314]"
              }`}
            >
              <tb.icon className="h-3.5 w-3.5" />
              <span>{tb.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Search */}
        <div className="relative flex items-center bg-[#FAF6EE] rounded-xl border border-[#D1C2A5] focus-within:border-[#322314] transition-all p-2 w-full md:max-w-xs shadow-sm">
          <Search className="h-4 w-4 text-[#5C4D3C] mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full text-xs bg-transparent outline-none text-[#322314]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="p-0.5 text-[#5C4D3C] hover:text-[#322314]">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Entity Table/Grid Section */}
      <div className="bg-[#FAF6EE] rounded-2xl border-2 border-[#D1C2A5] shadow-[4px_4px_0px_0px_rgba(50,35,20,0.06)] overflow-hidden">
        
        {/* Books Ledger Table */}
        {activeTab === "books" && (
          <div className="overflow-x-auto">
            {filteredBooks.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#5C4D3C] italic font-serif">
                No book records correspond to the query. Click "Add New" to expand catalog.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#E6DCB8]/50 border-b border-[#D1C2A5] text-[#322314] font-serif uppercase tracking-wider font-bold">
                    <th className="p-4">Title & Details</th>
                    <th className="p-4">Author</th>
                    <th className="p-4">Publisher</th>
                    <th className="p-4">Genre</th>
                    <th className="p-4">Reading Progress</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1C2A5]/40 text-[#322314]">
                  {filteredBooks.map(book => (
                    <tr key={book.id} className="hover:bg-[#FAF6EE]/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-10 rounded shadow-sm bg-gradient-to-br ${getCoverGradient(book.title)} flex items-center justify-center text-[10px] text-white font-bold`}>
                            {book.title.slice(0, 1)}
                          </div>
                          <div>
                            <button
                              onClick={() => onSelectBook?.(book)}
                              className="font-serif font-bold text-indigo-600 hover:underline hover:text-indigo-800 text-left"
                            >
                              {book.title}
                            </button>
                            <p className="text-[10px] text-[#5C4D3C] font-mono mt-0.5">ISBN: {book.isbn || "Pending"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => onSelectAuthor?.(book.author)}
                          className="font-semibold text-[#322314] hover:underline"
                        >
                          {book.author}
                        </button>
                      </td>
                      <td className="p-4">
                        {book.publisher ? (
                          <button
                            onClick={() => onSelectPublisher?.(book.publisher!)}
                            className="text-[#5C4D3C] hover:underline"
                          >
                            {book.publisher}
                          </button>
                        ) : (
                          <span className="text-[#5C4D3C]/50 italic">None</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-[#E6DCB8]/40 rounded-full font-mono text-[10px] text-[#322314]">
                          {book.genre}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 w-28">
                          <div className="flex justify-between font-mono text-[10px]">
                            <span>{book.currentPage}/{book.totalPages} pp</span>
                            <span>{Math.round((book.currentPage / book.totalPages) * 100)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#E6DCB8] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-600 rounded-full" 
                              style={{ width: `${Math.min(100, (book.currentPage / book.totalPages) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleEdit(book)}
                            className="p-1.5 bg-[#FAF6EE] border border-[#D1C2A5] rounded-lg hover:bg-[#E6DCB8]/40 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="Edit Book"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(book.id)}
                            className="p-1.5 bg-[#FAF6EE] border border-red-200 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Book"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Authors Ledger Table */}
        {activeTab === "authors" && (
          <div className="overflow-x-auto">
            {filteredAuthors.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#5C4D3C] italic font-serif">
                No author dossiers matched. Click "Add New" to register a literary record.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#E6DCB8]/50 border-b border-[#D1C2A5] text-[#322314] font-serif uppercase tracking-wider font-bold">
                    <th className="p-4">Author Portrait & Name</th>
                    <th className="p-4">Era</th>
                    <th className="p-4">Birth Place</th>
                    <th className="p-4">Notable Quote</th>
                    <th className="p-4">Key Themes</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1C2A5]/40 text-[#322314]">
                  {filteredAuthors.map(author => (
                    <tr key={author.name} className="hover:bg-[#FAF6EE]/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${author.avatarPlaceholderColor || "from-indigo-500 to-purple-600"} flex items-center justify-center font-bold text-white uppercase text-xs shadow-sm shrink-0`}>
                            {author.name.slice(0, 2)}
                          </div>
                          <div>
                            <button
                              onClick={() => onSelectAuthor?.(author.name)}
                              className="font-serif font-bold text-indigo-600 hover:underline hover:text-indigo-800 text-left"
                            >
                              {author.name}
                            </button>
                            {author.website && (
                              <a 
                                href={author.website} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[9px] text-[#5C4D3C] hover:text-[#322314] flex items-center gap-0.5 mt-0.5 underline"
                              >
                                <span>Website</span>
                                <ExternalLink className="h-2 w-2" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold">{author.era}</td>
                      <td className="p-4 text-[#5C4D3C]">{author.birthPlace}</td>
                      <td className="p-4 italic text-[#5C4D3C]/90 max-w-xs truncate" title={author.quote}>
                        "{author.quote}"
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {author.keyThemes?.slice(0, 3).map((theme, i) => (
                            <span key={i} className="text-[9px] px-1.5 py-0.5 bg-[#FAF6EE] border border-[#D1C2A5] rounded font-mono">
                              {theme}
                            </span>
                          ))}
                          {author.keyThemes?.length > 3 && (
                            <span className="text-[9px] text-gray-400 font-mono">+{author.keyThemes.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleEdit(author)}
                            className="p-1.5 bg-[#FAF6EE] border border-[#D1C2A5] rounded-lg hover:bg-[#E6DCB8]/40 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="Edit Author"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(author.name)}
                            className="p-1.5 bg-[#FAF6EE] border border-red-200 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Author"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Publishers Press Table */}
        {activeTab === "publishers" && (
          <div className="overflow-x-auto">
            {filteredPublishers.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#5C4D3C] italic font-serif">
                No publisher indexes correspond. Click "Add New" to insert a press catalog.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#E6DCB8]/50 border-b border-[#D1C2A5] text-[#322314] font-serif uppercase tracking-wider font-bold">
                    <th className="p-4">Publishing House</th>
                    <th className="p-4">Founded</th>
                    <th className="p-4">Address</th>
                    <th className="p-4">Global Catalog Size</th>
                    <th className="p-4">Focal Genres</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1C2A5]/40 text-[#322314]">
                  {filteredPublishers.map(pub => (
                    <tr key={pub.name} className="hover:bg-[#FAF6EE]/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded bg-gradient-to-br ${pub.brandColor || "from-indigo-500 to-purple-600"} flex items-center justify-center font-bold text-white uppercase text-xs shadow-sm shrink-0`}>
                            {pub.name.slice(0, 2)}
                          </div>
                          <div>
                            <button
                              onClick={() => onSelectPublisher?.(pub.name)}
                              className="font-serif font-bold text-indigo-600 hover:underline hover:text-indigo-800 text-left"
                            >
                              {pub.name}
                            </button>
                            {pub.website && (
                              <a 
                                href={pub.website} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[9px] text-[#5C4D3C] hover:text-[#322314] flex items-center gap-0.5 mt-0.5 underline"
                              >
                                <span>Website</span>
                                <ExternalLink className="h-2 w-2" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold">{pub.foundedYear}</td>
                      <td className="p-4 text-[#5C4D3C] max-w-xs truncate">{pub.address}</td>
                      <td className="p-4 font-mono">{pub.globalCatalogCount}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {pub.focalGenres?.slice(0, 3).map((genre, i) => (
                            <span key={i} className="text-[9px] px-1.5 py-0.5 bg-[#FAF6EE] border border-[#D1C2A5] rounded font-mono">
                              {genre}
                            </span>
                          ))}
                          {pub.focalGenres?.length > 3 && (
                            <span className="text-[9px] text-gray-400 font-mono">+{pub.focalGenres.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleEdit(pub)}
                            className="p-1.5 bg-[#FAF6EE] border border-[#D1C2A5] rounded-lg hover:bg-[#E6DCB8]/40 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="Edit Publisher"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(pub.name)}
                            className="p-1.5 bg-[#FAF6EE] border border-red-200 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Publisher"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Users Reader Cards Table */}
        {activeTab === "users" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#E6DCB8]/50 border-b border-[#D1C2A5] text-[#322314] font-serif uppercase tracking-wider font-bold">
                  <th className="p-4">User Portrait & Username</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D1C2A5]/40 text-[#322314]">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-[#FAF6EE]/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatarUrl} 
                          alt={user.username} 
                          className="w-8 h-8 rounded-full border border-[#D1C2A5]/60 object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="font-bold">{user.username}</span>
                          {user.id === currentUser.id && (
                            <span className="ml-2 px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded font-mono text-[8px] uppercase">
                              Self
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[#5C4D3C] font-mono">{user.email}</td>
                    <td className="p-4">
                      {user.isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full font-serif font-bold text-[9px]">
                          <Shield className="h-2.5 w-2.5" />
                          <span>Librarian Admin</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FAF6EE] border border-[#D1C2A5] text-[#5C4D3C] rounded-full text-[9px]">
                          <span>Active Reader</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-[#5C4D3C] font-mono">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Historical"}
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1.5 bg-[#FAF6EE] border border-[#D1C2A5] rounded-lg hover:bg-[#E6DCB8]/40 hover:text-indigo-600 transition-colors cursor-pointer"
                          title="Edit User Card"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={user.id === currentUser.id}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            user.id === currentUser.id 
                              ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed" 
                              : "bg-[#FAF6EE] border-red-200 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                          }`}
                          title="Revoke Card"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Form Overlay Backdrop */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
          
          {/* Main Slide-over Container */}
          <div className="w-full max-w-lg h-full bg-[#FAF6EE] border-l-2 border-[#D1C2A5] shadow-2xl flex flex-col justify-between animate-slide-in overflow-hidden">
            
            {/* Overlay Header */}
            <div className="p-5 border-b border-[#E6DCB8] bg-[#FAF6EE] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-amber-600 animate-pulse" />
                <h3 className="font-serif font-bold text-base text-[#322314]">
                  {editingId ? "Update Dossier" : "Catalog New Entity"} • {activeTab.slice(0, -1).toUpperCase()}
                </h3>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)} 
                className="p-1.5 rounded-lg bg-[#E6DCB8]/40 hover:bg-[#E6DCB8] text-[#322314] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Overlay Scrollable Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 text-xs text-[#322314]">
              
              {/* === BOOK FORM === */}
              {activeTab === "books" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Book Title*</label>
                    <input 
                      type="text" 
                      value={bookTitle} 
                      onChange={e => setBookTitle(e.target.value)} 
                      placeholder="e.g. Beyond Good and Evil"
                      className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Author Name*</label>
                      <input 
                        type="text" 
                        value={bookAuthor} 
                        onChange={e => setBookAuthor(e.target.value)} 
                        placeholder="e.g. Friedrich Nietzsche"
                        className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Publisher Name</label>
                      <input 
                        type="text" 
                        value={bookPublisher} 
                        onChange={e => setBookPublisher(e.target.value)} 
                        placeholder="e.g. Avery, Harper, etc."
                        className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Genre</label>
                      <input 
                        type="text" 
                        value={bookGenre} 
                        onChange={e => setBookGenre(e.target.value)} 
                        placeholder="e.g. Philosophy"
                        className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Published Year</label>
                      <input 
                        type="text" 
                        value={bookPublishedYear} 
                        onChange={e => setBookPublishedYear(e.target.value)} 
                        placeholder="e.g. 1886"
                        className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">ISBN Reference</label>
                      <input 
                        type="text" 
                        value={bookIsbn} 
                        onChange={e => setBookIsbn(e.target.value)} 
                        placeholder="e.g. 9780140449235"
                        className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Shelf Status</label>
                      <select
                        value={bookCategory}
                        onChange={e => setBookCategory(e.target.value as Book["category"])}
                        className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl font-sans"
                      >
                        <option value="Currently Reading">Currently Reading</option>
                        <option value="Already Finished">Already Finished</option>
                        <option value="Plan to Read">Plan to Read</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Total Pages</label>
                      <input 
                        type="number" 
                        value={bookTotalPages} 
                        onChange={e => setBookTotalPages(Math.max(1, Number(e.target.value)))} 
                        className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Description & Premise</label>
                    <textarea 
                      value={bookDescription} 
                      onChange={e => setBookDescription(e.target.value)} 
                      placeholder="Provide a comprehensive synopsis of the books contents and thematic context..."
                      rows={4}
                      className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 p-3 bg-[#E6DCB8]/20 border border-[#D1C2A5]/40 rounded-xl">
                    <input 
                      type="checkbox" 
                      id="onlineAvailable"
                      checked={bookIsOnlineAvailable} 
                      onChange={e => setBookIsOnlineAvailable(e.target.checked)}
                      className="h-4 w-4 border-[#D1C2A5] text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="onlineAvailable" className="font-semibold text-[#5C4D3C] cursor-pointer">
                      Allow online rendering / Read Now preview
                    </label>
                  </div>
                </div>
              )}

              {/* === AUTHOR FORM === */}
              {activeTab === "authors" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Author Name*</label>
                    <input 
                      type="text" 
                      value={authorName} 
                      onChange={e => setAuthorName(e.target.value)} 
                      placeholder="e.g. Friedrich Nietzsche"
                      className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl font-serif font-bold text-sm"
                      required
                      disabled={!!editingId}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Historical Era</label>
                      <input 
                        type="text" 
                        value={authorEra} 
                        onChange={e => setAuthorEra(e.target.value)} 
                        placeholder="e.g. Late 19th Century (1844-1900)"
                        className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Place of Birth</label>
                      <input 
                        type="text" 
                        value={authorBirthPlace} 
                        onChange={e => setAuthorBirthPlace(e.target.value)} 
                        placeholder="e.g. Röcken, Prussia"
                        className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Biographical Dossier</label>
                    <textarea 
                      value={authorBio} 
                      onChange={e => setAuthorBio(e.target.value)} 
                      placeholder="Enter a complete biographical profile..."
                      rows={4}
                      className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Defining Philosophies / Themes (comma separated)</label>
                    <input 
                      type="text" 
                      value={authorKeyThemes} 
                      onChange={e => setAuthorKeyThemes(e.target.value)} 
                      placeholder="e.g. Nihilism, Perspectivism, Will to Power, Eternal Recurrence"
                      className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Achievements & Honours (one per line)</label>
                    <textarea 
                      value={authorAchievements} 
                      onChange={e => setAuthorAchievements(e.target.value)} 
                      placeholder="e.g. Author of Thus Spoke Zarathustra&#10;Professor of Classical Philology at age 24"
                      rows={3}
                      className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Famous Epigraph / Quote</label>
                    <input 
                      type="text" 
                      value={authorQuote} 
                      onChange={e => setAuthorQuote(e.target.value)} 
                      placeholder="e.g. What does not kill me makes me stronger."
                      className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl italic"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Official Website URL</label>
                      <input 
                        type="url" 
                        value={authorWebsite} 
                        onChange={e => setAuthorWebsite(e.target.value)} 
                        placeholder="https://example.com"
                        className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Portrait Gradient Theme</label>
                      <select
                        value={authorColor}
                        onChange={e => setAuthorColor(e.target.value)}
                        className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl font-sans"
                      >
                        {GRADIENT_OPTIONS.map((g, idx) => (
                          <option key={idx} value={g.value}>{g.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* === PUBLISHER FORM === */}
              {activeTab === "publishers" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Publisher House Name*</label>
                    <input 
                      type="text" 
                      value={publisherName} 
                      onChange={e => setPublisherName(e.target.value)} 
                      placeholder="e.g. Penguin Books"
                      className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl font-serif font-bold text-sm"
                      required
                      disabled={!!editingId}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Founded Year</label>
                      <input 
                        type="text" 
                        value={publisherFoundedYear} 
                        onChange={e => setPublisherFoundedYear(e.target.value)} 
                        placeholder="e.g. 1935"
                        className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Global Catalog Count</label>
                      <input 
                        type="text" 
                        value={publisherGlobalCatalog} 
                        onChange={e => setPublisherGlobalCatalog(e.target.value)} 
                        placeholder="e.g. 15,000+ works"
                        className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Brand Gradient</label>
                      <select
                        value={publisherColor}
                        onChange={e => setPublisherColor(e.target.value)}
                        className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                      >
                        {GRADIENT_OPTIONS.map((g, idx) => (
                          <option key={idx} value={g.value}>{g.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Headquarters Location</label>
                    <input 
                      type="text" 
                      value={publisherAddress} 
                      onChange={e => setPublisherAddress(e.target.value)} 
                      placeholder="e.g. London, United Kingdom"
                      className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">About the Publishing House</label>
                    <textarea 
                      value={publisherAbout} 
                      onChange={e => setPublisherAbout(e.target.value)} 
                      placeholder="Provide a comprehensive profile statement of the publisher's history, mission, and scope..."
                      rows={4}
                      className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Focal Genres (comma separated)</label>
                    <input 
                      type="text" 
                      value={publisherGenres} 
                      onChange={e => setPublisherGenres(e.target.value)} 
                      placeholder="e.g. Classic Literature, Science Fiction, Modern Biographies"
                      className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Key Achievements & Highlights (one per line)</label>
                    <textarea 
                      value={publisherHighlights} 
                      onChange={e => setPublisherHighlights(e.target.value)} 
                      placeholder="e.g. Pioneer of high-quality paperback books&#10;Consistently cataloging dozens of Nobel laureates"
                      rows={3}
                      className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Brand Motto</label>
                      <input 
                        type="text" 
                        value={publisherMotto} 
                        onChange={e => setPublisherMotto(e.target.value)} 
                        placeholder="e.g. Reading is discovery."
                        className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Official Website</label>
                      <input 
                        type="url" 
                        value={publisherWebsite} 
                        onChange={e => setPublisherWebsite(e.target.value)} 
                        placeholder="https://example.com"
                        className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* === USER FORM === */}
              {activeTab === "users" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Username*</label>
                    <input 
                      type="text" 
                      value={userUsername} 
                      onChange={e => setUserUsername(e.target.value)} 
                      placeholder="e.g. LiterarySage"
                      className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Email Address*</label>
                    <input 
                      type="email" 
                      value={userEmail} 
                      onChange={e => setUserEmail(e.target.value)} 
                      placeholder="e.g. sage@example.com"
                      className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">
                      Secret Passcode {editingId && "(Leave unchanged to keep existing passcode)"}
                    </label>
                    <input 
                      type="password" 
                      value={userPassword} 
                      onChange={e => setUserPassword(e.target.value)} 
                      placeholder="••••••••"
                      className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C4D3C] mb-1">Avatar Portrait URL</label>
                    <input 
                      type="url" 
                      value={userAvatarUrl} 
                      onChange={e => setUserAvatarUrl(e.target.value)} 
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full p-2.5 bg-[#FAF6EE] border-2 border-[#D1C2A5] focus:border-[#322314] outline-none rounded-xl font-mono"
                    />
                    {userAvatarUrl && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] text-[#5C4D3C]">Preview:</span>
                        <img 
                          src={userAvatarUrl} 
                          alt="avatar preview" 
                          className="w-7 h-7 rounded-full object-cover border" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as any).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 p-3 bg-[#E6DCB8]/20 border border-[#D1C2A5]/40 rounded-xl">
                    <input 
                      type="checkbox" 
                      id="isAdmin"
                      checked={userIsAdmin} 
                      onChange={e => setUserIsAdmin(e.target.checked)}
                      disabled={editingId === currentUser.id}
                      className="h-4 w-4 border-[#D1C2A5] text-indigo-600 focus:ring-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <label 
                      htmlFor="isAdmin" 
                      className={`font-semibold text-[#5C4D3C] select-none ${
                        editingId === currentUser.id ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                      }`}
                    >
                      Grant Librarian Admin Permissions
                    </label>
                  </div>
                  {editingId === currentUser.id && (
                    <p className="text-[10px] text-indigo-600 italic">
                      Note: You cannot demote yourself from Admin status while operating this panel.
                    </p>
                  )}
                </div>
              )}

            </form>

            {/* Overlay Footer Action Bar */}
            <div className="p-5 border-t border-[#E6DCB8] bg-[#FAF6EE]/85 backdrop-blur-xs flex gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 py-2.5 border-2 border-[#D1C2A5] hover:bg-[#E6DCB8]/30 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-2.5 bg-[#322314] hover:bg-[#4E3924] text-[#FAF6EE] font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md"
              >
                {editingId ? "Apply Modifications" : "Issue & Catalog"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
