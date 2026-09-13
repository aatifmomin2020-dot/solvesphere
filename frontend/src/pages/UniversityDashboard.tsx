import React, { useEffect, useState } from 'react';
import { GraduationCap, Award, Send, Users, CheckCircle2, Sparkles } from 'lucide-react';

interface UniversityDashboardProps {
  onSelectProject: (projectId: string) => void;
}

export const UniversityDashboard: React.FC<UniversityDashboardProps> = ({ onSelectProject }) => {
  const [matchData, setMatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [proposalSubmitted, setProposalSubmitted] = useState(false);

  useEffect(() => {
    // Fetch university recommendation for flagship SS-1042
    fetch('/api/v1/challenges/SS-1042')
      .then((res) => res.json())
      .then((ch) => {
        return fetch(`/api/v1/universities/matches/${ch.id}`);
      })
      .then((res) => res.json())
      .then((data) => {
        setMatchData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmitProposal = async () => {
    const authRes = await fetch('/api/v1/auth/demo-login?role=UNIVERSITY', { method: 'POST' });
    const authData = await authRes.json();

    const res = await fetch('/api/v1/universities/proposals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authData.access_token}`
      },
      body: JSON.stringify({
        challenge_id: matchData?.challenge_id || 'flagship-id',
        title: 'Smart Modular IoT Drainage & Permeable Pavement Network',
        problem_interpretation: 'Runoff water overflow caused by insufficient culvert gradient and sediment accumulation.',
        proposed_solution: 'Deployment of modular permeable drainage chambers equipped with IoT water level sensors.',
        technical_architecture: 'Ultrasonic level sensors + LoRaWAN telemetry + Gravity-fed filtration trench.',
        estimated_timeline_weeks: 10,
        budget_estimate_inr: 250000.0
      })
    });
    const data = await res.json();
    setProposalSubmitted(true);
    alert(data.message);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Calculating 7-factor University Capability Matches...</div>;

  const matches = matchData?.matches || [];
  const topMatch = matches[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-emerald-600" />
          Higher Education & Research Ecosystem
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">University Matching & Proposal Workspace</h1>
        <p className="text-slate-600 text-sm mt-1">
          7-Factor capability algorithm pairs faculty expertise & student research teams to verified public challenges.
        </p>
      </div>

      {/* Flagship Match Recommendation Card */}
      {topMatch && (
        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-400/30">
                <Award className="w-3.5 h-3.5" />
                <span>#1 AI Recommended Institution ({topMatch.score_pct}% Match)</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">{topMatch.name}</h2>
              <p className="text-xs text-slate-300 mt-1">
                District: {topMatch.district} | NIRF Rank #14 | Facilities: Hydrology Lab, IoT Suite, GIS Mapping
              </p>
            </div>

            <button
              onClick={handleSubmitProposal}
              disabled={proposalSubmitted}
              className={`inline-flex items-center space-x-2 px-6 py-3 text-sm font-bold rounded-xl transition shadow-lg shrink-0 ${
                proposalSubmitted
                  ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                  : 'bg-emerald-400 hover:bg-emerald-300 text-slate-900'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{proposalSubmitted ? 'Proposal Submitted' : 'Submit Team Technical Proposal'}</span>
            </button>
          </div>

          {/* Factor Breakdown Grid */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 border-t border-emerald-800/80 text-xs">
            {Object.entries(topMatch.factors || {}).map(([key, val]) => (
              <div key={key} className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/50">
                <span className="text-emerald-400 block text-[10px] uppercase font-bold">{key}</span>
                <strong className="text-white text-sm font-extrabold">{String(val)}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Challenge List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Recommended Challenges Matching Research Focus</h3>
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
            <div>
              <strong className="text-sm font-bold text-slate-900 block">SS-1042: Urban Waterlogging Near ABC School</strong>
              <span className="text-slate-500">Matched Department: Department of Civil & Environmental Engineering</span>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold rounded-lg">94% Recommended</span>
          </div>
        </div>
      </div>
    </div>
  );
};
