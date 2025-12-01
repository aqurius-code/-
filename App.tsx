import React, { useState } from 'react';
import { TabType } from './types';
import ChangcheTab from './components/ChangcheTab';
import SeteukTab from './components/SeteukTab';
import HaengbalTab from './components/HaengbalTab';
import { checkApiKey } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.CHANGCHE);
  const apiKeyAvailable = checkApiKey();

  if (!apiKeyAvailable) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">API Key Missing</h1>
          <p className="text-slate-600">
            The <code>API_KEY</code> environment variable is not set. 
            Please configure it in your runtime environment to use the Gemini AI features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden min-h-[800px]">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            🎓 2025 생기부 작성 통합 마스터 <span className="text-indigo-600">AI</span>
          </h1>
          <p className="text-slate-500 mt-2">
            Google Gemini 2.5를 활용한 고품격 생활기록부 문구 자동 생성 시스템
          </p>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setActiveTab(TabType.CHANGCHE)}
            className={`flex-1 py-4 px-6 text-center font-bold text-lg transition-all ${
              activeTab === TabType.CHANGCHE
                ? 'bg-white text-indigo-600 border-t-4 border-indigo-600 shadow-[0_4px_0_white]'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            📝 창의적 체험활동
          </button>
          <button
            onClick={() => setActiveTab(TabType.SETEUK)}
            className={`flex-1 py-4 px-6 text-center font-bold text-lg transition-all ${
              activeTab === TabType.SETEUK
                ? 'bg-white text-violet-600 border-t-4 border-violet-600 shadow-[0_4px_0_white]'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            📚 과목별 세특 (Pro)
          </button>
          <button
            onClick={() => setActiveTab(TabType.HAENGBAL)}
            className={`flex-1 py-4 px-6 text-center font-bold text-lg transition-all ${
              activeTab === TabType.HAENGBAL
                ? 'bg-white text-emerald-600 border-t-4 border-emerald-600 shadow-[0_4px_0_white]'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            🌱 행동특성 및 종합의견
          </button>
        </div>

        {/* Content */}
        <main className="p-6 md:p-8 bg-white">
          {activeTab === TabType.CHANGCHE && <ChangcheTab />}
          {activeTab === TabType.SETEUK && <SeteukTab />}
          {activeTab === TabType.HAENGBAL && <HaengbalTab />}
        </main>
      </div>
      
      <footer className="max-w-7xl mx-auto mt-6 text-center text-slate-400 text-sm">
        Powered by Google Gemini 2.5 Flash • Secure & Private
      </footer>
    </div>
  );
};

export default App;