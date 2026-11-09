"use client";
import { useState } from "react";
import { Loader2, CheckCircle, AlertTriangle, Link as LinkIcon, FileText } from "lucide-react";

export default function Home() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [handover, setHandover] = useState(null);

  const generateHandover = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setHandover(json.data);
        setStep(2); 
      } else {
        alert("Error: " + json.error);
      }
    } catch (error) {
      alert("Error generating handover");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-indigo-700">Project Continuum</h1>
          <p className="text-slate-500">Evidence-Linked Knowledge Handover</p>
        </div>

        {step === 1 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
            <h2 className="text-2xl font-semibold mb-4">Outgoing Member: Alex</h2>
            <p className="mb-6 text-slate-600">Connected Sources: GitHub (core-api), Discord (dev-chat)</p>
            <button 
              onClick={generateHandover} 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center mx-auto gap-2 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : <FileText />}
              {loading ? "AI is reconstructing project state..." : "Generate Handover Report"}
            </button>
          </div>
        )}

        {step === 2 && handover && (
          <div className="space-y-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-800 rounded-r-lg flex gap-3">
              <AlertTriangle className="shrink-0" />
              <div>
                <strong>Human Review Required:</strong> Please review the AI-generated draft below. You can redact sensitive info or resolve conflicts before approving.
              </div>
            </div>

            {handover.conflicts?.length > 0 && (
              <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                <h3 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
                  <AlertTriangle size={20} /> Flagged Conflicts
                </h3>
                {handover.conflicts.map((c, i) => (
                  <div key={i} className="mb-2 text-sm text-red-800">
                    <p>⚠️ {c.text}</p>
                    <p className="text-xs text-red-500 mt-1">Source A: {c.source1} | Source B: {c.source2}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-4 border-b pb-2">Project Summary</h3>
              <p className="text-slate-700">{handover.summary}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-indigo-700 mb-4">Key Decisions</h3>
                <ul className="space-y-3">
                  {handover.decisions?.map((d, i) => (
                    <li key={i} className="text-sm border-l-2 border-indigo-300 pl-3">
                      {d.text}
                      <span className="block text-xs text-indigo-500 mt-1 flex items-center gap-1 cursor-pointer hover:underline">
                        <LinkIcon size={12} /> {d.source}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-emerald-700 mb-4">Next Actions (Incoming)</h3>
                <ul className="space-y-3">
                  {handover.next_actions?.map((a, i) => (
                    <li key={i} className="text-sm border-l-2 border-emerald-300 pl-3">
                      {a.text}
                      <span className="block text-xs text-emerald-500 mt-1 flex items-center gap-1 cursor-pointer hover:underline">
                        <LinkIcon size={12} /> {a.source}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setStep(3)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
              >
                <CheckCircle size={20} /> Approve & Share Handover
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200 text-center">
            <CheckCircle size={64} className="text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Handover Approved & Shared</h2>
            <p className="text-slate-600 mb-6">The incoming member (Sam) now has permission-aware access to the project state.</p>
            <div className="bg-slate-100 p-6 rounded-lg text-left">
              <h4 className="font-bold mb-2">Notification sent to incoming user:</h4>
              <p className="text-sm text-slate-700 italic border-l-4 border-slate-300 pl-4">
                "Welcome Sam! Alex has left the project. You have been assigned the role of 'Backend Developer'. Please review the approved handover document. Note: There is 1 unresolved conflict regarding mobile login that requires your immediate attention."
              </p>
            </div>
            <button onClick={() => { setStep(1); setHandover(null); }} className="mt-8 text-indigo-600 hover:underline">
              Start New Handover
            </button>
          </div>
        )}

      </div>
    </main>
  );
}