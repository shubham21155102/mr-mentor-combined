export const calculateExperienceScore = (years: number): number => {
  if (years <= 2) return 0;
  if (years <= 4) return 2;
  if (years <= 6) return 5;
  if (years <= 8) return 7;
  if (years <= 12) return 9;
  return 10;
};

export const calculateCompanyScore = (tier: string): number => {
  const scores: { [key: string]: number } = {
    tier1: 10,
    tier2: 7,
    tier3: 4,
  };
  return scores[tier] || 0;
};

export const calculateCollegeScore = (tier: string): number => {
  const scores: { [key: string]: number } = {
    tier1: 10,
    tier2: 5,
    tier3: 0,
  };
  return scores[tier] || 0;
};

export const calculateRatingScore = (rating: number, count: number): number => {
  if (count < 20) return 0;
  if (rating >= 4.8) return 10;
  if (rating >= 4.5) return 9;
  if (rating >= 4.0) return 7;
  if (rating >= 3.8) return 5;
  if (rating >= 3.5) return 4;
  return 0;
};

export const calculateRoleScore = (role: string): number => {
  return role === "senior" ? 10 : 5;
};

export const calculateNicheScore = (skills: string): number => {
  const scores: { [key: string]: number } = {
    niche: 10,
    "high-demand": 8,
    none: 0,
  };
  return scores[skills] || 0;
};

export const calculateInterviewScore = (experience: string): number => {
  const scores: { [key: string]: number } = {
    "tier1-2": 10,
    other: 5,
    none: 0,
  };
  return scores[experience] || 0;
};

export const calculateMentorMultiplier = (formData: any) => {
  const baseRate = 500;

  // Calculate individual scores
  const expScore = calculateExperienceScore(parseFloat(formData.workExperience));
  const compScore = calculateCompanyScore(formData.companyTier);
  const collScore = calculateCollegeScore(formData.collegeTier);
  const ratingScore = calculateRatingScore(
    parseFloat(formData.mentorRating || "0"),
    parseInt(formData.ratingCount || "0")
  );
  const roleScore = calculateRoleScore(formData.currentRole);
  const nicheScore = calculateNicheScore(formData.nicheSkills);
  const intScore = calculateInterviewScore(formData.interviewExperience);

  // Weights according to the formula
  const weights = {
    experience: 0.4,
    company: 0.25,
    college: 0.05,
    rating: 0.15,
    role: 0.05,
    niche: 0.05,
    interview: 0.05,
  };

  // Calculate total weighted score
  const totalWeightedScore =
    expScore * weights.experience +
    compScore * weights.company +
    collScore * weights.college +
    ratingScore * weights.rating +
    roleScore * weights.role +
    nicheScore * weights.niche +
    intScore * weights.interview;

  // Calculate mentor multiplier: M = 1 + 0.15 * TotalWeightedScore
  const mentorMultiplier = Math.min(1 + 0.15 * totalWeightedScore, 2.5);

  // Calculate final price
  const price = baseRate * mentorMultiplier;

  return {
    scores: {
      experience: expScore,
      company: compScore,
      college: collScore,
      rating: ratingScore,
      role: roleScore,
      niche: nicheScore,
      interview: intScore,
      totalWeightedScore: totalWeightedScore.toFixed(2),
    },
    multiplier: parseFloat(mentorMultiplier.toFixed(3)),
    finalPrice: Math.round(price),
  };
};