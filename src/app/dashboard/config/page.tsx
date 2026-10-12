"use client";

import { useState, useEffect } from "react";
import { Settings, User, Lock, Bot, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ConfigPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [sysStatus, setSysStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [sysMessage, setSysMessage] = useState("");

  useEffect(() => {
    fetch('/api/credentials/system')
      .then(r => r.json())
      .then(data => {
        if (!data.error) setConfigValues(data);
      })
      .catch(() => {});
  }, []);

  const handleConfigChange = (key: string, value: string) => {
    setConfigValues(prev => ({ ...prev, [key]: value }));
  };

  const handleUpdateSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSysStatus("loading");
    
    try {
      const res = await fetch("/api/credentials/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configValues)
      });
      
      if (res.ok) {
        setSysStatus("success");
        setSysMessage("System Integrations saved successfully!");
        setTimeout(() => setSysStatus("idle"), 5000);
      } else {
        setSysStatus("error");
        setSysMessage("Failed to update system config.");
      }
    } catch (e: any) {
      setSysStatus("error");
      setSysMessage("Network error occurred.");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setStatus("error");
      setMessage("Username and password are required.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    
    try {
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus("success");
        setMessage("Credentials updated successfully! You can now use these to log in.");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to update credentials.");
      }
    } catch (e: any) {
      setStatus("error");
      setMessage(e.message || "Network error occurred.");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-[#F8F9FA] dark:bg-black">
      <div className="mb-12 animate-fade-up">
        <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2 text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">Account Configuration</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Manage your system settings and secure access.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
          
          {/* Dashboard Credentials Settings */}
          <div className="group bg-white dark:bg-[#050505] border border-gray-100 dark:border-white/5 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-32 -mt-32 transition-transform group-hover:scale-150 duration-700 pointer-events-none" />
            
            <h2 className="text-xl font-bold uppercase tracking-widest mb-8 text-gray-800 dark:text-gray-200 flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <span>Admin Credentials</span>
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4 relative z-10">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pl-2">New Username</label>
                <div className="flex relative">
                  <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter new username"
                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 py-2.5 pl-11 pr-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pl-2">New Password</label>
                <div className="flex relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 py-2.5 pl-11 pr-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pl-2">Confirm New Password</label>
                <div className="flex relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 py-2.5 pl-11 pr-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="w-full py-3 bg-[#0F5A2A] hover:bg-[#0c4821] text-white font-extrabold uppercase tracking-widest text-sm transition-all duration-300 flex justify-center items-center gap-3 rounded-2xl shadow-lg hover:shadow-emerald-900/40 hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:hover:-translate-y-0 disabled:hover:shadow-none"
                >
                  {status === 'loading' ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...</>
                  ) : (
                    "Update Credentials"
                  )}
                </button>
              </div>
              
              {status === 'success' && (
                <div className="p-4 rounded-xl text-sm font-medium bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 border border-green-500/20 flex items-start gap-3 mt-4 animate-pop">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <p>{message}</p>
                </div>
              )}
              
              {status === 'error' && (
                <div className="p-4 rounded-xl text-sm font-medium bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-500/20 flex items-start gap-3 mt-4 animate-pop">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{message}</p>
                </div>
              )}
            </form>
          </div>

          {/* System API & Integrations Settings */}
          <div className="group bg-white dark:bg-[#050505] border border-gray-100 dark:border-white/5 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden mt-8">
            <h2 className="text-xl font-bold uppercase tracking-widest mb-8 text-gray-800 dark:text-gray-200 flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-blue-600"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </div>
              <span>Platform Integrations</span>
            </h2>
            <form onSubmit={handleUpdateSystem} className="space-y-6 relative z-10">
              
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-200 dark:border-white/10 pb-2">Meta (WhatsApp & Instagram)</h4>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pl-2">App ID</label>
                  <input type="text" value={configValues.META_APP_ID || ''} onChange={(e) => handleConfigChange('META_APP_ID', e.target.value)} placeholder="e.g. 1405743091375589" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 py-2.5 px-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all duration-300 font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pl-2">App Secret</label>
                  <input type="password" value={configValues.META_APP_SECRET || ''} onChange={(e) => handleConfigChange('META_APP_SECRET', e.target.value)} placeholder="Enter App Secret" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 py-2.5 px-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all duration-300 font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pl-2">WhatsApp Phone Number ID</label>
                  <input type="text" value={configValues.META_PHONE_NUMBER_ID || ''} onChange={(e) => handleConfigChange('META_PHONE_NUMBER_ID', e.target.value)} placeholder="e.g. 112233445566778" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 py-2.5 px-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all duration-300 font-mono" />
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" disabled={sysStatus === 'loading'} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase tracking-widest text-sm transition-all duration-300 flex justify-center items-center gap-3 rounded-2xl shadow-lg hover:shadow-blue-600/40 hover:-translate-y-1 active:scale-95 disabled:opacity-50">
                  {sysStatus === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save All Integrations"}
                </button>
              </div>
              {sysStatus === 'success' && <div className="p-4 rounded-xl text-sm font-medium bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 border border-green-500/20 flex items-start gap-3 mt-4"><CheckCircle2 className="w-5 h-5 shrink-0" /><p>{sysMessage}</p></div>}
              {sysStatus === 'error' && <div className="p-4 rounded-xl text-sm font-medium bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-500/20 flex items-start gap-3 mt-4"><AlertCircle className="w-5 h-5 shrink-0" /><p>{sysMessage}</p></div>}
            </form>
          </div>
        </div>

        <div className="space-y-8 animate-fade-up" style={{ animationDelay: '200ms' }}>
          {/* Agent Settings Note */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:rotate-12 pointer-events-none">
              <Bot className="w-32 h-32 text-emerald-500" />
            </div>

            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2 mb-3 relative z-10">
              <Settings className="w-4 h-4 animate-[spin_4s_linear_infinite]" />
              AI Behavior Profile
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium relative z-10">
              The internal AI logic, prompting guardrails, and acoustic model parameters are securely locked. To request changes to the conversational AI behavior, please contact your account manager.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
