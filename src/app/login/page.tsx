'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Brain,
  ShieldCheck,
  GraduationCap,
  Users,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Persona Test Presets
  const testPersonas = [
    {
      label: 'Priya (Student 10-A)',
      email: 'priya@student.medha.edu',
      role: 'student',
      badge: 'Class 10-A',
      desc: 'Has completed diagnostic with C01/C02 at risk'
    },
    {
      label: 'Aarav (Student 10-A)',
      email: 'aarav@student.medha.edu',
      role: 'student',
      badge: 'Class 10-A',
      desc: 'Unassessed clean slate baseline'
    },
    {
      label: 'Rohit (Student 10-B)',
      email: 'rohit@student.medha.edu',
      role: 'student',
      badge: 'Class 10-B',
      desc: 'Isolated in Section B'
    },
    {
      label: 'Dr. Sharma (Teacher)',
      email: 'sharma@teacher.medha.edu',
      role: 'teacher',
      badge: 'Assigned: 10-A',
      desc: 'Authorized for Section A only'
    },
    {
      label: 'Prof. Verma (Teacher)',
      email: 'verma@teacher.medha.edu',
      role: 'teacher',
      badge: 'Assigned: 10-B',
      desc: 'Authorized for Section B only'
    },
    {
      label: 'Admin (System)',
      email: 'admin@medha.edu',
      role: 'admin',
      badge: 'Root Access',
      desc: 'Full role & assignment control'
    }
  ];

  const handleApplyPersona = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('Medha@2026!');
    setErrorMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Authentication failed. Please check your credentials.');
        return;
      }

      // Route according to verified server-side role
      const userRole = data.user.role;
      if (redirectPath) {
        router.push(redirectPath);
      } else if (userRole === 'student') {
        router.push('/student');
      } else if (userRole === 'teacher') {
        router.push('/teacher');
      } else if (userRole === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-deep text-text-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-accent-primaryContainer selection:text-white">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-primaryContainer/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-primaryContainer to-accent-secondaryContainer shadow-neonPrimary text-white mx-auto">
          <Brain className="w-8 h-8" />
        </div>
        <h1 className="font-heading font-extrabold text-3xl tracking-wider text-text-primary">
          MEDHA
        </h1>
        <p className="text-xs font-mono text-accent-secondary">
          Adaptive AI Learning Intelligence • Role-Protected Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        <div className="bg-surface rounded-3xl border border-outline-variant/40 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-outline-variant/30 pb-4">
            <h2 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2">
              <Lock className="w-4 h-4 text-accent-primary" />
              <span>Sign In to Your Authorized Portal</span>
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Role permissions and data ownership are enforced strictly by the server.
            </p>
          </div>

          {/* Quick Persona Presets for Judges/Testers */}
          <div className="p-4 rounded-2xl bg-surface-deep border border-outline-variant/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-accent-secondary font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Select Persona Preset for Audit Testing:
              </span>
              <span className="text-[10px] font-mono text-text-secondary">Password: Medha@2026!</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {testPersonas.map((p) => (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => handleApplyPersona(p.email)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                    email === p.email
                      ? 'bg-accent-primaryContainer/20 border-accent-primary text-text-primary shadow-neonPrimary'
                      : 'bg-surface hover:bg-surface-elevated border-outline-variant/30 text-text-secondary'
                  }`}
                >
                  <div className="font-semibold text-[11px] text-text-primary truncate">
                    {p.label}
                  </div>
                  <div className="text-[9px] font-mono text-accent-primary truncate">
                    {p.badge}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-mastery-atRisk/15 border border-mastery-atRisk/40 text-mastery-atRisk text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-text-secondary mb-1">
                Academic Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@medha.edu or teacher@medha.edu"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface-deep border border-outline-variant/40 text-xs text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-text-secondary mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-deep border border-outline-variant/40 text-xs text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-secondary hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-accent-primaryContainer to-accent-secondaryContainer hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs shadow-neonPrimary transition-all mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Authenticating Server Session...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span>Sign In to Authenticated Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Security Guarantee Notice */}
          <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between text-[11px] text-text-secondary font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-mastery-mastered" />
              Bcrypt Hash • Server-Side Sessions
            </span>
            <span>HTTP-Only Secure Cookies</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-deep flex items-center justify-center text-text-muted">
          Loading MEDHA Secure Access...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
