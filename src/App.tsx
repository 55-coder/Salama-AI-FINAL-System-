import React, { useState, useEffect } from 'react';
import { SalamaApiService, User, RiskAssessmentResult } from './services/api';
import AuthScreens from './components/AuthScreens';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import HealthDataForms from './components/HealthDataForms';
import AppointmentsView from './components/AppointmentsView';
import RiskHistoryView from './components/RiskHistoryView';
import ClinicianDashboard from './components/ClinicianDashboard';
import ClinicianAppointments from './components/ClinicianAppointments';
import ClinicianPrescriptions from './components/ClinicianPrescriptions';

import { 
  Heart, 
  X, 
  Sparkles, 
  Activity, 
  Activity as HeartPulse, 
  TrendingUp, 
  Award,
  BookOpen,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Shared Modal overlays
  const [selectedAssessmentDetail, setSelectedAssessmentDetail] = useState<RiskAssessmentResult | null>(null);
  const [activeShapDisease, setActiveShapDisease] = useState<'cvd' | 'hypertension' | 'stroke' | 'chd'>('cvd');

  // Sync / Reset SHAP disease tab when switching patient details
  useEffect(() => {
    if (selectedAssessmentDetail) {
      setActiveShapDisease('cvd');
    }
  }, [selectedAssessmentDetail]);

  // Authenticate user on startup if already stored
  useEffect(() => {
    const active = SalamaApiService.getActiveUser();
    if (active) {
      setUser(active);
      // Select appropriate default tab
      setActiveTab(active.role === 'clinician' ? 'patients' : 'dashboard');
    }
  }, []);

  const handleLoginSuccess = (usr: User) => {
    setUser(usr);
    setActiveTab(usr.role === 'clinician' ? 'patients' : 'dashboard');
    confetti({ particleCount: 120, spread: 80, colors: ['#ec4899', '#f43f5e'] });
  };

  const handleLogout = () => {
    SalamaApiService.logout();
    setUser(null);
    setSelectedAssessmentDetail(null);
    confetti({ particleCount: 30 });
  };

  // Switch tabs/view based on active session
  const renderPatientTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            user={user!} 
            onNavigateToForms={() => setActiveTab('health_data')} 
            openAssessmentModal={(ass) => setSelectedAssessmentDetail(ass)}
          />
        );
      case 'health_data':
        return (
          <HealthDataForms 
            user={user!} 
            onScanCompleted={() => setActiveTab('risk_history')}
          />
        );
      case 'appointments':
        return <AppointmentsView user={user!} />;
      case 'risk_history':
        return (
          <RiskHistoryView 
            user={user!} 
            openAssessmentModal={(ass) => setSelectedAssessmentDetail(ass)} 
          />
        );
      default:
        return (
          <DashboardView 
            user={user!} 
            onNavigateToForms={() => setActiveTab('health_data')} 
            openAssessmentModal={(ass) => setSelectedAssessmentDetail(ass)}
          />
        );
    }
  };

  const renderClinicianTabContent = () => {
    switch (activeTab) {
      case 'patients':
        return (
          <ClinicianDashboard 
            openAssessmentModal={(ass) => setSelectedAssessmentDetail(ass)} 
            openBookingModalForPatient={(email, name) => {
              // Direct route to schedules tab for instant scheduling
              setActiveTab('appointments');
            }}
          />
        );
      case 'appointments':
        return <ClinicianAppointments />;
      case 'prescriptions':
        return <ClinicianPrescriptions />;
      default:
        return (
          <ClinicianDashboard 
            openAssessmentModal={(ass) => setSelectedAssessmentDetail(ass)} 
            openBookingModalForPatient={(email, name) => {
              setActiveTab('appointments');
            }}
          />
        );
    }
  };

  if (!user) {
    return <AuthScreens onLoginSuccess={handleLoginSuccess} />;
  }

  // Generate dynamic progression descriptors for the SHAP modal matching Page 5 & 7 of the PDF
  const hasShapData = selectedAssessmentDetail && selectedAssessmentDetail.shap_values;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Navigation Sidebar Drawer */}
      <Sidebar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />

      {/* Main viewport area */}
      <main className="flex-1 overflow-hidden relative">
        {user.role === 'clinician' ? renderClinicianTabContent() : renderPatientTabContent()}
      </main>

      {/* ============================================================= */}
      {/* ADVANCED HEALTH DIAGNOSTICS & SHAP MODEL VISUALIZATION MODAL */}
      {/* ============================================================= */}
      {selectedAssessmentDetail && (() => {
        const getSelectedDiseaseRisk = (): { name: string; score: number } => {
          switch (activeShapDisease) {
            case 'cvd':
              return { name: 'Cardiovascular Disease', score: selectedAssessmentDetail.cvd_risk };
            case 'hypertension':
              return { name: 'Hypertension', score: selectedAssessmentDetail.hypertension_risk };
            case 'stroke':
              return { name: 'Ischemic Stroke', score: selectedAssessmentDetail.stroke_risk };
            case 'chd':
              return { name: 'Coronary Heart', score: selectedAssessmentDetail.chd_risk };
            default:
              return { name: 'Cardiovascular', score: selectedAssessmentDetail.cvd_risk };
          }
        };

        const activeRiskDetails = getSelectedDiseaseRisk();

        const getActiveShapObject = (): Record<string, number> => {
          switch (activeShapDisease) {
            case 'cvd':
              return selectedAssessmentDetail.shap_values_cvd || selectedAssessmentDetail.shap_values || {};
            case 'hypertension':
              return selectedAssessmentDetail.shap_values_hypertension || {};
            case 'stroke':
              return selectedAssessmentDetail.shap_values_stroke || {};
            case 'chd':
              return selectedAssessmentDetail.shap_values_chd || {};
            default:
              return selectedAssessmentDetail.shap_values || {};
          }
        };

        const activeShapDataObj = getActiveShapObject();
        const hasShapDataVal = Object.keys(activeShapDataObj).length > 0;

        return (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
              
              {/* Header section (Page 7 Banner colors) */}
              <div className="bg-slate-900 px-6 py-4 text-white shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <HeartPulse className="h-5.5 w-5.5 text-rose-400 animate-pulse fill-rose-400" />
                  <div>
                    <h3 className="font-extrabold text-sm tracking-wider uppercase font-sans">Advanced Clinical Diagnostics</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Telemetry Assessment Record • REF #{selectedAssessmentDetail.id}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAssessmentDetail(null)}
                  className="hover:bg-white/10 p-1.5 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrolling content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* Disease Selector Tabs for SHAP Explainability */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Select Pathology Layer</span>
                  <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl">
                    {[
                      { id: 'cvd', label: 'CVD' },
                      { id: 'hypertension', label: 'Hypertension' },
                      { id: 'stroke', label: 'Stroke' },
                      { id: 'chd', label: 'Coronary Heart' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveShapDisease(tab.id as any)}
                        className={`flex-1 text-[11px] font-bold py-1.5 px-3 rounded-xl transition-all cursor-pointer text-center whitespace-nowrap ${
                          activeShapDisease === tab.id
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Risks overview & progress indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Visual cardiovascular speedometer card */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">{activeRiskDetails.name} Risk Rate</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-black text-rose-600">{Math.round(activeRiskDetails.score)}%</span>
                        <span className="text-xs font-semibold text-slate-500">probability</span>
                      </div>
                    </div>

                    {/* Multi color warning line */}
                    <div className="space-y-1 mt-4">
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                        <div className="bg-emerald-400 h-full" style={{ width: '30%' }}></div>
                        <div className="bg-yellow-400 h-full" style={{ width: '20%' }}></div>
                        <div className="bg-orange-500 h-full" style={{ width: '20%' }}></div>
                        <div className="bg-red-600 h-full flex-1"></div>
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold font-mono">
                        <span>LOW</span>
                        <span>BORDERLINE</span>
                        <span>MODERATE</span>
                        <span className="text-rose-600 font-extrabold">HIGH</span>
                      </div>
                    </div>
                  </div>

                  {/* Patient recorded vitals index lists */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs font-semibold text-slate-600">
                    <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider mb-2">Vitals Telemetry Layer</span>
                    
                    <div className="flex justify-between border-b border-slate-200/50 pb-1">
                      <span>Arterial Pressure:</span>
                      <b className="text-slate-800">{selectedAssessmentDetail.bp_reading || '120/80'} mmHg</b>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/50 pb-1">
                      <span>Serum Cholesterol:</span>
                      <b className="text-slate-800">{selectedAssessmentDetail.cholesterol_mg_dl || 195} mg/dL</b>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/50 pb-1">
                      <span>Blood Glucose:</span>
                      <b className="text-slate-800">{selectedAssessmentDetail.glucose_mg_dl || 95} mg/dL</b>
                    </div>
                    <div className="flex justify-between">
                      <span>Calculated BMI:</span>
                      <b className="text-slate-800">{selectedAssessmentDetail.bmi || 22.8}</b>
                    </div>
                  </div>

                </div>

                {/* SHAP Feature Contribution layout (Page 5) */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <TrendingUp className="h-4.5 w-4.5 text-rose-500" />
                    <h4 className="text-xs uppercase tracking-widest font-black text-rose-600 font-mono">SHAP Feature Contributions Explainability: {activeShapDisease.toUpperCase()}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    These weights show exactly why the machine learning model computed this risk rate. Positive parameters increase vulnerability, whereas lifestyle or active remedies protect performance.
                  </p>

                  <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {/* Dynamic weights list */}
                    {hasShapDataVal ? (
                      Object.entries(activeShapDataObj).map(([key, val]) => {
                        const numericVal = Number(val);
                        const isPositive = numericVal >= 0;
                        return (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold text-slate-700">
                              <span>{key}</span>
                              <span className={isPositive ? 'text-rose-600' : 'text-emerald-600'}>
                                {isPositive ? '+' : ''}{numericVal.toFixed(1)}% Impact
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${isPositive ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${Math.min(Math.abs(numericVal) * 4, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-4 text-center text-xs text-slate-400 font-semibold">
                        No SHAP metadata maps loaded for this disease tab.
                      </div>
                    )}
                  </div>
                </div>

                {/* Consultation clinical notes & recommendations */}
                <div className="p-4 bg-yellow-50/50 border border-yellow-100 rounded-2xl space-y-1.5 text-xs text-amber-800 font-semibold leading-relaxed">
                  <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase font-mono block">Clinical Consultation Memo</span>
                  <p>
                    &ldquo;{selectedAssessmentDetail.notes || 'Active therapeutic review requested. Control arterial tension parameters using prescribed drugs. Limit sodium load intakes. Schedule card-index review sessions within 14 days.'}&rdquo;
                  </p>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0 text-right">
                <button
                  type="button"
                  onClick={() => setSelectedAssessmentDetail(null)}
                  className="py-2 px-5 bg-slate-900 border border-slate-200 text-white rounded-xl text-xs font-bold leading-none cursor-pointer"
                >
                  Close View
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
