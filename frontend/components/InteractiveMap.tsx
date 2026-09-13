"use client";

import React, { useState } from "react";
import { MapPin } from "lucide-react";

interface MapChallenge {
  id: string;
  title: string;
  category: string;
  location_name: string;
  latitude: number;
  longitude: number;
  priority_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | string;
  status: string;
  people_affected: number;
}

interface InteractiveMapProps {
  challenges: MapChallenge[];
  onSelectChallenge?: (challenge: MapChallenge) => void;
}

export default function InteractiveMap({ challenges, onSelectChallenge }: InteractiveMapProps) {
  const [selected, setSelected] = useState<MapChallenge | null>(challenges[0] || null);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return { bg: "bg-rose-500 text-white", border: "border-rose-300", text: "text-rose-600" };
      case "HIGH":
        return { bg: "bg-amber-500 text-white", border: "border-amber-300", text: "text-amber-700" };
      case "MEDIUM":
        return { bg: "bg-sky-500 text-white", border: "border-sky-300", text: "text-sky-700" };
      default:
        return { bg: "bg-emerald-500 text-white", border: "border-emerald-300", text: "text-emerald-700" };
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col lg:flex-row min-h-[460px]">
      
      {/* Visual GIS Map Interface */}
      <div className="flex-1 relative bg-slate-50 p-6 flex flex-col justify-between overflow-hidden min-h-[360px]">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Map Header Overlay */}
        <div className="relative z-10 flex items-center justify-between bg-white/95 backdrop-blur p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-600 animate-pulse" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">Live Geospatial Challenge Map</h4>
              <p className="text-[10px] text-slate-500">Greater City Region • Real-time AI Priority Markers</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-rose-600"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical</span>
            <span className="flex items-center gap-1 text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-500"></span> High</span>
            <span className="flex items-center gap-1 text-sky-600"><span className="w-2 h-2 rounded-full bg-sky-500"></span> Medium</span>
          </div>
        </div>

        {/* Simulated Interactive Pins Grid */}
        <div className="relative z-10 my-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
          {challenges.slice(0, 8).map((ch) => {
            const style = getPriorityBadge(ch.priority_level);
            const isSelected = selected?.id === ch.id;

            return (
              <button
                key={ch.id}
                onClick={() => {
                  setSelected(ch);
                  if (onSelectChallenge) onSelectChallenge(ch);
                }}
                className={`group p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? "bg-white border-sky-600 shadow-md ring-2 ring-sky-500/20 scale-105"
                    : "bg-white/90 border-slate-200 hover:bg-white hover:border-slate-300 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="font-mono text-[11px] font-bold text-slate-500">{ch.id}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${style.bg}`}>
                    {ch.priority_level}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-sky-700">
                  {ch.title}
                </h5>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {ch.location_name}
                </p>
              </button>
            );
          })}
        </div>

        {/* Footer info bar */}
        <div className="relative z-10 text-right text-[11px] text-slate-500 font-mono">
          Showing top {Math.min(challenges.length, 8)} geo-tagged societal challenges
        </div>
      </div>

      {/* Selected Marker Detail Card */}
      {selected && (
        <div className="w-full lg:w-80 bg-white p-6 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-mono text-xs text-sky-700 font-bold bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                {selected.id}
              </span>
              <span className="text-xs text-slate-500 font-medium">{selected.category}</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{selected.title}</h3>
            
            <p className="text-xs text-slate-600 mb-4 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              {selected.location_name}
            </p>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">AI Priority Level:</span>
                <span className={`font-bold ${getPriorityBadge(selected.priority_level).text}`}>
                  {selected.priority_level}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Affected Population:</span>
                <span className="font-bold text-slate-800">{selected.people_affected.toLocaleString()} Citizens</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Ecosystem Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {selected.status}
                </span>
              </div>
            </div>
          </div>

          <a
            href={`/citizen/challenges/${selected.id}`}
            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-center text-xs transition shadow-md shadow-sky-600/20 block"
          >
            View Full Challenge & AI Analysis →
          </a>
        </div>
      )}
    </div>
  );
}
