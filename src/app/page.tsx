"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, PhoneCall, Bot, BarChart3, Globe, Database, CalendarCheck, FileAudio, Users, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";

const liveCallVariants = [
  '"I am calling regarding the overdue EMI on Loan Acc HL-98234-K."',
  '"Can I request an OTS settlement discount for my business loan?"',
  '"I can make a partial payment of ₹25,000 this Friday."',
  '"Please send me the official bank payment link on WhatsApp."'
];

const crmVariants = [
  { lead: "Rahul Menon", status: "PTP Recorded (18th Oct)" },
  { lead: "Anjali Nair", status: "OTS Request Forwarded" },
  { lead: "Priya Sharma", status: "Payment Confirmed (₹18,200)" },
  { lead: "Vikram Reddy", status: "SARFAESI Notice Advised" }
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [variantIndex, setVariantIndex] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight - 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVariantIndex((prev) => (prev + 1) % liveCallVariants.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const yHero = useTransform(scrollYProgress, [0, 0.2], ["0%", "50%"]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="bg-[#0A120D] text-foreground min-h-screen font-sans selection:bg-[#0F5A2A] selection:text-white transition-colors duration-300" ref={containerRef}>
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 transition-all duration-500 pointer-events-none ${
        scrolled ? 'py-3 md:py-4 bg-[#0A120D]/90 backdrop-blur-lg shadow-sm border-b border-white/5' : 'py-4 md:py-6 bg-transparent'
      }`}>
        <div className="flex items-center gap-3 pointer-events-auto">
          <img src="/logo.png" alt="Vision India Financial Solutions" className="h-[45px] md:h-[65px] w-auto object-contain transition-all drop-shadow-md brightness-110" />
        </div>

        <div className="flex items-center gap-4 md:gap-6 pointer-events-auto">
          <div className="hidden lg:flex gap-8 mr-4 text-xs font-bold tracking-widest uppercase">
            <Link href="#features" className="text-white/80 hover:text-white transition-colors">Capabilities</Link>
            <Link href="#call-flow" className="text-white/80 hover:text-white transition-colors">Recovery Flow</Link>
          </div>
          
          <ThemeToggle className="text-white hover:bg-white/20" />
          
          <Link href="/login" className="px-4 md:px-6 py-2.5 bg-[#0F5A2A] text-white font-bold text-[10px] md:text-sm uppercase tracking-widest hover:bg-[#0c4821] transition-colors rounded-lg shadow-lg border border-emerald-500/30">
            <span>Recovery Desk Login</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ y: yHero, opacity: opacityHero }}
          className="absolute inset-0 z-0 bg-[#0A120D]"
        >
          <div className="absolute inset-0 bg-radial from-[#0F5A2A]/25 via-[#0A120D]/90 to-[#0A120D] z-10" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />
        </motion.div>

        <div className="relative z-20 text-center px-4 md:px-6 max-w-5xl mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Autonomous NPA & Debt Resolution Platform
            </div>
            <h1 className="text-4xl md:text-7xl font-bold uppercase tracking-tighter mb-4 md:mb-6 text-white drop-shadow-lg">
              Next-Gen AI Voice <br/>
              <span className="text-emerald-400">Recovery & Debt Desk</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-300 mb-8 md:mb-10 max-w-3xl mx-auto font-light drop-shadow-md">
              Empowering 50+ Banks & NBFCs with intelligent, empathetic, and RBI-compliant Voice AI for retail loan collections, PTP tracking, and NPA resolution.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-[#0F5A2A] text-white font-bold uppercase tracking-widest hover:bg-[#0c4821] transition-all rounded-xl shadow-2xl group text-xs md:text-base border border-emerald-400/30"
              >
                <span>Access Recovery CRM</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#features" 
                className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white/10 text-white font-bold uppercase tracking-widest hover:bg-white/20 transition-all rounded-xl backdrop-blur-md text-xs md:text-base border border-white/10"
              >
                <span>Explore Capabilities</span>
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center opacity-70">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white mb-4">Scroll to explore</span>
          <div className="w-px h-16 bg-gradient-to-b from-white to-emerald-500" />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 md:py-24 bg-transparent relative z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-16 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter text-white">Enterprise <span className="text-emerald-400">Recovery Stack</span></h2>
            <p className="text-gray-400 mt-3 text-sm md:text-base">Built to handle high-volume retail debt portfolios, SARFAESI coordination, and early-bucket collections.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard 
              icon={<PhoneCall className="w-8 h-8 text-emerald-400" />}
              title="24/7 Borrower Inbound"
              description="Instantly verify borrower identities, address EMI queries, explain overdue breakdowns, and record repayment intent."
            />
            <FeatureCard 
              icon={<Bot className="w-8 h-8 text-emerald-400" />}
              title="Automated Outbound Calling"
              description="Run bulk recovery outreach across Federal Bank, HDFC, Muthoot, and SBI portfolios with dynamic loan context."
            />
            <FeatureCard 
              icon={<Globe className="w-8 h-8 text-emerald-400" />}
              title="Multilingual Mastery"
              description="Communicate naturally in Malayalam, English, Hindi, Tamil, and Kannada for pan-India and regional collections."
            />
            <FeatureCard 
              icon={<Database className="w-8 h-8 text-emerald-400" />}
              title="Loan Core CRM Sync"
              description="Automatically log PTP dates, partial settlements, call summaries, and customer dispositions straight to CRM."
            />
            <FeatureCard 
              icon={<CalendarCheck className="w-8 h-8 text-emerald-400" />}
              title="PTP & Settlement Tracking"
              description="Lock in Promise-to-Pay schedules, send instant payment gateway links, and route One-Time-Settlement (OTS) approvals."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-emerald-400" />}
              title="RBI Compliant & Audit Ready"
              description="Strict adherence to fair recovery practices, recording archives, call window restrictions, and audit trails."
            />
          </div>
        </div>
      </section>

      {/* Deep Dive Section */}
      <section className="py-24 bg-transparent relative z-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter mb-6 text-white">Maximized <span className="text-emerald-400">NPA Resolution</span></h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Manual tele-calling suffers from inconsistent tone, limited hours, and poor follow-up hygiene. Vision India&apos;s AI Voice Agents contact delinquent borrowers at scale, engage with empathetic yet firm negotiation, and secure verified payment commitments.
            </p>
            <ul className="space-y-4 mb-10">
              {["100% Portfolio Reach in Hours, Not Weeks", "Dynamic Loan Account & Amount Due Injection", "Automated WhatsApp Payment Link Dispatch", "Seamless Escalation to Senior Legal / Recovery Managers"].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <span className="font-medium text-gray-200">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative h-[550px] w-full"
          >
             {/* The Card Background */}
             <div className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-[#101c14] via-[#0A120D] to-[#050906] flex flex-col items-center justify-center p-8">
               <div className="absolute inset-0 bg-radial from-emerald-500/15 via-transparent to-transparent pointer-events-none" />
               <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 shadow-2xl shadow-emerald-950/50">
                 <ShieldCheck className="w-12 h-12 text-emerald-400" />
               </div>
               <h3 className="text-xl font-bold uppercase tracking-wider text-white mb-2">Vision India Voice AI</h3>
               <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">RBI-Compliant • 50+ Portfolios Supported</p>
             </div>
             
             {/* Floating UI Element 1 */}
             <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
               className="absolute left-2 md:-left-10 top-8 md:top-1/4 bg-[#101c14]/90 backdrop-blur-2xl border border-white/10 p-4 md:p-5 rounded-2xl shadow-2xl z-20 w-[90%] md:w-72 max-w-sm"
             >
                <div className="flex items-center gap-3 mb-2 md:mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-xs uppercase font-bold text-gray-300">Live Recovery Voice AI</span>
                </div>
                <div className="min-h-[2.5rem] flex items-center">
                  <motion.p 
                    key={`live-${variantIndex}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs md:text-sm font-medium text-white leading-relaxed"
                  >
                    {liveCallVariants[variantIndex]}
                  </motion.p>
                </div>
             </motion.div>

             {/* Floating UI Element 2 */}
             <motion.div 
               animate={{ y: [0, 10, 0] }}
               transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
               className="absolute right-2 md:-right-10 bottom-8 md:bottom-1/4 bg-[#0F5A2A]/90 backdrop-blur-2xl border border-emerald-400/30 p-4 md:p-5 rounded-2xl shadow-2xl z-20 w-[80%] md:w-60 max-w-sm text-white"
             >
                <div className="text-[10px] font-bold tracking-widest uppercase mb-1 opacity-80 text-emerald-200">Recovery Status</div>
                <motion.div
                  key={`crm-${variantIndex}`}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="font-bold text-base line-clamp-1">{crmVariants[variantIndex].lead}</div>
                  <div className="text-xs mt-1 text-emerald-200 line-clamp-1 font-semibold">{crmVariants[variantIndex].status}</div>
                </motion.div>
             </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Proposed Call Flow */}
      <section id="call-flow" className="py-16 md:py-32 bg-transparent relative z-20">
        <div className="max-w-7xl mx-auto px-6 md:px-16 text-center mb-12 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter text-white">Resolution <span className="text-emerald-400">Call Flow</span></h2>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <div className="bg-[#101c14]/80 backdrop-blur-2xl border border-white/10 p-6 md:p-8 relative shadow-2xl rounded-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
            <h3 className="text-xl md:text-2xl font-bold uppercase tracking-widest mb-8 md:mb-10 text-center text-emerald-400">Inbound Borrower Helpdesk</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-emerald-500/50 before:to-transparent">
              <FlowStep title="Borrower Calls In" />
              <FlowStep title="Voice AI Answers Immediately" />
              <FlowStep title="Authenticates Loan Account / DOB" />
              <FlowStep title="Presents Outstanding Dues & Breakdown" />
              <FlowStep title="Negotiates PTP or OTS Terms" />
              <FlowStep title="Sends Instant Payment Link on WhatsApp" />
              <FlowStep title="Recovery CRM Updated" isLast />
            </div>
          </div>
          
          <div className="bg-[#101c14]/80 backdrop-blur-2xl border border-white/10 p-6 md:p-8 relative shadow-2xl rounded-2xl overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
             <h3 className="text-xl md:text-2xl font-bold uppercase tracking-widest mb-8 md:mb-10 text-center text-emerald-400">Outbound NPA Outreach</h3>
             <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-emerald-500/50 before:to-transparent">
               <FlowStep title="Bank/NBFC Portfolio Ingestion" />
               <FlowStep title="Voice AI Triggers High-Speed Calls" />
               <FlowStep title="Conversational Verification & Tone" />
               <FlowStep title="Payment Commitment / Settlement Offer" />
               <FlowStep title="Promise-to-Pay (PTP) Timestamped" />
               <FlowStep title="Payment Link Dispatched" />
               <FlowStep title="Audit Logs & Recording Saved" isLast />
             </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-20 md:py-32 bg-[#050906] text-center relative overflow-hidden z-20 border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A120D] via-[#050906] to-[#0A120D] z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-30 max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter mb-6 text-white drop-shadow-md">Transform Your NPA & Retail Recovery</h2>
          <p className="text-gray-300 text-lg mb-10 drop-shadow-md">Access the Vision India admin console to launch portfolio campaigns, track real-time PTP rates, and listen to compliant borrower recordings.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-10 py-5 bg-[#0F5A2A] text-white font-bold text-lg uppercase tracking-widest hover:bg-[#0c4821] transition-colors rounded-xl shadow-2xl border border-emerald-400/30">
            <span>Enter Recovery Console</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="bg-[#101c14]/80 backdrop-blur-xl p-8 border border-white/5 hover:border-emerald-500/50 shadow-xl transition-all duration-300 group relative overflow-hidden rounded-2xl"
    >
      <div className="mb-6 bg-white/5 w-16 h-16 flex items-center justify-center rounded-xl group-hover:bg-emerald-500/10 transition-colors relative z-10">
        {icon}
      </div>
      <h4 className="text-xl font-bold uppercase tracking-wide mb-3 relative z-10 text-white">{title}</h4>
      <p className="text-gray-400 leading-relaxed text-sm relative z-10">{description}</p>
    </motion.div>
  );
}

function FlowStep({ title, isLast = false }: { title: string, isLast?: boolean }) {
  return (
    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active z-10">
      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#101c14] bg-[#0F5A2A] text-white shadow-lg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-20 backdrop-blur-md" />
      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/5 backdrop-blur-md p-4 border border-white/5 group-hover:border-emerald-500/50 transition-all duration-300 rounded-xl shadow-md hover:shadow-xl">
        <h4 className="font-bold text-sm uppercase tracking-wide text-white">{title}</h4>
      </div>
    </div>
  );
}
