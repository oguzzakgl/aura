"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Heart, Shield, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    title: "Get started in under 2 minutes",
    description: "Set up your clinic, configure your AI assistant, and start accepting patient bookings today.",
    icon: <Zap className="w-5 h-5 text-teal-300" />
  },
  {
    title: "No credit card required",
    description: "Start your 14-day free trial with no commitment.",
    icon: <CheckCircle2 className="w-5 h-5 text-teal-300" />
  },
  {
    title: "AI widget ready in 2 minutes",
    description: "Deploy our smart assistant to your website instantly.",
    icon: <Shield className="w-5 h-5 text-teal-300" />
  }
];

export default function SignupPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* LEFT COLUMN: BRANDING */}
      <div className="md:w-1/2 bg-linear-to-br from-brand-primary to-brand-dark p-12 flex flex-col justify-between text-white">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <Heart className="text-brand-primary w-6 h-6 fill-current" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Aura</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Get started in under 2 minutes.
          </h1>
          <p className="text-teal-100/70 mb-12">
            Set up your clinic, configure your AI assistant, and start accepting patient bookings today.
          </p>
          
          <div className="space-y-8">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div className="mt-1">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-teal-100/50 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm text-teal-100/50">
          © 2024 Aura. All rights reserved.
        </div>
      </div>

      {/* RIGHT COLUMN: MULTI-STEP FORM */}
      <div className="md:w-1/2 bg-medical-bg flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-slate-100"
        >
          <div className="mb-8">
            <div className="flex gap-2 mb-4">
              <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-brand-primary' : 'bg-slate-100'}`} />
              <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-brand-primary' : 'bg-slate-100'}`} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {step === 1 ? 'Create your account' : 'Clinic details'}
            </h2>
            <p className="text-slate-500">
              {step === 1 ? 'Start your 14-day free trial today — no card needed' : 'Tell us about your dental practice'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full name</label>
                  <input type="text" placeholder="Dr. John Smith" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
                  <input type="email" placeholder="doctor@clinic.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                  <input type="password" placeholder="Min. 8 characters" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary outline-none" />
                </div>
                <button 
                  onClick={() => setStep(2)}
                  className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Clinic Name</label>
                  <input type="text" placeholder="Zen Dental Practice" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary outline-none bg-white">
                    <option>Europe/Istanbul (GMT+3)</option>
                    <option>America/New_York (GMT-4)</option>
                    <option>Europe/London (GMT+1)</option>
                  </select>
                </div>
                <div className="pt-2">
                  <button className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl mb-3">
                    Create Account
                  </button>
                  <button 
                    onClick={() => setStep(1)}
                    className="w-full text-slate-400 font-medium py-2 flex items-center justify-center gap-2 hover:text-slate-600 transition-colors"
                  >
                    <ArrowLeft size={16} /> Go back
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Already have an account? {' '}
              <Link href="/auth/login" className="text-brand-primary font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
