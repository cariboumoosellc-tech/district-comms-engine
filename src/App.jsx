import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AlertCircle, Send, Mail, MessageSquare, Phone, ShieldCheck, Loader2, Copy, Check } from 'lucide-react';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(API_KEY);

function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  // State to track which button was copied
  const [copied, setCopied] = useState({ email: false, sms: false, script: false });

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [type]: true });
    setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
  };

  const handleGenerate = async () => {
    if (!input) return;
    setLoading(true);
    setResults(null);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `
        You are a School District Communications Director. 
        Convert these raw facts into professional, calm, 8th-grade reading level communications.
        
        FACTS: ${input}

        Return EXACTLY in this JSON format. Do not include any markdown backticks or outside text.
        {
          "email": "Subject: [Subject here]\\n\\nDear Parents,\\n\\n[Paragraph 1]\\n\\n[Paragraph 2]\\n\\nSincerely,\\n[District Communications]",
          "sms": "[Max 160 characters. Concise alert.]",
          "script": "[3-sentence phone script for the front office.]"
        }
      `;

      const result = await model.generateContent(prompt);
      let text = result.response.text();
      
      // Clean up the response just in case the AI wraps it in markdown blocks
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedData = JSON.parse(text);
      setResults(parsedData);

    } catch (error) {
      console.error("Error generating:", error);
      alert("There was an error formatting the response. Please try clicking generate again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-200">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
            <ShieldCheck className="text-white" size={22} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">District Crisis Comms Engine</h1>
        </div>
        <div className="hidden md:block text-xs font-bold text-slate-400 uppercase tracking-widest">
          Braden Stohlton Labs
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 lg:p-8 grid lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="flex items-center gap-2 font-bold text-lg mb-4 text-slate-900">
              <AlertCircle size={20} className="text-blue-600" />
              Incident Details
            </h2>
            <textarea 
              className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all resize-none"
              placeholder="Example: Water main break at the Elementary school. Early dismissal at 1:00 PM. Buses arriving shortly. No one is injured."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              onClick={handleGenerate}
              disabled={loading || !input}
              className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              {loading ? "Drafting Communications..." : "Generate Alerts"}
            </button>
          </div>
          
          <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
            <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Pro Tip</h3>
            <p className="text-sm text-blue-700/80 leading-relaxed">
              Stick to the raw facts. The AI will handle the empathetic tone, safety-first framing, and ADA-compliant accessibility formatting.
            </p>
          </div>
        </div>

        {/* Right Column: Results Panel */}
        <div className="lg:col-span-8 space-y-6">
          {!results && !loading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-slate-400">
              <MessageSquare size={48} className="mb-4 text-slate-300" strokeWidth={1.5} />
              <p className="text-sm font-medium">Enter incident facts to generate multi-channel communications.</p>
            </div>
          )}

          {loading && (
             <div className="h-full min-h-[400px] flex flex-col items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm">
               <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
               <p className="text-sm font-medium text-slate-500 animate-pulse">Structuring district protocols...</p>
             </div>
          )}

          {results && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Email Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="bg-slate-100/50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Mail size={18} className="text-blue-600" /> Email Notification
                  </div>
                  <button 
                    onClick={() => handleCopy(results.email, 'email')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm hover:border-blue-200"
                  >
                    {copied.email ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    {copied.email ? "Copied!" : "Copy"}
                  </button>
                </div>
                {/* whitespace-pre-wrap is what fixes the "smashed together" text */}
                <div className="p-6 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {results.email}
                </div>
              </div>

              {/* Bottom Row: SMS and Script */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* SMS Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="bg-slate-100/50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <MessageSquare size={18} className="text-green-600" /> SMS Alert
                    </div>
                    <button 
                      onClick={() => handleCopy(results.sms, 'sms')}
                      className="text-slate-400 hover:text-green-600 transition-colors p-1.5 rounded-md hover:bg-green-50"
                      title="Copy SMS"
                    >
                      {copied.sms ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className="p-6 text-sm font-mono leading-relaxed text-slate-800 bg-slate-50 flex-grow">
                    {results.sms}
                  </div>
                  <div className="px-6 py-3 bg-white border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Character Count</span>
                    <span className={`text-xs font-bold ${results.sms?.length > 160 ? 'text-red-500' : 'text-slate-500'}`}>
                      {results.sms?.length} / 160
                    </span>
                  </div>
                </div>

                {/* Phone Script Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="bg-slate-100/50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <Phone size={18} className="text-purple-600" /> Front Office Script
                    </div>
                    <button 
                      onClick={() => handleCopy(results.script, 'script')}
                      className="text-slate-400 hover:text-purple-600 transition-colors p-1.5 rounded-md hover:bg-purple-50"
                      title="Copy Script"
                    >
                      {copied.script ? <Check size={16} className="text-purple-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className="p-6 text-sm italic leading-relaxed text-slate-700 flex-grow">
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