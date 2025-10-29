import React, { JSX, useEffect, useMemo, useState } from "react";
import { Inter } from 'next/font/google'
import { testimonialCardsData } from "@/app/data/testimonialCardsData";
import { content } from "@/app/data/content";
import MobileMentorCard from "./MobileMentorCard";
import TestimonialCarousel from "../LandingPage/TestimonialCard";
import MobileRoleSelectionSection from "./MobileRoleSelectionSection";
import { fetchMentors } from "@/app/mentor-actions";

const inter = Inter({ subsets: ["latin"] });

const MobileMentorshipShowcaseSection = (): JSX.Element => {
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
    <div className="flex flex-col w-full px-4 py-6">
      {/* Mobile Role Selection */}
      <MobileRoleSelectionSection
        activeCategory={activeCategory}
        activeRole={activeRole}
        onCategoryChange={setActiveCategory}
        onRoleChange={setActiveRole}
      />

      {/* Mobile Mentor Cards - 2x2 Grid */}
      <div className="mt-6">
        <div className="grid grid-cols-2 gap-3">
          {filteredMentorCards.map((card, index) => (
            <MobileMentorCard key={`mobile-mentor-${index}-${card.name}`} card={card} index={index} />
          ))}
        </div>
      </div>

      {/* Mobile Quote Section */}
      <div
        className={`flex items-center justify-center text-center py-8 px-4 ${inter.className}`}
        style={{
          fontWeight: 600,
          fontSize: "1.25rem",
          lineHeight: "120%",
          letterSpacing: "-2%",
          color: "#000000",
        }}
      >
        "Where learners grow, and mentors give back. Your journey begins with a conversation."
      </div>

      {/* Mobile Testimonial Carousel */}
      <div className="mb-8">
        <TestimonialCarousel testimonials={testimonialCardsData} />
      </div>
    </div>
  );
};

export default MobileMentorshipShowcaseSection;
