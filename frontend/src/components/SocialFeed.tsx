import React, { useState, useEffect, useRef } from "react";
import { Heart, MessageSquare, Bookmark, Send, Sparkles, Loader2, Lock } from "lucide-react";
import { DatabaseService, generateId, getCoverGradient } from "../utils";
import { Activity, User } from "../types";

interface SocialFeedProps {
  currentUser?: User | null;
  onActionRestricted?: (action: string) => void;
}

export default function SocialFeed({ currentUser, onActionRestricted }: SocialFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newComment, setNewComment] = useState("");
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // States for sharing updates
  const [newPostText, setNewPostText] = useState("");
  const [selectedPostBook, setSelectedPostBook] = useState("Atomic Habits");

  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.isGuest) {
      onActionRestricted?.("publishing reading updates");
      return;
    }
    if (!newPostText.trim()) return;

    const newActivity: Activity = {
      id: `act-usr-${generateId()}`,
      user: {
        name: currentUser?.username || "You",
        avatar: currentUser?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
        isCurrentUser: true
      },
      timeAgo: "Just now",
      timestamp: Date.now(),
      bookTitle: selectedPostBook,
      bookCover: "",
      comment: newPostText.trim(),
      likes: 0,
      commentsCount: 0,
      saved: false,
      liked: false
    };

    const updated = [newActivity, ...activities];
    setActivities(updated);
    DatabaseService.saveActivities(updated);
    setNewPostText("");
  };

  useEffect(() => {
    const loaded = DatabaseService.getActivities();
    setActivities(loaded);
  }, []);

  // Infinite Scroll Trigger (past 80% scroll or sentinel intersection)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMoreActivities();
        }
      },
      {
        root: null, // viewport
        rootMargin: "0px 0px 200px 0px", // Trigger slightly before reaching the bottom
        threshold: 0.1
      }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [activities, isLoadingMore]);

  const loadMoreActivities = () => {
    setIsLoadingMore(true);
    // Simulate API pagination latency
    setTimeout(() => {
      const extra: Activity[] = [
        {
          id: `act-gen-${generateId()}`,
          user: {
            name: "Emily Watson",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120"
          },
          timeAgo: "2 days ago",
          timestamp: Date.now() - 3600000 * 48,
          bookTitle: "Deep Work",
          bookCover: "",
          comment: "Decided to shut down all instant messengers during my morning deep block. My output has doubled. Newport was right!",
          likes: 54,
          commentsCount: 9,
          saved: false,
          liked: false
        },
        {
          id: `act-gen-${generateId()}`,
          user: {
            name: "Nikola Tesla",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
          },
          timeAgo: "3 days ago",
          timestamp: Date.now() - 3600000 * 72,
          bookTitle: "Thinking, Fast and Slow",
          bookCover: "",
          comment: "Fascinating analysis of human biases. It turns out even the most mathematical minds rely on fast System 1 heuristic pathways more than they admit.",
          likes: 128,
          commentsCount: 22,
          saved: true,
          liked: true
        }
      ];

      const merged = [...activities, ...extra];
      DatabaseService.saveActivities(merged);
      setActivities(merged);
      setIsLoadingMore(false);
    }, 1500);
  };

  // Optimistic UI update implementation
  const handleLike = async (id: string) => {
    if (currentUser?.isGuest) {
      onActionRestricted?.("liking community posts");
      return;
    }

    // 1. Instantly update UI optimistically
    const index = activities.findIndex((a) => a.id === id);
    if (index === -1) return;

    const originalActivity = activities[index];
    const isLiked = !originalActivity.liked;
    const updatedActivities = [...activities];
    updatedActivities[index] = {
      ...originalActivity,
      liked: isLiked,
      likes: isLiked ? originalActivity.likes + 1 : originalActivity.likes - 1
    };

    setActivities(updatedActivities);
    setSyncingId(id); // Show indicator that background syncing is in progress

    // 2. Perform background fake fetch to secure API resolution
    try {
      await simulateApiCall();
      DatabaseService.saveActivities(updatedActivities);
    } catch (err) {
      // Rollback on failure
      const rollbacked = [...activities];
      rollbacked[index] = originalActivity;
      setActivities(rollbacked);
      alert("Reaction failed to sync with the server. Rolled back state.");
    } finally {
      setSyncingId(null);
    }
  };

  const handleSave = async (id: string) => {
    if (currentUser?.isGuest) {
      onActionRestricted?.("saving community posts");
      return;
    }

    const index = activities.findIndex((a) => a.id === id);
    if (index === -1) return;

    const originalActivity = activities[index];
    const isSaved = !originalActivity.saved;
    const updatedActivities = [...activities];
    updatedActivities[index] = {
      ...originalActivity,
      saved: isSaved
    };

    setActivities(updatedActivities);
    setSyncingId(id);

    try {
      await simulateApiCall();
      DatabaseService.saveActivities(updatedActivities);
    } catch (err) {
      const rollbacked = [...activities];
      rollbacked[index] = originalActivity;
      setActivities(rollbacked);
    } finally {
      setSyncingId(null);
    }
  };

  const submitComment = (id: string) => {
    if (currentUser?.isGuest) {
      onActionRestricted?.("commenting on posts");
      return;
    }

    if (!newComment.trim()) return;

    const updated = activities.map((act) => {
      if (act.id === id) {
        return {
          ...act,
          commentsCount: act.commentsCount + 1
        };
      }
      return act;
    });

    setActivities(updated);
    DatabaseService.saveActivities(updated);
    setNewComment("");
    setActiveCommentId(null);
  };

  // Fake network delay helper
  const simulateApiCall = (): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 600));
  };

  return (
    <div id="social-timeline" className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="font-sans font-bold text-gray-900 dark:text-white text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500 fill-current animate-pulse" /> Community Timeline
          </h2>
          <p className="text-xs text-gray-400 dark:text-zinc-500">Share findings and habits with other readers</p>
        </div>
        {syncingId && (
          <span className="flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-500 px-2 py-0.5 rounded-full font-mono">
            <Loader2 className="h-3 w-3 animate-spin" /> syncing updates
          </span>
        )}
      </div>

      {/* Share update post box */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm space-y-3 text-gray-800 dark:text-zinc-200">
        <div className="flex gap-3">
          <img
            src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"}
            alt="Your avatar"
            referrerPolicy="no-referrer"
            className="h-9 w-9 rounded-full object-cover shadow-sm shrink-0"
          />
          <div className="flex-1">
            <textarea
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              disabled={currentUser?.isGuest}
              placeholder={
                currentUser?.isGuest
                  ? "Become a registered reader to share reading updates..."
                  : "Share some takeaways, quotes, or progress from your reading session..."
              }
              rows={2}
              className="w-full bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800/80 rounded-xl p-2.5 text-xs text-gray-800 dark:text-zinc-200 outline-none focus:border-indigo-500/80 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5 pt-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">
              Reading Context:
            </span>
            <select
              value={selectedPostBook}
              onChange={(e) => setSelectedPostBook(e.target.value)}
              disabled={currentUser?.isGuest}
              className="text-[11px] font-semibold py-1 px-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="Atomic Habits">Atomic Habits</option>
              <option value="Project Hail Mary">Project Hail Mary</option>
              <option value="Sapiens: A Brief History of Humankind">Sapiens</option>
              <option value="Deep Work">Deep Work</option>
              <option value="Dune">Dune</option>
              <option value="Thinking, Fast and Slow">Thinking, Fast and Slow</option>
            </select>
          </div>

          {currentUser?.isGuest ? (
            <button
              type="button"
              onClick={() => onActionRestricted?.("publishing community updates")}
              className="py-1.5 px-3 bg-slate-100 dark:bg-zinc-800 text-slate-500 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Lock className="h-3.5 w-3.5 text-amber-500" />
              <span>Unlock Sharing</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreatePost}
              disabled={!newPostText.trim()}
              className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                newPostText.trim()
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.02]"
                  : "bg-slate-100 dark:bg-zinc-800 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              <span>Publish</span>
            </button>
          )}
        </div>
      </div>

      {/* Activity stream list */}
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
          >
            {/* Top row with user avatar and time */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={activity.user.avatar}
                  alt={activity.user.name}
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-full object-cover border border-gray-100 dark:border-zinc-800 shadow-sm"
                />
                <div>
                  <h4 className="font-sans font-semibold text-sm text-gray-900 dark:text-white leading-tight">
                    {activity.user.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">{activity.timeAgo}</p>
                </div>
              </div>

              {/* Book Indicator */}
              <div className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-zinc-950/40 py-1 px-2.5 rounded-lg border border-slate-100 dark:border-zinc-800/60 max-w-[180px] sm:max-w-none">
                <div className={`h-4 w-3 rounded bg-gradient-to-br ${getCoverGradient(activity.bookTitle)} shrink-0`} />
                <span className="font-sans font-medium text-[11px] text-gray-600 dark:text-zinc-400 truncate">
                  {activity.bookTitle}
                </span>
              </div>
            </div>

            {/* Blockquote comment */}
            <blockquote className="border-l-4 border-indigo-500/60 pl-4 py-1 italic text-gray-700 dark:text-zinc-300 text-sm mb-4 leading-relaxed font-sans">
              "{activity.comment}"
            </blockquote>

            {/* Actions row */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-zinc-800 text-gray-400 dark:text-zinc-500">
              <div className="flex items-center gap-4">
                {/* Like Button */}
                <button
                  onClick={() => handleLike(activity.id)}
                  className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                    activity.liked
                      ? "text-rose-500"
                      : "hover:text-gray-900 dark:hover:text-zinc-300"
                  }`}
                >
                  <Heart className={`h-4.5 w-4.5 ${activity.liked ? "fill-rose-500 stroke-rose-500" : ""}`} />
                  <span className="font-mono">{activity.likes}</span>
                </button>

                {/* Comment Button */}
                <button
                  onClick={() => setActiveCommentId(activeCommentId === activity.id ? null : activity.id)}
                  className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                    activeCommentId === activity.id
                      ? "text-indigo-500"
                      : "hover:text-gray-900 dark:hover:text-zinc-300"
                  }`}
                >
                  <MessageSquare className="h-4.5 w-4.5" />
                  <span className="font-mono">{activity.commentsCount}</span>
                </button>
              </div>

              {/* Bookmark Save Button */}
              <button
                onClick={() => handleSave(activity.id)}
                className={`flex items-center text-xs font-semibold cursor-pointer transition-all hover:scale-110 active:scale-90 ${
                  activity.saved
                    ? "text-amber-500"
                    : "hover:text-gray-900 dark:hover:text-zinc-300"
                }`}
              >
                <Bookmark className={`h-4.5 w-4.5 ${activity.saved ? "fill-amber-500 stroke-amber-500" : ""}`} />
              </button>
            </div>

            {/* Interactive Comments Drawer */}
            {activeCommentId === activity.id && (
              <div className="mt-4 pt-4 border-t border-gray-50 dark:border-zinc-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a supportive reply..."
                    className="flex-1 text-xs py-2 px-3 rounded-lg bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => submitComment(activity.id)}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all cursor-pointer flex items-center justify-center shadow-sm"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sentinel indicator for infinite scrolling */}
      <div ref={sentinelRef} className="h-10 flex items-center justify-center text-xs text-gray-400 dark:text-zinc-500">
        {isLoadingMore ? (
          <span className="flex items-center gap-1.5 font-medium">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" /> Pulling additional logs...
          </span>
        ) : (
          <span className="opacity-40 select-none">No further logs in this viewpoint.</span>
        )}
      </div>
    </div>
  );
}
