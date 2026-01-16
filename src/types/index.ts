// CV Master - TypeScript Type Definitions

// User types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  subscriptionStatus: 'free' | 'premium';
  subscriptionExpiry: Date | null;
  cvCount: number;
  scansToday: number;
  createdAt: Date;
}

// CV Data types
export interface PersonalInfo {
  fullName: string;
  profession?: string; // Posisi yang ingin dilamar
  email: string;
  phone: string;
  address: string;
  linkedin?: string;
  portfolio?: string;
}

export interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Expert';
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  gpa?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

export interface CVData {
  id: string;
  userId: string;
  templateId: string;
  personalInfo: PersonalInfo;
  summary: string;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  languages: Language[];
  lastScore: number | null;
  imageUrl?: string; // PNG image URL from Firebase Storage
  createdAt: Date;
  updatedAt: Date;
}

// CV Scoring types
export interface CVScoreBreakdown {
  formatStructure: number; // 20%
  keywordsSkills: number; // 25%
  experienceDescription: number; // 25%
  education: number; // 15%
  contactInfo: number; // 15%
}

export interface CVScore {
  overallScore: number;
  breakdown: CVScoreBreakdown;
  suggestions: string[];
  atsCompatibility: 'Low' | 'Medium' | 'High';
}

// Job matching types
export interface JobMatch {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}

// Scan history
export interface ScanHistory {
  id: string;
  userId: string;
  cvId: string | null;
  originalText: string;
  score: CVScore;
  createdAt: Date;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  CVForm: { cvId?: string };
  CVView: { cvId: string; imageUrl: string; title: string };
  CVPreview: { cvId: string };
  TemplateSelect: { cvId: string };
  Scanner: undefined;
  ScoreResult: { scanId: string };
  JobMatch: undefined;
  Subscription: undefined;
  Profile: undefined;
};

// Subscription types
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: 'monthly' | 'yearly';
  features: string[];
}

export const SUBSCRIPTION_PRICE = 89000; // IDR per month
