import { Activity, Phone, Calendar, Wrench, Percent, Car, Clock, CheckCircle2, Building2 } from "lucide-react";
import Papa from "papaparse";
import Link from "next/link";
import { RefreshButton } from "@/components/RefreshButton";
import { LeadSourceChart, LeadStatusChart } from "@/components/DashboardCharts";
import { UpcomingEventsBoard } from "@/components/UpcomingEventsBoard";
import { normalizeLogs, NormalizedLog } from "@/lib/normalizeLog";

export const revalidate = 0; // Disable caching for live data

export default async function DashboardOverview() {
  let totalCalls = 0;
  let ptpCommitments = 0;
  let otsSettlements = 0;
  let todaysCalls = 0;
  let resolutionRate = "0%";
  let topPortfolio = "Federal Bank";
  let isOnline = false;
  let logs: NormalizedLog[] = [];

  try {
    const csvUrl = "https://docs.google.com/spreadsheets/d/1mrt3Eka0Kl1bNPmkgsLizHKnmqZbvQOP4KMgo5SceUI/export?format=csv";
    const res = await fetch(csvUrl, { cache: "no-store" });
    
    if (res.ok) {
      isOnline = true;
      const csvText = await res.text();
      const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      
      logs = normalizeLogs(parsed.data);
      totalCalls = logs.length;
      
      const portfolioCounts: Record<string, number> = {};

      logs.forEach((log) => {
        const hasPtp = (log.ptpDate && log.ptpDate !== "-") || log.disposition.toLowerCase().includes("ptp");
        const hasSettlement = (log.settlementOffer && log.settlementOffer !== "-") || log.disposition.toLowerCase().includes("settle");
        
        if (hasSettlement) otsSettlements++;
        else if (hasPtp) ptpCommitments++;
        
        let isToday = false;
        if (log.callDate && log.callDate !== "-") {
          try {
            const d = new Date(log.callDate);
            if (!isNaN(d.getTime())) {
              const localDate = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
              const todayLocal = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
              if (localDate === todayLocal) isToday = true;
            }
          } catch(e) {}
        }
        if (isToday) todaysCalls++;

        const portfolio = log.portfolioDisplay;
        if (portfolio && portfolio !== "-") {
          portfolioCounts[portfolio] = (portfolioCounts[portfolio] || 0) + 1;
        }
      });

      if (totalCalls > 0) {
        resolutionRate = Math.round(((ptpCommitments + otsSettlements) / totalCalls) * 100) + "%";
      }

      const sortedPortfolios = Object.entries(portfolioCounts).sort((a, b) => b[1] - a[1]);
      if (sortedPortfolios.length > 0) topPortfolio = sortedPortfolios[0][0];
    }
  } catch (e) {
    console.error("Failed to fetch live stats", e);
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-screen bg-[#0A120D] text-gray-100">
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">Live Recovery Operations</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tighter mb-2 text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-100 to-gray-400">
            Recovery Analytics Hub
          </h1>
          <p className="text-sm md:text-base text-gray-400 font-medium">Vision India Financial Solutions &mdash; AI Voice NPA Resolution & Portfolio Insights.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Link href="/dashboard/pipeline" className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 md:px-5 py-3 md:py-2.5 bg-[#0F5A2A] text-white hover:bg-[#0c4821] transition-colors rounded-full text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-emerald-900/40 hover:-translate-y-0.5 transform duration-300">
            Pipeline
          </Link>
          <Link href="/dashboard/outbound" className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 md:px-5 py-3 md:py-2.5 bg-white text-black hover:bg-gray-200 transition-colors rounded-full text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-300">
            New Outreach
          </Link>
          
          <RefreshButton />
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 mb-8 md:mb-10">
        <StatCard title="Total Cases" value={totalCalls} icon={Phone} trend="All Portfolios" delay="0" />
        <StatCard title="Today's Outreach" value={todaysCalls} icon={Clock} trend="Last 24h" delay="75" />
        <StatCard title="PTP Commitments" value={ptpCommitments} icon={Calendar} trend="Promise to Pay" delay="150" isGood />
        <StatCard title="OTS Settlements" value={otsSettlements} icon={CheckCircle2} trend="Settlement Offers" delay="225" isGood />
        <StatCard title="Resolution Rate" value={resolutionRate} icon={Percent} trend="Closure Ratio" isGood={parseFloat(resolutionRate) > 10} delay="300" />
        <StatCard title="Top Portfolio" value={topPortfolio} icon={Building2} trend="Max Volume" delay="375" />
      </div>

      {/* Notice Board Section */}
      <div className="mb-10 transform transition-all duration-500 hover:shadow-2xl rounded-3xl">
        <UpcomingEventsBoard data={logs} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="group bg-[#101c14] border border-white/5 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0F5A2A]/20 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-700" />
          <h2 className="text-lg font-bold uppercase tracking-widest mb-8 text-gray-200 relative z-10 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Bank / Portfolio Distribution
          </h2>
          <div className="relative z-10">
            {logs.length > 0 ? <LeadSourceChart data={logs} /> : <EmptyChart />}
          </div>
        </div>

        <div className="group bg-[#101c14] border border-white/5 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-700" />
          <h2 className="text-lg font-bold uppercase tracking-widest mb-8 text-gray-200 relative z-10 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Resolution Status Distribution
          </h2>
          <div className="relative z-10">
            {logs.length > 0 ? <LeadStatusChart data={logs} /> : <EmptyChart />}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, isGood = false, delay = "0" }: any) {
  return (
    <div 
      className="group relative bg-[#101c14] border border-white/5 p-6 rounded-3xl hover:border-emerald-500/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden cursor-default"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 group-hover:text-emerald-400 transition-colors">{title}</h3>
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:scale-110 transition-all duration-300">
          <Icon className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition-colors" />
        </div>
      </div>
      
      <div className="text-4xl font-black tracking-tighter mb-2 text-white relative z-10">
        {value}
      </div>
      
      <div className={`text-[10px] font-bold uppercase tracking-widest relative z-10 flex items-center gap-1.5 ${isGood ? 'text-emerald-400' : 'text-gray-400'}`}>
        {trend}
      </div>
    </div>
  );
}

function EmptyChart() {
  return <div className="h-64 flex flex-col items-center justify-center text-gray-400 space-y-4">
    <div className="w-16 h-16 border-4 border-dashed border-white/10 rounded-full animate-[spin_10s_linear_infinite]" />
    <span className="text-xs font-bold uppercase tracking-widest">Awaiting Case Data</span>
  </div>;
}
