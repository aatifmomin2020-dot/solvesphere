import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { RoleSwitcher } from './components/RoleSwitcher';
import { ChallengeWizardModal } from './components/ChallengeWizardModal';
import { LandingPage } from './pages/LandingPage';
import { GovernmentDashboard } from './pages/GovernmentDashboard';
import { UniversityDashboard } from './pages/UniversityDashboard';
import { IndustryDashboard } from './pages/IndustryDashboard';
import { ProjectWorkspacePage } from './pages/ProjectWorkspacePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AIEvaluationPage } from './pages/AIEvaluationPage';
import { PlusCircle, Layers, ShieldCheck, GraduationCap, Building2, BarChart3, Cpu, Globe } from 'lucide-react';

export function App() {
  const [currentRole, setCurrentRole] = useState('CITIZEN');
  const [activeTab, setActiveTab] = useState('LANDING'); // LANDING, GOV, UNIV, INDUSTRY, PROJECT, ANALYTICS, AI
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const handleRoleSelect = (role: string) => {
    setCurrentRole(role);
    if (role === 'CITIZEN') setActiveTab('LANDING');
    else if (role === 'GOVERNMENT') setActiveTab('GOV');
    else if (role === 'UNIVERSITY') setActiveTab('UNIV');
    else if (role === 'INDUSTRY') setActiveTab('INDUSTRY');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-brand-500 selection:text-white">
      {/* Demo Role Switcher */}
      <RoleSwitcher currentRole={currentRole} onSelectRole={handleRoleSelect} />

      {/* Main Header */}
      <Header />

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between h-14 gap-2">
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs font-bold overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('LANDING')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition ${
                activeTab === 'LANDING' ? 'bg-brand-50 text-brand-700 font-extrabold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('GOV')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition ${
                activeTab === 'GOV' ? 'bg-indigo-50 text-indigo-700 font-extrabold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Government Ops</span>
            </button>
            <button
              onClick={() => setActiveTab('UNIV')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition ${
                activeTab === 'UNIV' ? 'bg-emerald-50 text-emerald-700 font-extrabold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>University Hub</span>
            </button>
            <button
              onClick={() => setActiveTab('INDUSTRY')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition ${
                activeTab === 'INDUSTRY' ? 'bg-amber-50 text-amber-700 font-extrabold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Industry Portal</span>
            </button>
            <button
              onClick={() => setActiveTab('PROJECT')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition ${
                activeTab === 'PROJECT' ? 'bg-slate-900 text-white font-extrabold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Project Workspace</span>
            </button>
            <button
              onClick={() => setActiveTab('ANALYTICS')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition ${
                activeTab === 'ANALYTICS' ? 'bg-sky-50 text-sky-700 font-extrabold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('AI')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition ${
                activeTab === 'AI' ? 'bg-purple-50 text-purple-700 font-extrabold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>AI Metrics</span>
            </button>
          </div>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Report Problem</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1">
        {activeTab === 'LANDING' && <LandingPage />}
        {activeTab === 'GOV' && <GovernmentDashboard onSelectChallenge={() => setActiveTab('PROJECT')} />}
        {activeTab === 'UNIV' && <UniversityDashboard onSelectProject={() => setActiveTab('PROJECT')} />}
        {activeTab === 'INDUSTRY' && <IndustryDashboard />}
        {activeTab === 'PROJECT' && <ProjectWorkspacePage />}
        {activeTab === 'ANALYTICS' && <AnalyticsPage />}
        {activeTab === 'AI' && <AIEvaluationPage />}
      </main>

      {/* 4-Step Submission Wizard Modal */}
      <ChallengeWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={() => {
          setActiveTab('GOV');
        }}
      />

      <Footer />
    </div>
  );
}

export default App;
