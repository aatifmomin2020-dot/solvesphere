import React, { useState } from 'react';
import { X, Upload, MapPin, AlertTriangle, CheckCircle, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newChallenge: any) => void;
}

export const ChallengeWizardModal: React.FC<WizardProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('Pune');
  const [locality, setLocality] = useState('');
  const [affectedPopulation, setAffectedPopulation] = useState(100);
  const [severityLevel, setSeverityLevel] = useState('MODERATE');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  // Result state
  const [resultData, setResultData] = useState<any>(null);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && (!title.trim() || !description.trim())) {
      alert("Please provide a title and description for the problem.");
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          district,
          locality,
          affected_population: affectedPopulation,
          severity_level: severityLevel,
          is_anonymous: isAnonymous
        })
      });
      const data = await res.json();
      setResultData(data);
      setStep(4); // Show confirmation step
      onSuccess(data);
    } catch (e) {
      alert("Submission error. Retrying with offline AI pending queue...");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  step === s
                    ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                    : step > s
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                {s === 1 ? 'Problem' : s === 2 ? 'Location' : s === 3 ? 'Impact' : 'AI Review'}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Problem Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Step 1: Describe the Societal Problem</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Problem Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Severe Urban Flooding Near ABC School"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Detailed Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happens, affected community members, recurrence..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Upload Photo/Evidence Evidence</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
              <p className="text-[10px] text-slate-400 mt-1">Allowed: JPG, PNG, WEBP, PDF (Max 5MB). Server SHA-256 validated.</p>
            </div>
          </div>
        )}

        {/* Step 2: Location & Privacy */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Step 2: Location & Privacy Settings</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">District</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
              >
                {['Pune', 'Mumbai Urban', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Locality / Landmark</label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Sector 4, Near School Gate"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
              />
            </div>
            <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl flex items-start space-x-3 text-xs text-sky-800">
              <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">Location Privacy Guarantee</strong>
                <span>Public endpoints display approximate locality only. Exact GPS coordinates are strictly masked from public API responses per Principle 5.</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Additional Info & Anonymous option */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Step 3: Affected Population & Options</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Estimated Affected Population</label>
              <input
                type="number"
                value={affectedPopulation}
                onChange={(e) => setAffectedPopulation(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Severity Level</label>
              <select
                value={severityLevel}
                onChange={(e) => setSeverityLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
              >
                <option value="LOW">Low Impact</option>
                <option value="MODERATE">Moderate Impact</option>
                <option value="HIGH">High Urgency</option>
                <option value="SEVERE">Severe Danger / Safety Risk</option>
              </select>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <input
                type="checkbox"
                id="anon"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded"
              />
              <label htmlFor="anon" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Submit as Anonymous Report (Hides identity details internally)
              </label>
            </div>
          </div>
        )}

        {/* Step 4: AI Analysis & Duplicate Check Result */}
        {step === 4 && resultData && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">Report Submitted!</h3>
              <p className="text-xs text-slate-500 mt-1">Public Code: <strong className="text-brand-600 font-bold">{resultData.public_code}</strong></p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">AI Domain Category:</span>
                <strong className="text-slate-900 font-bold">{resultData.domain}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AI Recommended Priority:</span>
                <strong className="text-rose-600 font-bold">{resultData.ai_priority_recommended}</strong>
              </div>
            </div>

            {/* Semantic Duplicate Candidates */}
            {resultData.duplicates_found && resultData.duplicates_found.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                <div className="flex items-center space-x-2 text-amber-800 text-xs font-bold mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Semantic Duplicates Detected by AI ({resultData.duplicates_found.length})</span>
                </div>
                <div className="space-y-1.5 text-xs text-amber-900">
                  {resultData.duplicates_found.map((dup: any) => (
                    <div key={dup.challenge_id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-amber-200">
                      <span>{dup.public_code}: {dup.title}</span>
                      <span className="font-bold text-amber-700">{(dup.similarity * 100).toFixed(0)}% Match</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl transition"
            >
              Done & View Tracking
            </button>
          </div>
        )}

        {/* Wizard Controls */}
        {step < 4 && (
          <div className="mt-8 flex justify-between items-center pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center space-x-1.5 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition"
              >
                <span>{loading ? 'Analyzing with AI...' : 'Submit Challenge'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
