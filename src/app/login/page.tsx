"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        // Cookie is now set server-side by /api/login — just redirect
        window.location.href = "/dashboard";
      } else {
        setError(true);
        setIsLoading(false);
      }
    } catch (err) {
      setError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0A120D] font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 right-1/4 w-[600px] h-[400px] bg-[#0F5A2A]/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#0A120D]/60 to-[#0A120D]" />
      </div>

      {/* Back Button */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="text-white/60 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors">
          ← Back to Site
        </Link>
      </div>

      {/* Login Form Container */}
      <div className="relative z-10 w-full max-w-md p-6 md:p-10 mx-4 backdrop-blur-xl bg-black/40 border border-white/10 shadow-2xl rounded-sm">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Vision India Logo" className="h-[70px] w-auto object-contain drop-shadow-xl" />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-white uppercase tracking-widest">
            Vision India Recovery Desk
          </h1>
          <p className="text-[10px] text-[#E67E22] font-bold uppercase tracking-widest mt-1">
            Voice AI & NPA Resolution CRM
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-mahindra-red/20 border border-mahindra-red text-white text-sm text-center py-3 px-4 rounded-sm animate-pulse">
              Invalid credentials.
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-widest mb-2">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(false); }}
              className="w-full bg-white/5 border border-white/20 text-white rounded-sm px-4 py-3 focus:outline-none focus:border-mahindra-red focus:bg-white/10 transition-all placeholder:text-gray-500 font-mono"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-widest mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className="w-full bg-white/5 border border-white/20 text-white rounded-sm px-4 py-3 focus:outline-none focus:border-mahindra-red focus:bg-white/10 transition-all placeholder:text-gray-500 font-mono"
              placeholder="Enter password"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 bg-mahindra-red text-white font-bold text-sm uppercase tracking-widest hover:bg-[#cc0000] transition-colors skew-x-[-10deg] shadow-lg flex justify-center group disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <span className="skew-x-[10deg] transition-transform flex items-center gap-2">
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</>
                ) : (
                  "Secure Login"
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
