import React, { useState, useEffect, useRef } from 'react';
import { Activity } from '../types';
import { CC_SCHEDULE_DB } from '../constants';
import { generateChangcheBulk, extractScheduleFromImage } from '../services/geminiService';

const ChangcheTab: React.FC = () => {
  const [grade, setGrade] = useState("1");
  const [semester, setSemester] = useState("1");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string>("");
  const [generatedResults, setGeneratedResults] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [pasteMessage, setPasteMessage] = useState("📋 이곳을 클릭하고 캡쳐한 이미지를 붙여넣기 (Ctrl+V) 하세요");

  useEffect(() => {
    const key = `${grade}-${semester}`;
    setActivities(CC_SCHEDULE_DB[key] || []);
    setSelectedActivity("");
    setGeneratedResults([]);
  }, [grade, semester]);

  const handleGenerate = async () => {
    if (!selectedActivity) {
      alert("활동을 선택해주세요.");
      return;
    }

    const activity = JSON.parse(selectedActivity) as Activity;
    setIsGenerating(true);
    
    try {
      const batchSize = 10;
      const totalStudents = 30;
      let allSentences: string[] = [];

      // Calculate how many batches needed
      for (let i = 0; i < totalStudents / batchSize; i++) {
        const batch = await generateChangcheBulk(activity, batchSize);
        
        // Format: (2025.03.04.) 입학식 및 시업식 [내용]
        const formattedBatch = batch.map(text => `(${activity.date}) ${activity.name} ${text}`);
        allSentences = [...allSentences, ...formattedBatch];
      }
      
      setGeneratedResults(allSentences);
    } catch (e) {
      console.error(e);
      alert("생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const processImageFile = async (file: File) => {
    setIsProcessingImage(true);
    setPasteMessage("🔄 이미지 분석 중...");
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        const mimeType = file.type;

        try {
          const extractedActivities = await extractScheduleFromImage(base64Data, mimeType);
          if (extractedActivities && extractedActivities.length > 0) {
            setActivities(prev => [...extractedActivities, ...prev]);
            setSelectedActivity(JSON.stringify(extractedActivities[0]));
            setPasteMessage("✅ 일정 등록 완료! (다른 이미지 붙여넣기 가능)");
            setTimeout(() => setPasteMessage("📋 이곳을 클릭하고 캡쳐한 이미지를 붙여넣기 (Ctrl+V) 하세요"), 3000);
          } else {
            setPasteMessage("⚠️ 일정을 찾을 수 없습니다. 다시 시도해주세요.");
          }
        } catch (err) {
          setPasteMessage("❌ 분석 실패. 다시 시도해주세요.");
        } finally {
          setIsProcessingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsProcessingImage(false);
      setPasteMessage("❌ 오류 발생");
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    let foundImage = false;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          foundImage = true;
          processImageFile(file);
          break;
        }
      }
    }

    if (!foundImage) {
      setPasteMessage("⚠️ 이미지가 아닙니다. 화면을 캡쳐 후 붙여넣어주세요.");
      setTimeout(() => setPasteMessage("📋 이곳을 클릭하고 캡쳐한 이미지를 붙여넣기 (Ctrl+V) 하세요"), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-indigo-900 mb-2">창의적 체험활동 AI 생성기 (중학교)</h2>
        <p className="text-indigo-600 mb-4 text-sm">
          활동을 선택하면 Gemini AI가 30명의 학생을 위한 다양하고 창의적인 문구를 생성합니다.
        </p>

        <div className="flex flex-col gap-4">
            {/* Top Row: Grade/Semester/PasteZone */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
                <div className="flex gap-2">
                   <select 
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white min-w-[100px]"
                  >
                      <option value="1">1학년</option>
                      <option value="2">2학년</option>
                      <option value="3">3학년</option>
                  </select>

                  <select 
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white min-w-[100px]"
                  >
                      <option value="1">1학기</option>
                      <option value="2">2학기</option>
                  </select>
                </div>

                 {/* Paste Zone */}
                 <div 
                    className={`flex-1 border-2 border-dashed rounded-lg flex items-center justify-center p-3 cursor-pointer transition-colors ${
                      isProcessingImage 
                        ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
                        : 'bg-white border-indigo-300 hover:bg-indigo-50 hover:border-indigo-400 text-slate-500'
                    }`}
                    onPaste={handlePaste}
                    tabIndex={0} // Make it focusable to accept paste events
                    onClick={(e) => e.currentTarget.focus()}
                 >
                    <span className="flex items-center gap-2 font-medium select-none">
                      {isProcessingImage ? (
                         <span className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      )}
                      {pasteMessage}
                    </span>
                 </div>
            </div>

            {/* Bottom Row: Activity Select & Generate */}
            <div className="flex flex-col md:flex-row gap-3">
                <select 
                    value={selectedActivity}
                    onChange={(e) => setSelectedActivity(e.target.value)}
                    className="p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white flex-1 font-medium text-slate-700 shadow-sm"
                >
                    <option value="">활동을 선택하세요 (또는 학사일정을 붙여넣으세요)</option>
                    {activities.map((act, idx) => (
                    <option key={idx} value={JSON.stringify(act)}>
                        [{act.date}] {act.name}
                    </option>
                    ))}
                </select>

                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[160px] shadow-md"
                >
                    {isGenerating ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        생성 중...
                    </>
                    ) : (
                    "✨ 반 전체 생성"
                    )}
                </button>
            </div>
        </div>
      </div>

      <div className="grid gap-4">
        {generatedResults.map((text, index) => (
          <div key={index} className="flex gap-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg">
              {index + 1}
            </div>
            <textarea 
              className="w-full p-2 border border-slate-200 rounded text-slate-700 text-sm focus:ring-1 focus:ring-indigo-500 outline-none resize-none bg-slate-50"
              rows={3}
              defaultValue={text}
            />
          </div>
        ))}
        {generatedResults.length === 0 && !isGenerating && (
          <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="mb-2">상단의 활동을 선택하고 [반 전체 생성] 버튼을 눌러주세요.</p>
            <p className="text-xs">엑셀/PDF 학사일정을 캡쳐해서 상단 영역에 붙여넣기(Ctrl+V)하면 목록이 추가됩니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangcheTab;