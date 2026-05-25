"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Heart, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const features = [
  {
    title: "Claude-powered AI booking assistant",
    description: "24/7 smart scheduling that understands your clinic's needs.",
    icon: <Zap className="w-5 h-5 text-teal-300" />
  },
  {
    title: "HIPAA-ready, secure patient data",
    description: "Enterprise-grade security for sensitive medical records.",
    icon: <Shield className="w-5 h-5 text-teal-300" />
  },
  {
    title: "Auto email notifications on booking",
    description: "Keep patients informed with zero manual effort.",
    icon: <CheckCircle2 className="w-5 h-5 text-teal-300" />
  }
];

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // DEMO MODE: Redirect to dashboard without real auth
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* LEFT COLUMN: BRANDING & FEATURES */}
      <div className="md:w-1/2 bg-linear-to-br from-blue-600 to-indigo-900 p-12 flex flex-col justify-between text-white">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <Heart className="text-blue-600 w-6 h-6 fill-current" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Aura</span>
        </motion.div>

        <div className="max-w-md">
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold leading-tight mb-6"
          >
            The future of clinic booking is here.
          </motion.h1>
          
          <div className="space-y-8 mt-12">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                className="flex gap-4"
              >
                <div className="mt-1">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-teal-100/70 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-sm text-teal-100/50">
          © 2024 Aura. All rights reserved.
        </div>
      </div>

      {/* RIGHT COLUMN: LOGIN FORM */}
      <div className="md:w-1/2 bg-(--background) flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl shadow-teal-900/5 border border-slate-100"
        >
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500">Sign in to your clinic dashboard</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
              <input 
                type="email" 
                required
                placeholder="doctor@clinic.com"
                className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 border border-slate-200 focus:border-(--primary) focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <a href="#" className="text-xs text-blue-600 hover:underline font-medium">Forgot?</a>
              </div>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 border border-slate-200 focus:border-(--primary) focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-(--primary) hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account? {' '}
              <Link href="/auth/signup" className="text-blue-600 font-bold hover:underline">
                Start free trial
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

