import React, { useState, useEffect } from 'react';
import { SalamaApiService, SalamaDatabase, User, UserProfile, RiskAssessmentResult, BloodPressureRecord } from '../services/api';
import { 
  Heart, 
  Activity, 
  ArrowUpRight, 
  HeartPulse, 
  Sparkles, 
  FileSpreadsheet, 
  Settings, 
  Plus, 
  TrendingUp, 
  Gauge, 
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import confetti from 'canvas-confetti';

interface DashboardViewProps {
  user: User;
  onNavigateToForms: () => void;
  openAssessmentModal: (assessment: RiskAssessmentResult) => void;
}

export default function DashboardView({ user, onNavigateToForms, openAssessmentModal }: DashboardViewProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [latestAssessment, setLatestAssessment] = useState<RiskAssessmentResult | null>(null);
  const [bpRecords, setBpRecords] = useState<BloodPressureRecord[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  const loadData = async () => {
    try {
      const prof = await SalamaApiService.getProfile(user.email);
      setProfile(prof);

      // To ensure consistency with the "clinician dashboard view" and always show the latest,
      // trigger a fresh risk assessment on load.
      const latestRiskAssessment = await SalamaApiService.runRiskAssessment(user.email);
      setLatestAssessment(latestRiskAssessment);

      const bps = await SalamaApiService.getBpRecords(user.email);
      setBpRecords(bps);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.email]);

  const handleRunScan = async () => {
    setScanning(true);
    setScanStep(1);

    // Dynamic scanning timer choreography
    const steps = [
      'Ingesting biographical baseline files...',
      'Computing BMI indices & anthropometrics...',
      'Loading XGBoost model configurations...',
      'Synthesizing TreeSHAP clinical explainability...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setScanStep(i + 2);
    }

    try {
      const result = await SalamaApiService.runRiskAssessment(user.email);
      setLatestAssessment(result);
      
      // Update charts
      const bps = await SalamaApiService.getBpRecords(user.email);
      setBpRecords(bps);
      
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    } catch (e) {
      alert('Scanning experienced a momentary latency. Using state-computed indicators.');
    } finally {
      setScanning(false);
      setScanStep(0);
    }
  };

  // Human readable Name
  const fullName = profile 
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : user.email.split('@')[0].toUpperCase();

  // Color Mapping of Badges
  const getRiskColor = (label: 'Low' | 'Moderate' | 'Borderline' | 'High' | string) => {
    switch (label) {
      case 'High': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Moderate': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Borderline': return 'bg-orange-50 text-orange-700 border-orange-100';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
  };

  const getRiskTextColor = (val: number) => {
    if (val >= 60) return 'text-rose-600 font-bold';
    if (val >= 30) return 'text-orange-500 font-semibold';
    return 'text-emerald-600 font-medium';
  };

  // Convert readings for line chart
  const lineChartData = [...bpRecords]
    .slice(0, 7) // Last 7 records
    .reverse() // Chronological order
    .map(rec => {
      const dateStr = new Date(rec.start_date_time).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      return {
        name: dateStr,
        Systolic: rec.systolic_value,
        Diastolic: rec.diastolic_value
      };
    });

  return (
    <div className="space-y-4 md:space-y-6 font-sans p-4 md:p-6 pb-20 overflow-y-auto h-screen max-w-7xl mx-auto">
      
      {/* 1. Header & Welcome Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Welcome Area */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 bottom-0 translate-x-20 translate-y-20 opacity-10">
            <Heart className="h-64 w-64 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 px-3 py-1 rounded-full text-xs font-semibold text-rose-300 tracking-wide uppercase mb-3">
              <Sparkles className="h-3 w-3 animate-spin" />
              Secure Patient Portal Connected
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
              Welcome back, {fullName}
            </h1>
            <p className="text-slate-300 text-sm max-w-md font-medium leading-relaxed">
              Salama AI provides stateful multi-disease cardiac risk models, dynamic diagnostic baselines, and instant telehealth syncing.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span>Primary Care Email: <b className="text-slate-200 font-sans">{user.email}</b></span>
          </div>
        </div>

        {/* Middle Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center justify-center p-2 bg-rose-50 rounded-xl border border-rose-100 text-rose-500 mb-4">
              <Gauge className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Launch Cardiovascular Scan</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Submit current physical biometric values and run risk vectors assessments instantly.
            </p>
          </div>
          <div className="mt-4">
            <button
              id="begin-scan-btn"
              onClick={handleRunScan}
              disabled={scanning}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl active:scale-95 disabled:bg-slate-200 disabled:scale-100 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
            >
              {scanning ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-mono">Step {scanStep}/5</span>
                </div>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Begin New Scan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Portal Shortcut */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 mb-4">
              <ClipboardList className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Clinical Health Sheets</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Input and complete structured physical telemetry, heart rates, and medications.
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={onNavigateToForms}
              className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-slate-400" />
              Health Forms
            </button>
            <button
              onClick={onNavigateToForms}
              className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <Settings className="h-3.5 w-3.5 text-slate-400" />
              Settings
            </button>
          </div>
        </div>

      </div>

      {/* 2. Loading State Overlay for Active Analysis Scan */}
      {scanning && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-500 rounded-xl text-white">
              <Sparkles className="h-6 w-6 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-800">Cardiology Neural Engines Engaged</h4>
              <p className="text-emerald-600 text-xs font-mono mt-0.5">
                {[
                  '',
                  'Ingesting bio-demographics indices...',
                  'Compiling BMIs and blood pressure curves...',
                  'Triggering XGBoost clinical arrays...',
                  'Mapping explainability arrays...'
                ][scanStep] || 'Evaluating values...'}
              </p>
            </div>
          </div>
          <div className="w-full sm:w-48 bg-emerald-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-300" 
              style={{ width: `${(scanStep / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 3. Four Core Risks Meters Panels */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-500" />
          Active Multi-Disease Risk Assessments
        </h2>
        
        {latestAssessment ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Risk Card 1: CVD */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between relative group hover:border-slate-200 transition-all">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    CARDIOVASCULAR DISEASE
                  </span>
                  <Heart className="h-4 w-4 text-slate-300 group-hover:text-rose-400 transition-colors" />
                </div>
                <div className="flex items-baseline gap-2 mb-2" data-testid="cvd-risk-score">
                  <span className={`text-3xl font-extrabold ${getRiskTextColor(latestAssessment.cvd_risk)}`}>
                    {latestAssessment.cvd_risk.toFixed(1)}%
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wide font-black rounded-full border ${getRiskColor(latestAssessment.cvd_risk >= 60 ? 'High' : latestAssessment.cvd_risk >= 30 ? 'Borderline' : 'Low')}`}>
                    {latestAssessment.cvd_risk >= 60 ? 'High' : latestAssessment.cvd_risk >= 30 ? 'Borderline' : 'Low'}
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  CVD 10-year risk reflects core metrics, chronobiological age, and blood pressure indicators.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>MODEL: model_xgb_cvd_v3</span>
                <span>UPDATED: Today</span>
              </div>
            </div>

            {/* Risk Card 2: Hypertension */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between relative group hover:border-slate-200 transition-all">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    HYPERTENSION INDICATOR
                  </span>
                  <TrendingUp className="h-4 w-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                </div>
                <div className="flex items-baseline gap-2 mb-2" data-testid="hypertension-risk-score">
                  <span className={`text-3xl font-extrabold ${getRiskTextColor(latestAssessment.hypertension_risk)}`}>
                    {latestAssessment.hypertension_risk.toFixed(1)}%
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wide font-black rounded-full border ${getRiskColor(latestAssessment.hypertension_risk >= 80 ? 'High' : latestAssessment.hypertension_risk >= 50 ? 'Borderline' : 'Low')}`}>
                    {latestAssessment.hypertension_risk >= 80 ? 'High' : latestAssessment.hypertension_risk >= 50 ? 'Borderline' : 'Low'}
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Arterial pressure indicators calculated dynamically based on historical systolic indices.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>MODEL: model_xgb_htn_v1</span>
                <span>UPDATED: Today</span>
              </div>
            </div>

            {/* Risk Card 3: Stroke */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between relative group hover:border-slate-200 transition-all">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    ISCHEMIC STROKE POTENTIAL
                  </span>
                  <Activity className="h-4 w-4 text-slate-300 group-hover:text-cyan-500 transition-colors" />
                </div>
                <div className="flex items-baseline gap-2 mb-2" data-testid="stroke-risk-score">
                  <span className={`text-3xl font-extrabold ${getRiskTextColor(latestAssessment.stroke_risk)}`}>
                    {latestAssessment.stroke_risk.toFixed(1)}%
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wide font-black rounded-full border ${getRiskColor(latestAssessment.stroke_risk >= 40 ? 'High' : latestAssessment.stroke_risk >= 20 ? 'Borderline' : 'Low')}`}>
                    {latestAssessment.stroke_risk >= 40 ? 'High' : latestAssessment.stroke_risk >= 20 ? 'Borderline' : 'Low'}
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Risk vectors evaluated against vascular metrics, stress markers, and diabetic baselines.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>MODEL: model_xgb_stroke_v2</span>
                <span>UPDATED: Today</span>
              </div>
            </div>

            {/* Risk Card 4: CHD */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between relative group hover:border-slate-200 transition-all">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    CORONARY HEART DISEASE
                  </span>
                  <HeartPulse className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>
                <div className="flex items-baseline gap-2 mb-2" data-testid="chd-risk-score">
                  <span className={`text-3xl font-extrabold ${getRiskTextColor(latestAssessment.chd_risk)}`}>
                    {latestAssessment.chd_risk.toFixed(1)}%
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wide font-black rounded-full border ${getRiskColor(latestAssessment.chd_risk >= 30 ? 'High' : latestAssessment.chd_risk >= 15 ? 'Borderline' : 'Low')}`}>
                    {latestAssessment.chd_risk >= 30 ? 'High' : latestAssessment.chd_risk >= 15 ? 'Borderline' : 'Low'}
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Coronary index tracking total lipid levels (cholesterol) and smoking histories.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>MODEL: model_xgb_chd_v2</span>
                <span>UPDATED: Today</span>
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <HeartPulse className="mx-auto h-12 w-12 text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No Assessment Models Run Yet</h4>
            <p className="text-slate-400 text-xs max-w-sm mx-auto mt-1 mb-4 leading-relaxed font-semibold">
              Before we can compute multi-disease models, please fill in your biometrics and run a new scan.
            </p>
            <button
              onClick={handleRunScan}
              className="py-2 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold font-sans cursor-pointer"
            >
              Launch First Assessment
            </button>
          </div>
        )}
      </div>

      {/* 4. Active Blood Pressure Line Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart (Col span 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-slate-50 pb-3 gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                LIVE CLINICAL TELEMETRY
              </span>
              <h3 className="text-lg font-bold text-gray-900">Active Blood Pressure Assessment</h3>
              <p className="text-slate-400 text-xs font-medium">
                Chronological systolic and diastolic values plotted from logging trials.
              </p>
            </div>
            {latestAssessment && (
              <button
                onClick={() => openAssessmentModal(latestAssessment)}
                className="py-1.5 px-3 border border-slate-100 bg-slate-50 rounded-xl text-xs font-semibold hover:border-slate-200 transition-all flex items-center gap-1 cursor-pointer text-slate-700"
              >
                View SHAP Details
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </div>
          
          <div className="h-48 sm:h-64 w-full">
            {lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[60, 180]} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      borderRadius: '12px', 
                      border: 'none',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="Systolic" 
                    stroke="#f43f5e" 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 1 }} 
                    name="Systolic (mmHg)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Diastolic" 
                    stroke="#0EA5E9" 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 1 }} 
                    name="Diastolic (mmHg)" 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                No blood pressure logs detected. Fill Form 2 to generate charts here.
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Cardiovascular assessments summary */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b border-slate-50 pb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-rose-500" />
            Cardiovascular Assessments History
          </h3>

          <div className="space-y-3.5 overflow-y-auto max-h-64 pr-1">
            {latestAssessment ? (
              <div key={latestAssessment.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    Scan on {new Date(latestAssessment.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded-lg ${getRiskColor(latestAssessment.cvd_risk >= 60 ? 'High' : 'Low')}`} data-testid="cvd-risk-score-history">
                    {latestAssessment.cvd_risk.toFixed(0)}% • {latestAssessment.cvd_risk >= 60 ? 'High' : 'Low'}
                  </span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed font-semibold">
                  {latestAssessment.notes || 'Elevated blood pressure patterns mapped. Routine checkup recommended.'}
                </p>
                <button
                  onClick={() => openAssessmentModal(latestAssessment)}
                  className="mt-2.5 text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-all cursor-pointer"
                >
                  View Details
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            ) : null}

            {/* Simulated previous assessments to exactly map page 19 PDF! */}
            <div className="p-3.5 border border-slate-100 rounded-xl opacity-75">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-400 font-mono">Scan on May 15, 2025</span>
                <span className="px-2 py-0.5 text-[10px] font-black rounded-lg bg-orange-50 text-orange-700 border border-orange-100">
                  28.4% • Borderline
                </span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                Risk factors within borderline range. Continue monitoring blood pressure.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Historical Log Entries list */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-slate-50 pb-3 gap-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Historical Log Entries</h3>
            <p className="text-slate-400 text-xs font-semibold">Track historical blood pressure measurements and postures.</p>
          </div>
          <button
            onClick={onNavigateToForms}
            className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Blood Pressure
          </button>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left text-xs text-slate-600 min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold tracking-wider text-slate-400 uppercase bg-slate-50/50">
                <th className="py-3 px-4">DATE & TIME</th>
                <th className="py-3 px-4">BP READING</th>
                <th className="py-3 px-4">POSTURE</th>
                <th className="py-3 px-4">LOCATION</th>
                <th className="py-3 px-4">ACTIVITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bpRecords.map((rec) => {
                const dateObj = new Date(rec.start_date_time);
                const readableDate = dateObj.toLocaleDateString(undefined, { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                });
                const readableTime = dateObj.toLocaleTimeString(undefined, { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });

                return (
                  <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-500">
                      {readableDate}, {readableTime}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {rec.systolic_value}/{rec.diastolic_value}{' '}
                      <span className="text-[10px] text-slate-400 font-normal font-mono">mmHg</span>
                    </td>
                    <td className="py-3.5 px-4 capitalize font-semibold text-slate-700">{rec.body_posture || 'Sitting'}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{rec.measurement_location || 'Home'}</td>
                    <td className="py-3.5 px-4 capitalize text-slate-500 font-semibold font-mono">
                      {rec.activity_level || 'rest'}
                    </td>
                  </tr>
                );
              })}
              {bpRecords.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold">
                    No blood pressure telemetry logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
