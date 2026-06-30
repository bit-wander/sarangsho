import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Settings, Clock, Coffee, AlertCircle, Volume2 } from "lucide-react";
import { PomodoroMode, PomodoroSession } from "../types";

interface PomodoroWidgetProps {
  onSessionComplete?: (mode: PomodoroMode) => void;
  inline?: boolean;
}

export default function PomodoroWidget({ onSessionComplete, inline = true }: PomodoroWidgetProps) {
  // Configurations (in seconds)
  const [durations, setDurations] = useState<Record<PomodoroMode, number>>({
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  });

  const [mode, setMode] = useState<PomodoroMode>("focus");
  const [timeLeft, setTimeLeft] = useState(durations.focus);
  const [isActive, setIsActive] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [inactiveTime, setInactiveTime] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const expectedTimeRef = useRef<number>(0);
  const remainingAtPauseRef = useRef<number>(0);

  // Inactivity tracking (180 seconds auto-pause as per 3.3)
  useEffect(() => {
    const handleActivity = () => {
      setInactiveTime(0);
    };

    // Attach listeners
    window.addEventListener("scroll", handleActivity, { passive: true });
    window.addEventListener("touchmove", handleActivity, { passive: true });
    window.addEventListener("click", handleActivity);
    window.addEventListener("keydown", handleActivity);

    const activityInterval = setInterval(() => {
      if (isActive) {
        setInactiveTime((prev) => {
          if (prev >= 179) {
            // Auto-pause timer and show layout alert
            setIsActive(false);
            soundInactivityAlert();
            alert("Pomodoro Auto-Paused: Zero reading activity (scrolling/touch) detected for 180 seconds.");
            return 0;
          }
          return prev + 1;
        });
      }
    }, 1000);

    return () => {
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("touchmove", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      clearInterval(activityInterval);
    };
  }, [isActive]);

  // Synchronous precision epoch counter loop using performance.now() (Section 3.3)
  useEffect(() => {
    if (isActive) {
      expectedTimeRef.current = performance.now() + timeLeft * 1000;
      
      const tick = () => {
        const now = performance.now();
        const delta = Math.round((expectedTimeRef.current - now) / 1000);
        
        if (delta <= 0) {
          // Timer finished
          setIsActive(false);
          handleTimerComplete();
        } else {
          setTimeLeft(delta);
          // Request next frame or standard high-frequency timeout
          timerRef.current = setTimeout(tick, 1000);
        }
      };

      timerRef.current = setTimeout(tick, 1000);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isActive]);

  // Reset timer if mode or configured durations change
  useEffect(() => {
    setTimeLeft(durations[mode]);
    setIsActive(false);
    setInactiveTime(0);
  }, [mode, durations]);

  const handleTimerComplete = () => {
    // Sound completed alert
    soundCompleteAlert();

    alert(`Pomodoro ${mode === "focus" ? "Focus block completed!" : "Break completed!"} Great job.`);
    
    if (onSessionComplete) {
      onSessionComplete(mode);
    }

    // Auto switch modes
    if (mode === "focus") {
      setMode("shortBreak");
    } else {
      setMode("focus");
    }
  };

  const soundInactivityAlert = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(330, audioCtx.currentTime); // Mi tone
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.start();
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.warn("Audio Context blocked by browser safety rules.");
    }
  };

  const soundCompleteAlert = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // High C
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2); // E
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.4); // G
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.start();
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.9);
      osc.stop(audioCtx.currentTime + 0.9);
    } catch (e) {
      console.warn("Audio Context blocked by browser safety rules.");
    }
  };

  const toggleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(durations[mode]);
    setInactiveTime(0);
  };

  const handleConfigChange = (targetMode: PomodoroMode, minutes: number) => {
    const updated = { ...durations };
    updated[targetMode] = minutes * 60;
    setDurations(updated);
  };

  const formatMinutesSeconds = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getPercentageRemaining = (): number => {
    const total = durations[mode];
    return (timeLeft / total) * 100;
  };

  // Prevent mental fatigue color scheme tints (Section 3.3)
  const getColorTintClasses = () => {
    switch (mode) {
      case "focus":
        return {
          border: "border-red-200 dark:border-red-900/50",
          text: "text-red-600 dark:text-red-400",
          bg: "bg-red-50 dark:bg-red-950/20",
          ring: "ring-red-400",
          circleFill: "stroke-red-500",
          circleBg: "stroke-red-100 dark:stroke-red-950/50"
        };
      case "shortBreak":
        return {
          border: "border-emerald-200 dark:border-emerald-900/50",
          text: "text-emerald-600 dark:text-emerald-400",
          bg: "bg-emerald-50 dark:bg-emerald-950/20",
          ring: "ring-emerald-400",
          circleFill: "stroke-emerald-500",
          circleBg: "stroke-emerald-100 dark:stroke-emerald-950/50"
        };
      case "longBreak":
        return {
          border: "border-blue-200 dark:border-blue-900/50",
          text: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-50 dark:bg-blue-950/20",
          ring: "ring-blue-400",
          circleFill: "stroke-blue-500",
          circleBg: "stroke-blue-100 dark:stroke-blue-950/50"
        };
    }
  };

  const tints = getColorTintClasses();

  return (
    <div id="pomodoro-system-container" className="flex flex-col items-center relative z-40">
      {/* Mini Top Banner circular trigger */}
      {inline ? (
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 px-4 py-2 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          {/* Progress Circle SVG */}
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="w-10 h-10 transform -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                className={`${tints.circleBg}`}
                strokeWidth="3.5"
                fill="transparent"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                className={`${tints.circleFill} transition-all`}
                strokeWidth="3.5"
                fill="transparent"
                strokeDasharray="100.53"
                strokeDashoffset={100.53 - (getPercentageRemaining() / 100) * 100.53}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              {mode === "focus" ? (
                <Clock className={`h-4.5 w-4.5 ${tints.text}`} />
              ) : (
                <Coffee className={`h-4.5 w-4.5 ${tints.text}`} />
              )}
            </div>
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1">
              <span className={`text-[10px] uppercase font-bold tracking-widest ${tints.text}`}>
                {mode === "focus" ? "Focus session" : "Break block"}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
            <div className="font-mono text-sm font-bold text-gray-900 dark:text-white leading-tight">
              {formatMinutesSeconds(timeLeft)}
            </div>
          </div>

          {/* Core Controls */}
          <div className="flex items-center gap-1 pl-2 border-l border-gray-100 dark:border-zinc-800">
            <button
              onClick={toggleStartPause}
              className={`p-1.5 rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer ${tints.text}`}
              title={isActive ? "Pause Session" : "Start Focus"}
            >
              {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              title="Configure Pomodoro"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      {/* Pop-out configuration dials & inactive logs alerts */}
      {showConfig && (
        <div className="p-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl shadow-lg w-72 text-left z-50 absolute top-full mt-2 right-0">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-sans font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider">Durations (m)</h4>
            <button onClick={() => setShowConfig(false)} className="text-xs text-indigo-500 font-semibold cursor-pointer">
              Done
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Mode selection toggles */}
            <div className="grid grid-cols-3 gap-1.5 pb-2 border-b border-gray-50 dark:border-zinc-800">
              {(["focus", "shortBreak", "longBreak"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`py-1 rounded text-[10px] font-bold text-center capitalize transition-all cursor-pointer ${
                    mode === m
                      ? "bg-slate-900 text-white dark:bg-zinc-800"
                      : "bg-gray-50 text-gray-500 dark:bg-zinc-950"
                  }`}
                >
                  {m === "shortBreak" ? "Short" : m === "longBreak" ? "Long" : "Focus"}
                </button>
              ))}
            </div>

            {/* Dials for each option */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Focus Duration:</span>
              <input
                type="number"
                min="1"
                max="60"
                value={durations.focus / 60}
                onChange={(e) => handleConfigChange("focus", parseInt(e.target.value) || 25)}
                className="w-14 font-mono font-bold text-center py-1 rounded bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Short Break:</span>
              <input
                type="number"
                min="1"
                max="60"
                value={durations.shortBreak / 60}
                onChange={(e) => handleConfigChange("shortBreak", parseInt(e.target.value) || 5)}
                className="w-14 font-mono font-bold text-center py-1 rounded bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Long Break:</span>
              <input
                type="number"
                min="1"
                max="60"
                value={durations.longBreak / 60}
                onChange={(e) => handleConfigChange("longBreak", parseInt(e.target.value) || 15)}
                className="w-14 font-mono font-bold text-center py-1 rounded bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* Inline indicator showing reading active status */}
      {isActive && inactiveTime > 30 && (
        <div className="text-[10px] text-amber-500 font-semibold flex items-center gap-1 mt-1 animate-pulse">
          <AlertCircle className="h-3 w-3" /> Reading inactive for {inactiveTime}s. Will auto-pause in {180 - inactiveTime}s!
        </div>
      )}
    </div>
  );
}
