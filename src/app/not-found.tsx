import React from 'react';
import Link from 'next/link';
import { Compass, ArrowRight, Layers } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col items-center justify-center p-6 antialiased">
      <div className="max-w-md w-full bg-surface rounded-3xl border border-outline-variant p-8 shadow-card text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-accent-primaryLight text-accent-primary mx-auto flex items-center justify-center font-heading font-black text-lg">
          404
        </div>

        <div className="space-y-1.5">
          <h2 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            Page Not Found
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            The requested concept or learning portal view does not exist or has been moved.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt hover:bg-accent-primaryHover transition-all"
          >
            <span>Return to Learning Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-secondary text-text-secondary hover:text-text-primary text-xs font-semibold border border-outline-variant transition-colors"
          >
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}