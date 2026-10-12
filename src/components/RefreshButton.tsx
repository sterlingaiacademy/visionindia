"use client";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [isSpinning, setIsSpinning] = useState(false);

  const handleRefresh = () => {
    setIsSpinning(true);
    router.refresh();
    setTimeout(() => setIsSpinning(false), 1000);
  };

  return (
    <button 
      onClick={handleRefresh}
      className="flex-1 md:flex-none justify-center flex items-center gap-3 bg-white dark:bg-white/5 px-4 py-3 md:py-2.5 rounded-full border border-gray-200 dark:border-white/10 shadow-sm backdrop-blur-md hover:bg-gray-50 dark:hover:bg-white/10 transition-colors cursor-pointer group"
    >
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2">
        Live Sync
        <RefreshCw className={`w-3 h-3 text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors ${isSpinning ? "animate-spin text-black dark:text-white" : ""}`} />
      </span>
    </button>
  );
}
