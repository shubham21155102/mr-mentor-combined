"use client";

import React, { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { FormData, Scores } from "@/types/mentorMultiplier";
import { calculateMentorMultiplier } from "@/utils/mentorMultiplierUtils";
import ResultsDisplay from "@/components/mentor-multiplier/ResultsDisplay";
import MentorMultiplierForm from "@/components/mentor-multiplier/MentorMultiplierForm";
import ConditionalNavBar from "@/components/ConditionalNavBar";

const MentorMultiplier = () => {
  const [showResults, setShowResults] = useState(false);
  const [multiplier, setMultiplier] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [scores, setScores] = useState<Scores>({
    experience: 0,
    company: 0,
    college: 0,
    rating: 0,
    role: 0,
    niche: 0,
    interview: 0,
    totalWeightedScore: "0",
  });
  const [formData, setFormData] = useState<FormData>({
    workExperience: "",
    company: "",
    companyTier: "",
    college: "",
    collegeTier: "",
    currentRole: "",
    nicheSkills: "",
    interviewExperience: "",
    mentorRating: "",
    ratingCount: "",
  });

  const calculateMultiplier = () => {
    // Set default ratingCount if not specified
    const dataWithDefaults = {
      ...formData,
      ratingCount: formData.ratingCount || "0",
    };
    const result = calculateMentorMultiplier(dataWithDefaults);
    setScores(result.scores);
    setMultiplier(result.multiplier);
    setFinalPrice(result.finalPrice);
    setShowResults(true);
  };

  const resetCalculator = () => {
    setShowResults(false);
    setFormData({
      workExperience: "",
      company: "",
      companyTier: "",
      college: "",
      collegeTier: "",
      currentRole: "",
      nicheSkills: "",
      interviewExperience: "",
      mentorRating: "",
      ratingCount: "",
    });
  };

  if (showResults) {
    return (
      <>
        <ConditionalNavBar />
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <Breadcrumb className="mb-8">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="flex items-center gap-2 text-sm text-gray-600">
                    <Home className="h-4 w-4" />
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-sm">Payout Calculator</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <ResultsDisplay
              multiplier={multiplier}
              finalPrice={finalPrice}
              scores={scores}
              onGoHome={() => (globalThis.location.href = "/")}
              onCalculateAgain={resetCalculator}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ConditionalNavBar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="flex items-center gap-2 text-sm text-gray-600">
                  <Home className="h-4 w-4" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm">Payout Calculator</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="max-w-6xl mx-auto mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
              What's Your Mentor Multiplier?
            </h1>
            <p className="text-gray-600 text-base max-w-2xl mx-auto text-center">
              Every mentor has a unique value. Enter a few quick details and discover how your expertise turns into impact — and rewards.
            </p>
          </div>

          <MentorMultiplierForm
            formData={formData}
            onFormDataChange={setFormData}
            onCalculate={calculateMultiplier}
          />
        </div>
      </div>
    </>
  );
};

export default MentorMultiplier;