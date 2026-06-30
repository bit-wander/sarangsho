import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Mail, Lock, User as UserIcon, Sparkles, AlertCircle, ArrowRight, BookMarked } from "lucide-react";
import { AuthService } from "../utils";
import { User } from "../types";

interface AuthViewProps {
  onAuthSuccess: (user: User) => void;
  activeTheme: string;
}

const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120", // Sophia/Marcus style
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120", // Sophia style
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120", // Liam style
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120", // Alex style
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120", // Ada style
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"  // Default style
];

export default function AuthView({ onAuthSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const user = await AuthService.login(email, password);
        onAuthSuccess(user);
      } else {
        if (!username.trim()) {
          throw new Error("Username is required for registration");
        }
        const user = await AuthService.register(username, email, password, selectedAvatar);
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const user = AuthService.loginAsGuest();
    onAuthSuccess(user);
  };

  const fillDemoAccount = () => {
    setEmail("reader@example.com");
    setPassword("password123");
    setIsLogin(true);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4EFE6] text-[#322314] font-sans antialiased">
      {/* Decorative background elements resembling open book pages */}
      <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-multiply bg-[radial-gradient(#322314_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <div className="w-full max-w-lg relative z-10">
        {/* Main Card */}
        <div className="bg-[#FAF6EE] rounded-2xl border-2 border-[#D1C2A5] shadow-[8px_8px_0px_0px_rgba(50,35,20,0.15)] overflow-hidden">
          
          {/* Header */}
          <div className="px-6 pt-10 pb-6 text-center border-b border-[#E6DCB8]">
            <div className="inline-flex p-3 bg-[#E6DCB8] text-[#322314] rounded-2xl border border-[#D1C2A5] mb-4 shadow-sm">
              <BookOpen className="h-8 w-8" />
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#322314]">
              Sarangsho
            </h1>
            <p className="text-xs text-[#5C4D3C] font-mono mt-1 font-bold uppercase tracking-widest">
              Est. 2026 • Literary Haven
            </p>
          </div>

          {/* Form / Tabs Wrapper */}
          <div className="p-6 md:p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3 bg-[#FDF2F2] border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2.5 shadow-sm"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Access Denied:</span> {error}
                </div>
              </motion.div>
            )}

            {/* Tab switchers */}
            <div className="flex bg-[#E6DCB8]/50 p-1.5 rounded-xl border border-[#D1C2A5]/60 mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                }}
                className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isLogin
                    ? "bg-[#FAF6EE] text-[#322314] shadow-sm border border-[#D1C2A5]/50"
                    : "text-[#5C4D3C] hover:text-[#322314]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                }}
                className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isLogin
                    ? "bg-[#FAF6EE] text-[#322314] shadow-sm border border-[#D1C2A5]/50"
                    : "text-[#5C4D3C] hover:text-[#322314]"
                }`}
              >
                Create Library Card
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="register-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D3C] mb-1.5">
                        Reader Username
                      </label>
                      <div className="relative flex items-center bg-[#FAF6EE] rounded-xl border-2 border-[#D1C2A5] focus-within:border-[#322314] transition-all p-2.5">
                        <UserIcon className="h-4 w-4 text-[#5C4D3C] mr-2" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g. Booker99"
                          className="w-full text-xs bg-transparent outline-none text-[#322314]"
                          required={!isLogin}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D3C] mb-1.5">
                        Choose Avatar Portrait
                      </label>
                      <div className="flex items-center justify-between gap-2.5 bg-[#E6DCB8]/30 p-3 rounded-xl border border-[#D1C2A5]/40">
                        {AVATARS.map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedAvatar(url)}
                            className={`relative rounded-full overflow-hidden w-9 h-9 border-2 cursor-pointer transition-all ${
                              selectedAvatar === url
                                ? "border-[#322314] scale-110 shadow-sm"
                                : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img src={url} alt={`Avatar option ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D3C] mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center bg-[#FAF6EE] rounded-xl border-2 border-[#D1C2A5] focus-within:border-[#322314] transition-all p-2.5">
                  <Mail className="h-4 w-4 text-[#5C4D3C] mr-2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-xs bg-transparent outline-none text-[#322314]"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D3C]">
                    Secret Passcode
                  </label>
                </div>
                <div className="relative flex items-center bg-[#FAF6EE] rounded-xl border-2 border-[#D1C2A5] focus-within:border-[#322314] transition-all p-2.5">
                  <Lock className="h-4 w-4 text-[#5C4D3C] mr-2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs bg-transparent outline-none text-[#322314]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#322314] hover:bg-[#4E3924] text-[#FAF6EE] font-serif font-bold rounded-xl text-sm transition-all duration-150 cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Processing Parchment..."
                ) : (
                  <>
                    <span>{isLogin ? "Authenticate Card" : "Issue Library Card"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Info */}
            {isLogin && (
              <div className="mt-5 pt-4 border-t border-[#E6DCB8] space-y-2.5">
                <p className="text-[10px] text-[#5C4D3C] text-center font-bold uppercase tracking-wider">Quick Test Accounts:</p>
                <div className="flex gap-2.5 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("reader@example.com");
                      setPassword("password123");
                      setIsLogin(true);
                      setError(null);
                    }}
                    className="font-mono font-bold text-[11px] bg-[#FAF6EE] border border-[#D1C2A5] px-3 py-1.5 rounded-lg text-[#9B6A3E] hover:text-[#322314] hover:bg-[#E6DCB8]/50 transition-all cursor-pointer shadow-sm"
                  >
                    Reader Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("admin@example.com");
                      setPassword("password123");
                      setIsLogin(true);
                      setError(null);
                    }}
                    className="font-mono font-bold text-[11px] bg-[#322314] border border-[#322314] px-3 py-1.5 rounded-lg text-[#FAF6EE] hover:bg-[#4E3924] hover:border-[#4E3924] transition-all cursor-pointer shadow-sm"
                  >
                    Admin Account
                  </button>
                </div>
              </div>
            )}

            {/* Continue as Guest */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#D1C2A5]/50"></div></div>
              <span className="relative px-3 text-[10px] uppercase font-mono font-bold tracking-widest text-[#5C4D3C] bg-[#FAF6EE]">OR</span>
            </div>

            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full py-2.5 px-4 bg-transparent hover:bg-[#E6DCB8]/30 text-[#322314] font-bold rounded-xl text-xs border-2 border-[#D1C2A5] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <BookMarked className="h-4 w-4" />
              <span>Browse Library as Guest</span>
            </button>
          </div>
        </div>

        {/* Footer vintage message */}
        <p className="text-center text-[11px] text-[#5C4D3C]/80 mt-6 font-serif italic">
          "A room without books is like a body without a soul." — Cicero
        </p>
      </div>
    </div>
  );
}
