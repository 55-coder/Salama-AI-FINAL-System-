import React, { useState, useEffect } from 'react';
import { SalamaApiService, SalamaDatabase, User, UserProfile } from '../services/api';
import { 
  User as UserIcon, 
  Activity, 
  Heart, 
  ClipboardCheck, 
  Sparkles, 
  FileText,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HealthDataFormsProps {
  user: User;
  onScanCompleted?: () => void;
}

export default function HealthDataForms({ user, onScanCompleted }: HealthDataFormsProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'bp' | 'hr' | 'assessment'>('profile');
  
  // 1. User Profile State (Biographical + Cardiac Baseline)
  const [firstName, setFirstName] = useState('Mary');
  const [middleName, setMiddleName] = useState('Wanja');
  const [lastName, setLastName] = useState('Wanjiku');
  const [phone, setPhone] = useState('0712345678');
  const [dob, setDob] = useState('1973-05-15');
  const [sex, setSex] = useState<'male' | 'female' | 'other'>('female');

  const [smoking, setSmoking] = useState<'never' | 'former' | 'smoker' | 'unknown' | 'never_smoked' | 'passive' | 'current_light' | 'current_heavy'>('never_smoked');
  const [diabetes, setDiabetes] = useState(false);
  const [bpHistory, setBpHistory] = useState<'normal' | 'prehypertension' | 'hypertension'>('hypertension');
  const [familyHtn, setFamilyHtn] = useState(false);
  const [familyCvd, setFamilyCvd] = useState(false);
  const [physicalActivity, setPhysicalActivity] = useState<'none' | 'light' | 'moderate' | 'heavy' | 'low' | 'high'>('light');
  const [stressScore, setStressScore] = useState(5);
  const [sleepQuality, setSleepQuality] = useState('Fair');
  const [cigsPerDay, setCigsPerDay] = useState(0);
  const [alcoholUse, setAlcoholUse] = useState<'none' | 'moderate' | 'heavy'>('none');
  const [exerciseFrequency, setExerciseFrequency] = useState('none');
  const [dietQuality, setDietQuality] = useState('average');
  const [saltIntake, setSaltIntake] = useState(0);
  const [sleepDuration, setSleepDuration] = useState(7);

  // Extended Biography, Medical & Chronic State (PDF Page 4 Alignment)
  const [workType, setWorkType] = useState('Private Sector Corporate');
  const [education, setEducation] = useState<'primary' | 'high_school' | 'undergraduate' | 'graduate'>('undergraduate');
  const [heartDisease, setHeartDisease] = useState(false);
  const [prevalentStroke, setPrevalentStroke] = useState(false);
  const [prevalentHypertension, setPrevalentHypertension] = useState(true);
  const [kidneyDisease, setKidneyDisease] = useState(false);
  const [historyCvd, setHistoryCvd] = useState(false);

  // Loading existing profile and mapping active API telemetry records
  useEffect(() => {
    const fetchProfileAndTelemetry = async () => {
      try {
        const prof = await SalamaApiService.getProfile(user.email);
        if (prof.first_name) setFirstName(prof.first_name);
        if (prof.middle_name) setMiddleName(prof.middle_name);
        if (prof.last_name) setLastName(prof.last_name);
        if (prof.phone_number) setPhone(prof.phone_number);
        if (prof.date_of_birth) setDob(prof.date_of_birth);
        if (prof.sex) setSex(prof.sex);
        if (prof.smoking) setSmoking(prof.smoking as any);
        setDiabetes(!!prof.diabetes);
        if (prof.bp_history) setBpHistory(prof.bp_history);
        setFamilyHtn(!!prof.family_history_htn);
        setFamilyCvd(!!prof.family_history_cvd);
        if (prof.physical_activity_level) {
          setPhysicalActivity(prof.physical_activity_level as any);
        }
        if (prof.stress_score) setStressScore(prof.stress_score);
        if (prof.sleep_quality) setSleepQuality(prof.sleep_quality);
        if (prof.cigs_per_day !== undefined) setCigsPerDay(prof.cigs_per_day || 0);
        if (prof.alcohol_use) setAlcoholUse(prof.alcohol_use);
        if (prof.exercise_frequency) setExerciseFrequency(prof.exercise_frequency);
        if (prof.diet_quality) setDietQuality(prof.diet_quality);
        if (prof.salt_intake !== undefined) setSaltIntake(prof.salt_intake || 0);
        if (prof.sleep_duration !== undefined) setSleepDuration(prof.sleep_duration || 7);
        
        // Load occupational/biographical additions
        if (prof.work_type) setWorkType(prof.work_type);
        if (prof.education) setEducation(prof.education as any);
        setHeartDisease(!!prof.heart_disease);
        setPrevalentStroke(!!prof.prevalent_stroke);
        setPrevalentHypertension(!!prof.prevalent_hypertension);
        setKidneyDisease(!!prof.kidney_disease);
        setHistoryCvd(!!prof.history_cvd);
      } catch (e) {
        console.error('Error fetching baseline profile', e);
      }

      try {
        // Fetch and map the blood pressure entries from the API
        const bpRecords = await SalamaApiService.getBpRecords(user.email);
        if (bpRecords.length > 0) {
          const latestBp = bpRecords[0];
          setBpSystolic(latestBp.systolic_value);
          setBpDiastolic(latestBp.diastolic_value);
          if (latestBp.start_date_time) {
            setBpDateTime(latestBp.start_date_time.substring(0, 16));
          }
          if (latestBp.body_posture) setBpPosture(latestBp.body_posture as any);
          if (latestBp.measurement_location) setBpLocation(latestBp.measurement_location);
          if (latestBp.temporal_relationship_to_physical_activity) setBpActivityRelation(latestBp.temporal_relationship_to_physical_activity as any);
          if (latestBp.temporal_relationship_to_sleep) setBpSleepRelation(latestBp.temporal_relationship_to_sleep as any);
        }

        // Fetch and map the heart rate entries from the API
        const hrRecords = await SalamaApiService.getHrRecords(user.email);
        if (hrRecords.length > 0) {
          const latestHr = hrRecords[0];
          setHrValue(latestHr.heart_rate_value);
          if (latestHr.start_date_time) {
            setHrDateTime(latestHr.start_date_time.substring(0, 16));
          }
          if (latestHr.body_posture) setHrPosture(latestHr.body_posture as any);
          if (latestHr.measurement_location) setHrLocation(latestHr.measurement_location);
          if (latestHr.temporal_relationship_to_physical_activity) setHrActivityRelation(latestHr.temporal_relationship_to_physical_activity as any);
          if (latestHr.temporal_relationship_to_sleep) setHrSleepRelation(latestHr.temporal_relationship_to_sleep as any);
        }

        // Fetch and map the health assessment entries from the API
        const assessments = await SalamaApiService.getHealthAssessments(user.email);
        if (assessments.length > 0) {
          const latestAssess = assessments[0];
          if (latestAssess.weight_kg) setAssessWeight(latestAssess.weight_kg);
          if (latestAssess.height_m) setAssessHeight(latestAssess.height_m);
          if (latestAssess.blood_glucose) setAssessGlucose(latestAssess.blood_glucose);
          if (latestAssess.avg_glucose_level) setAssessAvgGlucose(latestAssess.avg_glucose_level);
          if (latestAssess.total_cholesterol) setAssessCholesterol(latestAssess.total_cholesterol);
          if (latestAssess.hdl_cholesterol) setAssessHdlCholesterol(latestAssess.hdl_cholesterol);
          if (latestAssess.notes) setAssessNotes(latestAssess.notes);
          if (latestAssess.taking_bp_medication !== undefined) setAssessTakingBpMeds(latestAssess.taking_bp_medication);
          if (latestAssess.medication_type) setAssessMedClass(latestAssess.medication_type as any);
          if (latestAssess.smoking_status) setAssessSmoking(latestAssess.smoking_status as any);
          if (latestAssess.cigs_per_day !== undefined) setAssessCigsPerDay(latestAssess.cigs_per_day);
          if (latestAssess.alcohol_use) setAssessAlcohol(latestAssess.alcohol_use as any);
          if (latestAssess.physical_activity_level) setAssessPhysicalActivity(latestAssess.physical_activity_level as any);
        }
      } catch (err) {
        console.error('Error fetching baseline telemetry/records', err);
      }
    };
    fetchProfileAndTelemetry();
  }, [user.email]);

  // 2. BP Form State
  const [bpSystolic, setBpSystolic] = useState(120);
  const [bpDiastolic, setBpDiastolic] = useState(80);
  const [bpDateTime, setBpDateTime] = useState('2026-06-08T08:20');
  const [bpPosture, setBpPosture] = useState<'sitting' | 'standing' | 'lying' | 'reclining'>('sitting');
  const [bpLocation, setBpLocation] = useState('Home');
  const [bpActivityRelation, setBpActivityRelation] = useState<'before exercise' | 'after exercise' | 'during exercise' | 'at rest'>('at rest');
  const [bpSleepRelation, setBpSleepRelation] = useState<'before sleep' | 'during sleep' | 'after sleep'>('before sleep');

  // 3. Heart Rate Form State
  const [hrValue, setHrValue] = useState(72);
  const [hrDateTime, setHrDateTime] = useState('2026-06-08T08:20');
  const [hrPosture, setHrPosture] = useState<'sitting' | 'standing' | 'lying' | 'reclining'>('sitting');
  const [hrLocation, setHrLocation] = useState('Home');
  const [hrActivityRelation, setHrActivityRelation] = useState<'before exercise' | 'after exercise' | 'during exercise' | 'at rest'>('at rest');
  const [hrSleepRelation, setHrSleepRelation] = useState<'before sleep' | 'during sleep' | 'after sleep'>('before sleep');

  // 4. Clinical Assessment State
  const [assessWeight, setAssessWeight] = useState(74);
  const [assessHeight, setAssessHeight] = useState(1.78);
  const [assessGlucose, setAssessGlucose] = useState(95);
  const [assessAvgGlucose, setAssessAvgGlucose] = useState(95);
  const [assessCholesterol, setAssessCholesterol] = useState(195);
  const [assessHdlCholesterol, setAssessHdlCholesterol] = useState(50);
  const [assessNotes, setAssessNotes] = useState('Standard checkup');
  const [assessTakingBpMeds, setAssessTakingBpMeds] = useState(true);
  const [assessMedClass, setAssessMedClass] = useState<'none' | 'beta_blocker' | 'diuretic' | 'ace_inhibitor' | 'other'>('ace_inhibitor');
  const [assessSmoking, setAssessSmoking] = useState<'never' | 'former' | 'passive' | 'current_light' | 'current_heavy'>('never');
  const [assessCigsPerDay, setAssessCigsPerDay] = useState(0);
  const [assessAlcohol, setAssessAlcohol] = useState<'none' | 'moderate' | 'heavy'>('none');
  const [assessPhysicalActivity, setAssessPhysicalActivity] = useState<'none' | 'low' | 'moderate' | 'high'>('moderate');

  // UI state feedback
  const [submitting, setSubmitting] = useState(false);
  const [successText, setSuccessText] = useState<string | null>(null);

  const showSuccessNotification = (msg: string) => {
    setSuccessText(msg);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => setSuccessText(null), 4000);
  };

  // 1. Submit Profile
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: UserProfile = {
        first_name: firstName,
        middle_name: middleName || null,
        last_name: lastName,
        phone_number: phone || null,
        date_of_birth: dob,
        sex,
        age_years: dob ? (new Date().getFullYear() - new Date(dob).getFullYear()) : 52,
        smoking,
        diabetes,
        bp_history: bpHistory,
        family_history_htn: familyHtn,
        family_history_cvd: familyCvd,
        physical_activity_level: physicalActivity,
        stress_score: stressScore,
        sleep_quality: sleepQuality,
        cigs_per_day: cigsPerDay,
        alcohol_use: alcoholUse,
        exercise_frequency: exerciseFrequency,
        diet_quality: dietQuality,
        salt_intake: saltIntake,
        sleep_duration: sleepDuration,
        work_type: workType,
        education: education,
        heart_disease: heartDisease,
        prevalent_stroke: prevalentStroke,
        prevalent_hypertension: prevalentHypertension,
        kidney_disease: kidneyDisease,
        history_cvd: historyCvd
      };

      await SalamaApiService.saveProfile(user.email, payload);
      showSuccessNotification('Biographical and Cardiovascular Baseline Profile saved successfully.');
      setActiveTab('bp'); // Step forward
    } catch (e: any) {
      alert(`Profile update error: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Submit BP Record
  const handleSubmitBP = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await SalamaApiService.addBpRecord(user.email, { // The time is already timezone-aware due to toISOString()
        start_date_time: new Date(bpDateTime + 'Z').toISOString(), // Interpret local picker as UTC
        systolic_value: bpSystolic,
        diastolic_value: bpDiastolic,
        body_posture: bpPosture,
        measurement_location: bpLocation,
        activity_level: 'rest',
        temporal_relationship_to_physical_activity: bpActivityRelation,
        temporal_relationship_to_sleep: bpSleepRelation
      });
      showSuccessNotification('Clinical blood pressure telemetry logged successfully.');
      setActiveTab('hr'); // Step forward
    } catch (e: any) {
      alert(`Error logging blood pressure: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Submit Heart Rate Record
  const handleSubmitHR = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await SalamaApiService.addHrRecord(user.email, { // The time is already timezone-aware due to toISOString()
        start_date_time: new Date(hrDateTime + 'Z').toISOString(), // Interpret local picker as UTC
        heart_rate_value: hrValue,
        body_posture: hrPosture,
        measurement_location: hrLocation,
        temporal_relationship_to_physical_activity: hrActivityRelation,
        temporal_relationship_to_sleep: hrSleepRelation
      });
      showSuccessNotification('Heart rate telemetry logged successfully.');
      setActiveTab('assessment'); // Step forward
    } catch (e: any) {
      alert(`Error logging heart rate: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Submit Full Assessment & Run Models
  const handleSubmitAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // First save the comprehensive Health Assessment biometric dataset through the API
      await SalamaApiService.addHealthAssessment(user.email, {
        weight_kg: assessWeight,
        height_m: assessHeight,
        blood_glucose: assessGlucose,
        avg_glucose_level: assessAvgGlucose,
        total_cholesterol: assessCholesterol,
        hdl_cholesterol: assessHdlCholesterol,
        taking_bp_medication: assessTakingBpMeds,
        medication_type: assessMedClass,
        smoking_status: assessSmoking,
        cigs_per_day: assessCigsPerDay,
        alcohol_use: assessAlcohol,
        physical_activity_level: assessPhysicalActivity,
        notes: assessNotes
      });

      // Now run the CVD risk models on the updated profile and clinical measurements
      const response = await SalamaApiService.runRiskAssessment(user.email);
      showSuccessNotification(`Cardiology telemetry analysis submitted successfully! CVD Risk score: ${response.cvd_risk.toFixed(1)}%`);
      
      if (onScanCompleted) {
        setTimeout(() => onScanCompleted(), 1500);
      }
    } catch (e: any) {
      alert(`Telemetry validation metrics error: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const tabsSetup = [
    { id: 'profile', label: 'Form 1: User Profile', numLabel: 'FORM 01 OF 04', icon: UserIcon },
    { id: 'bp', label: 'Form 2: Blood Pressure', numLabel: 'FORM 02 OF 04', icon: Activity },
    { id: 'hr', label: 'Form 3: Heart Rate', numLabel: 'FORM 03 OF 04', icon: Heart },
    { id: 'assessment', label: 'Form 4: Health Assessment', numLabel: 'FORM 04 OF 04', icon: ClipboardCheck },
  ] as const;

  return (
    <div className="font-sans p-6 pb-20 overflow-y-auto h-screen max-w-7xl mx-auto space-y-6">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-[10px] font-black tracking-widest text-slate-400 block uppercase">
            Clinical Telemetry Hub
          </span>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">
            Health Telemetry Hub & Patient Forms
          </h1>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Log physical telemetry, compile diagnostic baseline data layers, and plot automated clinical assessment charts.
          </p>
        </div>
        <button
          onClick={() => {
            setActiveTab('profile');
            confetti({ particleCount: 30 });
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer text-center"
        >
          ✨ New Full Assessment
        </button>
      </div>

      {/* 2. Success Banner */}
      {successText && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-4 text-xs font-semibold flex items-center gap-2.5 animate-bounce">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          <span>{successText}</span>
        </div>
      )}

      {/* 3. Steps Wizard Headers (Page 1-4 Tabs structure) */}
      <div className="bg-white border border-slate-100 rounded-2xl p-2.5 flex flex-wrap justify-between gap-2 shadow-sm">
        {tabsSetup.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              id={`form-tab-${t.id}`}
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive 
                  ? 'bg-rose-50 text-rose-700 shadow-inner' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-rose-500' : 'text-slate-400'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Active Forms Content Container */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-2 font-mono">
          {tabsSetup.find(it => it.id === activeTab)?.numLabel}
        </span>

        {/* ----------------- TAB 1: USER PROFILE FORM ----------------- */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSubmitProfile} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">User Profile Configuration</h2>
              <p className="text-slate-400 text-xs mt-0.5">Define patient identity, medical history, and lifestyle habits.</p>
            </div>

            {/* Demographics Area (Page 4 / 18) */}
            <div className="space-y-4">
              <span className="block text-[11px] font-black text-rose-600 tracking-wider uppercase border-b border-rose-50 pb-1.5 matches-pdf">
                1. Personal Demographics
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mary"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Middle Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Wanja"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Wanjiku"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="0712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Sex / Sex Profile
                  </label>
                  <select
                    value={sex}
                    onChange={(e: any) => setSex(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 font-semibold bg-white"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Education Gained Level
                  </label>
                  <select
                    value={education}
                    onChange={(e: any) => setEducation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 font-semibold bg-white"
                  >
                    <option value="undergraduate">College / Undergraduate</option>
                    <option value="primary">Primary School</option>
                    <option value="high_school">High School</option>
                    <option value="graduate">Graduate Degree (Masters / PhD)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Occupational Work Type
                  </label>
                  <select
                    value={workType}
                    onChange={(e: any) => setWorkType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 font-semibold bg-white"
                  >
                    <option value="Private Sector Corporate">Private Sector Corporate</option>
                    <option value="Self-Employed / Business owner">Self-Employed / Business owner</option>
                    <option value="Public Sector / Civil Service">Public Sector / Civil Service</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Student">Student</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Behavioral Risk Markers (Page 8 Group 3) */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <span className="block text-[11px] font-black text-rose-600 tracking-wider uppercase border-b border-rose-50 pb-1.5">
                3. Behavioral & Chronic Medical Risk History
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Smoking Status
                  </label>
                  <select
                    value={smoking}
                    onChange={(e: any) => setSmoking(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 font-semibold bg-white"
                  >
                    <option value="never_smoked">Never Smoked</option>
                    <option value="former">Former Smoker</option>
                    <option value="smoker">Active Smoker</option>
                    <option value="unknown">Unknown</option>
                    <option value="passive">Passive Smoker / Exposed</option>
                    <option value="current_light">Current Light Smoker</option>
                    <option value="current_heavy">Current Heavy Smoker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Average Cigarettes per Day
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cigsPerDay}
                    onChange={(e) => setCigsPerDay(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Alcohol Use level
                  </label>
                  <select
                    value={alcoholUse}
                    onChange={(e: any) => setAlcoholUse(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 font-semibold bg-white"
                  >
                    <option value="none">None / Teetotaler</option>
                    <option value="moderate">Moderate Drinker</option>
                    <option value="heavy">Heavy Drinker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Diabetes Diagnosed Status
                  </label>
                  <select
                    value={diabetes ? 'yes' : 'no'}
                    onChange={(e) => setDiabetes(e.target.value === 'yes')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 font-semibold bg-white"
                  >
                    <option value="no">No Diabetes</option>
                    <option value="yes">Diagnosed Diabetes (Type 1 or 2)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Blood Pressure History
                  </label>
                  <select
                    value={bpHistory}
                    onChange={(e: any) => setBpHistory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 font-semibold bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="prehypertension">Prehypertension</option>
                    <option value="hypertension">Hypertension</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Exercise Frequency (Weekly)
                  </label>
                  <select
                    value={exerciseFrequency}
                    onChange={(e) => setExerciseFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 font-semibold bg-white"
                  >
                    <option value="none">No physical exercise</option>
                    <option value="1-2 times">1-2 times per week</option>
                    <option value="3-4 times">3-4 times per week</option>
                    <option value="daily">Daily activity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Dietary Nutrition Quality
                  </label>
                  <select
                    value={dietQuality}
                    onChange={(e) => setDietQuality(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 font-semibold bg-white"
                  >
                    <option value="poor">Poor (High processed / sodium)</option>
                    <option value="average">Average (Balanced)</option>
                    <option value="excellent">Excellent (Plant-based / Low fat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Estimated Salt Intake (Grams)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={saltIntake}
                    onChange={(e) => setSaltIntake(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Average Sleep Duration (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={sleepDuration}
                    onChange={(e) => setSleepDuration(parseInt(e.target.value) || 7)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Physical Activity Level
                  </label>
                  <select
                    value={physicalActivity}
                    onChange={(e: any) => setPhysicalActivity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 font-semibold bg-white"
                  >
                    <option value="light">Low (Occasional walks)</option>
                    <option value="moderate">Medium (Moderate physical work)</option>
                    <option value="heavy">High (Intense daily training)</option>
                    <option value="none">Sedentary (None)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Sleep Quality Rating
                  </label>
                  <select
                    value={sleepQuality}
                    onChange={(e) => setSleepQuality(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 font-semibold bg-white"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair / Intermittent</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Stress Level Score (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={stressScore}
                    onChange={(e) => setStressScore(parseInt(e.target.value) || 5)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 font-semibold"
                  />
                </div>
              </div>

              {/* Chronic & Preconceived Medical Risk Checkboxes */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3 mt-4">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Chronic & Familial CVD Risk Factors
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-center gap-2.5">
                    <input
                      id="prevalent-htn-check"
                      type="checkbox"
                      checked={prevalentHypertension}
                      onChange={(e) => setPrevalentHypertension(e.target.checked)}
                      className="h-4.5 w-4.5 text-rose-500 focus:ring-rose-400 border-slate-300 rounded cursor-pointer"
                    />
                    <label htmlFor="prevalent-htn-check" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
                      Prevalent Hypertension History (HTN)
                    </label>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <input
                      id="heart-disease-check"
                      type="checkbox"
                      checked={heartDisease}
                      onChange={(e) => setHeartDisease(e.target.checked)}
                      className="h-4.5 w-4.5 text-rose-500 focus:ring-rose-400 border-slate-300 rounded cursor-pointer"
                    />
                    <label htmlFor="heart-disease-check" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
                      Chronic Heart Disease History (CHD)
                    </label>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <input
                      id="prevalent-stroke-check"
                      type="checkbox"
                      checked={prevalentStroke}
                      onChange={(e) => setPrevalentStroke(e.target.checked)}
                      className="h-4.5 w-4.5 text-rose-500 focus:ring-rose-400 border-slate-300 rounded cursor-pointer"
                    />
                    <label htmlFor="prevalent-stroke-check" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
                      Prevalent Stroke History
                    </label>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <input
                      id="kidney-disease-check"
                      type="checkbox"
                      checked={kidneyDisease}
                      onChange={(e) => setKidneyDisease(e.target.checked)}
                      className="h-4.5 w-4.5 text-rose-500 focus:ring-rose-400 border-slate-300 rounded cursor-pointer"
                    />
                    <label htmlFor="kidney-disease-check" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
                      Chronic Kidney Disease (CKD)
                    </label>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <input
                      id="history-cvd-check"
                      type="checkbox"
                      checked={historyCvd}
                      onChange={(e) => setHistoryCvd(e.target.checked)}
                      className="h-4.5 w-4.5 text-rose-500 focus:ring-rose-400 border-slate-300 rounded cursor-pointer"
                    />
                    <label htmlFor="history-cvd-check" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
                      Personal History of Cardiovascular Disease (CVD)
                    </label>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <input
                      id="family-htn-check"
                      type="checkbox"
                      checked={familyHtn}
                      onChange={(e) => setFamilyHtn(e.target.checked)}
                      className="h-4.5 w-4.5 text-rose-500 focus:ring-rose-400 border-slate-300 rounded cursor-pointer"
                    />
                    <label htmlFor="family-htn-check" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
                      Familial History: Hypertension (HTN)
                    </label>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <input
                      id="family-cvd-check"
                      type="checkbox"
                      checked={familyCvd}
                      onChange={(e) => setFamilyCvd(e.target.checked)}
                      className="h-4.5 w-4.5 text-rose-500 focus:ring-rose-400 border-slate-300 rounded cursor-pointer"
                    />
                    <label htmlFor="family-cvd-check" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
                      Familial History: Cardiovascular Disease (CVD)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl text-xs cursor-pointer select-none"
              >
                {submitting ? 'Saving...' : 'Save Profile & Go Next'}
              </button>
            </div>
          </form>
        )}

        {/* ----------------- TAB 2: BLOOD PRESSURE FORM ----------------- */}
        {activeTab === 'bp' && (
          <form onSubmit={handleSubmitBP} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight font-sans">Blood Pressure Measurement</h2>
              <p className="text-slate-400 text-xs mt-0.5">Log clinical arterial pressure readings.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Systolic (mmHg)
                </label>
                <input
                  type="number"
                  min="50"
                  max="280"
                  required
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(parseInt(e.target.value) || 120)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Diastolic (mmHg)
                </label>
                <input
                  type="number"
                  min="30"
                  max="180"
                  required
                  value={bpDiastolic}
                  onChange={(e) => setBpDiastolic(parseInt(e.target.value) || 80)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Date & Time of reading
                </label>
                <input
                  type="datetime-local"
                  required
                  value={bpDateTime}
                  onChange={(e) => setBpDateTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Current Body Posture
                </label>
                <select
                  value={bpPosture}
                  onChange={(e: any) => setBpPosture(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold bg-white"
                >
                  <option value="sitting">Sitting Comfortably</option>
                  <option value="standing">Standing</option>
                  <option value="lying">Lying / Resting</option>
                  <option value="reclining">Reclining</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Temporal Relationship to Physical Activity
                </label>
                <select
                  value={bpActivityRelation}
                  onChange={(e: any) => setBpActivityRelation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold bg-white"
                >
                  <option value="at rest">At Rest</option>
                  <option value="before exercise">Before Exercise</option>
                  <option value="during exercise">During Exercise</option>
                  <option value="after exercise">After Exercise</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Temporal Relationship to Sleep
                </label>
                <select
                  value={bpSleepRelation}
                  onChange={(e: any) => setBpSleepRelation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold bg-white"
                >
                  <option value="before sleep">Before Sleep</option>
                  <option value="during sleep">During Sleep / Nighttime</option>
                  <option value="after sleep">After Sleep / On waking up</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Measurement Device Location / Left or Right Wrist
                </label>
                <input
                  type="text"
                  placeholder="e.g. Left Wrist, Right Arm, Clinic Desk"
                  value={bpLocation}
                  onChange={(e) => setBpLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs cursor-pointer"
              >
                Back to Part 1
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl text-xs cursor-pointer"
              >
                {submitting ? 'Uploading...' : 'Save BP Entry & Continue'}
              </button>
            </div>
          </form>
        )}

        {/* ----------------- TAB 3: HEART RATE FORM ----------------- */}
        {activeTab === 'hr' && (
          <form onSubmit={handleSubmitHR} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight font-sans">Heart Rate Measurement</h2>
              <p className="text-slate-400 text-xs mt-0.5">Log resting or active heart rate values.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Heart Rate (BPM)
                </label>
                <input
                  type="number"
                  min="40"
                  max="220"
                  required
                  value={hrValue}
                  onChange={(e) => setHrValue(parseInt(e.target.value) || 72)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Date & Time of reading
                </label>
                <input
                  type="datetime-local"
                  required
                  value={hrDateTime}
                  onChange={(e) => setHrDateTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Body Posture
                </label>
                <select
                  value={hrPosture}
                  onChange={(e: any) => setHrPosture(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold bg-white"
                >
                  <option value="sitting">Sitting Comfortably</option>
                  <option value="standing">Standing</option>
                  <option value="lying">Lying / Sleeping</option>
                  <option value="reclining">Reclining</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Reading Location / Wrist
                </label>
                <input
                  type="text"
                  placeholder="e.g. Left Wrist, Right Arm, Clinic Desk"
                  value={hrLocation}
                  onChange={(e) => setHrLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Temporal Relationship to Physical Activity
                </label>
                <select
                  value={hrActivityRelation}
                  onChange={(e: any) => setHrActivityRelation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold bg-white"
                >
                  <option value="at rest">At Rest</option>
                  <option value="before exercise">Before Exercise</option>
                  <option value="during exercise">During Exercise</option>
                  <option value="after exercise">After Exercise</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Temporal Relationship to Sleep
                </label>
                <select
                  value={hrSleepRelation}
                  onChange={(e: any) => setHrSleepRelation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold bg-white"
                >
                  <option value="before sleep">Before Sleep</option>
                  <option value="during sleep">During Sleep / Nighttime</option>
                  <option value="after sleep">After Sleep / On waking up</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('bp')}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs cursor-pointer"
              >
                Back to Part 2
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl text-xs cursor-pointer"
              >
                {submitting ? 'Uploading...' : 'Save Heart Rate & Go Next'}
              </button>
            </div>
          </form>
        )}

        {/* ----------------- TAB 4: GENERAL CLINICAL HEALTH ASSESSMENT ----------------- */}
        {activeTab === 'assessment' && (
          <form onSubmit={handleSubmitAssessment} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight font-sans">Health Assessment</h2>
              <p className="text-slate-400 text-xs mt-0.5">Biometric vitals, blood panels, and clinical notes.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Weight (KG)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={assessWeight}
                  onChange={(e) => setAssessWeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Height (M)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={assessHeight}
                  onChange={(e) => setAssessHeight(parseFloat(e.target.value) || 1.7)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Fasting Blood Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  required
                  value={assessGlucose}
                  onChange={(e) => setAssessGlucose(parseInt(e.target.value) || 90)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Average Blood Glucose (30 Days, mg/dL)
                </label>
                <input
                  type="number"
                  required
                  value={assessAvgGlucose}
                  onChange={(e) => setAssessAvgGlucose(parseInt(e.target.value) || 90)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Total Cholesterol (mg/dL)
                </label>
                <input
                  type="number"
                  required
                  value={assessCholesterol}
                  onChange={(e) => setAssessCholesterol(parseInt(e.target.value) || 190)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  HDL "Good" Cholesterol (mg/dL)
                </label>
                <input
                  type="number"
                  required
                  value={assessHdlCholesterol}
                  onChange={(e) => setAssessHdlCholesterol(parseInt(e.target.value) || 50)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Smoking Status History
                </label>
                <select
                  value={assessSmoking}
                  onChange={(e: any) => setAssessSmoking(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold bg-white"
                >
                  <option value="never">Never Smoked</option>
                  <option value="former">Former Smoker</option>
                  <option value="passive">Passive exposure</option>
                  <option value="current_light">Current Light Smoker (1-9 cigs/day)</option>
                  <option value="current_heavy">Current Heavy Smoker (10+ cigs/day)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Average Cigarettes per Day
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={assessCigsPerDay}
                  onChange={(e) => setAssessCigsPerDay(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Alcohol Consumption Use level
                </label>
                <select
                  value={assessAlcohol}
                  onChange={(e: any) => setAssessAlcohol(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold bg-white"
                >
                  <option value="none">None / Teetotaler</option>
                  <option value="moderate">Moderate Drinker</option>
                  <option value="heavy">Heavy Drinker</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  General Physical Activity
                </label>
                <select
                  value={assessPhysicalActivity}
                  onChange={(e: any) => setAssessPhysicalActivity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold bg-white"
                >
                  <option value="none">Sedentary (No Exercise)</option>
                  <option value="low">Low physical movement</option>
                  <option value="moderate">Moderate exercise (Medium)</option>
                  <option value="high">Intense high training</option>
                </select>
              </div>

              <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                <div className="flex items-center gap-3">
                  <input
                    id="assess-taking-meds"
                    type="checkbox"
                    checked={assessTakingBpMeds}
                    onChange={(e) => setAssessTakingBpMeds(e.target.checked)}
                    className="h-4.5 w-4.5 text-emerald-600 border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="assess-taking-meds" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                    Diagnosed Hypertension on Active Medication
                  </label>
                </div>

                {assessTakingBpMeds && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                      Active Hypertension Medication Category
                    </label>
                    <select
                      value={assessMedClass}
                      onChange={(e: any) => setAssessMedClass(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white"
                    >
                      <option value="ace_inhibitor">ACE Inhibitor / Lisinopril</option>
                      <option value="beta_blocker">Beta-Blocker / Atenolol</option>
                      <option value="diuretic">Diuretic Drug</option>
                      <option value="other">Other Anti-hypertensive</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Assessment Notes / Consultation Memo
                </label>
                <textarea
                  placeholder="Standard clinical checkup notes"
                  rows={4}
                  value={assessNotes}
                  onChange={(e) => setAssessNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('hr')}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs cursor-pointer"
              >
                Back to Part 3
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs cursor-pointer"
              >
                {submitting ? 'Running Risk Models...' : 'Submit Assessment'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
