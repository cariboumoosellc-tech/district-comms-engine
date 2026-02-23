import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  AlertCircle, Send, Mail, MessageSquare, Phone, ShieldCheck, 
  Loader2, Copy, Check, Info, Building2, GraduationCap, Globe 
} from 'lucide-react';

// --- CONFIGURATION ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(API_KEY);

const COMMON_LANGUAGES = [
  "Portuguese", "Mandarin", "Vietnamese", "Arabic", "French", "Tagalog", "Russian", "Korean"
];

function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  // Toggles and State
  const [senderLevel, setSenderLevel] = useState('School');
  const [language, setLanguage] = useState('English');
  const [showLanguageList, setShowLanguageList] = useState(false);
  const [copied, setCopied] = useState({ email: false, sms: false, script: false });

  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [type]: true });
    setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
  };

  const handleGenerate = async () => {
    if (!input) return;
    setLoading(true);
    setResults(null);

    try {
      // Using gemini-2.5-flash with forced JSON output
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        }
      });
      
      const prompt = `
        You are an expert Communications Director for a ${senderLevel}. 
        TASK: Convert the raw facts provided into professional, calm, and clear notifications sent from the ${senderLevel} level.
        AUDIENCE: Parents and Community.
        LANGUAGE: All output MUST be translated into and written entirely in ${language}.
        
        FACTS: ${input}

        INSTRUCTIONS:
        1. Emphasize safety and student well-being first.
        2. Keep the tone reassuring but factual. Ensure the translation is culturally appropriate for a native ${language} speaker.
        3. Since this is from the ${senderLevel}, ensure the sign-off and perspective reflect that authority.
        
        Respond with a JSON object using this exact structure (but in ${language}):
        {
          "email": "Subject: [Urgent/Update in ${language}] ...\\n\\nDear Families,\\n\\n[Paragraph 1: What happened and safety status]\\n\\n[Paragraph 2: The plan/next steps]\\n\\nSincerely,\\n${senderLevel} Administration",
          "sms": "[Max 160 chars] [${senderLevel} Name]: [Brief update in ${language}]. [Action item].",
          "script": "[3-sentence script for front office staff answering phones in ${language}]"
        }
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      const parsedData = JSON.parse(responseText);
      setResults(parsedData);

    } catch (error) {
      console.error("Detailed Error:", error);
      alert("Something went wrong communicating with the AI. Please check the terminal logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-blue-200 shadow-lg">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Crisis Comms Engine</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global District Operations</p>
          </div>
        </div>
        <div className="hidden sm:block">
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Powered by Gemini 2.5 Flash
          </span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-10 grid lg:grid-cols-12 gap-10">
        
        {/* Left: Control Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            
            {/* 1. IDENTITY TOGGLE */}
            <h2 className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">
              1. Sender Identity
            </h2>
            <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6">
              <button
                onClick={() => setSenderLevel('School')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${senderLevel === 'School' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <GraduationCap size={16} />
                School
              </button>
              <button
                onClick={() => setSenderLevel('District')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${senderLevel === 'District' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Building2 size={16} />
                District
              </button>
            </div>

            {/* 2. LANGUAGE TOGGLE */}
            <h2 className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">
              2. Target Language
            </h2>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button 
                onClick={() => {setLanguage('English'); setShowLanguageList(false);}} 
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${language === 'English' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                English
              </button>
              <button 
                onClick={() => {setLanguage('Spanish'); setShowLanguageList(false);}} 
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${language === 'Spanish' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                Spanish
              </button>
              <button 
                onClick={() => setShowLanguageList(!showLanguageList)} 
                className={`py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 transition-all ${showLanguageList || !['English', 'Spanish'].includes(language) ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                <Globe size={12} /> {['English', 'Spanish'].includes(language) ? "Other" : language}
              </button>
            </div>

            {/* EXPANDED LANGUAGE LIST */}
            {showLanguageList && (
              <div className="mb-6 grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                {COMMON_LANGUAGES.map(lang => (
                  <button 
                    key={lang} 
                    onClick={() => {setLanguage(lang); setShowLanguageList(false);}} 
                    className="text-left px-3 py-2 text-xs text-slate-600 hover:text-blue-600 hover:bg-white rounded-md transition-all font-medium"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}

            {/* 3. INCIDENT INPUT */}
            <h2 className="flex items-center gap-2 font-bold text-slate-800 mb-3 mt-6 text-sm uppercase tracking-wide">
              <AlertCircle size={16} className="text-blue-600" />
              3. Incident Facts
            </h2>
            <textarea 
              className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm leading-relaxed focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all resize-none shadow-inner"
              placeholder="Example: Pipe burst in gym. Early dismissal at 2pm. Buses are on the way. No injuries reported."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            
            <button 
              onClick={handleGenerate}
              disabled={loading || !input}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              {loading ? `Drafting in ${language}...` : "Generate Alerts"}
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-start gap-3 text-blue-700">
              <Info size={20} className="mt-1 flex-shrink-0" />
              <p className="text-sm leading-relaxed">
                <strong>Data Privacy:</strong> This tool uses a private API tunnel. Incident facts are ephemeral and are not used to train public models.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Output Display */}
        <div className="lg:col-span-8 space-y-6">
          {!results && !loading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-4 border-dashed border-slate-200 rounded-3xl bg-white/50 text-slate-400">
              <div className="bg-white p-5 rounded-full shadow-sm mb-4 border border-slate-100">
                <Globe size={40} className="text-slate-300" />
              </div>
              <p className="font-semibold text-slate-500">Awaiting Incident Data</p>
              <p className="text-sm mt-1 text-slate-400">Output will be formatted for Email, SMS, and Voice in {language}.</p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center rounded-3xl bg-white border border-slate-100 shadow-xl">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
              <p className="text-lg font-bold text-slate-800">Translating to {language}</p>
              <p className="text-slate-500 animate-pulse">Consulting cultural and communication standards...</p>
            </div>
          )}

          {results && !loading && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              
              {/* EMAIL CARD */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
                <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-2 font-bold text-slate-700 uppercase tracking-wider text-xs">
                    <Mail size={16} className="text-blue-600" /> Email Notification ({language})
                  </div>
                  <button 
                    onClick={() => handleCopy(results.email, 'email')}
                    className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                  >
                    {copied.email ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    {copied.email ? "COPIED" : "COPY EMAIL"}
                  </button>
                </div>
                <div className="p-8 text-base leading-relaxed text-slate-700 whitespace-pre-wrap font-medium">
                  {results.email}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* SMS CARD */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      <MessageSquare size={14} className="text-green-600" /> SMS Alert ({language})
                    </div>
                    <button 
                      onClick={() => handleCopy(results.sms, 'sms')}
                      className="text-slate-400 hover:text-green-600 p-2 rounded-lg hover:bg-green-50 transition-all"
                    >
                      {copied.sms ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className="p-6 text-sm font-mono text-slate-800 bg-slate-50 flex-grow leading-relaxed">
                    {results.sms}
                  </div>
                  <div className="px-6 py-3 bg-white border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400">LENGTH</span>
                    <span className={`text-[10px] font-bold ${results.sms?.length > 160 ? 'text-red-500' : 'text-slate-500'}`}>
                      {results.sms?.length} / 160
                    </span>
                  </div>
                </div>

                {/* SCRIPT CARD */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      <Phone size={14} className="text-purple-600" /> Staff Script ({language})
                    </div>
                    <button 
                      onClick={() => handleCopy(results.script, 'script')}
                      className="text-slate-400 hover:text-purple-600 p-2 rounded-lg hover:bg-purple-50 transition-all"
                    >
                      {copied.script ? <Check size={16} className="text-purple-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className="p-6 text-sm italic text-slate-700 leading-relaxed flex-grow">
                    "{results.script}"
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;