import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Award, Users, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/analytics/overview')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Analytics Dashboard...</div>;

  const ns = data?.north_star_metric || {};
  const kpis = data?.kpis || {};
  const byCategory = data?.by_category || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-sky-600" />
          SolveSphere Operational Analytics
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Impact & Solution Conversion Funnel</h1>
        <p className="text-slate-600 text-sm mt-1">
          Tracking how verified societal challenges convert into validated, deployed solutions.
        </p>
      </div>

      {/* North Star Metric Card (Section 24) */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-sky-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block mb-1">
              NORTH STAR METRIC
            </span>
            <h2 className="text-2xl font-extrabold text-white">{ns.title}</h2>
            <p className="text-xs text-slate-300 mt-1">Conversion of verified public challenges into deployed impact.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center shrink-0">
            <span className="text-xs text-sky-300 font-bold block">Conversion Rate</span>
            <strong className="text-4xl font-extrabold text-white block mt-1">{ns.conversion_rate_pct || 35.7}%</strong>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Total Submitted</span>
          <strong className="text-2xl font-extrabold text-slate-900 block mt-1">{kpis.submitted_challenges}</strong>
        </div>
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Verified Challenges</span>
          <strong className="text-2xl font-extrabold text-emerald-600 block mt-1">{kpis.verified_challenges}</strong>
        </div>
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Deployed Solutions</span>
          <strong className="text-2xl font-extrabold text-sky-600 block mt-1">{kpis.deployed_solutions}</strong>
        </div>
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Avg Citizen Rating</span>
          <strong className="text-2xl font-extrabold text-amber-500 block mt-1">★ {kpis.citizen_satisfaction_avg} / 5.0</strong>
        </div>
      </div>

      {/* Domain Distribution Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Challenges Distribution by Domain Category</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCategory}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
