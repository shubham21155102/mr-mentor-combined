import React, { JSX, useEffect, useMemo, useState } from "react";
import { Inter } from 'next/font/google'
import { testimonialCardsData } from "@/app/data/testimonialCardsData";
import { content } from "@/app/data/content";
import MentorCard from "./MentorCard";
import TestimonialCarousel from "./TestimonialCard";
import RoleSelectionSection from "./RoleSelectionSection";
import { fetchMentors } from "@/app/mentor-actions";

const inter = Inter({ subsets: ["latin"] });

const MentorshipShowcaseSection = (): JSX.Element => {
  const [activeCategory, setActiveCategory] = useState<keyof typeof content>("Business & Consultancy");
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [mentors, setMentors] = useState<any[]>([]);

  // Set initial active role when component mounts
  useEffect(() => {
    if (content[activeCategory].length > 0) {
      setActiveRole(content[activeCategory][0].title);
    }
  }, [activeCategory]);

  // Fetch mentors when category or role changes
  useEffect(() => {
    if (activeCategory && activeRole) {
      fetchMentors(activeCategory, activeRole)
        .then(transformed => {
          setMentors(transformed);
        })
        .catch(err => console.error('Error fetching mentors:', err));
    }
  }, [activeCategory, activeRole]);

  // Filter mentor cards based on active category and role
  const filteredMentorCards = useMemo(() => {
    return mentors.slice(0, 4); // Always show top 4
  }, [mentors]);

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
      {/* Main Content Section */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 mb-16 lg:mb-24 py-12 lg:py-20">

        {/* Left side - Main heading and Categories */}
        <RoleSelectionSection
          activeCategory={activeCategory}
          activeRole={activeRole}
          onCategoryChange={setActiveCategory}
          onRoleChange={setActiveRole}
        />

        {/* Right side - Mentor Cards */}
        <div className="w-full lg:w-1/2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-20">
            {filteredMentorCards.map((card, index) => (
              <MentorCard key={`mentor-${index}-${card.name}`} card={card} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* Middle Quote Section */}
      <div
        className={`flex items-center justify-center text-center py-12 lg:py-16 px-4 ${inter.className}`}
        style={{
          fontWeight: 600,
          fontSize: "clamp(1.75rem, 4vw, 3rem)",
          lineHeight: "120%",
          letterSpacing: "-2%",
          color: "#000000",
        }}
      >
        "Where learners grow, and mentors give back.
        <br className="hidden md:block" />
        Your journey begins with a conversation."
      </div>
      <div className="mb-16 lg:mb-24">
        <TestimonialCarousel testimonials={testimonialCardsData} />
      </div>
    </div>
  );
};

export default MentorshipShowcaseSection;