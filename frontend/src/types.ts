export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  category: "Currently Reading" | "Already Finished" | "Plan to Read";
  currentPage: number;
  totalPages: number;
  rating?: number;
  review?: string;
  description: string;
  genre: string;
  publishedYear: string;
  isbn?: string;
  isOnlineAvailable?: boolean;
  highlights?: Highlight[];
  notes?: Note[];
  publisher?: string;
}

export interface Highlight {
  id: string;
  text: string;
  color: string;
  createdAt: string;
}

export interface Note {
  id: string;
  highlightId?: string;
  text: string;
  createdAt: string;
}

export interface PriceOption {
  platform: string;
  price: number;
  condition: "New" | "Used" | "Digital";
  delivery: string;
  isBestValue: boolean;
  affiliateUrl: string;
}

export interface Activity {
  id: string;
  user: {
    name: string;
    avatar: string;
    isCurrentUser?: boolean;
  };
  timeAgo: string;
  timestamp: number;
  bookTitle: string;
  bookCover: string;
  comment: string;
  likes: number;
  commentsCount: number;
  saved: boolean;
  liked: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  value: number; // either books volume, review count, or reading minutes
  isCurrentUser?: boolean;
}

export type ThemeMode = "light" | "dark" | "sepia" | "oled" | "bookish";

export type PomodoroMode = "focus" | "shortBreak" | "longBreak";

export interface PomodoroSession {
  mode: PomodoroMode;
  timeLeft: number;
  duration: number; // in seconds
  isActive: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  isGuest?: boolean;
  isAdmin?: boolean;
  createdAt: string;
}

export interface Author {
  name: string;
  bio: string;
  birthPlace: string;
  era: string;
  keyThemes: string[];
  achievements: string[];
  quote: string;
  website?: string;
  avatarPlaceholderColor?: string;
}

export interface Publisher {
  name: string;
  about: string;
  address: string;
  foundedYear: string;
  globalCatalogCount: string;
  focalGenres: string[];
  keyHighlights: string[];
  motto?: string;
  website?: string;
  brandColor?: string;
}

