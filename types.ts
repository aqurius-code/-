export interface Activity {
  date: string;
  name: string;
  keyword: string;
}

export interface ScheduleMap {
  [key: string]: Activity[];
}

export interface StudentData {
  id: number;
  text: string;
  isLoading: boolean;
  // Specific fields for Seteuk
  topic?: string;
  selectedCompetencies?: string[];
  // Specific fields for Haengbal
  selectedKeywords?: string[];
  customObservation?: string;
}

export enum TabType {
  CHANGCHE = 'changche',
  SETEUK = 'seteuk',
  HAENGBAL = 'haengbal',
}

export const COMPETENCIES = ["이해/개념", "탐구/심화", "적용/해결", "발표/소통", "태도/성장"];

export const HAENGBAL_KEYWORDS = [
  "성실/책임", "배려/공감", "리더십", "소극적/신중", "산만/에너지", 
  "창의성", "협력", "자기주도", "규칙준수", "봉사정신"
];