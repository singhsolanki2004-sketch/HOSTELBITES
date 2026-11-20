import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, ShieldCheck, UserCheck } from 'lucide-react';
import { api } from '../api';
import type { AuthSession, UserRole } from '../types';
import { BrandLogo } from './BrandLogo';

interface AuthScreenProps {
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
  onAuthenticated: (session: AuthSession) => Promise<void> | void;
  onCancel?: () => void;
}

const AJMER_COLLEGES = [
  'Government Engineering College, Ajmer',
  'MDS University, Ajmer',
  'Bhagwant University, Ajmer',
  'Central University Corridor, Ajmer',
  'Mayo College / Regional Institute, Ajmer',
];

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'login',
  initialRole = 'student',
  onAuthenticated,
  onCancel,
}) => {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Student registration fields
  const [stuName, setStuName] = useState('');
  const [stuEmail, setStuEmail] = useState('');
  const [stuMobile, setStuMobile] = useState('');
  const [stuPassword, setStuPassword] = useState('');
  const [stuCollege, setStuCollege] = useState(AJMER_COLLEGES[0]);
  const [stuHostel, setStuHostel] = useState('');
  const [stuGate, setStuGate] = useState('');

  // Home Chef registration fields
  const [chefName, setChefName] = useState('');
  const [chefEmail, setChefEmail] = useState('');
  const [chefMobile, setChefMobile] = useState('');
  const [chefPassword, setChefPassword] = useState('');
  const [kitchenName, setKitchenName] = useState('');
  const [locality, setLocality] = useState('Vaishali Nagar');
  const [specialty, setSpecialty] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [chefBio, setChefBio] = useState('');

  // Forgot password field
  const [resetEmail, setResetEmail] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your email or mobile number and password.');
      return;
    }
    setLoading(true);
    try {
      const { session } = await api.login(role, identifier, password);
      await onAuthenticated(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!stuName || !stuEmail || !stuMobile || !stuPassword || !stuCollege || !stuHostel || !stuGate) {
      setError('Please complete all student and hostel drop-off fields.');
      return;
    }
    if (stuMobile.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    setLoading(true);
    try {
      const { session } = await api.registerStudent({
        name: stuName,
        email: stuEmail,
        mobile: stuMobile,
        password: stuPassword,
        college: stuCollege,
        hostelName: stuHostel,
        dropOffGate: stuGate,
      });
      await onAuthenticated(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleChefRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!chefName || !chefEmail || !chefMobile || !chefPassword || !kitchenName || !fssaiNumber) {
      setError('Please complete all chef kitchen and FSSAI registration details.');
      return;
    }
    setLoading(true);
    try {
      const { session } = await api.registerChef({
        name: chefName,
        email: chefEmail,
        mobile: chefMobile,
        password: chefPassword,
        kitchenName,
        locality,
        specialty: specialty || 'Homestyle North Indian Meals',
        bio: chefBio || 'Local Ajmer home kitchen preparing fresh daily hostel meals.',
        fssaiNumber,
        fssaiCertificateNote: 'Submitted during onboarding · Pending Admin Verification',
      });
      await onAuthenticated(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chef registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!resetEmail.trim()) {
      setError('Enter your registered email address or mobile number.');
      return;
    }
    setSuccessMsg(
      `Demo Prototype: Password reset instructions simulated for ${resetEmail}. You can use demo credentials below to test immediately.`,
    );
  };

  const quickDemoLogin = async (demoRole: UserRole, demoId: string, demoPass: string) => {
    setError('');
    setLoading(true);
    try {
      const { session } = await api.login(demoRole, demoId, demoPass);
      await onAuthenticated(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Info + Demo Prototype Quick Access */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl bg-white border border-[#252525]/10 p-6 space-y-4">
            <BrandLogo size="md" />
            <h1 className="font-display text-2xl font-bold text-[#252525]">
              {mode === 'register'
                ? role === 'chef'
                  ? 'Register Your Home Kitchen'
                  : 'Create Student Account'
                : mode === 'forgot'
                ? 'Reset Prototype Password'
                : 'Sign In to HostelBites'}
            </h1>
            <p className="text-sm text-[#252525]/75 leading-relaxed">
              Connecting Ajmer college hostel students with FSSAI-verified local home chefs. Zero delivery fees on every hostel gate drop-off.
            </p>
            <div className="pt-3 border-t border-[#252525]/10 space-y-2.5">
              <p className="text-xs font-semibold text-[#176B45]">
                Demo Prototype Quick Login (Ajmer Pilot)
              </p>
              <p className="text-xs text-[#252525]/65">
                Use one-click demo access below for university presentation testing, or register a brand-new account on the right.
              </p>
              <div className="grid grid-cols-1 gap-2 pt-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => quickDemoLogin('student', 'aarav.sharma@student.ajmer.edu', 'demo123')}
                  className="flex items-center justify-between rounded-xl border border-[#176B45]/25 bg-[#176B45]/5 px-3.5 py-2.5 text-left text-xs font-semibold text-[#176B45] hover:bg-[#176B45]/10 transition-colors cursor-pointer"
                >
                  <span>Demo Student · Aarav Sharma</span>
                  <span className="font-mono font-normal opacity-80">GEC Ajmer</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => quickDemoLogin('chef', 'sunita.kitchen@hostelbites.in', 'demo123')}
                  className="flex items-center justify-between rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-left text-xs font-semibold text-[#252525] hover:bg-[#252525]/5 transition-colors cursor-pointer"
                >
                  <span>Demo Home Chef · Sunita Sharma</span>
                  <span className="text-[#176B45] font-medium">Verified</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => quickDemoLogin('chef', 'meena.tiffin@hostelbites.in', 'demo123')}
                  className="flex items-center justify-between rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-left text-xs font-semibold text-[#252525] hover:bg-[#252525]/5 transition-colors cursor-pointer"
                >
                  <span>Demo Chef · Meena Verma</span>
                  <span className="text-amber-700 font-medium">Pending Review</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => quickDemoLogin('admin', 'admin@hostelbites.in', 'admin123')}
                  className="flex items-center justify-between rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-left text-xs font-semibold text-[#252525] hover:bg-[#252525]/5 transition-colors cursor-pointer"
                >
                  <span>Demo Admin · Venture Console</span>
                  <span className="font-mono font-normal opacity-75">Full Access</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Interactive Auth Form */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-[#252525]/10 p-6 sm:p-8 space-y-6">
          {/* Role Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#252525]/70">Account Role</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FFFDF8] border border-[#252525]/10 rounded-xl">
              {(['student', 'chef', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setError('');
                    setSuccessMsg('');
                    if (r === 'admin' && mode === 'register') setMode('login');
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    role === r
                      ? 'bg-[#176B45] text-white'
                      : 'text-[#252525]/70 hover:text-[#252525]'
                  }`}
                >
                  {r === 'student' ? 'Student' : r === 'chef' ? 'Home Chef' : 'Admin'}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Tabs (Login / Register) */}
          {role !== 'admin' && mode !== 'forgot' && (
            <div className="flex items-center gap-6 border-b border-[#252525]/10 text-sm">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`pb-2.5 font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'login'
                    ? 'border-[#176B45] text-[#176B45]'
                    : 'border-transparent text-[#252525]/60 hover:text-[#252525]'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className={`pb-2.5 font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'register'
                    ? 'border-[#176B45] text-[#176B45]'
                    : 'border-transparent text-[#252525]/60 hover:text-[#252525]'
                }`}
              >
                {role === 'student' ? 'Student Registration' : 'Home Chef Registration'}
              </button>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="rounded-xl border border-[#176B45]/25 bg-[#176B45]/10 px-4 py-3 text-sm text-[#176B45]">
              {successMsg}
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#252525]/75 mb-1.5">
                  Email Address or Mobile Number
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    role === 'admin'
                      ? 'admin@hostelbites.in'
                      : role === 'chef'
                      ? 'sunita.kitchen@hostelbites.in'
                      : 'aarav.sharma@student.ajmer.edu'
                  }
                  className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm text-[#252525] focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#252525]/75">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-xs font-medium text-[#176B45] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (demo123)"
                    className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 pr-10 text-sm text-[#252525] focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#252525]/55 hover:text-[#252525] cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-xl border border-[#252525]/15 px-4 py-2.5 text-sm font-medium text-[#252525] hover:bg-[#252525]/5 cursor-pointer"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#176B45] px-5 py-3 text-sm font-semibold text-white hover:bg-[#125436] disabled:opacity-60 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  {loading ? 'Signing in...' : `Sign In as ${role === 'student' ? 'Student' : role === 'chef' ? 'Home Chef' : 'Admin'}`}
                </button>
              </div>
            </form>
          )}

          {mode === 'register' && role === 'student' && (
            <form onSubmit={handleStudentRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#252525]/75 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={stuName}
                    onChange={(e) => setStuName(e.target.value)}
                    placeholder="e.g. Kabir Mathur"
                    className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#252525]/75 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={stuMobile}
                    onChange={(e) => setStuMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#252525]/75 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={stuEmail}
                    onChange={(e) => setStuEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#252525]/75 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={stuPassword}
                      onChange={(e) => setStuPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#252525]/55 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#252525]/75 mb-1">College / University (Ajmer)</label>
                <select
                  value={stuCollege}
                  onChange={(e) => setStuCollege(e.target.value)}
                  className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
                >
                  {AJMER_COLLEGES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#252525]/75 mb-1">Hostel / PG Name</label>
                  <input
                    type="text"
                    value={stuHostel}
                    onChange={(e) => setStuHostel(e.target.value)}
                    placeholder="e.g. Aravalli Hostel Block A"
                    className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#252525]/75 mb-1">
                    Hostel Gate / Drop-off Location
                  </label>
                  <input
                    type="text"
                    value={stuGate}
                    onChange={(e) => setStuGate(e.target.value)}
                    placeholder="e.g. Main Gate Guard Cabin"
                    className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#176B45] px-5 py-3 text-sm font-semibold text-white hover:bg-[#125436] disabled:opacity-60 transition-colors cursor-pointer"
              >
                {loading ? 'Creating Account...' : 'Create Student Account'}
              </button>
            </form>
          )}

          {mode === 'register' && role === 'chef' && (
            <form onSubmit={handleChefRegister} className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <span>
                  New Home Chef accounts start with <strong>Pending Verification</strong> status. An administrator will verify your submitted FSSAI certificate and kitchen hygiene before marking your kitchen Verified.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#252525]/75 mb-1">Chef Full Name</label>
                  <input
                    type="text"
                    value={chefName}
                    onChange={(e) => setChefName(e.target.value)}
                    placeholder="e.g. Kavita Agarwal"
                    className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#252525]/75 mb-1">Home Kitchen Name</label>
                  <input
                    type="text"
                    value={kitchenName}
                    onChange={(e) => setKitchenName(e.target.value)}
                    placeholder="e.g. Agarwal Ghar Rasoi"
                    className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#252525]/75 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={chefEmail}
                    onChange={(e) => setChefEmail(e.target.value)}
                    placeholder="kitchen@hostelbites.in"
                    className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#252525]/75 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={chefMobile}
                    onChange={(e) => setChefMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#252525]/75 mb-1">Ajmer Locality</label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Vaishali Nagar"
                    className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#252525]/75 mb-1">
                    FSSAI Registration Number
                  </label>
                  <input
                    type="text"
                    value={fssaiNumber}
                    onChange={(e) => setFssaiNumber(e.target.value)}
                    placeholder="14-digit FSSAI number"
                    className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#252525]/75 mb-1">Kitchen Specialty</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. Rajasthani Dal-Bati & Everyday Thalis"
                    className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#252525]/75 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={chefPassword}
                      onChange={(e) => setChefPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#252525]/55 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#252525]/75 mb-1">About Your Home Kitchen</label>
                <textarea
                  rows={2}
                  value={chefBio}
                  onChange={(e) => setChefBio(e.target.value)}
                  placeholder="Describe cooking oil, hygiene practices, and home-style dishes..."
                  className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#176B45] px-5 py-3 text-sm font-semibold text-white hover:bg-[#125436] disabled:opacity-60 transition-colors cursor-pointer"
              >
                {loading ? 'Submitting Application...' : 'Submit Home Chef Application'}
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#252525]">
                <KeyRound className="w-4 h-4 text-[#176B45]" />
                <span>Reset Password (Prototype Simulation)</span>
              </div>
              <p className="text-xs text-[#252525]/70">
                Enter your registered email or mobile number. In this demo environment, password reset notifications are simulated.
              </p>
              <input
                type="text"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Registered email or mobile number"
                className="w-full rounded-xl border border-[#252525]/15 bg-[#FFFDF8] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#176B45]/30"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="rounded-xl border border-[#252525]/15 px-4 py-2.5 text-sm font-medium text-[#252525] cursor-pointer"
                >
                  Back to Login
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#176B45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#125436] cursor-pointer"
                >
                  Send Demo Reset Link
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
