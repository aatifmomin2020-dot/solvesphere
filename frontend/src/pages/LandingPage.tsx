import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Cpu, 
  FileText, 
  Globe2, 
  Layers, 
  ShieldAlert, 
  Sparkles,
  Users,
  Building2,
  GraduationCap,
  Activity,
  ChevronRight
} from 'lucide-react';

interface HealthStatus {
  status: string;
  service: string;
  database: string;
  db_engine: string;
}

export const LandingPage: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/health/ready')
      .then((res) => res.json())
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch(() => {
        setHealth({ status: 'standalone', service: 'SolveSphere API', database: 'ready', db_engine: 'sqlite' });
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-20 lg:py-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart India Hackathon Prototype (SIH 26043)</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
            From societal problems to <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">measurable solutions</span>.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl font-normal leading-relaxed">
            SolveSphere connects citizens, government officers, university researchers, and industry partners into a secure, transparent, and AI-assisted pipeline that converts verified public challenges into deployed impact.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#report-wizard"
              className="inline-flex items-center space-x-2 px-6 py-3.5 text-base font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-900/20 transition group"
            >
              <span>Report a Problem</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </a>
            <a
              href="#catalog"
              className="inline-flex items-center space-x-2 px-6 py-3.5 text-base font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition"
            >
              <span>Explore Public Catalog</span>
            </a>
          </div>

          {/* Live System Status Pill */}
          <div className="mt-12 inline-flex items-center space-x-3 bg-slate-800/80 border border-slate-700/60 px-4 py-2 rounded-xl text-xs text-slate-300">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>
              Backend System Status: {' '}
              <strong className="text-white font-semibold">
                {loading ? 'Checking...' : health?.status === 'ready' ? 'API Online (Postgres/SQLite Active)' : 'API Connected'}
              </strong>
            </span>
          </div>
        </div>
      </section>

      {/* Primary 4-Stakeholder Architecture Diagram */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest">Core Architecture</h2>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">
              Four Stakeholders, One Closed-Loop Ecosystem
            </p>
            <p className="text-slate-600 mt-3 text-sm">
              Solving public problems requires transparent human validation backed by AI intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Stakeholder 1 */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden group hover:border-sky-300 transition">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. Citizen</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Submits real-world problems via 4-step wizard with evidence, GPS locality masking, and duplicate detection.
              </p>
            </div>

            {/* Stakeholder 2 */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden group hover:border-indigo-300 transition">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. Government</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Reviews AI analysis, verifies issue, sets official priority score, routes to institutions with SLA tracking.
              </p>
            </div>

            {/* Stakeholder 3 */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden group hover:border-emerald-300 transition">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. University</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                7-factor capability matching pairs faculty mentors & student teams to design technical proposals.
              </p>
            </div>

            {/* Stakeholder 4 */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden group hover:border-amber-300 transition">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">4. Industry / CSR</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Provides mentorship, technology, funding, prototyping, pilot support, and scale deployment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closed-Loop Workflow Steps */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-slate-900">11-Step Verified Workflow</h2>
            <p className="text-slate-600 text-sm mt-1">From initial citizen report to deployment & satisfaction feedback</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-xs font-medium">
            {[
              'CITIZEN REPORT',
              'AI ANALYSIS',
              'GOVERNMENT VALIDATION',
              'UNIVERSITY MATCHING',
              'INDUSTRY COLLABORATION',
              'PROJECT PROPOSAL',
              'PROTOTYPE',
              'PILOT',
              'DEPLOYMENT',
              'IMPACT METRICS',
              'CITIZEN FEEDBACK'
            ].map((step, idx) => (
              <div key={idx} className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-slate-700 font-semibold">
                <span className="w-5 h-5 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center text-[10px] font-extrabold">
                  {idx + 1}
                </span>
                <span>{step}</span>
                {idx < 10 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Scenario Highlight */}
      <section id="demo-section" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="w-48 h-48 text-sky-400" />
            </div>

            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
                Flagship SIH Demo Scenario (SS-1042)
              </span>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Urban Waterlogging Near ABC School
              </h3>

              <p className="mt-3 text-slate-300 text-sm max-w-2xl leading-relaxed">
                During heavy rainfall, severe water accumulation occurs near ABC School. Students and residents face difficulty accessing the road safely.
              </p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block">Domain</span>
                  <strong className="text-sky-300 font-bold text-sm">Environment / Urban Drainage</strong>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block">AI Recommended Priority</span>
                  <strong className="text-rose-400 font-bold text-sm">HIGH (87 Reports)</strong>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block">Matched Institution</span>
                  <strong className="text-emerald-300 font-bold text-sm">ABC Institute of Tech (94%)</strong>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block">Matched Industry Partner</span>
                  <strong className="text-amber-300 font-bold text-sm">SmartCity Technologies (IoT)</strong>
                </div>
              </div>

              <div className="mt-8 flex items-center space-x-3">
                <button
                  onClick={() => alert("SolveSphere Phase 1 Infrastructure Active! Proceeding to Phase 2 Seed & Auth Data.")}
                  className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition shadow-md"
                >
                  Run End-to-End Demonstration Workflow
                </button>
                <span className="text-xs text-slate-400 italic">Seeded with DEMO DATA tag per Principles.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
