import React, { useEffect, useState } from 'react';
import { SalamaDatabase, SalamaApiService, User, Appointment } from '../services/api';
import { 
  Calendar, 
  Plus, 
  MapPin, 
  Video, 
  Clock, 
  CheckCircle, 
  X, 
  Stethoscope, 
  VideoOff, 
  Activity,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AppointmentsViewProps {
  user: User;
}

export default function AppointmentsView({ user }: AppointmentsViewProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clinicians, setClinicians] = useState<any[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Booking form states
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [date, setDate] = useState('2026-06-15');
  const [time, setTime] = useState('10:00 AM');
  const [appointmentType, setAppointmentType] = useState<'In-Person' | 'Virtual'>('Virtual');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const loadAppointments = () => {
    const list = SalamaDatabase.getAppointments('patient', user.email);
    setAppointments(list);
  };

  useEffect(() => {
    loadAppointments();
    SalamaApiService.getClinicians().then((list) => {
      setClinicians(list);
      if (list.length > 0) {
        setSelectedDoctor(list[0]);
        setAppointmentType(list[0].type || 'Virtual');
      }
    });
  }, [user.email]);

  const handleCancelAppointment = (id: string) => {
    if (confirm('Are you sure you want to cancel this scheduled consultation?')) {
      SalamaDatabase.updateAppointment(id, { status: 'cancelled' });
      loadAppointments();
      confetti({ particleCount: 40, colors: ['#f43f5e', '#fda4af'] });
    }
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) {
      alert('Please select a clinician for your consultation.');
      return;
    }
    
    SalamaDatabase.bookAppointment({
      patient_id: user.id,
      patient_name: user.email.split('@')[0].toUpperCase(),
      patient_email: user.email,
      clinician_name: selectedDoctor.name,
      clinician_specialty: selectedDoctor.specialty,
      date,
      time,
      type: appointmentType,
      reason,
      notes,
      meeting_link: appointmentType === 'Virtual' ? 'https://meet.google.com/abc-defg-hij' : ''
    });

    setShowBookingModal(false);
    loadAppointments();
    
    // Play sound or confetti
    confetti({ particleCount: 150, spread: 80, colors: ['#10b981', '#34d399'] });
  };

  const upcomingApps = appointments.filter(it => it.status === 'accepted' || it.status === 'pending');
  const pastApps = appointments.filter(it => it.status === 'completed' || it.status === 'cancelled' || it.status === 'missed');

  return (
    <div className="font-sans p-6 pb-20 overflow-y-auto h-screen max-w-7xl mx-auto space-y-6">
      
      {/* 1. Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-[10px] font-black tracking-widest text-slate-400 block uppercase">
            Schedules Telehealth Center
          </span>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">
            My Appointments
          </h1>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Manage your upcoming and past telehealth consultations with verified medical specialists.
          </p>
        </div>
        <button
          id="book-appointment-btn"
          onClick={() => {
            setShowBookingModal(true);
            confetti({ particleCount: 20 });
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Book Appointment
        </button>
      </div>

      {/* 2. List of Upcoming consultations (Page 16 Layout) */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Calendar className="h-4.5 w-4.5 text-rose-500" />
          Upcoming Appointments
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {upcomingApps.map((app) => (
            <div 
              key={app.id}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:border-slate-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl flex items-center justify-center shrink-0">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="font-bold text-gray-900 text-base">{app.clinician_name}</h4>
                    <span className="text-xs bg-slate-100 font-bold px-2.5 py-0.5 rounded-full text-slate-600">
                      {app.clinician_specialty}
                    </span>
                  </div>
                  
                  {/* Date, Time & Mode metrics */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-semibold font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(app.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })} @ {app.time}
                    </span>
                    <span className="flex items-center gap-1 rounded-lg px-2 py-0.5 bg-slate-50 border border-slate-100">
                      {app.type === 'Virtual' ? (
                        <>
                          <Video className="h-3.5 w-3.5 text-blue-500" />
                          Virtual Video Session
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3.5 w-3.5 text-orange-500" />
                          In-Person Consultation
                        </>
                      )}
                    </span>
                  </div>

                  {app.type === 'In-Person' ? (
                    <p className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {app.clinician_specialty === 'Cardiologist' ? 'Nairobi Heart Clinic, Suite 204, Nairobi' : 'Primary Care Center, Annex Building'}
                    </p>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                        <Video className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                        Virtual video link will be sent via registered email.
                      </p>
                      {app.meeting_link && (
                        <a 
                          href={app.meeting_link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-block text-xs font-bold text-blue-600 hover:underline"
                        >
                          Join meeting session: {app.meeting_link}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Clinician notes */}
                  <p className="text-xs text-slate-600 italic bg-amber-50/50 px-3 py-1.5 border border-amber-100/50 rounded-xl leading-relaxed font-semibold">
                    &ldquo;{app.reason}&rdquo; {app.notes ? `• ${app.notes}` : ''}
                  </p>
                </div>
              </div>

              {/* Status or Cancellation Panel */}
              <div className="flex sm:flex-row md:flex-col items-end gap-3 shrink-0">
                <span className={`text-[10px] font-black uppercase tracking-widest font-mono border px-3 py-1 rounded-full ${
                  app.status === 'accepted' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                    : 'bg-amber-50 border-amber-100 text-amber-700'
                }`}>
                  {app.status === 'accepted' ? 'Upcoming / Confirmed' : 'Request Pending'}
                </span>
                
                <button
                  onClick={() => handleCancelAppointment(app.id)}
                  className="py-1.5 px-3 border border-rose-100 hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-xl active:scale-95 transition-all text-center cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}

          {upcomingApps.length === 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-400 font-semibold text-xs leading-relaxed">
              No scheduled upcoming telemedicine appointments found on file.
            </div>
          )}
        </div>
      </div>

      {/* 3. List of Past completed consultations */}
      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Clock className="h-4.5 w-4.5 text-slate-400" />
          Past Appointments
        </h3>

        <div className="bg-white border border-slate-100 rounded-2xl p-1 shadow-sm overflow-hidden divide-y divide-slate-50">
          {pastApps.map((app) => (
            <div 
              key={app.id} 
              className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border flex items-center justify-center shrink-0 ${
                  app.status === 'completed' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-500' 
                    : 'bg-slate-50 border-slate-100 text-slate-400'
                }`}>
                  {app.status === 'completed' ? <CheckCircle className="h-4.5 w-4.5" /> : <X className="h-4.5 w-4.5" />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{app.clinician_name}</h4>
                  <p className="text-xs text-slate-400 font-semibold">
                    {app.clinician_specialty} • {new Date(app.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  app.status === 'completed' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                    : 'bg-rose-50 border-rose-100 text-rose-700'
                }`}>
                  {app.status}
                </span>
                <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">{app.time}</span>
              </div>
            </div>
          ))}

          {pastApps.length === 0 && (
            <div className="p-6 text-center text-slate-400 font-semibold text-xs">
              No historical treatment files locked yet.
            </div>
          )}
        </div>
      </div>

      {/* 4. Booking Dialog Modal Overlay */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-rose-400" />
                <h3 className="font-extrabold text-sm tracking-wider uppercase">Book Telehealth Appointment</h3>
              </div>
              <button 
                onClick={() => setShowBookingModal(false)}
                className="hover:bg-white/15 p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="p-6 space-y-4">
              
              {/* Doctor choice */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                  Select Medical Specialist
                </label>
                <select
                  value={selectedDoctor.name}
                  onChange={(e) => {
                    const found = AVAILABLE_DOCTORS.find(doc => doc.name === e.target.value);
                    if (found) {
                      setSelectedDoctor(found);
                      setAppointmentType(found.type as 'In-Person' | 'Virtual');
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold bg-white"
                >
                  {AVAILABLE_DOCTORS.map((doc, idx) => (
                    <option key={idx} value={doc.name}>
                      {doc.name} ({doc.specialty})
                    </option>
                  ))}
                </select>
              </div>

              {/* Consultation Type toggler */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1.5">
                  Consultation Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAppointmentType('In-Person')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      appointmentType === 'In-Person'
                        ? 'bg-orange-50 border-orange-200 text-orange-800 shadow-inner'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    🏥 In-Person Annex Clinic
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppointmentType('Virtual')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      appointmentType === 'Virtual'
                        ? 'bg-blue-50 border-blue-200 text-blue-800 shadow-inner'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    🎥 Virtual Google Meet
                  </button>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                    Select Time Slot
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                  Primary Reason for session
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Follow-up on hypertension management"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              {/* Short notes */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                  Additional Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. My historical BP was 146/94"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Confirm Booking request
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
