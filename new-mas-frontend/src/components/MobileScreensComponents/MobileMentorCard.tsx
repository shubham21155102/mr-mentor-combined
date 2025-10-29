// MobileMentorCard.tsx
import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { ArrowUpRightIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import ScheduleMeetingModal from "../FindAnExpert/ScheduleMeetingModal";

type Props = {
  card: {
    id?: string;
    name: string;
    description: string;
    role: string;
    company: string;
    institute: string;
    slotsLeft: number;
    category: string;
    subCategory: string;
  };
  index: number;
};

const MobileMentorCard = ({ card, index }: Props) => {
  const { isLoggedIn } = useUser();
  const router = useRouter();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const handleScheduleMeet = () => {
    if (!isLoggedIn) {
      // Redirect to login page
      router.push('/login');
      return;
    }
    
    // Open schedule meeting modal
    setIsScheduleModalOpen(true);
  };

  // Create mentor object for the modal
  const mentorForModal = {
    id: card.id || `mentor-${index}`,
    fullName: card.name,
    email: '', // This would need to be provided from the card data
    phone: null,
    profession: card.role,
    domain: card.category,
    role: card.role,
    profilePhoto: '/mentor_image.svg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mentorProfile: [{
      id: card.id || `mentor-profile-${index}`,
      company: card.company,
      role: card.role,
      institute: card.institute,
      slotsLeft: card.slotsLeft,
      description: card.description,
      category: card.category,
      subCategory: card.subCategory,
      image: '/mentor_image.svg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }]
  };

  return (
    <>
      <Card
        key={`mobile-mentor-${index}-${card.name}`}
        className="w-full max-w-[185px] bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      >
        <CardContent className="p-3 relative">
          {/* Floating Inner Box */}
          <div className="relative -mt-4 bg-white rounded-xl shadow-md overflow-hidden">
            {/* Image Section */}
            <div className="relative h-32 rounded-t-xl overflow-hidden">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url("/mentor_image.svg")`,
                }}
              >
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10"></div>

                {/* Company Badge */}
                <div className="absolute top-2 left-2 bg-white/90 text-gray-800 text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                  {card.company}
                </div>

                {/* Name & Description */}
                <div className="absolute bottom-2 left-2 right-2 text-white drop-shadow-lg">
                  <h3 className="font-semibold text-sm truncate">{card.name}</h3>
                  <p className="text-xs mt-1 line-clamp-2 opacity-90 hidden">{card.description}</p>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex flex-col gap-1 mt-3 px-3">
              <div className="font-semibold text-xs text-gray-900 truncate">
                {card.role}
              </div>
              <div className="text-gray-500 text-xs truncate">
                {card.institute}
              </div>
            </div>

            {/* Footer Section */}
            <div className="flex justify-between items-center mt-3 px-3 pb-3">
              <div
                className={`text-xs font-medium ${
                  card.slotsLeft > 0 ? "text-green-700" : "text-red-600"
                }`}
              >
                Slots left: <span className="font-bold">{card.slotsLeft}</span>
              </div>

              <Button 
                onClick={handleScheduleMeet}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 rounded-full text-xs text-white shadow-md"
              >
                <span>Schedule meet</span>
                <ArrowUpRightIcon className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Meeting Modal */}
      <ScheduleMeetingModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        mentor={mentorForModal}
      />
    </>
  );
};

export default MobileMentorCard;
