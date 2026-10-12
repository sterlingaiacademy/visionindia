'use client';
import Papa from 'papaparse';
import { useState, useRef, useEffect } from 'react';
import { Share2, FileImage, UploadCloud, RefreshCw, Plus, X, CheckCircle, AlertCircle, Info, ChevronDown, Activity, LogOut, Edit2, Trash2 } from 'lucide-react';

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState('CREATE');
  const [platform, setPlatform] = useState('whatsapp'); 
  const [metaConnected, setMetaConnected] = useState(false);
  
  // Custom Toast State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  // Audiences & Meta Info
  const [metaInfo, setMetaInfo] = useState<any>(null);
  const [isMetaDropdownOpen, setIsMetaDropdownOpen] = useState(false);
  const [audiences, setAudiences] = useState<any[]>([]);
  const [selectedAudience, setSelectedAudience] = useState('sandbox');
  const [isAudienceModalOpen, setIsAudienceModalOpen] = useState(false);
  const [newAudienceName, setNewAudienceName] = useState('');
  const [newAudienceNumbers, setNewAudienceNumbers] = useState('');
  const [editingAudienceId, setEditingAudienceId] = useState<string | null>(null);
  const [audienceToDelete, setAudienceToDelete] = useState<string | null>(null);

  // WhatsApp State
  const [adBody, setAdBody] = useState("Dear Customer, this is an official reminder from Vision India Financial Solutions regarding your pending loan EMI account. Avoid late penalties and credit score impact by clearing your dues today.");
  const [adFooter, setAdFooter] = useState("");
  const [buttonText, setButtonText] = useState("Pay EMI Online");
  const [buttonUrl, setButtonUrl] = useState("https://visionindiagroup.org");
  
  // Instagram State
  const [igCaption, setIgCaption] = useState("Achieve financial freedom and NPA resolution with Vision India Financial Solutions.\n\n#VisionIndia #FinancialSolutions #DebtResolution #LoanSettlement");
  
  // Shared Media
  const [imageBlob, setImageBlob] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [leads, setLeads] = useState<any[]>([]);

  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [savedDrafts, setSavedDrafts] = useState<any[]>([]);

  const fetchDrafts = async () => {
    try {
      const res = await fetch('/api/meta/campaign/drafts');
      if (res.ok) {
        const data = await res.json();
        setSavedDrafts(data.drafts);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleSaveDraft = async () => {
    const payload = {
      id: currentDraftId,
      platform,
      adBody,
      adFooter,
      buttonText,
      buttonUrl,
      igCaption,
      imageBlob
    };
    try {
      const res = await fetch('/api/meta/campaign/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Draft saved successfully!", "success");
        setCurrentDraftId(data.draft.id);
        fetchDrafts();
      }
    } catch (e) {
      showToast("Failed to save draft", "error");
    }
  };

  const loadDraft = (draft: any) => {
    setPlatform(draft.platform || 'whatsapp');
    setAdBody(draft.adBody || "");
    setAdFooter(draft.adFooter || "");
    setButtonText(draft.buttonText || "Pay EMI Online");
    setButtonUrl(draft.buttonUrl || "https://visionindiagroup.org");
    setIgCaption(draft.igCaption || "");
    setImageBlob(draft.imageBlob || null);
    setCurrentDraftId(draft.id);
    setActiveTab('CREATE');
  };

  const deleteDraft = async (id: string) => {
    try {
      const res = await fetch(`/api/meta/campaign/drafts?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("Draft deleted", "success");
        if (currentDraftId === id) setCurrentDraftId(null);
        fetchDrafts();
      }
    } catch (e) {}
  };


  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  
  const handleConnectMeta = async () => {
    try {
      const res = await fetch('/api/credentials/system');
      const config = await res.json();
      if (!config.META_APP_ID || !config.META_APP_SECRET) {
        showToast("Please enter your Meta credentials in the Account Config tab first!", "error");
        return;
      }
      window.location.href = "/api/meta/oauth/login";
    } catch (error) {
      showToast("Failed to verify Meta configuration.", "error");
    }
  };

  const fetchData = async () => {
    try {
      const leadRes = await fetch('/api/meta/leads');
      if (leadRes.ok) setLeads(await leadRes.json());
    } catch(e) {}
  };

  const fetchAudiences = async () => {
    try {
      const res = await fetch('/api/meta/audiences');
      if (res.ok) {
        const data = await res.json();
        setAudiences(data);
        if (data.length > 0 && !data.find((a:any) => a.id === selectedAudience)) {
          setSelectedAudience(data[0].id);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetch('/api/meta/status').then(res => res.json()).then(data => {
        if (data.connected) {
          setMetaConnected(true);
          setMetaInfo(data);
        }
    }).catch(console.error);

    fetchAudiences();
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const openCreateModal = () => {
    setEditingAudienceId(null);
    setNewAudienceName('');
    setNewAudienceNumbers('');
    setIsAudienceModalOpen(true);
  };

  const openEditModal = (aud: any) => {
    setEditingAudienceId(aud.id);
    setNewAudienceName(aud.name);
    setNewAudienceNumbers(aud.numbers.join('\n'));
    setIsAudienceModalOpen(true);
  };

    const handleDeleteAudience = (id: string) => {
    setAudienceToDelete(id);
  };

  const confirmDeleteAudience = async () => {
    if (!audienceToDelete) return;
    try {
      const res = await fetch(`/api/meta/audiences?id=${audienceToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("Audience deleted", "success");
        if (selectedAudience === audienceToDelete) {
          setSelectedAudience('sandbox');
        }
        fetchAudiences();
      } else {
        showToast("Failed to delete", "error");
      }
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setAudienceToDelete(null);
    }
  };

  
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      complete: (results) => {
        const text = results.data.flat().join(' ');
        const matches = text.match(/\d{10,15}/g) || [];
        if (matches.length > 0) {
          setNewAudienceNumbers(prev => prev + (prev ? '\n' : '') + matches.join('\n'));
          showToast(`Extracted ${matches.length} numbers from CSV!`, 'success');
        } else {
          showToast('No valid phone numbers found in CSV.', 'error');
        }
      }
    });
  };


  const handleSaveAudience = async () => {
    if (!newAudienceName || !newAudienceNumbers) return;
    try {
      const isEditing = !!editingAudienceId;
      const res = await fetch('/api/meta/audiences', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingAudienceId, name: newAudienceName, numbers: newAudienceNumbers })
      });
      if (res.ok) {
        await fetchAudiences();
        setIsAudienceModalOpen(false);
        showToast(isEditing ? "Audience updated" : "Audience created", "success");
      }
    } catch (e) {
      showToast("Failed to save audience", "error");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onload = (ev) => { if (ev.target?.result) setImageBlob(ev.target.result as string); }; reader.readAsDataURL(file); }
  };

  const handlePushCampaign = async () => {
    if (platform === 'whatsapp') {
      const targetAudience = audiences.find(a => a.id === selectedAudience);
      if (!targetAudience || !targetAudience.numbers || targetAudience.numbers.length === 0) {
        showToast("Please select a valid audience with phone numbers.", "error");
        return;
      }
      
      const phoneNumbers = targetAudience.numbers;
      showToast(`Initiating bulk push to ${phoneNumbers.length} contacts...`, "info");
      
      try {
        const res = await fetch('/api/meta/campaign/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumbers, adBody, adFooter, buttonText, buttonUrl })
        });
        const data = await res.json();
        if (res.ok) showToast(data.message, "success");
        else showToast("Error: " + data.error, "error");
      } catch (e) { showToast("Push failed. Check network connection.", "error"); }
    } else {
      showToast(`Initiating Instagram Post...`, "info");
      try {
        const res = await fetch('/api/meta/campaign/ig-push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caption: igCaption, imageUrl: imageBlob || "" })
        });
        const data = await res.json();
        if (res.ok) showToast(data.message, "success");
        else showToast("Error: " + data.error, "error");
      } catch (e) { showToast("Push failed.", "error"); }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-gray-900 dark:text-gray-100 relative">
      
      {/* CUSTOM TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${
            toast.type === 'success' ? 'bg-black dark:bg-white border-zinc-800 dark:border-gray-200 text-white dark:text-black' :
            toast.type === 'error' ? 'bg-red-600 border-red-700 text-white' :
            'bg-black dark:bg-white border-zinc-800 dark:border-gray-200 text-white dark:text-black'
          }`}>
            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {toast.type === 'info' && <Info className="w-5 h-5" />}
            <p className="font-semibold text-sm">{toast.message}</p>
          </div>
        </div>
      )}

      {/* AUDIENCE MODAL */}
        {isAudienceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
            <div className="bg-white dark:bg-black w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-zinc-800">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-900">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{editingAudienceId ? 'Edit Audience' : 'Create New Audience'}</h3>
                <button onClick={() => setIsAudienceModalOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Audience Name</label>
                  <input value={newAudienceName} onChange={e => setNewAudienceName(e.target.value)} placeholder="e.g. October Overdue Leads" className="w-full bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg p-3 outline-none focus:border-emerald-600 transition-colors" />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-xs font-bold text-gray-500 block uppercase tracking-wider">Phone Numbers</label>
                    <label className="cursor-pointer text-xs font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-1.5 transition-colors bg-emerald-600/10 px-3 py-1.5 rounded-full">
                      <UploadCloud className="w-3.5 h-3.5" /> Upload CSV
                      <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" className="hidden" onChange={handleCsvUpload} />
                    </label>
                  </div>
                  <textarea value={newAudienceNumbers} onChange={e => setNewAudienceNumbers(e.target.value)} rows={6} placeholder="919876543210&#10;918765432109" className="w-full bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg p-3 outline-none focus:border-emerald-600 transition-colors font-mono text-sm" />
                </div>
                <button onClick={handleSaveAudience} className="w-full bg-[#0F5A2A] hover:bg-[#0c4821] text-white font-bold py-3.5 rounded-lg transition-colors shadow-lg shadow-emerald-950/20">
                  {editingAudienceId ? 'Save Changes' : 'Create Audience'}
                </button>
              </div>
            </div>
          </div>
        )}

      <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">Campaign Manager</h1>
          <p className="text-gray-500 dark:text-zinc-400">Create WhatsApp & Instagram campaigns, manage audiences, and trigger AI outbound calls.</p>
        </div>

        <div className="relative z-50">
          {metaConnected && metaInfo ? (
            <div className="relative">
              <button 
                onClick={() => setIsMetaDropdownOpen(!isMetaDropdownOpen)}
                className="group flex items-center gap-3 px-4 py-2.5 rounded-lg font-bold border border-gray-300 dark:border-zinc-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors text-sm shadow-sm">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-gray-900 dark:text-white leading-tight">Meta Connected</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-zinc-400 transition-transform duration-300 ${isMetaDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isAudienceModalOpen === false && isMetaDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0a0a0a] rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-900 flex items-center justify-center border border-gray-200 dark:border-zinc-800">
                        <Share2 className="w-4 h-4 text-gray-700 dark:text-zinc-300" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">API Active</h4>
                        <p className="text-[10px] text-green-600 dark:text-green-500 font-bold uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Token Verified
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-1">
                    <div className="px-3 py-2 text-xs text-gray-500 dark:text-zinc-400 flex justify-between items-center border-b border-gray-100 dark:border-zinc-800/50">
                      <span className="font-medium uppercase tracking-wider text-[10px]">Last Sync</span>
                      <span className="font-mono text-gray-900 dark:text-white">{new Date(metaInfo.connected_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="px-3 py-2 text-xs text-gray-500 dark:text-zinc-400 flex justify-between items-center">
                      <span className="font-medium uppercase tracking-wider text-[10px]">Access</span>
                      <span className="text-gray-900 dark:text-white">Ads, WA</span>
                    </div>
                  </div>
                  <div className="p-1 flex bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-zinc-800">
                    <button onClick={() => { fetchAudiences(); fetchData(); }} className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 text-xs font-bold text-gray-700 dark:text-zinc-300 transition-colors">
                      <RefreshCw className="w-3 h-3" /> Refresh
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-bold text-red-600 transition-colors">
                      <LogOut className="w-3 h-3" /> Unlink
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={handleConnectMeta}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold border border-gray-300 dark:border-zinc-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors text-sm shadow-sm text-gray-900 dark:text-white">
              <Share2 className="w-4 h-4" /> Connect Meta
            </button>
          )}
        </div>
      </div>

                      <div className="flex gap-6 mb-8 border-b border-gray-200 dark:border-zinc-800">
          <button onClick={() => setActiveTab('CREATE')} className={`pb-4 text-sm font-bold tracking-wider ${activeTab === 'CREATE' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white transition-colors'}`}>AD & TEMPLATE CREATOR</button>
          <button onClick={() => setActiveTab('DRAFTS')} className={`pb-4 text-sm font-bold tracking-wider ${activeTab === 'DRAFTS' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white transition-colors'}`}>SAVED DRAFTS</button>
          <button onClick={() => setActiveTab('LEADS')} className={`pb-4 text-sm font-bold tracking-wider flex items-center gap-2 ${activeTab === 'LEADS' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white transition-colors'}`}>
            FETCHED LEADS <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full">NEW</span>
          </button>
        </div>

      {activeTab === 'CREATE' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <div className="space-y-6">
            <div className="bg-gray-100 dark:bg-zinc-900/50 p-2 rounded-xl flex gap-2 border border-gray-200 dark:border-zinc-800">
              <button 
                onClick={() => setPlatform('whatsapp')}
                className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${platform === 'whatsapp' ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-zinc-700' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'}`}>
                WhatsApp Broadcast
              </button>
              <button 
                onClick={() => setPlatform('instagram')}
                className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${platform === 'instagram' ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-zinc-700' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'}`}>
                Instagram Post
              </button>
            </div>

            {platform === 'whatsapp' && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target Audience</label>
                  <button onClick={openCreateModal} className="text-emerald-600 text-xs font-bold flex items-center gap-1 hover:underline"><Plus className="w-3 h-3"/> Create Group</button>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={selectedAudience} 
                    onChange={(e) => setSelectedAudience(e.target.value)}
                    className="flex-1 bg-white dark:bg-black border border-gray-300 dark:border-zinc-800 rounded-lg p-3.5 outline-none focus:border-emerald-600 transition-colors shadow-sm text-sm"
                  >
                    {audiences.map((aud) => (
                      <option key={aud.id} value={aud.id}>{aud.name} ({aud.numbers.length} contacts)</option>
                    ))}
                  </select>
                  
                  {selectedAudience && (
                    <>
                      <button 
                        onClick={() => openEditModal(audiences.find(a => a.id === selectedAudience))}
                        className="px-4 border border-gray-300 dark:border-zinc-800 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-500 dark:text-gray-400"
                        title="Edit Audience"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteAudience(selectedAudience)}
                        className="px-4 border border-gray-300 dark:border-zinc-800 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 transition-colors text-gray-500 dark:text-gray-400"
                        title="Delete Audience"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{platform === 'instagram' ? 'POST IMAGE (REQUIRED)' : 'BANNER IMAGE'}</label>
              <div 
                className="border-2 border-dashed border-gray-300 dark:border-zinc-800 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 dark:hover:border-zinc-600 transition-colors bg-gray-50 dark:bg-zinc-900/30 group relative overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {imageBlob ? (
                  <img src={imageBlob} alt="Preview" className="w-full h-48 object-cover rounded-lg opacity-80 group-hover:opacity-40 transition-opacity" />
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <FileImage className="w-8 h-8 text-gray-400 dark:text-zinc-600 mb-3" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Click or drag & drop to upload</p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Recommended: 1080x1080px (JPG/PNG)</p>
                  </div>
                )}
                {imageBlob && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><UploadCloud className="w-8 h-8 text-gray-900 dark:text-white" /></div>}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
            </div>

            {platform === 'whatsapp' ? (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">MESSAGE BODY</label>
                  <textarea value={adBody} onChange={e => setAdBody(e.target.value)} rows={4} className="bg-white dark:bg-black border border-gray-300 dark:border-zinc-800 rounded-lg p-3 outline-none focus:border-emerald-600 transition-colors resize-none shadow-sm" />
                </div>
                <div className="p-5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 mb-2"><Share2 className="w-4 h-4 text-gray-400 dark:text-zinc-500" /><h3 className="font-bold text-sm text-gray-600 dark:text-zinc-400 uppercase">INTERACTIVE CTA BUTTON</h3></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-bold text-gray-500 mb-1 block">Button Text</label><input type="text" value={buttonText} onChange={e => setButtonText(e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-3 text-sm outline-none" /></div>
                    <div><label className="text-xs font-bold text-gray-500 mb-1 block">Redirect URL</label><input type="text" value={buttonUrl} onChange={e => setButtonUrl(e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-3 text-sm outline-none" /></div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">INSTAGRAM CAPTION</label>
                <textarea value={igCaption} onChange={e => setIgCaption(e.target.value)} rows={6} className="bg-white dark:bg-black border border-gray-300 dark:border-zinc-800 rounded-lg p-3 outline-none focus:border-emerald-600 transition-colors resize-none shadow-sm" placeholder="Write a caption for your post..." />
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button onClick={handleSaveDraft} className="flex-1 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-white py-3.5 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors">Save Draft</button>
              <button onClick={handlePushCampaign} className="flex-1 py-3.5 rounded-lg font-bold transition-colors bg-[#0F5A2A] text-white hover:bg-[#0c4821]">
                {platform === 'whatsapp' ? 'Push Bulk Campaign' : 'Post to Instagram'}
              </button>
            </div>
          </div>

          <div className="flex justify-center items-start lg:sticky lg:top-8 pt-8">
            <div className="w-[320px] bg-white dark:bg-[#0b141a] border-[8px] border-gray-900 dark:border-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 dark:bg-black z-20 rounded-b-3xl mx-24 flex items-center justify-center">
                <div className="w-12 h-1 bg-gray-700 dark:bg-zinc-800 rounded-full"></div>
              </div>
              
              {platform === 'whatsapp' ? (
                <>
                  <div className="bg-[#0F5A2A] pt-12 pb-4 px-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><Share2 className="w-5 h-5 text-white" /></div>
                    <div><h4 className="font-bold text-white text-sm">Vision India Recovery</h4><p className="text-xs text-white/70">Verified Financial Desk</p></div>
                  </div>
                  <div className="p-4 h-[500px] overflow-y-auto bg-[#efeae2] dark:bg-[#0b141a]">
                    <div className="bg-white dark:bg-[#202c33] rounded-lg p-1 max-w-[90%] shadow-md">
                      {imageBlob ? (
                        <img src={imageBlob} alt="Ad" className="w-full h-40 object-cover rounded-t-md mb-2" />
                      ) : (
                        <div className="w-full h-40 bg-gray-200 dark:bg-zinc-800 rounded-t-md mb-2 flex items-center justify-center"><FileImage className="w-8 h-8 text-gray-400 dark:text-zinc-600" /></div>
                      )}
                      <div className="px-2 pb-2">
                        <p className="text-gray-800 dark:text-[#e9edef] text-sm whitespace-pre-wrap">{adBody}</p>
                        <p className="text-gray-400 dark:text-zinc-500 text-[10px] mt-2">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                      <div className="border-t border-gray-100 dark:border-zinc-700/50 mt-1">
                        <button className="w-full py-2.5 text-[#0F5A2A] dark:text-[#38bdf8] text-sm font-bold flex items-center justify-center gap-2">
                          <Share2 className="w-4 h-4" /> {buttonText}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white dark:bg-black pt-12 pb-3 px-4 flex items-center gap-3 border-b border-gray-200 dark:border-zinc-800">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-zinc-800 rounded-full"></div>
                    <div><h4 className="font-bold text-gray-900 dark:text-white text-sm">visionindia_financial</h4></div>
                  </div>
                  <div className="bg-white dark:bg-black h-[500px] overflow-y-auto pb-8">
                    {imageBlob ? (
                      <img src={imageBlob} alt="Post" className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="w-full aspect-square bg-gray-100 dark:bg-zinc-900 flex items-center justify-center"><FileImage className="w-12 h-12 text-gray-300 dark:text-zinc-800" /></div>
                    )}
                    <div className="p-3">
                      <p className="text-gray-800 dark:text-white text-sm"><span className="font-bold mr-2 text-gray-900 dark:text-white">visionindia_financial</span><span className="whitespace-pre-wrap">{igCaption}</span></p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      
      {activeTab === 'DRAFTS' && (
        <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Saved Campaigns</h2>
              <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Manage your saved ad templates and drafts.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedDrafts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500 dark:text-zinc-500">
                No saved drafts yet. Create an ad and click "Save Draft".
              </div>
            ) : (
              savedDrafts.map(draft => (
                <div key={draft.id} className="border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black rounded-xl overflow-hidden group">
                  {draft.imageBlob ? (
                    <img src={draft.imageBlob} className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 dark:bg-zinc-900 flex items-center justify-center"><FileImage className="w-8 h-8 text-gray-300 dark:text-zinc-700" /></div>
                  )}
                  <div className="p-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">{draft.platform}</span>
                    <p className="mt-3 text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{draft.platform === 'whatsapp' ? draft.adBody : draft.igCaption}</p>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => loadDraft(draft)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold rounded transition-colors">Edit & Push</button>
                      <button onClick={() => deleteDraft(draft.id)} className="px-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'LEADS' && (
        <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Captured WhatsApp Leads</h2>
              <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Live feed of customers who interact with your ads.</p>
            </div>
            <button 
              onClick={() => window.location.href = '/dashboard/outbound'}
              className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-lg">
              Export to AI Caller
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-black">
            <table className="w-full text-left">
              <thead className="bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                <tr><th className="p-4">Customer</th><th className="p-4">Phone Number</th><th className="p-4">Action Taken</th><th className="p-4 text-right">Time</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 text-sm">
                {leads.length > 0 ? leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-white dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4 font-medium">{lead.name}</td>
                    <td className="p-4 font-mono text-gray-600 dark:text-zinc-300">{lead.phone}</td>
                    <td className="p-4"><span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-200 dark:border-green-900/50">{lead.status}</span></td>
                    <td className="p-4 text-right text-gray-500 dark:text-zinc-500">{new Date(lead.time).toLocaleTimeString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500 dark:text-zinc-500 flex flex-col items-center gap-3"><RefreshCw className="w-6 h-6 animate-spin opacity-20" /> Listening for live webhooks...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {audienceToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#050505] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4">Delete Audience</h2>
            <p className="text-sm text-gray-400 mb-6">Are you sure you want to delete this audience group? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setAudienceToDelete(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-xs rounded-lg transition-colors">Cancel</button>
              <button onClick={confirmDeleteAudience} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-xs rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







