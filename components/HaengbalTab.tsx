import React, { useState } from 'react';
import { StudentData, HAENGBAL_KEYWORDS } from '../types';
import { generateHaengbalSingle } from '../services/geminiService';

const HaengbalTab: React.FC = () => {
  const [students, setStudents] = useState<StudentData[]>(
    Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      text: "",
      isLoading: false,
      selectedKeywords: [],
      customObservation: ""
    }))
  );

  const toggleKeyword = (studentId: number, kw: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const current = s.selectedKeywords || [];
      const newKw = current.includes(kw) 
        ? current.filter(k => k !== kw) 
        : [...current, kw];
      return { ...s, selectedKeywords: newKw };
    }));
  };

  const updateCustomObservation = (studentId: number, value: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, customObservation: value } : s));
  };

  const handleGenerate = async (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const keywords = student.selectedKeywords || [];
    const customObs = student.customObservation || "";

    if (keywords.length === 0 && !customObs.trim()) {
      alert("키워드를 선택하거나 추가 특성을 입력해주세요.");
      return;
    }

    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, isLoading: true } : s));

    try {
      const result = await generateHaengbalSingle(keywords, customObs);
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, text: result, isLoading: false } : s));
    } catch (e) {
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, isLoading: false } : s));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-emerald-900 mb-2">행동특성 및 종합의견 AI 생성기</h2>
        <p className="text-emerald-700 text-sm">
          학생의 키워드를 선택하거나 직접 입력하면, AI가 단점을 성장의 언어로 순화하여 종합적인 의견을 작성합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {students.map((student) => (
          <div key={student.id} className="bg-white border border-emerald-100 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg text-emerald-800">{student.id}번 학생</span>
            </div>

            <div className="mb-3">
              <div className="flex flex-wrap gap-2 mb-3">
                {HAENGBAL_KEYWORDS.map(kw => (
                  <button
                    key={kw}
                    onClick={() => toggleKeyword(student.id, kw)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      student.selectedKeywords?.includes(kw)
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {kw}
                  </button>
                ))}
              </div>
              
              <input 
                type="text"
                value={student.customObservation || ""}
                onChange={(e) => updateCustomObservation(student.id, e.target.value)}
                placeholder="기타 특성 직접 입력 (예: 청소 시간에 항상 솔선수범함, 예체능 재능이 있음)"
                className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50/50"
              />
            </div>

            <textarea 
              className="w-full p-3 border border-slate-200 rounded-lg text-slate-700 text-sm focus:ring-2 focus:ring-emerald-200 outline-none resize-none bg-slate-50 mb-3"
              rows={4}
              value={student.text}
              placeholder="키워드 선택 또는 입력 후 생성 버튼을 클릭하세요."
              readOnly
            />

            <div className="flex justify-end gap-2">
              <button 
                onClick={() => navigator.clipboard.writeText(student.text)}
                className="px-3 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
              >
                복사
              </button>
              <button 
                onClick={() => handleGenerate(student.id)}
                disabled={student.isLoading}
                className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-sm transition-all disabled:opacity-50 min-w-[80px]"
              >
                {student.isLoading ? "..." : "생성"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HaengbalTab;