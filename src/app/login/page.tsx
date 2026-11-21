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
  KeyRound,
  BookOpen
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
      desc: 'Completed diagnostic with C01/C02 at risk'
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
      desc: 'Isolated in Section 10-B'
    },
    {
      label: 'Dr. Sharma (Teacher)',
      email: 'sharma@teacher.medha.edu',
      role: 'teacher',
      badge: 'Assigned: 10-A',
      desc: 'Authorized for Section 10-A only'
    },
    {
      label: 'Prof. Verma (Teacher)',
      email: 'verma@teacher.medha.edu',
      role: 'teacher',
      badge: 'Assigned: 10-B',
      desc: 'Authorized for Section 10-B only'
    },
    {
      label: 'Admin (System)',
      email: 'admin@medha.edu',
      role: 'admin',
      badge: 'Governance',
      desc: 'User & class assignment control'
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
      setErrorMessage('Please enter both your email address and password.');
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
        setErrorMessage(data.error || 'Authentication failed. Please verify your credentials.');
        setIsLoading(false);
        return;
      }

      // Route authenticated user to their role-dedicated portal
      if (redirectPath) {
        router.push(redirectPath);
      } else if (data.user.role === 'student') {
        router.push('/student');
      } else if (data.user.role === 'teacher') {
        router.push('/teacher');
      } else if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('Login submit error:', err);
      setErrorMessage('A network error occurred while connecting to the authentication server.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-accent-primary text-white mx-auto flex items-center justify-center shadow-cobalt font-heading font-black text-xl">
            M
          </div>
          <h2 className="font-heading font-extrabold text-3xl text-text-primary tracking-tight">
            Sign In to MEDHA
          </h2>
          <p className="text-xs text-text-secondary">
            Adaptive AI Learning Intelligence Platform · Class 10 Physics
          </p>
        </div>

        {/* Quick Evaluation Persona Switcher */}
        <div className="bg-surface rounded-2xl border border-outline-variant p-4 shadow-card space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-accent-primary uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Evaluation Persona Presets</span>
            </span>
            <span className="text-[10px] font-mono text-text-muted">Password: Medha@2026!</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {testPersonas.map((p) => {
              const isSelected = email === p.email;
              return (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => handleApplyPersona(p.email)}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs ${isSelected
                    ? 'border-accent-primary bg-accent-primaryLight text-accent-primary font-semibold shadow-sm'
                    : 'border-outline-variant bg-canvas hover:bg-surface-secondary text-text-secondary hover:text-text-primary'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold truncate text-[11px] text-text-primary">{p.label}</span>
                  </div>
                  <span className="text-[10px] text-text-muted font-mono block truncate mt-0.5">
                    {p.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Credentials Form */}
        <div className="bg-surface rounded-3xl border border-outline-variant p-6 sm:p-8 shadow-card space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-mastery-atRiskLight border border-mastery-atRisk/30 flex items-start gap-2.5 text-xs text-mastery-atRisk">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-primary flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] font-mono text-text-muted">Domain: @student / @teacher / @medha.edu</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@student.medha.edu"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-canvas focus:bg-surface focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-none text-xs text-text-primary font-mono transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-primary">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-outline-variant bg-canvas focus:bg-surface focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-none text-xs text-text-primary font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-accent-primary hover:bg-accent-primaryHover disabled:opacity-50 text-white font-semibold text-xs shadow-cobalt transition-all mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  Authenticating Session...
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
          <div className="pt-3 border-t border-outline-variant flex items-center justify-between text-[11px] text-text-muted font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-mastery-mastered" />
              Bcrypt Hash · Server-Side Sessions
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
        <div className="min-h-screen bg-canvas flex items-center justify-center text-text-muted text-xs font-mono">
          Loading MEDHA Secure Access...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}