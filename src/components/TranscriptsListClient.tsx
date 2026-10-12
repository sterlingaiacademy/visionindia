"use client";

import { useState, useMemo } from "react";
import { Search, Mic, PhoneCall, CheckCircle2, XCircle, ArrowUpDown, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function TranscriptsListClient({ 
  conversations, 
  selectedId, 
  selectedData, 
  error 
}: { 
  conversations: any[], 
  selectedId: string | undefined, 
  selectedData: any, 
  error: string | null 
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [filterStatus, setFilterStatus] = useState<"all" | "success" | "failed">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const filteredConversations = useMemo(() => {
    let result = [...conversations];

    // Filter by Status
    if (filterStatus !== "all") {
      result = result.filter(conv => {
        const isSuccess = conv.call_successful === "success";
        return filterStatus === "success" ? isSuccess : !isSuccess;
      });
    }

    // Search
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(conv => 
        (conv.call_summary_title || "").toLowerCase().includes(q) ||
        (conv.conversation_id || "").toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      return sortOrder === "newest" 
        ? b.start_time_unix_secs - a.start_time_unix_secs
        : a.start_time_unix_secs - b.start_time_unix_secs;
    });

    return result;
  }, [conversations, searchQuery, sortOrder, filterStatus]);

  return (
    <div className="p-8 max-w-[1400px] bg-[#F8F9FA] dark:bg-black animate-fade-up mx-auto flex h-[calc(100vh-2rem)] gap-6">
      
      {/* Left List Pane */}
      <div className="w-[400px] flex flex-col bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-3xl transition-all duration-500 overflow-hidden shadow-sm shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-white/10 shrink-0 bg-gray-50 dark:bg-white/5">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-4 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-emerald-500" />
              Raw Transcripts
            </span>
            <button
              onClick={handleManualRefresh}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors group"
              title="Refresh transcripts"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                Sync
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : "text-gray-400 group-hover:text-gray-700 dark:group-hover:text-white"} transition-colors`} />
              </span>
            </button>
          </h2>
          
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search summaries or IDs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#050505] border border-gray-200 dark:border-white/10 py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors rounded-3xl transition-all duration-500"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="flex-1 bg-white dark:bg-[#050505] border border-gray-200 dark:border-white/10 py-1.5 px-2 text-xs focus:outline-none focus:border-emerald-500 rounded-3xl transition-all duration-500"
              >
                <option value="all">All Status</option>
                <option value="success">Successful</option>
                <option value="failed">Failed</option>
              </select>
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="flex-1 bg-white dark:bg-[#050505] border border-gray-200 dark:border-white/10 py-1.5 px-2 text-xs focus:outline-none focus:border-emerald-500 rounded-3xl transition-all duration-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {error ? (
            <div className="p-4 text-red-500 text-sm">{error}</div>
          ) : filteredConversations.map((conv: any) => {
            const isSelected = selectedId === conv.conversation_id;
            const date = new Date(conv.start_time_unix_secs * 1000).toLocaleString('en-IN', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            const isSuccess = conv.call_successful === "success";

            return (
              <Link 
                key={conv.conversation_id}
                href={`/dashboard/transcripts?id=${conv.conversation_id}`}
                className={`block p-4 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${isSelected ? 'bg-emerald-500/10 border-l-2 border-l-emerald-500' : 'border-l-2 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate pr-2">
                    {conv.call_summary_title || "Incoming Call"}
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap shrink-0">{date}</div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <PhoneCall className="w-3 h-3" /> {Math.round(conv.call_duration_secs)}s
                  </div>
                  <div className="flex items-center gap-1">
                    {isSuccess ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                      {conv.call_successful || "Failed"}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
          {filteredConversations.length === 0 && !error && (
            <div className="p-8 text-center text-gray-500 text-sm">No conversations match your filters.</div>
          )}
        </div>
      </div>

      {/* Right Detail Pane */}
      <div className="flex-1 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-3xl transition-all duration-500 shadow-sm flex flex-col overflow-hidden">
        {selectedData ? (
          <>
            <div className="p-6 border-b border-gray-200 dark:border-white/10 shrink-0 bg-gray-50 dark:bg-white/5">
              <h2 className="text-2xl font-bold mb-2">Transcript Details</h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div><strong>ID:</strong> <span className="font-mono text-xs">{selectedId}</span></div>
                <div><strong>Duration:</strong> {Math.round(selectedData.metadata?.call_duration_secs || 0)}s</div>
                <div><strong>Status:</strong> <span className="uppercase">{selectedData.status}</span></div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Call Audio</h3>
                <audio 
                  controls 
                  className="w-full h-10" 
                  src={`/api/elevenlabs/audio/${selectedId}`}
                  autoPlay={false}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {selectedData.transcript?.map((turn: any, i: number) => {
                const isAgent = turn.role === "agent";
                return (
                  <div key={i} className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1 px-1">
                      {isAgent ? "Ananya (AI)" : "Customer"}
                    </span>
                    <div className={`p-4 rounded-3xl transition-all duration-500 max-w-[85%] text-sm leading-relaxed shadow-sm ${
                      isAgent 
                        ? 'bg-gray-100 dark:bg-[#050505] text-gray-900 dark:text-gray-100' 
                        : 'bg-[#0F5A2A] text-white'
                    }`}>
                      {turn.message || <span className="italic opacity-50">No audio detected</span>}
                    </div>
                  </div>
                );
              })}
              {(!selectedData.transcript || selectedData.transcript.length === 0) && (
                <div className="text-center text-gray-500 italic py-10">No transcript available for this call.</div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
            <Mic className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-700" />
            <h3 className="text-lg font-bold mb-2">Select a Conversation</h3>
            <p className="text-sm max-w-xs">
              Choose a call from the list to securely load its raw audio recording and live transcript directly from the Voice AI Engine.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
