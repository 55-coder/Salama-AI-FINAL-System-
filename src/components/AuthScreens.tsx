import React, { useState } from 'react';
import { SalamaApiService, User } from '../services/api';
import { Heart, Activity, ShieldAlert, CheckCircle, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthScreensProps {
  onLoginSuccess: (user: User) => void;
}

export default function AuthScreens({ onLoginSuccess }: AuthScreensProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'clinician'>('patient');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please supply both your email address and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        // Register flow
        const user = await SalamaApiService.register(email, password, role);
        setSuccessMsg(`Welcome aboard! Account registered successfully as a ${role}.`);
        confetti({ particleCount: 80, spread: 60 });
        
        // Auto logo in
        setTimeout(async () => {
          try {
            const loggedIn = await SalamaApiService.login(email, password);
            onLoginSuccess(loggedIn);
          } catch {
            setErrorMsg('Registration was successful, but automatic login failed. Please sign in manually.');
          }
        }, 1500);
      } else {
        // Sign In flow
        const loggedInUser = await SalamaApiService.login(email, password);
        onLoginSuccess(loggedInUser);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An unexpected error occurred during access verification.');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoUser = async (demoEmail: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const loggedIn = await SalamaApiService.login(demoEmail, 'password123');
      onLoginSuccess(loggedIn);
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans transition-all duration-300">
      
      {/* Upper Logo Indicator */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-rose-50 p-2.5 rounded-2xl shadow-sm border border-rose-100 flex items-center justify-center">
            <Heart className="h-8 w-8 text-rose-500 fill-rose-500 animate-pulse" />
          </div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight">Salama AI</span>
        </div>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-100 sm:px-10">
          
          {/* Main Titles */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isSignUp ? 'Sign Up' : 'Welcome Back'}
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              {isSignUp ? 'Enter your email and password below to create your account.' : 'Login to check your cardiovascular health'}
            </p>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mb-4 bg-rose-50 border border-rose-100 rounded-xl p-3.5 flex items-start gap-2.5 text-rose-600 text-xs">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex items-start gap-2.5 text-emerald-600 text-xs">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Roles Selection (Required for creating account correctly) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 tracking-wider uppercase mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    role === 'patient'
                      ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Activity className="h-3.5 w-3.5" />
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => setRole('clinician')}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    role === 'clinician'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  Clinician
                </button>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-600 tracking-wider uppercase mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-600 tracking-wider uppercase">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => alert('Please use your registered email and password to access your secure health records.')}
                    className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-all"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Submit */}
            <button
              id="submit-auth-btn"
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 active:scale-95 disabled:bg-slate-400 disabled:scale-100 transition-all cursor-pointer shadow-md"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isSignUp ? (
                'Sign Up'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Alternate Footer Toggle */}
          <div className="mt-6 flex flex-col items-center gap-2 border-t border-slate-100 pt-5 text-center">
            <button
              id="auth-toggle-btn"
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-slate-600 font-medium text-xs hover:text-slate-900 transition-all"
            >
              {isSignUp ? 'Already have an account? Back to login' : "Don't have an account? Create account"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
