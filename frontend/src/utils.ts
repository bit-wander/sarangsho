import { Book, Activity, LeaderboardEntry, PriceOption, User, Author, Publisher } from "./types";

// Generate unique ID
export const generateId = () => Math.random().toString(36).substring(2, 9);

// Pure CSS Beautiful Gradient Book Covers
export const getCoverGradient = (title: string): string => {
  const gradients = [
    "from-indigo-600 to-purple-800",
    "from-amber-600 to-rose-700",
    "from-teal-600 to-emerald-800",
    "from-blue-600 to-cyan-800",
    "from-orange-500 to-red-700",
    "from-fuchsia-600 to-pink-800",
    "from-slate-700 to-zinc-900"
  ];
  let sum = 0;
  for (let i = 0; i < title.length; i++) sum += title.charCodeAt(i);
  return gradients[sum % gradients.length];
};

export const INITIAL_BOOKS: Book[] = [
  {
    id: "book-1",
    title: "Atomic Habits",
    author: "James Clear",
    coverUrl: "",
    category: "Currently Reading",
    currentPage: 142,
    totalPages: 320,
    genre: "Self-Help",
    publishedYear: "2018",
    isbn: "9780735211291",
    isOnlineAvailable: true,
    publisher: "Avery",
    description: "An easy & proven way to build good habits & break bad ones. James Clear reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
    highlights: [
      {
        id: "hl-1",
        text: "You do not rise to the level of your goals. You fall to the level of your systems.",
        color: "bg-yellow-200 text-yellow-900",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: "hl-2",
        text: "Every action you take is a vote for the type of person you wish to become.",
        color: "bg-teal-200 text-teal-900",
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
      }
    ],
    notes: [
      {
        id: "n-1",
        highlightId: "hl-1",
        text: "Focus on process, not just outcomes. Create triggers for daily routines.",
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ]
  },
  {
    id: "book-2",
    title: "Project Hail Mary",
    author: "Andy Weir",
    coverUrl: "",
    category: "Currently Reading",
    currentPage: 88,
    totalPages: 476,
    genre: "Science Fiction",
    publishedYear: "2021",
    isbn: "9780593135204",
    isOnlineAvailable: true,
    publisher: "Ballantine Books",
    description: "Ryland Grace is the sole survivor on a desperate, last-chance mission to save humanity from an extinction-level threat. But right now, he doesn't know that. He can't even remember his own name, let alone the nature of his assignment.",
    highlights: [
      {
        id: "hl-3",
        text: "Human beings have an extraordinary survival instinct. It's why we're still here.",
        color: "bg-pink-200 text-pink-900",
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
      }
    ],
    notes: []
  },
  {
    id: "book-3",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    coverUrl: "",
    category: "Already Finished",
    currentPage: 512,
    totalPages: 512,
    genre: "History",
    publishedYear: "2011",
    isbn: "9780062316097",
    isOnlineAvailable: true,
    publisher: "Harper",
    description: "Harari surveys the history of humankind from the evolutionary stage of Homo sapiens in the Stone Age up to the twenty-first century, focusing on the cognitive, agricultural, and scientific revolutions that shaped us.",
    rating: 5,
    review: "Absolutely mind-bending analysis of how shared myths structured human civilization. It completely shifts how you view history, religion, and currencies."
  },
  {
    id: "book-4",
    title: "Deep Work",
    author: "Cal Newport",
    coverUrl: "",
    category: "Already Finished",
    currentPage: 304,
    totalPages: 304,
    genre: "Productivity",
    publishedYear: "2016",
    isbn: "9781455586691",
    isOnlineAvailable: true,
    publisher: "Grand Central Publishing",
    description: "Deep work is the ability to focus without distraction on a cognitively demanding task. Cal Newport explains how to cultivate a deep work practice in an age of constant notification clutter.",
    rating: 4,
    review: "An essential roadmap for modern knowledge workers. Cal Newport provides excellent actionable strategies to eliminate mental fatigue and create absolute focus."
  },
  {
    id: "book-5",
    title: "Dune",
    author: "Frank Herbert",
    coverUrl: "",
    category: "Plan to Read",
    currentPage: 0,
    totalPages: 617,
    genre: "Science Fiction",
    publishedYear: "1965",
    isbn: "9780441172719",
    isOnlineAvailable: true,
    publisher: "Ace Books",
    description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the spice 'melange'."
  },
  {
    id: "book-6",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    coverUrl: "",
    category: "Plan to Read",
    currentPage: 0,
    totalPages: 499,
    genre: "Psychology",
    publishedYear: "2011",
    isbn: "9780374275631",
    isOnlineAvailable: false,
    publisher: "Farrar, Straus and Giroux",
    description: "Daniel Kahneman, recipient of the Nobel Prize in Economic Sciences, takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think."
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: "act-1",
    user: {
      name: "Marcus Aurelius",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
    },
    timeAgo: "2 hours ago",
    timestamp: Date.now() - 7200 * 1000,
    bookTitle: "Atomic Habits",
    bookCover: "",
    comment: "Completed Chapter 4 today. The concept of 'identity-based habits' makes perfect sense. I am choosing system design over simple goals!",
    likes: 14,
    commentsCount: 3,
    saved: false,
    liked: false
  },
  {
    id: "act-2",
    user: {
      name: "Sophia Carter",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
    },
    timeAgo: "5 hours ago",
    timestamp: Date.now() - 18000 * 1000,
    bookTitle: "Sapiens: A Brief History of Humankind",
    bookCover: "",
    comment: "Just finished this masterpiece. The Agricultural Revolution section is so counterintuitive but extremely well-reasoned. Highly recommend to everyone!",
    likes: 42,
    commentsCount: 12,
    saved: true,
    liked: true
  },
  {
    id: "act-3",
    user: {
      name: "Liam Bennett",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
    },
    timeAgo: "1 day ago",
    timestamp: Date.now() - 86400 * 1000,
    bookTitle: "Project Hail Mary",
    bookCover: "",
    comment: "Fascinating hard science fiction! The chemistry and physics calculations in the opening chapters make you feel like you are actually solving the stellar mystery along with Grace.",
    likes: 29,
    commentsCount: 5,
    saved: false,
    liked: false
  }
];

export const MOCK_LEADERBOARDS = {
  volume: [
    { rank: 1, name: "Alexander the Great", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120", value: 48 },
    { rank: 2, name: "Sophia Carter", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120", value: 39 },
    { rank: 3, name: "Marcus Aurelius", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120", value: 31 },
    { rank: 4, name: "Jane Austen", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120", value: 27 },
    { rank: 5, name: "You (Active Reader)", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120", value: 12, isCurrentUser: true },
    { rank: 6, name: "Liam Bennett", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120", value: 11 },
    { rank: 7, name: "Ada Lovelace", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120", value: 9 }
  ] as LeaderboardEntry[],
  reviews: [
    { rank: 1, name: "Jane Austen", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120", value: 34 },
    { rank: 2, name: "Marcus Aurelius", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120", value: 28 },
    { rank: 3, name: "Sophia Carter", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120", value: 22 },
    { rank: 4, name: "Alexander the Great", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120", value: 18 },
    { rank: 5, name: "Ada Lovelace", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120", value: 15 },
    { rank: 8, name: "You (Active Reader)", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120", value: 4, isCurrentUser: true }
  ] as LeaderboardEntry[],
  readingTime: {
    Daily: [
      { rank: 1, name: "Sophia Carter", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120", value: 120 },
      { rank: 2, name: "Ada Lovelace", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120", value: 95 },
      { rank: 3, name: "Marcus Aurelius", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120", value: 75 },
      { rank: 12, name: "You (Active Reader)", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120", value: 15, isCurrentUser: true }
    ] as LeaderboardEntry[],
    Weekly: [
      { rank: 1, name: "Marcus Aurelius", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120", value: 580 },
      { rank: 2, name: "Sophia Carter", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120", value: 540 },
      { rank: 3, name: "Alexander the Great", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120", value: 480 },
      { rank: 14, name: "You (Active Reader)", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120", value: 105, isCurrentUser: true }
    ] as LeaderboardEntry[],
    "All-Time": [
      { rank: 1, name: "Alexander the Great", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120", value: 14500 },
      { rank: 2, name: "Sophia Carter", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120", value: 12300 },
      { rank: 3, name: "Jane Austen", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120", value: 11200 },
      { rank: 21, name: "You (Active Reader)", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120", value: 3120, isCurrentUser: true }
    ] as LeaderboardEntry[]
  }
};

export const MOCK_PRICES: Record<string, PriceOption[]> = {
  "Atomic Habits": [
    { platform: "Amazon", price: 11.99, condition: "New", delivery: "Free Prime shipping", isBestValue: false, affiliateUrl: "https://amazon.com/dp/0735211299" },
    { platform: "Barnes & Noble", price: 14.39, condition: "New", delivery: "Ships in 2-3 days", isBestValue: false, affiliateUrl: "https://barnesandnoble.com/w/atomic-habits" },
    { platform: "Bookshop.org", price: 24.84, condition: "New", delivery: "Supports local bookstores", isBestValue: false, affiliateUrl: "https://bookshop.org/books/atomic-habits" },
    { platform: "ThriftBooks", price: 8.49, condition: "Used", delivery: "Ships in 5 days", isBestValue: true, affiliateUrl: "https://thriftbooks.com/w/atomic-habits" },
    { platform: "Google Play Books", price: 12.99, condition: "Digital", delivery: "Instant Access", isBestValue: false, affiliateUrl: "https://play.google.com/store/books" }
  ],
  "Project Hail Mary": [
    { platform: "Amazon", price: 13.59, condition: "New", delivery: "Free Prime shipping", isBestValue: true, affiliateUrl: "https://amazon.com/dp/0593135202" },
    { platform: "Barnes & Noble", price: 16.99, condition: "New", delivery: "Ships in 1-2 days", isBestValue: false, affiliateUrl: "https://barnesandnoble.com" },
    { platform: "ThriftBooks", price: 14.20, condition: "Used", delivery: "Ships in 3-5 days", isBestValue: false, affiliateUrl: "https://thriftbooks.com" }
  ],
  "Sapiens: A Brief History of Humankind": [
    { platform: "Amazon", price: 14.99, condition: "New", delivery: "Free shipping", isBestValue: false, affiliateUrl: "https://amazon.com" },
    { platform: "ThriftBooks", price: 7.99, condition: "Used", delivery: "Ships in 5 days", isBestValue: true, affiliateUrl: "https://thriftbooks.com" }
  ],
  "Deep Work": [
    { platform: "Amazon", price: 14.29, condition: "New", delivery: "Free Prime shipping", isBestValue: false, affiliateUrl: "https://amazon.com" },
    { platform: "AbeBooks", price: 6.50, condition: "Used", delivery: "Ships in 7 days", isBestValue: true, affiliateUrl: "https://abebooks.com" }
  ],
  "Dune": [
    { platform: "Amazon", price: 9.99, condition: "New", delivery: "Free Prime shipping", isBestValue: true, affiliateUrl: "https://amazon.com" },
    { platform: "Barnes & Noble", price: 10.99, condition: "New", delivery: "Ships in 2 days", isBestValue: false, affiliateUrl: "https://barnesandnoble.com" }
  ],
  "Thinking, Fast and Slow": [
    { platform: "Amazon", price: 12.80, condition: "New", delivery: "Free shipping", isBestValue: false, affiliateUrl: "https://amazon.com" },
    { platform: "ThriftBooks", price: 6.20, condition: "Used", delivery: "Ships in 4 days", isBestValue: true, affiliateUrl: "https://thriftbooks.com" }
  ]
};

export const INITIAL_AUTHORS: Author[] = [
  {
    name: "James Clear",
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
  {
    name: "Andy Weir",
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
  {
    name: "Yuval Noah Harari",
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
  {
    name: "Cal Newport",
    bio: "Cal Newport is an Associate Professor of Computer Science at Georgetown University and the author of several self-improvement and productivity books. He is best known for coining the term 'deep work' and advocating for digital minimalism in an increasingly distracted world.",
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
  {
    name: "Frank Herbert",
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
  {
    name: "Daniel Kahneman",
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
];

export const INITIAL_PUBLISHERS: Publisher[] = [
  {
    name: "Avery",
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
  {
    name: "Ballantine Books",
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
  {
    name: "Harper",
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
  {
    name: "Grand Central Publishing",
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
  {
    name: "Ace Books",
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
  {
    name: "Farrar, Straus and Giroux",
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
];

// Simulated Local/Offline DB Service
export class DatabaseService {
  static getBooks(): Book[] {
    const data = localStorage.getItem("companion_books");
    if (!data) {
      localStorage.setItem("companion_books", JSON.stringify(INITIAL_BOOKS));
      return INITIAL_BOOKS;
    }
    return JSON.parse(data);
  }

  static saveBooks(books: Book[]) {
    localStorage.setItem("companion_books", JSON.stringify(books));
    this.queueSync("books");
  }

  static getActivities(): Activity[] {
    const data = localStorage.getItem("companion_activities");
    if (!data) {
      localStorage.setItem("companion_activities", JSON.stringify(INITIAL_ACTIVITIES));
      return INITIAL_ACTIVITIES;
    }
    return JSON.parse(data);
  }

  static saveActivities(activities: Activity[]) {
    localStorage.setItem("companion_activities", JSON.stringify(activities));
    this.queueSync("activities");
  }

  static getStreakLogs(): Record<string, boolean> {
    const data = localStorage.getItem("companion_streak_logs");
    if (!data) {
      // Seed some past days in current month
      const logs: Record<string, boolean> = {};
      const today = new Date();
      // active 8 days out of the last 15 days
      for (let i = 1; i <= 15; i++) {
        if (i % 2 === 0) {
          const pastDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
          const key = pastDate.toISOString().split("T")[0];
          logs[key] = true;
        }
      }
      localStorage.setItem("companion_streak_logs", JSON.stringify(logs));
      return logs;
    }
    return JSON.parse(data);
  }

  static saveStreakLogs(logs: Record<string, boolean>) {
    localStorage.setItem("companion_streak_logs", JSON.stringify(logs));
    this.queueSync("streak_logs");
  }

  static getStreakCount(): number {
    const logs = this.getStreakLogs();
    const today = new Date();
    let currentStreak = 0;
    let checkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Check if read today
    const todayKey = checkDate.toISOString().split("T")[0];
    const readToday = logs[todayKey];
    
    // Check yesterday if not read today to see if streak is still active
    if (!readToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const key = checkDate.toISOString().split("T")[0];
      if (logs[key]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return currentStreak;
  }

  // Queue changes to local offline queue
  private static queueSync(key: string) {
    const queue = JSON.parse(localStorage.getItem("companion_sync_queue") || "[]");
    if (!queue.includes(key)) {
      queue.push(key);
      localStorage.setItem("companion_sync_queue", JSON.stringify(queue));
    }
  }

  // Pull latest data from backend on startup or login
  static async syncFromBackend(token: string) {
    try {
      // 1. Fetch shelves
      const shelfRes = await fetch("http://localhost:8000/api/shelves", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (shelfRes.ok) {
        const books = await shelfRes.json();
        localStorage.setItem("companion_books", JSON.stringify(books));
      }
      
      // 2. Fetch activities
      const actRes = await fetch("http://localhost:8000/api/activities", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (actRes.ok) {
        const activities = await actRes.json();
        localStorage.setItem("companion_activities", JSON.stringify(activities));
      }
      
      // 3. Fetch streaks
      const streakRes = await fetch("http://localhost:8000/api/streaks", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (streakRes.ok) {
        const streakInfo = await streakRes.json();
        localStorage.setItem("companion_streak_logs", JSON.stringify(streakInfo.logs));
      }
    } catch (err) {
      console.error("Failed to fetch startup sync from backend:", err);
    }
  }

  // Sweep queue and simulate server upload every 30s as per 4.0
  static async sweepSyncQueue(): Promise<{ success: boolean; syncedItems: string[] }> {
    const queue = JSON.parse(localStorage.getItem("companion_sync_queue") || "[]");
    if (queue.length === 0) {
      return { success: false, syncedItems: [] };
    }
    
    const token = localStorage.getItem("companion_access_token");
    if (!token) {
      // Guest or not logged in, cannot sync with backend
      return { success: false, syncedItems: [] };
    }
    
    const syncedItems: string[] = [];
    
    try {
      if (queue.includes("books")) {
        const books = JSON.parse(localStorage.getItem("companion_books") || "[]");
        const res = await fetch("http://localhost:8000/api/shelves/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(books)
        });
        if (res.ok) {
          syncedItems.push("books");
        }
      }
      
      if (queue.includes("activities")) {
        const activities = JSON.parse(localStorage.getItem("companion_activities") || "[]");
        const userActivities = activities.filter((a: any) => a.user.isCurrentUser).map((a: any) => ({
          id: a.id,
          bookTitle: a.bookTitle,
          comment: a.comment,
          timestamp: a.timestamp
        }));
        
        const res = await fetch("http://localhost:8000/api/activities/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(userActivities)
        });
        if (res.ok) {
          syncedItems.push("activities");
        }
      }
      
      if (queue.includes("streak_logs")) {
        const logs = JSON.parse(localStorage.getItem("companion_streak_logs") || "{}");
        const res = await fetch("http://localhost:8000/api/streaks/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(logs)
        });
        if (res.ok) {
          syncedItems.push("streak_logs");
        }
      }
      
      const remainingQueue = queue.filter((item: string) => !syncedItems.includes(item));
      if (remainingQueue.length > 0) {
        localStorage.setItem("companion_sync_queue", JSON.stringify(remainingQueue));
      } else {
        localStorage.removeItem("companion_sync_queue");
      }
      
      return { success: syncedItems.length > 0, syncedItems };
    } catch (err) {
      console.error("Error during background sync sweep:", err);
      return { success: false, syncedItems: [] };
    }
  }

  static getAuthors(): Author[] {
    const data = localStorage.getItem("companion_authors");
    if (!data) {
      localStorage.setItem("companion_authors", JSON.stringify(INITIAL_AUTHORS));
      return INITIAL_AUTHORS;
    }
    return JSON.parse(data);
  }

  static saveAuthors(authors: Author[]) {
    localStorage.setItem("companion_authors", JSON.stringify(authors));
    this.queueSync("authors");
  }

  static getPublishers(): Publisher[] {
    const data = localStorage.getItem("companion_publishers");
    if (!data) {
      localStorage.setItem("companion_publishers", JSON.stringify(INITIAL_PUBLISHERS));
      return INITIAL_PUBLISHERS;
    }
    return JSON.parse(data);
  }

  static savePublishers(publishers: Publisher[]) {
    localStorage.setItem("companion_publishers", JSON.stringify(publishers));
    this.queueSync("publishers");
  }

  // Admin Database Methods
  static async adminGetBooks(): Promise<Book[]> {
    const token = localStorage.getItem("companion_access_token");
    const res = await fetch("http://localhost:8000/api/admin/books", {
      headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error("Failed to fetch books from database.");
    const data = await res.json();
    return data.map((b: any) => ({
      id: String(b.id),
      title: b.title,
      author: b.authors && b.authors.length > 0 ? b.authors.join(", ") : "Unknown Author",
      publisher: b.publisher || "",
      genre: b.genres && b.genres.length > 0 ? b.genres.join(", ") : "General",
      publishedYear: b.published_year || "",
      isbn: b.ISBN || "",
      description: b.description || "",
      coverUrl: b.thumbnail_url || "",
      currentPage: 0,
      totalPages: b.total_pages || 100,
      category: "Plan to Read"
    }));
  }

  static async adminSaveBook(book: Book, isEdit: boolean): Promise<void> {
    const token = localStorage.getItem("companion_access_token");
    const url = isEdit 
      ? `http://localhost:8000/api/admin/books/${book.id}`
      : "http://localhost:8000/api/admin/books";
    
    const payload = {
      title: book.title,
      description: book.description,
      publisher: book.publisher,
      published_year: book.publishedYear,
      total_pages: book.totalPages,
      ISBN: book.isbn,
      thumbnail_url: book.coverUrl,
      is_online_available: book.isOnlineAvailable,
      authors: book.author.split(",").map(s => s.trim()).filter(Boolean),
      genres: book.genre.split(",").map(s => s.trim()).filter(Boolean)
    };

    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to save book to database.");
    }
  }

  static async adminDeleteBook(bookId: string): Promise<void> {
    const token = localStorage.getItem("companion_access_token");
    const res = await fetch(`http://localhost:8000/api/admin/books/${bookId}`, {
      method: "DELETE",
      headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error("Failed to delete book from database.");
  }

  static async adminGetAuthors(): Promise<Author[]> {
    const token = localStorage.getItem("companion_access_token");
    const res = await fetch("http://localhost:8000/api/admin/authors", {
      headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error("Failed to fetch authors from database.");
    const data = await res.json();
    return data.map((a: any) => ({
      name: a.name,
      bio: a.description || "",
      birthPlace: "Unknown",
      era: "Contemporary",
      keyThemes: [],
      achievements: [],
      quote: "No quote registered.",
      avatarPlaceholderColor: "from-indigo-500 to-purple-600"
    }));
  }

  static async adminSaveAuthor(author: Author, isEdit: boolean, originalId?: string): Promise<void> {
    const token = localStorage.getItem("companion_access_token");
    
    // Fetch authors to find the ID
    const listRes = await fetch("http://localhost:8000/api/admin/authors", {
      headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });
    const authorsList = await listRes.json();
    const existing = authorsList.find((a: any) => a.name.toLowerCase() === (originalId || author.name).toLowerCase());
    
    const url = existing 
      ? `http://localhost:8000/api/admin/authors/${existing.id}`
      : "http://localhost:8000/api/admin/authors";
      
    const res = await fetch(url, {
      method: existing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        name: author.name,
        description: author.bio
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to save author to database.");
    }
  }

  static async adminDeleteAuthor(authorName: string): Promise<void> {
    const token = localStorage.getItem("companion_access_token");
    const listRes = await fetch("http://localhost:8000/api/admin/authors", {
      headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });
    const authorsList = await listRes.json();
    const existing = authorsList.find((a: any) => a.name.toLowerCase() === authorName.toLowerCase());
    if (!existing) throw new Error("Author not found in database.");
    
    const res = await fetch(`http://localhost:8000/api/admin/authors/${existing.id}`, {
      method: "DELETE",
      headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error("Failed to delete author from database.");
  }
}

export class AuthService {
  private static SEED_USERS = [
    {
      id: "u-1",
      username: "reader",
      email: "reader@example.com",
      password: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
      createdAt: new Date().toISOString()
    }
  ];

  static getUsers(): any[] {
    const data = localStorage.getItem("companion_users");
    if (!data) {
      localStorage.setItem("companion_users", JSON.stringify(this.SEED_USERS));
      return this.SEED_USERS;
    }
    return JSON.parse(data);
  }

  static saveUsers(users: any[]) {
    localStorage.setItem("companion_users", JSON.stringify(users));
  }

  static getCurrentUser(): User | null {
    const data = localStorage.getItem("companion_current_user");
    return data ? JSON.parse(data) : null;
  }

  static async login(email: string, password: string): Promise<User> {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);
    
    const res = await fetch("http://localhost:8000/api/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Invalid email/username or password");
    }
    
    const tokenData = await res.json();
    localStorage.setItem("companion_access_token", tokenData.access_token);
    
    // Fetch user details
    const meRes = await fetch("http://localhost:8000/api/auth/me", {
      headers: { "Authorization": `Bearer ${tokenData.access_token}` }
    });
    
    if (!meRes.ok) {
      throw new Error("Failed to retrieve user profile details.");
    }
    
    const user = await meRes.json();
    
    // Convert backend user id to string to match frontend types
    const formattedUser: User = {
      id: String(user.id),
      username: user.username,
      email: user.email,
      avatarUrl: user.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
      isAdmin: user.role === "ADMIN" || user.email.toLowerCase() === "admin@example.com",
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem("companion_current_user", JSON.stringify(formattedUser));
    
    // Proactively pull latest data from backend to sync
    await DatabaseService.syncFromBackend(tokenData.access_token);
    
    return formattedUser;
  }

  static async register(username: string, email: string, password: string, avatarUrl: string): Promise<User> {
    if (!username || !email || !password) {
      throw new Error("All fields are required");
    }
    
    const res = await fetch("http://localhost:8000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        email,
        password,
        avatar_url: avatarUrl,
        full_name: username
      })
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Registration failed. Email/Username may be taken.");
    }
    
    // Automatically log in after registration
    return this.login(email, password);
  }

  static loginAsGuest(): User {
    const guestUser: User = {
      id: `guest-${generateId()}`,
      username: "Guest Reader",
      email: "guest@example.com",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
      isGuest: true,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem("companion_current_user", JSON.stringify(guestUser));
    return guestUser;
  }

  static async adminGetUsers(): Promise<any[]> {
    const token = localStorage.getItem("companion_access_token");
    const res = await fetch("http://localhost:8000/api/admin/users", {
      headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error("Failed to fetch users from database.");
    const data = await res.json();
    return data.map((u: any) => ({
      id: String(u.id),
      username: u.username,
      email: u.email,
      fullName: u.full_name,
      role: u.role,
      isAdmin: u.role === "ADMIN",
      avatarUrl: u.avatar_url,
      createdAt: u.created_at
    }));
  }

  static async adminSaveUser(user: any, isEdit: boolean): Promise<void> {
    const token = localStorage.getItem("companion_access_token");
    if (!isEdit) {
      throw new Error("Creation of users via admin panel should be done via Registration.");
    }
    const res = await fetch(`http://localhost:8000/api/admin/users/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        username: user.username,
        email: user.email,
        full_name: user.fullName || user.username,
        role: user.isAdmin ? "ADMIN" : "USER",
        avatar_url: user.avatarUrl
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to update user in database.");
    }
  }

  static async adminDeleteUser(userId: string): Promise<void> {
    const token = localStorage.getItem("companion_access_token");
    const res = await fetch(`http://localhost:8000/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to revoke user card.");
    }
  }

  static logout() {
    localStorage.removeItem("companion_current_user");
    localStorage.removeItem("companion_access_token");
    localStorage.removeItem("companion_books");
    localStorage.removeItem("companion_activities");
    localStorage.removeItem("companion_streak_logs");
  }
}
