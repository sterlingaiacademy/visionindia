import Papa from "papaparse";
import { Clock, CheckCircle2, AlertCircle, Phone, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { normalizeLogs, NormalizedLog } from "@/lib/normalizeLog";

export const revalidate = 0;

export default async function PipelinePage() {
  let logs: NormalizedLog[] = [];
  try {
    const csvUrl = "https://docs.google.com/spreadsheets/d/1mrt3Eka0Kl1bNPmkgsLizHKnmqZbvQOP4KMgo5SceUI/export?format=csv";
    const res = await fetch(csvUrl, { cache: "no-store" });
    if (res.ok) {
      const csvText = await res.text();
      const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      logs = normalizeLogs(parsed.data);
    }
  } catch (e) {
    console.error(e);
  }

  // Group leads into stages
  const discoveryPending: NormalizedLog[] = [];
  const followUpLeads: NormalizedLog[] = [];
  const ptpCommitments: NormalizedLog[] = [];
  const settlementClosed: NormalizedLog[] = [];

  logs.forEach(log => {
    const disp = log.disposition.toLowerCase();
    const hasSettlement = (log.settlementOffer && log.settlementOffer !== "-") || disp.includes("settle");
    const hasPtp = (log.ptpDate && log.ptpDate !== "-") || disp.includes("ptp") || disp.includes("promise");
    const hasFollowUp = disp.includes("callback") || disp.includes("follow") || disp.includes("inquir") || disp.includes("barrier");

    if (hasSettlement) {
      settlementClosed.push(log);
    } else if (hasPtp) {
      ptpCommitments.push(log);
    } else if (hasFollowUp) {
      followUpLeads.push(log);
    } else {
      discoveryPending.push(log);
    }
  });

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-64px)] overflow-hidden flex flex-col bg-[#0A120D] text-gray-100">
      <header className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 flex-shrink-0 animate-fade-up">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tighter mb-2 text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-100 to-gray-400">
            Recovery & Case Pipeline
          </h1>
          <p className="text-sm md:text-base text-gray-400 font-medium">AI-monitored borrower stages, active negotiations, and PTP settlement milestones.</p>
        </div>
        <Link href="/dashboard" className="text-xs font-bold text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors bg-emerald-500/10 px-4 py-2.5 sm:py-2 rounded-full hover:scale-105 transform duration-300 w-full sm:w-auto text-center border border-emerald-500/20 inline-flex items-center justify-center gap-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </header>

      <div className="flex-1 overflow-x-auto pb-8">
        <div className="flex gap-6 h-full min-w-[1300px] px-2">
          <PipelineColumn title="Pending Outreach / Unverified" count={discoveryPending.length} color="gray" items={discoveryPending} delay="0" />
          <PipelineColumn title="Negotiation / Callback" count={followUpLeads.length} color="orange" items={followUpLeads} delay="100" />
          <PipelineColumn title="Promise to Pay (PTP)" count={ptpCommitments.length} color="green" items={ptpCommitments} delay="200" />
          <PipelineColumn title="OTS Settlement Closed" count={settlementClosed.length} color="blue" items={settlementClosed} delay="300" />
        </div>
      </div>
    </div>
  );
}

function PipelineColumn({ title, count, color, items, delay }: { title: string, count: number, color: string, items: NormalizedLog[], delay: string }) {
  const colorMap: any = {
    gray: "from-gray-500/20 to-transparent border-t-gray-500",
    orange: "from-amber-500/20 to-transparent border-t-amber-500",
    green: "from-emerald-500/20 to-transparent border-t-emerald-500",
    blue: "from-blue-500/20 to-transparent border-t-blue-500",
  };

  return (
    <div 
      className={`flex-1 flex flex-col bg-[#101c14] rounded-3xl border border-white/5 shadow-sm overflow-hidden border-t-[6px] ${colorMap[color].split(" ")[2]} animate-fade-up hover:shadow-2xl transition-all duration-500 group/col relative`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-b ${colorMap[color].split(" ")[0]} opacity-10 pointer-events-none`} />
      
      <div className="p-6 border-b border-white/5 flex justify-between items-center relative z-10 backdrop-blur-md">
        <h3 className="font-extrabold text-sm uppercase tracking-widest text-gray-100">{title}</h3>
        <span className="bg-white/10 text-gray-200 px-3 py-1 rounded-full text-xs font-black shadow-sm group-hover/col:scale-110 transition-transform duration-300">{count}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {items.map((item, i) => (
          <PipelineCard key={i} item={item} i={i} />
        ))}
        {items.length === 0 && (
          <div className="text-center p-8 text-gray-500 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-white/5 rounded-2xl animate-pulse">
            Empty Stage
          </div>
        )}
      </div>
    </div>
  );
}

function PipelineCard({ item, i }: { item: NormalizedLog, i: number }) {
  const isUnknown = !item.borrowerName || item.borrowerName.toLowerCase() === "unknown";

  return (
    <div 
      className="bg-[#0A120D] border border-white/10 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:border-emerald-500/50 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 group cursor-grab active:cursor-grabbing animate-fade-up relative overflow-hidden"
      style={{ animationDelay: `${(i * 50)}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className={`font-extrabold capitalize text-sm ${isUnknown ? 'text-gray-400 italic' : 'text-white'}`}>
          {item.borrowerName}
        </div>
        <span className="text-[10px] font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
          {item.direction}
        </span>
      </div>

      <div className="text-xs font-mono text-gray-400 mb-3 bg-white/5 inline-flex items-center gap-1 px-2 py-0.5 rounded border border-white/5 relative z-10">
        📞 {item.phoneNumber}
      </div>
      
      {item.portfolioDisplay && item.portfolioDisplay !== "-" && (
        <div className="mb-3 relative z-10">
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">Portfolio</span>
          <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
            {item.portfolioDisplay}
          </span>
        </div>
      )}

      {item.callSummary && item.callSummary !== "-" && (
        <p className="text-xs text-gray-400 italic line-clamp-2 mb-3 bg-black/40 p-2 rounded border border-white/5 relative z-10">
          "{item.callSummary}"
        </p>
      )}

      {(item.ptpDate || item.ptpTime) && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-emerald-400 font-bold relative z-10 group-hover:text-emerald-300 transition-colors">
          <Calendar className="w-3.5 h-3.5" />
          <span>PTP: {item.ptpDate} {item.ptpTime && `(${item.ptpTime})`}</span>
        </div>
      )}
    </div>
  );
}
