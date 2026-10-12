"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Download, ExternalLink, PhoneIncoming, PhoneOutgoing, RefreshCw, AlertCircle, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { normalizeLogs, NormalizedLog } from "@/lib/normalizeLog";

export function LogsTableClient({ initialLogs, error }: { initialLogs: any[], error: string | null }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [filterType, setFilterType] = useState<"all" | "inbound" | "outbound">("all");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Auto-refresh every 60 seconds, paused when tab is not visible
  useEffect(() => {
    const tick = () => {
      if (!document.hidden) router.refresh();
    };
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [router]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const normalizedLogs = useMemo(() => {
    return normalizeLogs(initialLogs);
  }, [initialLogs]);

  const filteredLogs = useMemo(() => {
    let result = [...normalizedLogs];

    if (filterType !== "all") {
      result = result.filter(log => {
        const direction = (log.direction || "Inbound").toLowerCase();
        return direction.includes(filterType);
      });
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(log => 
        log.borrowerName.toLowerCase().includes(q) ||
        log.phoneNumber.toLowerCase().includes(q) ||
        log.portfolioDisplay.toLowerCase().includes(q) ||
        log.disposition.toLowerCase().includes(q) ||
        log.loanAccount.toLowerCase().includes(q) ||
        log.callSummary.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.callDate !== "-" ? a.callDate : 0).getTime();
      const dateB = new Date(b.callDate !== "-" ? b.callDate : 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [normalizedLogs, searchQuery, sortOrder, filterType]);

  const handleExport = () => {
    if (filteredLogs.length === 0) return;
    
    const allKeys = new Set<string>();
    filteredLogs.forEach(log => Object.keys(log).forEach(key => allKeys.add(key)));
    const headers = Array.from(allKeys);
    
    const csvRows = [];
    csvRows.push(headers.join(","));
    
    for (const log of filteredLogs) {
      const values = headers.map(header => {
        const val = log[header] === undefined || log[header] === null ? '' : String(log[header]);
        const escaped = val.replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }
    
    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'visionindia_recovery_logs.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getDispositionColor = (disp: string) => {
    const d = disp.toLowerCase();
    if (d.includes("ptp") || d.includes("settled") || d.includes("promise")) {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
    if (d.includes("callback") || d.includes("interested") || d.includes("follow")) {
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
    if (d.includes("dispute") || d.includes("refused") || d.includes("barrier") || d.includes("language")) {
      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    }
    return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-6 md:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">Live CRM Sync</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight mb-2 text-white">Call Logs & Resolution History</h1>
          <p className="text-sm md:text-base text-gray-400">Live AI recovery and outreach records synced from Google Sheets CRM.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <a 
            href="https://docs.google.com/spreadsheets/d/1mrt3Eka0Kl1bNPmkgsLizHKnmqZbvQOP4KMgo5SceUI/edit" 
            target="_blank" 
            rel="noreferrer"
            className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-3 md:py-2 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-sm font-medium rounded-lg text-gray-200"
          >
            <ExternalLink className="w-4 h-4 text-emerald-400" /> Open Sheet
          </a>
          <button 
            onClick={handleExport}
            disabled={filteredLogs.length === 0}
            className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-3 md:py-2 bg-[#0F5A2A] text-white hover:bg-[#0c4821] disabled:opacity-50 transition-colors text-sm font-bold uppercase tracking-wider rounded-lg shadow-sm"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={handleManualRefresh}
            className="flex-1 sm:flex-none justify-center flex items-center gap-3 bg-white/5 px-4 py-3 md:py-2 rounded-lg border border-white/10 shadow-sm hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
              Sync
              <RefreshCw className={`w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors ${isRefreshing ? "animate-spin text-white" : ""}`} />
            </span>
          </button>
        </div>
      </header>

      {error ? (
        <div className="mb-8 p-4 border-l-4 border-rose-500 bg-rose-500/10 text-rose-300 text-sm rounded-r-lg">
          <strong className="font-bold">Error Loading Data:</strong> {error}
        </div>
      ) : initialLogs.length === 0 ? (
        <div className="mb-8 p-4 border-l-4 border-blue-500 bg-blue-500/10 text-blue-300 text-sm rounded-r-lg">
          <strong className="font-bold">Info:</strong> Connection successful, but the Google Sheet is currently empty. Waiting for AI calls...
        </div>
      ) : (
        <div className="mb-8 p-4 border-l-4 border-emerald-500 bg-emerald-500/10 text-emerald-300 text-sm flex items-center justify-between rounded-r-lg">
          <span><strong className="font-bold">Connected:</strong> Successfully synced {initialLogs.length} live records from Google Sheets.</span>
        </div>
      )}

      <div className="bg-[#101c14] border border-white/10 rounded-xl overflow-hidden shadow-xl mb-6">
        <div className="p-4 border-b border-white/10 flex flex-col md:flex-row gap-4 bg-white/[0.02]">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by borrower name, phone, bank, disposition, or notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0A120D] border border-white/10 py-2.5 pl-10 pr-4 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors rounded-lg"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full sm:w-auto bg-[#0A120D] border border-white/10 py-3 md:py-2.5 px-3 text-sm text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors rounded-lg"
            >
              <option value="all">All Directions</option>
              <option value="inbound">Inbound Only</option>
              <option value="outbound">Outbound Only</option>
            </select>
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full sm:w-auto bg-[#0A120D] border border-white/10 py-3 md:py-2.5 px-3 text-sm text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors rounded-lg"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Date / Time</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Direction</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Borrower Details</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Portfolio & Account</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Disposition</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">PTP / Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {filteredLogs.map((log, index) => {
                  let displayDate = log.callDate;
                  if (displayDate !== "-") {
                    try {
                      const d = new Date(displayDate);
                      if (!isNaN(d.getTime())) {
                        displayDate = d.toLocaleString('en-IN', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        });
                      }
                    } catch (e) {}
                  }

                  const isOutbound = log.direction.toLowerCase().includes("outbound");
                  const isExpanded = expandedRow === index;
                  const isUnknownBorrower = !log.borrowerName || log.borrowerName.toLowerCase() === "unknown";

                  return (
                    <tr key={index} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="p-4 text-xs text-gray-400 whitespace-nowrap align-top">
                        {displayDate}
                      </td>
                      <td className="p-4 align-top">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${isOutbound ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          {isOutbound ? <PhoneOutgoing className="w-3 h-3" /> : <PhoneIncoming className="w-3 h-3" />}
                          {log.direction}
                        </span>
                      </td>
                      <td className="p-4 align-top text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold capitalize ${isUnknownBorrower ? 'text-gray-400 italic' : 'text-white'}`}>
                            {log.borrowerName}
                          </span>
                          {isUnknownBorrower && (
                            <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 font-sans not-italic">
                              Unidentified
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 font-mono mt-1 bg-white/5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-white/10">
                          📞 {log.phoneNumber}
                        </div>
                        {log.callSummary && log.callSummary !== "-" && (
                          <div className="mt-2 text-xs text-gray-400 bg-black/30 p-2 rounded border border-white/5">
                            <p className={isExpanded ? "" : "line-clamp-2"}>
                              {log.callSummary}
                            </p>
                            {log.callSummary.length > 100 && (
                              <button 
                                onClick={() => setExpandedRow(isExpanded ? null : index)}
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold mt-1 inline-flex items-center gap-1 cursor-pointer"
                              >
                                {isExpanded ? <>Less <ChevronUp className="w-3 h-3" /></> : <>More <ChevronDown className="w-3 h-3" /></>}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-top text-sm">
                        <div className="font-bold text-emerald-400 uppercase tracking-wide text-xs">
                          {log.portfolioDisplay}
                        </div>
                        {log.loanAccount && log.loanAccount !== "-" && (
                          <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                            Acc: <span className="text-gray-300">{log.loanAccount}</span>
                          </div>
                        )}
                        {log.amountDue && log.amountDue !== "-" && (
                          <div className="text-[11px] font-semibold text-amber-400 mt-0.5">
                            Due: ₹{log.amountDue}
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-top text-sm">
                        <span className={`inline-block px-2.5 py-1 text-xs rounded-md border font-medium ${getDispositionColor(log.disposition)}`}>
                          {log.disposition}
                        </span>
                      </td>
                      <td className="p-4 align-top text-sm text-gray-300">
                        {log.settlementOffer && log.settlementOffer !== "-" ? (
                          <div className="font-semibold text-emerald-400 text-xs">
                            Offer: {log.settlementOffer}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-xs italic">No Settlement Offer</div>
                        )}
                        {(log.ptpDate || log.ptpTime) && (
                          <div className="text-xs text-emerald-300 mt-1 flex items-center gap-1.5 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>PTP: {log.ptpDate}</span> {log.ptpTime && `(${log.ptpTime})`}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              {filteredLogs.length === 0 && !error && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400 text-sm">
                    No records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-white/10 text-xs text-gray-500 text-center uppercase tracking-widest bg-white/[0.02]">
          {filteredLogs.length > 0 ? `Showing ${filteredLogs.length} of ${initialLogs.length} records` : 'End of Results'}
        </div>
      </div>
    </div>
  );
}
