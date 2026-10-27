export type GenderType = "남학교" | "여학교" | "남녀공학" | "확인 필요";
export type FoundationType = "공립" | "사립" | "국립" | "기타";
export type SchoolType =
  | "일반고"
  | "자사고"
  | "특목고"
  | "영재고"
  | "특성화고"
  | "학력인정고"
  | "기타";

export interface School {
  schoolCode: string;
  schoolName: string;
  district: string;
  districtCode: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  hasLocation: boolean;
  phone: string;
  homepage: string;
  genderType: GenderType;
  foundationType: FoundationType;
  schoolType: SchoolType;
  eduOffice: string;
  studentCount?: number | null;
  classCount?: number | null;
  teacherCount?: number | null;
  studentsPerClass?: number | null;
  disclosureYear?: string | null;
  raw?: Record<string, any>;
}

export interface SchoolsApiResponse {
  success: boolean;
  total: number;
  districtSuccessCount: number;
  districtFailedCount: number;
  failedDistricts: string[];
  schools: School[];
  error?: string;
  message?: string;
}

export interface SchoolDetailData {
  schoolCode: string;
  schoolName: string;
  basic?: Partial<School>;
  studentStatus?: {
    totalStudents?: number;
    maleStudents?: number;
    femaleStudents?: number;
    grade1Students?: number;
    grade2Students?: number;
    grade3Students?: number;
    totalClasses?: number;
    grade1Classes?: number;
    grade2Classes?: number;
    grade3Classes?: number;
    teachersCount?: number;
    studentsPerClassCalc?: number; // 전체 학생 ÷ 전체 학급 (계산값)
    year?: string;
    raw?: any;
  } | null;
  curriculum?: {
    summary?: string;
    courses?: Array<{ grade: string; subject: string; courseName: string; units?: string }>;
    raw?: any;
    fileUrl?: string;
    fileName?: string;
  } | null;
  admissionInfo?: {
    year?: string;
    quota?: number;
    applicants?: number;
    competitionRatio?: string;
    notes?: string;
    fileUrl?: string;
    fileName?: string;
    raw?: any;
  } | null;
  specialPrograms?: {
    specialFeatures?: string[];
    clubs?: string[];
    afterSchool?: string[];
    facilities?: string[];
    raw?: any;
  } | null;
  careerStatus?: {
    year?: string;
    graduates?: number;
    collegeRate?: string; // 진학
    employmentRate?: string; // 취업
    otherRate?: string; // 기타
    raw?: any;
  } | null;
}

export interface SchoolDetailApiResponse {
  success: boolean;
  schoolCode: string;
  detail: SchoolDetailData | null;
  error?: string;
  message?: string;
}
