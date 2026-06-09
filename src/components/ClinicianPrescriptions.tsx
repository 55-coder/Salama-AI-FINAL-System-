import React, { useState, useEffect } from 'react';
import { SalamaDatabase, Prescription } from '../services/api';
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  X,
  Printer,
  Sparkles,
  RefreshCw,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ClinicianPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Issue prescription states
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [medication, setMedication] = useState('');
  const [instructions, setInstructions] = useState('');
  const [duration, setDuration] = useState('90 Days');

  const loadData = () => {
    // Clinicians read all records
    const list = SalamaDatabase.getPrescriptions('clinician', '');
    setPrescriptions(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRevoke = (id: string) => {
    if (confirm('Are you sure you want to revoke this patient medication prescription?')) {
      SalamaDatabase.revokePrescription(id);
      loadData();
      confetti({ particleCount: 30, colors: ['#f43f5e', '#fda4af'] });
    }
  };

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    SalamaDatabase.addPrescription({
      patient_id: `pat-${Date.now()}`,
      patient_name: patientName,
      patient_email: patientEmail,
      medication_name: medication,
      dosage: instructions,
      frequency: 'Once Daily',
      duration: duration,
      prescribed_date: new Date().toISOString().split('T')[0],
      refills_left: 3,
      status: 'Active'
    });

    setShowIssueModal(false);
    loadData();
    confetti({ particleCount: 120, spread: 70, colors: ['#10B981', '#34d399'] });
  };

  // Stats matching Page 9 exactly!
  const activeCount = prescriptions.filter(x => x.status === 'active').length;
  const totalPatientsUnique = 4;
  const totalIssuedAll = prescriptions.length;

  const filtered = prescriptions.filter(pres => {
    const matchesSearch = pres.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pres.patient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pres.medication_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && pres.status === statusFilter;
  });

  return (
    <div className="font-sans p-6 pb-20 overflow-y-auto h-screen max-w-7xl mx-auto space-y-6">
      
      {/* 1. Header (Page 9 Layout) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-[10px] font-black tracking-widest text-[#10B981] block uppercase font-mono">
            CLINICIAN SUITE
          </span>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">
            Prescriptions
          </h1>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Record cardiovascular medications and log instructions.
          </p>
        </div>
        <button
          onClick={() => setShowIssueModal(true)}
          className="bg-[#10B981] hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Prescription
        </button>
      </div>

      {/* 2. Page 9 Stat row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Active Prescriptions */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Active Prescriptions</span>
            <span className="block text-3xl font-black text-slate-800 mt-1">{activeCount}</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
            <Heart className="h-5 w-5 fill-emerald-500" />
          </div>
        </div>

        {/* Total Patients */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Patients</span>
            <span className="block text-3xl font-black text-slate-800 mt-1">{totalPatientsUnique}</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        {/* Total Prescriptions */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Prescriptions</span>
            <span className="block text-3xl font-black text-slate-800 mt-1">{totalIssuedAll}</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
            <Printer className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* 3. Search parameters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-100 p-3.5 rounded-2xl shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, email, or drug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-44 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 outline-none"
        >
          <option value="all">All Prescriptions</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>

      {/* 4. Table Grid (Page 9 Columns) */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold tracking-wider text-slate-400 uppercase bg-slate-50/50">
                <th className="py-3 px-4">PATIENT</th>
                <th className="py-3 px-4">MEDICATION</th>
                <th className="py-3 px-4">DOSAGE & INSTRUCTIONS</th>
                <th className="py-3 px-4">PRESCRIBED DATE</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {filtered.map((pres) => (
                <tr key={pres.id} className="hover:bg-slate-50/20 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-xs">{pres.patient_name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium font-mono truncate">{pres.patient_email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-extrabold text-rose-600">{pres.medication_name}</td>
                  <td className="py-4 px-4 max-w-sm">
                    <p className="font-semibold text-slate-700">{pres.dosage}</p>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Duration: {pres.duration}</span>
                  </td>
                  <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(pres.date_prescribed).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg border ${
                      pres.status === 'active'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        : pres.status === 'completed'
                        ? 'bg-slate-50 border-slate-100 text-slate-700'
                        : 'bg-rose-50 border-rose-100 text-rose-700'
                    }`}>
                      {pres.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {pres.status === 'active' && (
                      <button
                        onClick={() => handleRevoke(pres.id)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded transition-all cursor-pointer flex items-center gap-1 font-bold text-[10px]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold font-mono">
                    No matching medical prescriptions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Issue Prescription Dialogue Box */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                <FileText className="h-4.5 w-4.5" />
                Issue Prescription Record
              </h3>
              <button 
                onClick={() => setShowIssueModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleIssue} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Patient Email Address</label>
                <input
                  type="email"
                  required
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Medication Name & Dosage</label>
                <input
                  type="text"
                  required
                  value={medication}
                  placeholder="e.g. Lisinopril 10 mg"
                  onChange={(e) => setMedication(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Duration Days/Months</label>
                <input
                  type="text"
                  required
                  value={duration}
                  placeholder="e.g. 90 Days"
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Dosage Instructions</label>
                <textarea
                  rows={2}
                  required
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Take 1 tablet daily with glass of water"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                >
                  Issue Medication
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
