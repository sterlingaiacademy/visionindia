"use client";

import { useState } from "react";
import { Calendar, Clock, MapPin, User, Building2, Bell, AlertTriangle } from "lucide-react";

export function UpcomingEventsBoard({ data }: { data: any[] }) {
  const [selectedDate, setSelectedDate] = useState<string>("all");

  // Helper to get today's date in YYYY-MM-DD using IST timezone
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrow = tomorrowObj.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const isDateOver = (dateStr: string) => {
    if (!dateStr || dateStr.toLowerCase() === "today" || dateStr.toLowerCase() === "tomorrow") return false;
    try {
      const evtDate = new Date(dateStr);
      const todayDate = new Date(today);
      if (!isNaN(evtDate.getTime()) && evtDate < todayDate) {
        return true;
      }
    } catch(e) {}
    return false;
  };

  // Extract all events from logs
  const allEvents: any[] = [];

  data.forEach((log) => {
    const visitDay = (log.ptpDate || log["Visit Day"] || "").trim();
    const serviceType = (log.settlementOffer || log["Service Type"] || "").trim();
    const time = (log.ptpTime || log["Visit Time"] || "").trim() || "Time TBD";
    const customer = (log.borrowerName || log["Customer Name"] || "Unknown").trim();
    const phone = (log.phoneNumber || log["Phone Number"] || "-").trim();
    const portfolio = (log.portfolioDisplay || log["Bank Name"] || log["Vehicle Model"] || "Vision India").trim();
    
    // Also include if disposition explicitly has PTP or settlement
    const disp = (log.disposition || log["Enquiry Type"] || "").toLowerCase();
    const hasEvent = (visitDay && visitDay !== "-") || (serviceType && serviceType !== "-") || disp.includes("ptp");
    
    if (hasEvent) {
      let dateString = visitDay && visitDay !== "-" ? visitDay : today;
      const callDateStr = log.callDate || log["Call Date"];
      
      if (callDateStr && callDateStr !== "-") {
        try {
          const callDate = new Date(callDateStr);
          if (callDate && !isNaN(callDate.getTime())) {
            if (dateString.toLowerCase() === "today") {
              dateString = callDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
            } else if (dateString.toLowerCase() === "tomorrow") {
              const tmrw = new Date(callDate);
              tmrw.setDate(tmrw.getDate() + 1);
              dateString = tmrw.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
            }
          }
        } catch (e) {}
      } else {
        if (dateString.toLowerCase() === "today") dateString = today;
        if (dateString.toLowerCase() === "tomorrow") dateString = tomorrow;
      }
      
      allEvents.push({
        id: `${phone}_${callDateStr || "x"}_${dateString}`,
        type: serviceType && serviceType !== "-" ? "ots" : "ptp",
        title: serviceType && serviceType !== "-" ? `Settlement: ${serviceType}` : "PTP Commitment",
        customer: customer || "Unknown",
        phone: phone,
        portfolio: portfolio,
        date: dateString,
        time: time,
      });
    }
  });

  // Filter events
  let displayEvents = allEvents;
  if (selectedDate === "today") {
    displayEvents = allEvents.filter(e => e.date === today || e.date.toLowerCase() === "today");
  } else if (selectedDate === "tomorrow") {
    displayEvents = allEvents.filter(e => e.date === tomorrow || e.date.toLowerCase() === "tomorrow");
  } else if (selectedDate === "all") {
    displayEvents = allEvents;
  } else {
    displayEvents = allEvents.filter(e => e.date === selectedDate);
  }

  return (
    <div className="bg-[#101c14] border border-white/5 rounded-3xl shadow-sm overflow-hidden flex flex-col group/board transition-all duration-500">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover/board:bg-emerald-500/10 transition-colors duration-500">
            <Bell className="w-5 h-5 text-gray-400 group-hover/board:text-emerald-500 transition-colors duration-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-white">Recovery Notice Board</h2>
            <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">Scheduled PTP Dates & Settlement Deadlines</p>
          </div>
        </div>
        
        {/* Date Selector */}
        <div className="flex bg-black/50 p-1.5 rounded-xl border border-white/5 relative z-10 backdrop-blur-xl overflow-x-auto max-w-full hide-scrollbar snap-x">
          <button 
            onClick={() => setSelectedDate("all")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all snap-start ${selectedDate === "all" ? "bg-[#0F5A2A] text-white shadow-sm" : "text-gray-400 hover:text-white"}`}
          >
            All Commitments ({allEvents.length})
          </button>
          <button 
            onClick={() => setSelectedDate("today")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all snap-start ${selectedDate === "today" ? "bg-[#0F5A2A] text-white shadow-sm" : "text-gray-400 hover:text-white"}`}
          >
            Today
          </button>
          <button 
            onClick={() => setSelectedDate("tomorrow")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all snap-start ${selectedDate === "tomorrow" ? "bg-[#0F5A2A] text-white shadow-sm" : "text-gray-400 hover:text-white"}`}
          >
            Tomorrow
          </button>
          <div className="flex items-center px-3 border-l border-white/10 ml-1">
            <input 
              type="date"
              value={selectedDate !== "today" && selectedDate !== "tomorrow" && selectedDate !== "all" ? selectedDate : ""}
              onChange={(e) => {
                if (e.target.value) setSelectedDate(e.target.value);
              }}
              className="bg-transparent text-gray-400 text-xs font-mono focus:outline-none focus:text-white [&::-webkit-calendar-picker-indicator]:invert hover:[&::-webkit-calendar-picker-indicator]:opacity-100 transition-opacity cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="p-8 bg-black/20 flex-1 min-h-[250px] max-h-[450px] overflow-y-auto">
        {displayEvents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 pt-12">
            <Calendar className="w-12 h-12 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest">No Commitments Scheduled</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayEvents.map((evt, i) => {
              const over = isDateOver(evt.date);
              return (
              <div 
                key={i} 
                className={`group relative bg-[#0A120D] border p-6 rounded-2xl transition-all duration-500 overflow-hidden ${over ? 'border-white/5 opacity-50 grayscale hover:opacity-100 hover:grayscale-0' : 'border-white/5 hover:border-emerald-500/30 hover:shadow-xl hover:-translate-y-1'}`}
              >
                {!over && <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${evt.type === 'ots' ? 'bg-amber-500' : 'bg-emerald-500'}`} />}
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <h3 className={`font-extrabold uppercase text-xs tracking-widest ${over ? 'text-gray-500' : 'text-white'}`}>{evt.title}</h3>
                  <span className={`text-[9px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest shadow-sm ${over ? 'bg-white/5 text-gray-500' : evt.type === 'ots' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                    {evt.type}
                  </span>
                </div>
                
                <div className="space-y-3 mb-6 relative z-10">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="capitalize font-medium">{evt.customer}</span> <span className="font-mono text-xs opacity-50">({evt.phone})</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold uppercase tracking-wider text-xs text-emerald-400">{evt.portfolio}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-xs">Vision India Recovery Operations</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold relative z-10">
                  <div className="flex items-center gap-2 text-gray-400 transition-colors">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className={over ? 'line-through opacity-70' : ''}>{evt.date}</span>
                  </div>
                  {over ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="text-[9px] uppercase tracking-widest">Date Over</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-mono">{evt.time}</span>
                    </div>
                  )}
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
