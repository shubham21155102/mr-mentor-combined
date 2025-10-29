export type FormData = {
  workExperience: string;
  company: string;
  companyTier: string;
  college: string;
  collegeTier: string;
  currentRole: string;
  nicheSkills: string;
  interviewExperience: string;
  mentorRating: string;
  ratingCount: string;
};

export type Scores = {
  experience: number;
  company: number;
  college: number;
  rating: number;
  role: number;
  niche: number;
  interview: number;
  totalWeightedScore: string;
};