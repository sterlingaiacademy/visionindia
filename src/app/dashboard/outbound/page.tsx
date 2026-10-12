"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  PhoneOutgoing, Loader2, CheckCircle2, AlertCircle, FileUp,
  Play, Download, X, RefreshCw, PhoneOff, Clock, RotateCcw, History, ArrowLeft, Building2, CreditCard
} from "lucide-react";
import Papa from "papaparse";

type ContactStatus = {
  phone: string;
  name: string;
  loanAccount?: string;
  amountDue?: string;
  bankName?: string;
  vehicle?: string;
  context?: string;
  status: "queued" | "calling" | "done" | "failed" | "skipped";
  error?: string;
};

type CampaignStatus = {
  status: "idle" | "running" | "done";
  startedAt?: string;
  finishedAt?: string;
  total: number;
  current: number;
  contacts: ContactStatus[];
};

const STATUS_BADGE: Record<ContactStatus["status"], { label: string; className: string; icon: React.ReactNode }> = {
  queued:  { label: "Queued",   className: "bg-gray-100 dark:bg-white/5 text-gray-500", icon: <Clock className="w-3 h-3" /> },
  calling: { label: "Calling…", className: "bg-emerald-500/10 text-emerald-500 animate-pulse", icon: <PhoneOutgoing className="w-3 h-3" /> },
  done:    { label: "Done",     className: "bg-green-500/10 text-green-500", icon: <CheckCircle2 className="w-3 h-3" /> },
  failed:  { label: "Failed",   className: "bg-red-500/10 text-red-500", icon: <PhoneOff className="w-3 h-3" /> },
  skipped: { label: "Skipped",  className: "bg-yellow-500/10 text-yellow-500", icon: <AlertCircle className="w-3 h-3" /> },
};

export default function OutboundTriggerPage() {
  // ── Single call state ──
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loanAccount, setLoanAccount] = useState("");
  const [amountDue, setAmountDue] = useState("");
  const [bankName, setBankName] = useState("");
  const [context, setContext] = useState("");
  const [singleStatus, setSingleStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [singleMessage, setSingleMessage] = useState("");

  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistoryCampaign, setSelectedHistoryCampaign] = useState<any>(null);
  const [inlineStatus, setInlineStatus] = useState<Record<string, 'loading' | 'success' | 'error'>>({});

  const handleInlineRetry = async (contact: any) => {
    setInlineStatus(prev => ({ ...prev, [contact.phone]: 'loading' }));
    const result = await triggerCall(contact.phone, {
      customer_name: contact.name,
      loan_account: contact.loanAccount || "",
      amount_due: contact.amountDue || "",
      bank_nbfc: contact.bankName || "",
      context: contact.context || "",
      phone: contact.phone
    });
    
    if (result.success) {
      setInlineStatus(prev => ({ ...prev, [contact.phone]: 'success' }));
      if (selectedHistoryCampaign) {
        const updatedContacts = selectedHistoryCampaign.contacts.map((c: any) => c.phone === contact.phone ? { ...c, status: 'done', error: undefined } : c);
        setSelectedHistoryCampaign({ ...selectedHistoryCampaign, contacts: updatedContacts });
      }
    } else {
      setInlineStatus(prev => ({ ...prev, [contact.phone]: 'error' }));
      if (selectedHistoryCampaign) {
         const updatedContacts = selectedHistoryCampaign.contacts.map((c: any) => c.phone === contact.phone ? { ...c, error: result.error } : c);
         setSelectedHistoryCampaign({ ...selectedHistoryCampaign, contacts: updatedContacts });
      }
    }
    setTimeout(() => {
       setInlineStatus(prev => {
          const next = {...prev};
          delete next[contact.phone];
          return next;
       });
    }, 3000);
  };

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/outbound/history");
      if (res.ok) {
        setHistory(await res.json());
      }
    } catch(e) {}
  }, []);

  const handleClearCampaign = async () => {
    try {
      await fetch("/api/outbound/status", { method: "DELETE" });
      setCampaign(null);
      fetchHistory();
    } catch(e) {}
  };

  // ── Bulk state ──
  const [bulkList, setBulkList] = useState<any[]>([]);
  const [campaign, setCampaign] = useState<CampaignStatus | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Poll campaign status ──
  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/outbound/status");
      if (!res.ok) return;
      const data: CampaignStatus = await res.json();
      setCampaign(data);
      if (data.status === "done" || data.status === "idle") {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      }
    } catch (_) {}
  }, []);

  // On mount: check if a campaign is already running
  useEffect(() => {
    pollStatus();
    fetchHistory();
  }, [pollStatus, fetchHistory]);

  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(pollStatus, 3000);
  }, [pollStatus]);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  // ── Single call trigger ──
  const triggerCall = async (phoneNumber: string, contextData: any = {}) => {
    try {
      const res = await fetch("/api/outbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber.trim(), conversation_variables: contextData }),
      });
      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.error || "Failed to trigger call" };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const handleSingleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setSingleStatus("loading");
    setSingleMessage("");
    const result = await triggerCall(phone, {
      customer_name: customerName,
      loan_account: loanAccount,
      amount_due: amountDue,
      bank_nbfc: bankName || "Vision India Financial Solutions",
      context,
      phone: phone.trim()
    });
    if (result.success) {
      setSingleStatus("success");
      setSingleMessage(`Outbound recovery call triggered to ${phone}.`);
      setPhone(""); setCustomerName(""); setLoanAccount(""); setAmountDue(""); setBankName(""); setContext("");
      setTimeout(() => setSingleStatus("idle"), 5000);
    } else {
      setSingleStatus("error");
      setSingleMessage(result.error || "Unknown error");
    }
  };

  // ── CSV upload ──
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => { setBulkList(results.data as any[]); },
    });
    e.target.value = "";
  };

  // ── Start campaign ──
  const startCampaign = async (contacts: any[]) => {
    setIsStarting(true);
    try {
      const res = await fetch("/api/outbound/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to start campaign");
        setIsStarting(false);
        return;
      }
      setBulkList([]);
      await pollStatus();
      startPolling();
    } catch (e: any) {
      alert(e.message || "Network error");
    }
    setIsStarting(false);
  };

  // ── Retry failed contacts ──
  const retryFailed = () => {
    if (!campaign) return;
    const failedContacts = campaign.contacts
      .filter(c => c.status === "failed")
      .map(c => ({
        phone: c.phone,
        customer_name: c.name,
        loan_account: c.loanAccount,
        amount_due: c.amountDue,
        bank_nbfc: c.bankName,
        context: c.context
      }));
    if (failedContacts.length === 0) return;
    startCampaign(failedContacts);
  };

  // ── Download template ──
  const downloadTemplate = () => {
    const template = "phone,customer_name,loan_account,amount_due,bank_nbfc,context\n+919876543210,Rahul Menon,HL-98234-K,24500,Federal Bank,Overdue EMI Reminder for 15th\n+918765432109,Priya Nair,PL-44120-M,18200,HDFC Bank,Pre-NPA notice settlement offer\n+919447123456,Suresh Kumar,VL-77821-B,12400,Muthoot Finance,Vehicle loan overdue 2nd notice\n";
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", ""); a.setAttribute("href", url); a.setAttribute("download", "recovery_campaign_template.csv");
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const failedCount  = campaign?.contacts.filter(c => c.status === "failed").length ?? 0;
  const doneCount    = campaign?.contacts.filter(c => c.status === "done").length ?? 0;
  const progressPct  = campaign && campaign.total > 0 ? Math.round(((doneCount + failedCount) / campaign.total) * 100) : 0;
  const showCampaign = campaign && (campaign.status === "running" || campaign.status === "done") && campaign.total > 0;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <header className="mb-10 flex flex-col items-start relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#0F5A2A]/10 text-[#0F5A2A] dark:bg-[#0F5A2A]/30 dark:text-emerald-400 border border-[#0F5A2A]/20">
            RBI Fair Practices Compliant
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#E67E22]/10 text-[#E67E22] border border-[#E67E22]/20">
            DND Adherent
          </span>
        </div>
        <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
          Recovery Call Trigger
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Trigger single or batch Voice AI recovery dialogues with borrowers across India.</p>
      </header>

      {/* ── Campaign Progress Panel ── */}
      {showCampaign && (
        <div className="mb-8 bg-white dark:bg-[#101c14] border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
                {campaign.status === "running" ? (
                  <><Loader2 className="w-4 h-4 animate-spin text-[#0F5A2A]" /> Recovery Dialing In Progress</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4 text-green-500" /> Campaign Complete</>
                )}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {campaign.status === "running"
                  ? `Dialing contact ${(campaign.current ?? 0) + 1} of ${campaign.total}. Waiting for call completion before next connection.`
                  : `${doneCount} completed · ${failedCount} failed · ${campaign.contacts.filter(c => c.status === "skipped").length} skipped`
                }
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {campaign.status === "done" && failedCount > 0 && (
                <button
                  onClick={retryFailed}
                  disabled={isStarting}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0F5A2A] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#167a3a] transition-colors disabled:opacity-50 shadow-md"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retry {failedCount} Failed
                </button>
              )}
              {campaign.status === "done" && (
                <button
                  onClick={handleClearCampaign}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase tracking-widest rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  New Campaign
                </button>
              )}
              {campaign.status === "running" && (
                <button onClick={pollStatus} className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-5 pt-4 pb-2">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              <span>Dialing Progress</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0F5A2A] rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Contact list */}
          <div className="max-h-80 overflow-y-auto p-3">
            <ul className="space-y-2">
              {campaign.contacts.map((contact, i) => {
                const badge = STATUS_BADGE[contact.status];
                const isCurrent = campaign.status === "running" && i === campaign.current;
                return (
                  <li
                    key={`${contact.phone}-${i}`}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${
                      isCurrent
                        ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/5"
                        : "border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-black text-gray-300 dark:text-gray-600 w-5 text-right shrink-0">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {contact.name !== "Unknown" ? contact.name : contact.phone}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          {contact.phone}
                          {contact.loanAccount ? ` · Loan: ${contact.loanAccount}` : ""}
                          {contact.amountDue ? ` · Due: ₹${contact.amountDue}` : ""}
                        </p>
                        {contact.error && (
                          <p className="text-[10px] text-red-500 mt-0.5">{contact.error}</p>
                        )}
                      </div>
                    </div>
                    <span className={`shrink-0 ml-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${badge.className}`}>
                      {badge.icon} {badge.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {campaign.finishedAt && (
            <div className="px-5 py-3 border-t border-gray-100 dark:border-white/5 text-[10px] text-gray-400 text-right">
              Finished at {new Date(campaign.finishedAt).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}
            </div>
          )}
        </div>
      )}

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

        {/* Single Call Trigger */}
        <div className="bg-white dark:bg-[#101c14] border border-gray-200 dark:border-white/10 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500">
          <h2 className="text-xl font-bold uppercase tracking-wide mb-6 pb-4 border-b border-gray-100 dark:border-white/5 text-gray-900 dark:text-white flex items-center justify-between">
            <span>Single Case Trigger</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#E67E22] bg-[#E67E22]/10 px-2 py-0.5 rounded-full border border-[#E67E22]/20">
              Live AI
            </span>
          </h2>

          <form onSubmit={handleSingleTrigger} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Borrower Phone Number</label>
              <input
                type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 p-3 text-sm focus:outline-none focus:border-[#0F5A2A] transition-colors font-mono dark:text-white text-gray-900 rounded-xl"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Borrower Name</label>
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. Rahul Menon"
                  className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 p-3 text-sm focus:outline-none focus:border-[#0F5A2A] transition-colors dark:text-white text-gray-900 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Loan Account No.</label>
                <input type="text" value={loanAccount} onChange={e => setLoanAccount(e.target.value)} placeholder="e.g. HL-98234-K"
                  className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 p-3 text-sm focus:outline-none focus:border-[#0F5A2A] transition-colors dark:text-white text-gray-900 rounded-xl font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Overdue Amount (₹)</label>
                <input type="text" value={amountDue} onChange={e => setAmountDue(e.target.value)} placeholder="e.g. 24,500"
                  className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 p-3 text-sm focus:outline-none focus:border-[#0F5A2A] transition-colors dark:text-white text-gray-900 rounded-xl font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Bank / NBFC Partner</label>
                <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. Federal Bank / HDFC"
                  className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 p-3 text-sm focus:outline-none focus:border-[#0F5A2A] transition-colors dark:text-white text-gray-900 rounded-xl" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Call Context / Negotiation Strategy</label>
              <textarea rows={3} value={context} onChange={e => setContext(e.target.value)}
                placeholder="E.g., Reminder for 3rd overdue EMI payment before NPA classification. Discuss OTS concession if borrower expresses hardship."
                className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 p-3 text-sm focus:outline-none focus:border-[#0F5A2A] transition-colors resize-none dark:text-white text-gray-900 rounded-xl"
              />
            </div>

            <button type="submit" disabled={singleStatus === "loading"}
              className="w-full py-4 bg-[#0F5A2A] text-white font-bold uppercase tracking-wider text-sm hover:bg-[#167a3a] transition-all rounded-2xl flex justify-center items-center gap-2 shadow-lg shadow-[#0F5A2A]/20 disabled:opacity-50">
              {singleStatus === "loading" ? <><Loader2 className="w-5 h-5 animate-spin" /> Dialing Borrower...</> : <><PhoneOutgoing className="w-5 h-5" /> Initiate Recovery Call</>}
            </button>
            {singleStatus === "success" && (
              <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 text-sm flex items-start gap-3 rounded-xl">
                <CheckCircle2 className="w-5 h-5 shrink-0" /><p>{singleMessage}</p>
              </div>
            )}
            {singleStatus === "error" && (
              <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm flex items-start gap-3 rounded-xl">
                <AlertCircle className="w-5 h-5 shrink-0" /><p>{singleMessage}</p>
              </div>
            )}
          </form>

          {/* Recent Campaigns Button */}
          <button onClick={() => { setIsHistoryModalOpen(true); setSelectedHistoryCampaign(null); }}
            className="w-full py-3 mt-4 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider text-xs border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors rounded-2xl flex items-center justify-center gap-2">
            <History className="w-4 h-4 text-[#E67E22]" /> Past Recovery Campaigns
          </button>
        </div>

        {/* Bulk Campaign Upload */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#101c14] border border-gray-200 dark:border-white/10 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500">
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6 pb-4 border-b border-gray-100 dark:border-white/10 text-gray-900 dark:text-white flex items-center justify-between">
              <span>Bulk Portfolio Dialing</span>
              {bulkList.length > 0 && (
                <span className="text-xs bg-[#0F5A2A] text-white px-2.5 py-1 rounded-full font-bold">{bulkList.length} Accounts Loaded</span>
              )}
            </h2>

            {bulkList.length === 0 ? (
              <div onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-white/10 p-8 text-center hover:border-[#0F5A2A] dark:hover:border-emerald-500/50 transition-colors cursor-pointer group rounded-3xl bg-gray-50 dark:bg-black/30">
                <div className="w-12 h-12 bg-gray-200 dark:bg-white/5 mx-auto mb-4 flex items-center justify-center rounded-full group-hover:bg-[#0F5A2A]/10 transition-colors">
                  <FileUp className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-[#0F5A2A]" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Borrower CSV Portfolio</p>
                <p className="text-xs text-gray-500 font-mono">Columns: phone, customer_name, loan_account, amount_due, bank_nbfc, context</p>
              </div>
            ) : (
              <div className="border border-gray-200 dark:border-white/10 rounded-3xl bg-gray-50 dark:bg-black/40 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">{bulkList.length} Borrowers Ready</h3>
                  <button onClick={() => setBulkList([])} className="text-xs font-bold uppercase text-gray-500 hover:text-red-500 transition-colors">
                    Clear All
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto p-2">
                  <ul className="space-y-2">
                    {bulkList.map((row, index) => {
                      const p = row.phone || row.Phone || row.PHONE || row.phone_number || "No phone";
                      const n = row.customer_name || row.name || row.Name || "Unknown";
                      const acc = row.loan_account || row.account_no || "";
                      const amt = row.amount_due || row.amount || "";
                      return (
                        <li key={index} className="flex items-center justify-between p-3 bg-white dark:bg-[#101c14] border border-gray-200 dark:border-white/5 rounded-2xl">
                          <div className="flex flex-col text-left overflow-hidden pr-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{n !== "Unknown" ? n : p}</span>
                            <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500 font-mono">
                              <span>{p}</span>
                              {acc && <span className="bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full text-[10px]">Acc: {acc}</span>}
                              {amt && <span className="text-[#E67E22] font-bold">₹{amt}</span>}
                            </div>
                          </div>
                          <button onClick={() => setBulkList(prev => prev.filter((_, i) => i !== index))}
                            className="p-2 text-gray-400 hover:text-red-500 rounded-xl transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-white/10">
                  <button onClick={() => startCampaign(bulkList)} disabled={isStarting || campaign?.status === "running"}
                    className="w-full py-3 bg-[#0F5A2A] text-white font-bold uppercase tracking-wider text-xs hover:bg-[#167a3a] transition-all flex justify-center items-center gap-2 shadow-md rounded-2xl disabled:opacity-50">
                    {isStarting ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting...</> : <><Play className="w-4 h-4 fill-current" /> Start Sequential Recovery Dialing</>}
                  </button>
                  {campaign?.status === "running" && (
                    <p className="text-center text-xs text-gray-400 mt-2">A recovery campaign is currently active — wait for completion.</p>
                  )}
                </div>
              </div>
            )}

            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

            <button onClick={downloadTemplate}
              className="w-full py-3 mt-4 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider text-xs border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors rounded-2xl flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download Recovery CSV Template
            </button>
          </div>

          <div className="bg-[#0F5A2A]/5 border border-[#0F5A2A]/20 p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0F5A2A]/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            <h3 className="text-xs font-black uppercase tracking-widest text-[#0F5A2A] dark:text-emerald-400 flex items-center gap-2 mb-3 relative z-10">
              <AlertCircle className="w-4 h-4" /> Sequential Recovery Protocol
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium relative z-10">
              Recovery campaigns dial <strong>one borrower at a time</strong>. In strict compliance with <strong>RBI Fair Practices Code</strong>, the engine introduces itself, discloses recording, and captures Promise to Pay (PTP) agreements. Failed calls appear in red with a <strong>Retry Failed</strong> option.
            </p>
          </div>
        </div>
      </div>

      {/* HISTORY MODAL */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-50 dark:bg-[#0A120D] border border-gray-200 dark:border-emerald-950/60 w-full max-w-4xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-[#101c14]">
              <div className="flex items-center gap-4">
                {selectedHistoryCampaign ? (
                   <button onClick={() => setSelectedHistoryCampaign(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                     <ArrowLeft className="w-5 h-5" />
                   </button>
                ) : (
                   <div className="w-9 h-9 rounded-full bg-[#0F5A2A]/10 dark:bg-[#0F5A2A]/20 flex items-center justify-center text-[#0F5A2A] dark:text-emerald-400">
                     <History className="w-5 h-5" />
                   </div>
                )}
                <div>
                  <h2 className="text-lg font-black uppercase tracking-widest text-gray-900 dark:text-white">
                    {selectedHistoryCampaign ? "Campaign Case Details" : "Past Recovery Campaigns"}
                  </h2>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {selectedHistoryCampaign ? new Date(selectedHistoryCampaign.startedAt).toLocaleString() : "Audit logs of bulk outbound recovery runs"}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-black dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#0A120D]">
              {!selectedHistoryCampaign ? (
                // LIST VIEW
                history.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">No past recovery campaigns recorded yet.</div>
                ) : (
                  <div className="space-y-3">
                    {history.map((h: any, i: number) => {
                       const completed = h.contacts?.filter((c: any) => c.status === "done").length || 0;
                       const failed = h.contacts?.filter((c: any) => c.status === "failed").length || 0;
                       return (
                         <div 
                           key={i} 
                           onClick={() => setSelectedHistoryCampaign(h)}
                           className="p-5 border border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#101c14] flex flex-col md:flex-row md:items-center justify-between shadow-sm hover:border-[#0F5A2A]/50 hover:bg-[#0F5A2A]/5 dark:hover:bg-[#0F5A2A]/10 cursor-pointer transition-all group"
                         >
                           <div className="mb-4 md:mb-0">
                             <div className="text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-2 group-hover:text-[#0F5A2A] dark:group-hover:text-emerald-400 transition-colors text-gray-900 dark:text-white">
                               <CheckCircle2 className="w-4 h-4 text-green-500" />
                               PORTFOLIO RUN COMPLETED
                             </div>
                             <div className="text-xs text-gray-500 dark:text-gray-400">
                               Executed on {new Date(h.startedAt).toLocaleString()}
                             </div>
                           </div>
                           <div className="flex gap-6">
                             <div className="text-center min-w-[60px]">
                               <div className="text-xl font-black text-gray-900 dark:text-white">{h.total}</div>
                               <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Borrowers</div>
                             </div>
                             <div className="text-center min-w-[60px]">
                               <div className="text-xl font-black text-green-500">{completed}</div>
                               <div className="text-[10px] text-green-500/70 font-bold uppercase tracking-widest">Completed</div>
                             </div>
                             <div className="text-center min-w-[60px]">
                               <div className="text-xl font-black text-red-500">{failed}</div>
                               <div className="text-[10px] text-red-500/70 font-bold uppercase tracking-widest">Failed/Busy</div>
                             </div>
                           </div>
                         </div>
                       );
                    })}
                  </div>
                )
              ) : (
                // DETAILS VIEW
                <div>
                   <div className="mb-6 grid grid-cols-3 gap-4">
                     <div className="p-4 bg-white dark:bg-[#101c14] border border-gray-200 dark:border-white/10 rounded-2xl">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Total Borrowers</div>
                        <div className="text-2xl font-black text-gray-900 dark:text-white">{selectedHistoryCampaign.total}</div>
                     </div>
                     <div className="p-4 bg-white dark:bg-[#101c14] border border-gray-200 dark:border-white/10 rounded-2xl">
                        <div className="text-[10px] text-green-500 uppercase tracking-widest font-bold mb-1">Connected</div>
                        <div className="text-2xl font-black text-green-500">{selectedHistoryCampaign.contacts?.filter((c:any) => c.status === "done").length}</div>
                     </div>
                     <div className="p-4 bg-white dark:bg-[#101c14] border border-gray-200 dark:border-white/10 rounded-2xl">
                        <div className="text-[10px] text-red-500 uppercase tracking-widest font-bold mb-1">Unreachable</div>
                        <div className="text-2xl font-black text-red-500">{selectedHistoryCampaign.contacts?.filter((c:any) => c.status === "failed").length}</div>
                     </div>
                   </div>

                   <div className="bg-white dark:bg-[#101c14] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
                     <table className="w-full text-left text-sm min-w-[600px]">
                       <thead className="bg-gray-50 dark:bg-black/50 text-xs uppercase tracking-widest text-gray-500 border-b border-gray-200 dark:border-white/10">
                         <tr>
                           <th className="px-6 py-4 font-bold">Borrower Details</th>
                           <th className="px-6 py-4 font-bold">Phone Number</th>
                           <th className="px-6 py-4 font-bold">Status</th>
                           <th className="px-6 py-4 font-bold">Action</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                         {selectedHistoryCampaign.contacts?.map((c: any, idx: number) => {
                           const st = STATUS_BADGE[c.status as keyof typeof STATUS_BADGE] || STATUS_BADGE.queued;
                           return (
                             <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                               <td className="px-6 py-4">
                                 <div className="font-bold text-gray-900 dark:text-white">{c.name || "Unknown"}</div>
                                 <div className="text-xs text-gray-500">
                                   {c.loanAccount ? `Acc: ${c.loanAccount}` : ""}
                                   {c.amountDue ? ` · Due: ₹${c.amountDue}` : ""}
                                 </div>
                               </td>
                               <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs">{c.phone}</td>
                               <td className="px-6 py-4">
                                 <div className="flex flex-col items-start gap-1">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${st.className}`}>
                                      {st.icon} {st.label}
                                    </span>
                                    {c.error && <span className="text-[10px] text-red-500 max-w-[200px] truncate" title={c.error}>{c.error}</span>}
                                 </div>
                               </td>
                               <td className="px-6 py-4">
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); handleInlineRetry(c); }} 
                                   disabled={inlineStatus[c.phone] === 'loading'}
                                   className="px-3 py-1.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors disabled:opacity-50 text-gray-700 dark:text-gray-300"
                                 >
                                   {inlineStatus[c.phone] === 'loading' ? <Loader2 className="w-3 h-3 animate-spin" /> : (inlineStatus[c.phone] === 'success' ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <RotateCcw className="w-3 h-3" />)}
                                   {inlineStatus[c.phone] === 'loading' ? 'Calling...' : (inlineStatus[c.phone] === 'success' ? 'Triggered!' : (c.status === 'failed' ? 'Retry' : 'Call Again'))}
                                 </button>
                               </td>
                             </tr>
                           )
                         })}
                       </tbody>
                     </table>
                   </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
