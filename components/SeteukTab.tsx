import React, { useState } from 'react';
import { StudentData, COMPETENCIES } from '../types';
import { generateSeteukSingle } from '../services/geminiService';

const SeteukTab: React.FC = () => {
  const [globalTopic, setGlobalTopic] = useState("");
  const [globalStandard, setGlobalStandard] = useState("");
  const [includeStandard, setIncludeStandard] = useState(false);
  
  // Initialize 30 students
  const [students, setStudents] = useState<StudentData[]>(
    Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      text: "",
      isLoading: false,
      topic: "",
      selectedCompetencies: []
    }))
  );

  const toggleCompetency = (studentId: number, comp: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const current = s.selectedCompetencies || [];
      const newCompetencies = current.includes(comp) 
        ? current.filter(c => c !== comp) 
        : [...current, comp];
      return { ...s, selectedCompetencies: newCompetencies };
    }));
  };

  const updateStudentTopic = (studentId: number, topic: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, topic } : s));
  };

  const handleGenerateSingle = async (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const topicToUse = student.topic || globalTopic;
    if (!topicToUse) {
      alert("주제(단원명)를 입력해주세요 (공통 또는 개별).");
      return;
    }
    
    if ((student.selectedCompetencies || []).length === 0) {
      alert("최소 하나 이상의 역량을 선택해주세요.");
      return;
    }

    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, isLoading: true } : s));

    try {
      const result = await generateSeteukSingle(
        topicToUse,
        globalStandard,
        student.selectedCompetencies || [],
        includeStandard
      );
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, text: result, isLoading: false } : s));
    } catch (e) {
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, isLoading: false } : s));
      alert("생성 실패");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-violet-50 border border-violet-100 p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-violet-900 mb-2">과목별 세특 AI 생성기</h2>
        <p className="text-violet-600 mb-6 text-sm">
          성취기준과 주제를 기반으로 AI가 학문적이고 전문적인 세특을 작성합니다.
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-violet-800 font-bold mb-1 text-sm">📌 핵심 주제/단원명 (필수 공통)</label>
            <input 
              type="text" 
              value={globalTopic}
              onChange={(e) => setGlobalTopic(e.target.value)}
              placeholder="예: 미적분의 실생활 활용, 일제강점기 문학"
              className="w-full p-3 border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-violet-800 font-bold mb-1 text-sm">🎯 성취기준 (선택)</label>
            <input 
              type="text" 
              value={globalStandard}
              onChange={(e) => setGlobalStandard(e.target.value)}
              placeholder="예: [12화학Ⅰ03-05] 산화 환원 반응의 원리를 설명할 수 있다."
              className="w-full p-3 border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-violet-800 text-sm font-semibold">
          <input 
            type="checkbox" 
            id="includeStd"
            checked={includeStandard}
            onChange={(e) => setIncludeStandard(e.target.checked)}
            className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
          />
          <label htmlFor="includeStd" className="cursor-pointer">성취기준 내용을 문구 시작 부분에 포함하기</label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {students.map((student) => (
          <div key={student.id} className="bg-white border-l-4 border-violet-500 rounded-r-xl shadow-sm border-t border-r border-b border-slate-200 p-5 relative">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg text-slate-700">{student.id}번 학생</span>
              <input 
                type="text" 
                placeholder="개별 주제(필요시)" 
                value={student.topic}
                onChange={(e) => updateStudentTopic(student.id, e.target.value)}
                className="text-sm p-2 border border-slate-200 rounded w-40 focus:ring-1 focus:ring-violet-500 outline-none"
              />
            </div>

            <div className="mb-4">
              <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">역량 선택</div>
              <div className="flex flex-wrap gap-2">
                {COMPETENCIES.map(comp => (
                  <button
                    key={comp}
                    onClick={() => toggleCompetency(student.id, comp)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      student.selectedCompetencies?.includes(comp)
                        ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {comp}
                  </button>
                ))}
              </div>
            </div>

            <textarea 
              className="w-full p-3 border border-slate-200 rounded-lg text-slate-700 text-sm focus:ring-2 focus:ring-violet-200 outline-none resize-none bg-slate-50 mb-3"
              rows={5}
              value={student.text}
              placeholder="생성 버튼을 누르면 AI가 작성합니다."
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
                onClick={() => handleGenerateSingle(student.id)}
                disabled={student.isLoading}
                className="px-4 py-2 text-sm text-white bg-violet-600 hover:bg-violet-700 rounded shadow-sm transition-all disabled:opacity-50 min-w-[80px]"
              >
                {student.isLoading ? "..." : "AI 생성"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeteukTab;