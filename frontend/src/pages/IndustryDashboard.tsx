import React, { useEffect, useState } from 'react';
import { Building2, Handshake, DollarSign, Cpu, CheckCircle2, Sparkles } from 'lucide-react';

export const IndustryDashboard: React.FC = () => {
  const [opps, setOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/v1/industry/opportunities')
      .then((res) => res.json())
      .then((data) => {
        setOpps(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleOfferPartnership = async (projectId: string) => {
    const authRes = await fetch('/api/v1/auth/demo-login?role=INDUSTRY', { method: 'POST' });
    const authData = await authRes.json();

    const res = await fetch('/api/v1/industry/partnerships', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authData.access_token}`
      },
      body: JSON.stringify({
        project_id: projectId,
        contribution_types: ['MENTORSHIP', 'FUNDING', 'PROTOTYPING', 'PILOT'],
        funding_amount_inr: 150000.0,
        description: 'Provided IoT hardware sensors, telemetry gateway, and technical field mentorship.'
      })
    });
    const data = await res.json();
    setSubmitted(true);
    alert(data.message);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-amber-600" />
          Industry, MSME & CSR Collaboration
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Industry Partnership Portal</h1>
        <p className="text-slate-600 text-sm mt-1">
          Support verified university-lead innovation projects through mentorship, funding, hardware, and deployment scaling.
        </p>
      </div>

      {/* Available Opportunities List */}
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-800/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold rounded-full uppercase">
                Featured Partner Opportunity (SS-1042)
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-2">SmartCity Technologies [DEMO PARTNER]</h2>
              <p className="text-xs text-slate-300 mt-1">
                Project HydroSolve: Urban Waterlogging Mitigation | Sector: IoT & Civil Tech
              </p>
            </div>

            <button
              onClick={() => handleOfferPartnership(opps[0]?.project_id || 'proj-id')}
              disabled={submitted}
              className={`inline-flex items-center space-x-2 px-6 py-3 text-xs font-bold rounded-xl transition shadow-md shrink-0 ${
                submitted
                  ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-900'
              }`}
            >
              <Handshake className="w-4 h-4" />
              <span>{submitted ? 'Partnership Registered' : 'Submit Partnership Offer (₹1.5 Lakh + IoT Support)'}</span>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-amber-800/50 text-xs">
            <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-800/40">
              <span className="text-amber-400 block text-[10px]">Mentorship</span>
              <strong className="text-white">IoT Systems Engineering</strong>
            </div>
            <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-800/40">
              <span className="text-amber-400 block text-[10px]">Funding Contribution</span>
              <strong className="text-white">₹150,000 INR</strong>
            </div>
            <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-800/40">
              <span className="text-amber-400 block text-[10px]">Prototyping Hardware</span>
              <strong className="text-white">LoRa Gateway & Telemetry</strong>
            </div>
            <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-800/40">
              <span className="text-amber-400 block text-[10px]">Pilot Field Testing</span>
              <strong className="text-white">Pune Sector 4 Road</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
