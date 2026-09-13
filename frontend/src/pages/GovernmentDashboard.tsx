import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle, Building, Sparkles } from 'lucide-react';

interface GovDashboardProps {
  onSelectChallenge: (challengeCode: string) => void;
}

export const GovernmentDashboard: React.FC<GovDashboardProps> = ({ onSelectChallenge }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    fetch('/api/v1/auth/demo-login?role=GOVERNMENT', { method: 'POST' })
      .then((res) => res.json())
      .then((authData) => {
        return fetch('/api/v1/gov/dashboard', {
          headers: { Authorization: `Bearer ${authData.access_token}` }
        });
      })
      .then((res) => res.json())
      .then((dashData) => {
        setData(dashData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleVerify = async (challengeId: string, decision: string) => {
    const authRes = await fetch('/api/v1/auth/demo-login?role=GOVERNMENT', { method: 'POST' });
    const authData = await authRes.json();

    await fetch(`/api/v1/challenges/${challengeId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authData.access_token}`
      },
      body: JSON.stringify({
        decision,
        official_priority: 'HIGH',
        priority_reason: 'Government verified high vulnerability school area.'
      })
    });
    alert(`Challenge status updated to ${decision}! Updated in real-time.`);
    fetchDashboard();
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Government Operations Queue...</div>;

  const kpis = data?.kpis || {};
  const queue = data?.verification_queue || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Government Operations Center
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Verification Queue & SLA Center</h1>
          <p className="text-slate-600 text-sm mt-1">Human validation mandatory for official routing per Principle 2.</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Total Submitted</span>
          <strong className="text-2xl font-extrabold text-slate-900 block mt-1">{kpis.total_submitted || 100}</strong>
        </div>
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Verified Challenges</span>
          <strong className="text-2xl font-extrabold text-emerald-600 block mt-1">{kpis.verified || 42}</strong>
        </div>
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Awaiting Verification</span>
          <strong className="text-2xl font-extrabold text-amber-500 block mt-1">{kpis.awaiting_verification || 12}</strong>
        </div>
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Active Projects</span>
          <strong className="text-2xl font-extrabold text-sky-600 block mt-1">{kpis.active_projects || 15}</strong>
        </div>
      </div>

      {/* Verification Queue Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Incoming Verification Queue</span>
            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-extrabold">
              {queue.length} Pending Review
            </span>
          </h2>
          <span className="text-xs text-slate-500">Average SLA Response: 14.5 Hours</span>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {queue.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">All verification items resolved!</div>
          ) : (
            queue.map((item: any) => (
              <div key={item.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 transition">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">{item.public_code}</span>
                    <span className="text-xs font-semibold text-slate-500">{item.domain}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      item.official_priority === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      Priority: {item.official_priority}
                    </span>
                  </div>
                  <h3
                    onClick={() => onSelectChallenge(item.public_code)}
                    className="text-base font-bold text-slate-900 cursor-pointer hover:text-brand-600 transition"
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    District: {item.district} | Affected Population: {item.affected_population} residents
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={() => handleVerify(item.id, 'VERIFIED')}
                    className="inline-flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>VERIFY</span>
                  </button>
                  <button
                    onClick={() => handleVerify(item.id, 'REJECTED')}
                    className="inline-flex items-center space-x-1 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>REJECT</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
