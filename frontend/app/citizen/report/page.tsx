"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import EcosystemFlow from "@/components/EcosystemFlow";
import { Send, MapPin, AlertTriangle, Sparkles } from "lucide-react";

const CATEGORIES = [
  "Environment", "Healthcare", "Education", "Transportation", 
  "Public Safety", "Water & Sanitation", "Waste Management", 
  "Agriculture", "Smart City", "Accessibility", "Energy", "Other"
];

export default function ReportProblemPage() {
  const router = useRouter();

  const [title, setTitle] = useState("Urban Waterlogging Near ABC School");
  const [description, setDescription] = useState("During heavy rainfall, severe water accumulation occurs near ABC School entrance. Water remains logged for 6-8 hours, preventing over 2,400 students and local residents from accessing the school safely.");
  const [category, setCategory] = useState("Environment");
  const [subCategory, setSubCategory] = useState("Urban Drainage");
  const [locationName, setLocationName] = useState("ABC School Road, Sector 4, Pune");
  const [latitude, setLatitude] = useState<number>(18.5204);
  const [longitude, setLongitude] = useState<number>(73.8567);
  const [severity, setSeverity] = useState("HIGH");
  const [peopleAffected, setPeopleAffected] = useState<number>(2450);
  const [frequency, setFrequency] = useState("Monsoon");
  const [evidenceUrl, setEvidenceUrl] = useState("https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7");
  const [contactInfo, setContactInfo] = useState("ramesh.kumar@gmail.com");

  const [submitting, setSubmitting] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUseGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(parseFloat(pos.coords.latitude.toFixed(4)));
          setLongitude(parseFloat(pos.coords.longitude.toFixed(4)));
          setLocationName(`Current Location (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`);
        },
        (err) => alert("Could not fetch location: " + err.message)
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title,
        description,
        category,
        sub_category: subCategory,
        location_name: locationName,
        latitude,
        longitude,
        severity,
        people_affected: peopleAffected,
        frequency,
        evidence_url: evidenceUrl,
        contact_info: contactInfo
      };

      const result = await fetchApi("/challenges", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setAiAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || "Failed to submit challenge");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="bg-sky-100 text-sky-800 border border-sky-200 text-xs font-mono font-bold px-3 py-1 rounded-full">
          CITIZEN PROBLEM SUBMISSION
        </span>
        <h1 className="text-3xl font-black text-slate-900">Report a Societal Problem</h1>
        <p className="text-xs text-slate-600 max-w-xl mx-auto">
          Submit real-world civic challenges. SolveSphere AI instantly classifies, scores priority, and detects duplicate complaints.
        </p>
      </div>

      <EcosystemFlow activeStage="SUBMIT" />

      {/* AI ANALYSIS RESULTS OVERLAY / MODAL AFTER SUBMISSION */}
      {aiAnalysisResult ? (
        <div className="bg-white border border-emerald-300 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-emerald-700">AI ANALYSIS COMPLETE</span>
                <h2 className="text-xl font-bold text-slate-900">Challenge Recorded as {aiAnalysisResult.id}</h2>
              </div>
            </div>
            <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono px-3 py-1 rounded-lg">
              Status: {aiAnalysisResult.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 block font-medium">Domain Classification</span>
              <span className="text-base font-bold text-sky-700">{aiAnalysisResult.category}</span>
              <span className="text-[10px] text-slate-500 block">Sub-domain: {aiAnalysisResult.sub_category}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 block font-medium">Explainable Priority Score</span>
              <span className="text-base font-bold text-amber-700">{aiAnalysisResult.priority_score} / 100</span>
              <span className="text-[10px] text-amber-800 font-bold block">Level: {aiAnalysisResult.priority_level}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 block font-medium">AI Confidence</span>
              <span className="text-base font-bold text-emerald-700">{Math.round(aiAnalysisResult.ai_confidence * 100)}%</span>
              <span className="text-[10px] text-slate-500 block">SBERT MiniLM Embedding</span>
            </div>
          </div>

          {/* Duplicates Section */}
          {aiAnalysisResult.potential_duplicates && aiAnalysisResult.potential_duplicates.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Semantic Duplicates Flagged ({aiAnalysisResult.duplicates_count} match found)</span>
              </div>
              <p className="text-[11px] text-slate-700">
                SolveSphere AI detected similar existing complaints. Human Government Review is required before merging.
              </p>
              <div className="space-y-1.5 pt-1">
                {aiAnalysisResult.potential_duplicates.map((dup: any) => (
                  <div key={dup.id} className="flex justify-between items-center bg-white p-2 rounded text-xs border border-amber-200">
                    <span className="font-mono text-sky-800 font-bold">{dup.id}: {dup.title}</span>
                    <span className="text-amber-800 font-mono font-bold">{dup.similarity}% Similarity</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => router.push(`/citizen/challenges/${aiAnalysisResult.id}`)}
              className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs text-center transition shadow-md"
            >
              Track Live Workflow Status →
            </button>
            <button
              onClick={() => setAiAnalysisResult(null)}
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition border border-slate-200"
            >
              Report Another Problem
            </button>
          </div>

        </div>
      ) : (
        /* SUBMISSION FORM */
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-slate-800">Problem Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Urban Waterlogging Near ABC School"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-600"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">Primary Domain *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800">Detailed Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              placeholder="Explain the societal problem, impact on residents, and duration..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-600"
            />
          </div>

          {/* Location & Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2 space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-800">Location Name *</label>
                <button
                  type="button"
                  onClick={handleUseGeolocation}
                  className="text-[11px] text-sky-700 hover:text-sky-800 font-semibold flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" /> Use Current Location
                </button>
              </div>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                required
                placeholder="e.g. Sector 4, ABC School Road, Pune"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold">Lat</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold">Lng</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Parameters: Severity, People Affected, Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">Estimated People Affected</label>
              <input
                type="number"
                value={peopleAffected}
                onChange={(e) => setPeopleAffected(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">Occurrence Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
              >
                <option value="Continuous">Continuous</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monsoon">Monsoon</option>
                <option value="Occasional">Occasional</option>
              </select>
            </div>
          </div>

          {/* Evidence Upload URL & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">Evidence Image/Photo URL</label>
              <input
                type="text"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-600"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">Contact Email / Phone</label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="ramesh@gmail.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl font-black bg-sky-600 hover:bg-sky-700 text-white text-sm transition shadow-md flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>Running SBERT AI Embeddings & Priority Engine...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Problem for AI Analysis & Government Review
              </>
            )}
          </button>
        </form>
      )}

    </div>
  );
}
