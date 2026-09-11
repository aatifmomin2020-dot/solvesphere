"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import InteractiveMap from "@/components/InteractiveMap";
import { MapPin, Search, Filter, ThumbsUp, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function ChallengesMarketplacePage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    loadChallenges();
  }, [selectedDomain, selectedPriority, selectedStatus, searchQuery]);

  const loadChallenges = () => {
    setLoading(true);
    let queryParams = [];
    if (selectedDomain) queryParams.push(`domain=${encodeURIComponent(selectedDomain)}`);
    if (selectedPriority) queryParams.push(`priority=${encodeURIComponent(selectedPriority)}`);
    if (selectedStatus) queryParams.push(`status=${encodeURIComponent(selectedStatus)}`);
    if (searchQuery) queryParams.push(`q=${encodeURIComponent(searchQuery)}`);

    const url = `/challenges${queryParams.length ? "?" + queryParams.join("&") : ""}`;
    fetchApi(url)
      .then((data) => setChallenges(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleUpvote = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi(`/challenges/${id}/upvote`, { method: "POST" });
      setChallenges((prev) =>
        prev.map((c) => (c.id === id ? { ...c, upvotes_count: res.upvotes_count } : c))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 py-4">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">
            Civic Challenge Marketplace
          </span>
          <h1 className="text-3xl font-black text-white">Explore Societal Challenges</h1>
          <p className="text-xs text-slate-400">Discover verified real-world problems seeking university research and industry partners.</p>
        </div>

        <Link
          href="/citizen/report"
          className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg flex items-center gap-2"
        >
          + Submit New Challenge
        </Link>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
        >
          <option value="">All Domains</option>
          <option value="Environment">Environment</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Education">Education</option>
          <option value="Transportation">Transportation</option>
          <option value="Public Safety">Public Safety</option>
          <option value="Water & Sanitation">Water & Sanitation</option>
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
        >
          <option value="">All Priority Levels</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
        >
          <option value="">All Workflow Statuses</option>
          <option value="AI_ANALYZED">AI ANALYZED</option>
          <option value="VERIFIED">VERIFIED</option>
          <option value="IN_PROJECT">IN PROJECT</option>
        </select>
      </div>

      {/* CHALLENGES GRID */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 font-mono text-xs animate-pulse">
          Loading challenge marketplace...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((ch) => (
            <div
              key={ch.id}
              className="bg-slate-900 border border-slate-800 hover:border-sky-500/40 p-6 rounded-2xl flex flex-col justify-between transition group shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                    {ch.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      ch.priority_level === "CRITICAL"
                        ? "bg-rose-500 text-slate-950"
                        : ch.priority_level === "HIGH"
                        ? "bg-amber-500 text-slate-950"
                        : "bg-sky-500 text-slate-950"
                    }`}
                  >
                    {ch.priority_level}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug group-hover:text-sky-300 transition">
                  {ch.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {ch.description}
                </p>

                <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono">
                  <span className="bg-slate-950 text-slate-300 px-2 py-1 rounded border border-slate-800">
                    {ch.category}
                  </span>
                  <span className="bg-slate-950 text-emerald-400 px-2 py-1 rounded border border-slate-800">
                    Status: {ch.status}
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => handleUpvote(ch.id, e)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-sky-400 transition bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{ch.upvotes_count}</span>
                  </button>

                  <span className="text-[11px] text-slate-500">
                    {ch.people_affected?.toLocaleString()} affected
                  </span>
                </div>

                <Link
                  href={`/citizen/challenges/${ch.id}`}
                  className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
