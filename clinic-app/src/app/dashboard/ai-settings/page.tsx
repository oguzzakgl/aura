"use client";

import React from 'react';
import { Bot, Sparkles, Brain, MessageSquare, Zap } from 'lucide-react';

export default function AiSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Bot size={20} className="text-brand-primary" />
          <h1 className="text-2xl font-bold text-slate-900">AI Assistant Settings</h1>
        </div>
        <p className="text-sm text-slate-500 font-medium">Configure your intelligent clinic assistant and diagnostic models</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-brand-primary">
              <MessageSquare size={20} />
            </div>
            <h3 className="font-bold text-slate-900">Chatbot Personality</h3>
          </div>
          <p className="text-xs text-slate-500">Choose how the AI interacts with your patients during booking.</p>
          <div className="space-y-2">
            {['Professional & Clinical', 'Warm & Friendly', 'Concise & Fast'].map((p, i) => (
              <label key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-50 hover:bg-slate-50 cursor-pointer transition-all">
                <input type="radio" name="personality" defaultChecked={i === 0} className="accent-brand-primary" />
                <span className="text-sm font-medium text-slate-700">{p}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Brain size={20} />
            </div>
            <h3 className="font-bold text-slate-900">Diagnostic Depth</h3>
          </div>
          <p className="text-xs text-slate-500">Control how detailed the AI diagnostic reports should be.</p>
          <div className="space-y-2">
            {['Standard Scan', 'Deep Neural Analysis', 'Expert Mode (Full Report)'].map((d, i) => (
              <label key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-50 hover:bg-slate-50 cursor-pointer transition-all">
                <input type="radio" name="depth" defaultChecked={i === 1} className="accent-blue-600" />
                <span className="text-sm font-medium text-slate-700">{d}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
