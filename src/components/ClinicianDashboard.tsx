import React, { useState, useEffect } from 'react';
import { SalamaDatabase, UserProfile, RiskAssessmentResult, SalamaApiService } from '../services/api';
import { 
  Users, 
  AlertTriangle, 
  Activity, 
  Heart, 
  TrendingUp, 
  Calendar, 
  Search, 
  Filter, 
  ShieldAlert, 
  ChevronRight, 
  ArrowUpRight,
  Stethoscope,
  HeartPulse,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ClinicianDashboardProps {
  openAssessmentModal: (assessment: RiskAssessmentResult) => void;
  openBookingModalForPatient: (patientEmail: string, patientName: string) => void;
}

// Concrete static profiles for high fidelity clinical list
interface PatientItem {
  id: string;
  name: string;
  email: string;
  risk_score: number; // percentage
  risk_label: 'High' | 'Borderline' | 'Low';
  vitals: {
    blood_pressure: string;
    cholesterol: number;
    glucose: number;
    heart_rate: number;
  };
  risks: {
    cvd: number;
    hypertension: number;
    stroke: number;
    chd: number;
  };
  profile: UserProfile;
}

export default function ClinicianDashboard({ openAssessmentModal, openBookingModalForPatient }: ClinicianDashboardProps) {
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertFilter, setAlertFilter] = useState<'all' | 'high' | 'borderline'>('all');
  const [loading, setLoading] = useState(true);
  
  // Dashboard alarms states (Page 12 Panel)
  const [alerts, setAlerts] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    async function fetchPatients() {
      try {
        setLoading(true);
        const data = await SalamaApiService.getClinicianPatients();
        setPatients(data);
        if (data.length > 0) {
          setSelectedPatient(data[0]);
          
          // Generate automated live alerts based on actual high/critical patients in DB!
          const highRisk = data.filter(p => p.risk_score >= 60);
          const generatedAlerts = highRisk.map((p, index) => ({
            id: `al-${p.id}-${index}`,
            text: `⚠️ High CVD risk alert for ${p.name} (${p.risk_score}%). Immediate specialist review recommended.`
          }));
          setAlerts(generatedAlerts);
        }
      } catch (err) {
        console.error('Error fetching clinical patients:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, []);

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(x => x.id !== id));
    confetti({ particleCount: 20 });
  };

  // Filter patients
  const filteredPatients = patients.filter(pat => {
    const matchesSearch = pat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pat.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (alertFilter === 'high') {
      return matchesSearch && pat.risk_score >= 60;
    }
    if (alertFilter === 'borderline') {
      return matchesSearch && (pat.risk_score >= 30 && pat.risk_score < 60);
    }
    return matchesSearch;
  });

  const getRiskLabelColor = (score: number) => {
    if (score >= 60) return 'text-rose-600 bg-rose-50 border-rose-100';
    if (score >= 30) return 'text-orange-600 bg-orange-50 border-orange-100';
    return 'text-emerald-600 bg-emerald-50 border-emerald-100';
  };

  const getRiskBarColor = (score: number) => {
    if (score >= 60) return 'bg-rose-500';
    if (score >= 30) return 'bg-orange-400';
    return 'bg-emerald-400';
  };

  return (
    <div className="font-sans p-6 pb-20 overflow-y-auto h-screen max-w-7xl mx-auto space-y-6">
      
      {/* 1. Clinician Header Title (Page 12 layout) */}
      <div className="border-b border-slate-100 pb-5">
        <span className="text-[10px] font-black tracking-widest text-[#10B981] block uppercase font-mono">
          CLINICIAN SUITE
        </span>
        <h1 className="text-2xl font-black text-gray-950 tracking-tight">
          Clinician Monitoring Console
        </h1>
        <p className="text-xs text-slate-500 font-semibold">
          Real-time cardiovascular triage alerts and patient medical record reviews.
        </p>
      </div>

      {/* 2. Three Info cards at top of Clinician Dashboard (Page 12) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Patients */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Patients</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-slate-900">{patients.length}</span>
              <span className="text-[10px] uppercase tracking-wide text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                Active Records
              </span>
            </div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* High Risk Alerts */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">High Risk Alerts</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-rose-600">
                {patients.filter(p => p.risk_score >= 60).length}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md">
                Need Immediate Review
              </span>
            </div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        {/* Total Assessments */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Assessments</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-slate-900">{patients.length}</span>
              <span className="text-[10px] uppercase tracking-wide text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                ML Predictions Run
              </span>
            </div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
            <Activity className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* 3. Alerts Panels (Page 12 Critical Alerts) */}
      {alerts.length > 0 && (
        <div className="bg-rose-50/20 border border-rose-100 p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-rose-700">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
            <h3 className="text-xs font-black uppercase tracking-wider font-mono">Critical Security & Risk Alerts ({alerts.length})</h3>
          </div>
          <div className="space-y-2">
            {alerts.map((al) => (
              <div 
                key={al.id} 
                className="bg-white border border-rose-100/50 p-3.5 rounded-xl flex items-center justify-between gap-4 text-xs font-semibold text-slate-700 shadow-sm"
              >
                <span>{al.text}</span>
                <button
                  onClick={() => handleDeleteAlert(al.id)}
                  className="text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Main Two-column triage workspaces layout (Page 11 and 12) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Patients listings */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
            <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider font-sans">Patients Finder</h3>
            <span className="text-[10px] text-slate-400 font-bold font-mono">{filteredPatients.length} Linked</span>
          </div>

          {/* Search box & filter dials */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-bold leading-normal outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setAlertFilter('all')}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                  alertFilter === 'all' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100'
                }`}
              >
                All Patients
              </button>
              <button
                type="button"
                onClick={() => setAlertFilter('high')}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                  alertFilter === 'high' 
                    ? 'bg-rose-500 text-white shadow-sm' 
                    : 'bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100'
                }`}
              >
                High Risk 🚨
              </button>
              <button
                type="button"
                onClick={() => setAlertFilter('borderline')}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                  alertFilter === 'borderline' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                }`}
              >
                Intermediate
              </button>
            </div>
          </div>

          {/* Patients cards list */}
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {loading ? (
              <div className="py-8 text-center text-slate-400 font-semibold text-xs leading-normal">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-400 mx-auto mb-2"></div>
                Loading patients database...
              </div>
            ) : (
              <>
                {filteredPatients.map((pat) => (
                  <button
                    key={pat.id}
                    onClick={() => setSelectedPatient(pat)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col justify-between cursor-pointer group hover:border-slate-300 ${
                      selectedPatient && selectedPatient.id === pat.id 
                        ? 'bg-slate-50 border-slate-300 ring-1 ring-slate-200' 
                        : 'bg-white border-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900 text-xs truncate">{pat.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium font-mono truncate">{pat.email}</p>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border uppercase ${getRiskLabelColor(pat.risk_score)}`}>
                        {pat.risk_score}%
                      </span>
                    </div>
                    
                    {/* Risk load slider */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getRiskBarColor(pat.risk_score)} rounded-full`} 
                        style={{ width: `${pat.risk_score}%` }}
                      ></div>
                    </div>
                  </button>
                ))}

                {filteredPatients.length === 0 && (
                  <div className="py-6 text-center text-slate-400 font-semibold text-xs leading-normal">
                    No matched patient records found.
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Side: Selected patient detailed view (Page 11 Layout) */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 shadow-sm text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981] mx-auto mb-4"></div>
              <p className="text-xs font-semibold text-slate-500">Loading patient details...</p>
            </div>
          ) : selectedPatient ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              
              {/* Top row actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{selectedPatient.name}</h2>
                  <span className="text-xs text-slate-400 font-semibold font-mono">{selectedPatient.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-rose-50 border border-rose-100 rounded-xl text-xs font-black text-rose-700">
                    CVD Risk: {selectedPatient.risk_score}%
                  </span>
                  <button
                    onClick={() => openBookingModalForPatient(selectedPatient.email, selectedPatient.name)}
                    className="bg-[#10B981] hover:bg-emerald-600 font-bold text-white py-1.5 px-3 rounded-xl text-xs shadow-md shadow-emerald-500/10 cursor-pointer flex items-center gap-1"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Schedule Appointment
                  </button>
                </div>
              </div>

              {/* Selected patient vital stats display cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 text-center">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Blood Pressure</span>
                  <span className="block text-sm font-extrabold text-slate-800 mt-0.5">{selectedPatient.vitals.blood_pressure}</span>
                </div>

              <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Cholesterol</span>
                <span className="block text-sm font-extrabold text-slate-800 mt-0.5">{selectedPatient.vitals.cholesterol} mg/dL</span>
              </div>

              <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Glucose</span>
                <span className="block text-sm font-extrabold text-slate-800 mt-0.5">{selectedPatient.vitals.glucose} mg/dL</span>
              </div>

              <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Heart Rate</span>
                <span className="block text-sm font-extrabold text-slate-800 mt-0.5">{selectedPatient.vitals.heart_rate} BPM</span>
              </div>

            </div>

            {/* Profile properties labels row */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-b border-slate-50 py-3 text-xs font-semibold text-slate-600">
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg">Smoking: <b className="text-slate-800 capitalize">{selectedPatient.profile.smoking}</b></span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg">Diabetes: <b className="text-slate-800">{selectedPatient.profile.diabetes ? 'Yes' : 'No'}</b></span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg">Physical Activity: <b className="text-slate-800 capitalize">{selectedPatient.profile.physical_activity_level || 'Low'}</b></span>
            </div>

            {/* Multi-Disease risk indicator list (matching Page 11 bottom panel exactly) */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#10B981] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Activity className="h-4.5 w-4.5" />
                Multi-Disease Risk Assessment
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 border border-rose-100 rounded-2xl bg-rose-50/20">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-black text-rose-800 uppercase tracking-wide">Cardiovascular Disease</span>
                    <span className="text-[10px] font-black text-rose-600 bg-white px-2 py-0.5 rounded-lg border border-rose-100">High</span>
                  </div>
                  <span className="text-2xl font-black text-rose-600">{selectedPatient.risks.cvd.toFixed(1)}%</span>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">CVD risk evaluated based on age, blood pressure, and total lipid levels.</p>
                </div>

                <div className="p-4 border border-orange-100 rounded-2xl bg-orange-50/20">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-black text-orange-800 uppercase tracking-wide">Hypertension Indicator</span>
                    <span className="text-[10px] font-black text-orange-600 bg-white px-2 py-0.5 rounded-lg border border-orange-100">High</span>
                  </div>
                  <span className="text-2xl font-black text-orange-600">{selectedPatient.risks.hypertension.toFixed(1)}%</span>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">Hypertension indicator risk values mapped from systolic ratios.</p>
                </div>

                <div className="p-4 border border-blue-100 rounded-2xl bg-blue-50/20">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-black text-blue-800 uppercase tracking-wide">Stroke Potential</span>
                    <span className="text-[10px] font-black text-blue-600 bg-white px-2 py-0.5 rounded-lg border border-blue-100">Borderline</span>
                  </div>
                  <span className="text-2xl font-black text-blue-600">{selectedPatient.risks.stroke.toFixed(1)}%</span>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">Ischemic stroke metrics calculated from vascular loading values.</p>
                </div>

                <div className="p-4 border border-teal-100 rounded-2xl bg-teal-50/20">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-black text-teal-800 uppercase tracking-wide">Coronary Heart Disease</span>
                    <span className="text-[10px] font-black text-teal-600 bg-white px-2 py-0.5 rounded-lg border border-teal-100">Borderline</span>
                  </div>
                  <span className="text-2xl font-black text-teal-600">{selectedPatient.risks.chd.toFixed(1)}%</span>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">CHD risk values calculated considering family histories constraints.</p>
                </div>

              </div>
            </div>

            {/* SHAP explanation link button inside clinician page (Page 11 bottom timeline) */}
            <div className="pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Assessment History & Logs</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">6/1/2026: Elevated blood pressure and cholesterol levels mapped.</p>
                </div>
                
                <button
                  onClick={() => {
                    // Fetch the actual patient's assessment from the local Database so it is consistent with the patient's view!
                    const latestAs = SalamaDatabase.getRiskAssessments(selectedPatient.email)[0];
                    openAssessmentModal(latestAs);
                    confetti({ particleCount: 30, colors: ['#10B981', '#34d399'] });
                  }}
                  className="py-1.5 px-3 border border-[#10B981]/20 hover:bg-[#10B981]/10 text-[#10B981] rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Activity className="h-4 w-4 text-[#10B981]" />
                  SHAP Analysis
                </button>
              </div>
            </div>

          </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 shadow-sm text-center flex flex-col items-center justify-center space-y-3">
              <Stethoscope className="h-10 w-10 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">No Patient Selected</h3>
              <p className="text-xs text-slate-500 font-semibold max-w-sm">
                Select a patient from the list on the left to review their dynamic multi-disease assessment metrics, latest vitals, and SHAP explainability.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
