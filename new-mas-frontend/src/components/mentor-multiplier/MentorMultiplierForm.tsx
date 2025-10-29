import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormData } from "@/types/mentorMultiplier";
import { COMPANIES, COLLEGES } from "@/data/mentorMultiplierData";
import Image from "next/image";

interface MentorMultiplierFormProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  onCalculate: () => void;
}

const MentorMultiplierForm: React.FC<MentorMultiplierFormProps> = ({
  formData,
  onFormDataChange,
  onCalculate,
}) => {
  const handleCompanyChange = (value: string) => {
    const allCompanies = [
      ...COMPANIES.tier1,
      ...COMPANIES.tier2,
      ...COMPANIES.tier3,
    ];
    const selected = allCompanies.find((c) => c.name === value);
    if (selected) {
      onFormDataChange({
        ...formData,
        company: value,
        companyTier: selected.tier,
      });
    }
  };

  const handleCollegeChange = (value: string) => {
    const allColleges = [
      ...COLLEGES.tier1,
      ...COLLEGES.tier2,
      ...COLLEGES.tier3,
    ];
    const selected = allColleges.find((c) => c.name === value);
    if (selected) {
      onFormDataChange({
        ...formData,
        college: value,
        collegeTier: selected.tier,
      });
    }
  };

  const isFormValid = () => {
    return (
      formData.workExperience &&
      formData.company &&
      formData.college &&
      formData.currentRole &&
      formData.nicheSkills &&
      formData.interviewExperience &&
      formData.mentorRating
    );
  };

  return (
    <div className="flex items-start gap-12 max-w-7xl mx-auto">
      {/* Left side - Illustration */}
      <div className="hidden lg:block flex-shrink-0">
        <Image
          src="/coin_0x_icon.svg"
          alt="Illustration"
          width={236}
          height={236}
        />
      </div>

      {/* Right side - Form */}
      <div className="flex-1 max-w-[936px]">
        <div className="space-y-6">

          {/* Row 1: Work Experience and Company */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5A5A5A] block">
                Work Experience
              </label>
              <Select
                value={formData.workExperience}
                onValueChange={(value) =>
                  onFormDataChange({ ...formData, workExperience: value })
                }
              >
                <SelectTrigger className="bg-[#F4F9F9] border-[#E5E5E5] w-[450px] h-[56px] rounded-xl px-4 text-base border-b opacity-100">
                  <SelectValue placeholder="4" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">0-2 years</SelectItem>
                  <SelectItem value="3">2.1-4 years</SelectItem>
                  <SelectItem value="5">4.1-6 years</SelectItem>
                  <SelectItem value="7">6.1-8 years</SelectItem>
                  <SelectItem value="10">8.1-12 years</SelectItem>
                  <SelectItem value="14">12.1-16 years</SelectItem>
                  <SelectItem value="16">16+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5A5A5A] block">
                Company
              </label>
              <Select
                value={formData.company}
                onValueChange={handleCompanyChange}
              >
                <SelectTrigger className="bg-[#F4F9F9] border-[#E5E5E5] w-[450px] h-[56px] rounded-xl px-4 text-base border-b opacity-100">
                  <SelectValue placeholder="Wipro - Tier 1" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500  min-w-[100px]">
                    Tier 1 - FAANG/Top Firms
                  </div>
                  {COMPANIES.tier1.map((company) => (
                    <SelectItem key={company.name} value={company.name}>
                      {company.name}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 mt-2">
                    Tier 2 - Product Companies
                  </div>
                  {COMPANIES.tier2.map((company) => (
                    <SelectItem key={company.name} value={company.name}>
                      {company.name}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 mt-2">
                    Tier 3 - Service/Startups
                  </div>
                  {COMPANIES.tier3.map((company) => (
                    <SelectItem key={company.name} value={company.name}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: College and Current Role */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5A5A5A] block">
                College
              </label>
              <Select
                value={formData.college}
                onValueChange={handleCollegeChange}
              >
                <SelectTrigger className="bg-[#F4F9F9] border-[#E5E5E5] w-[450px] h-[56px] rounded-xl px-4 text-base border-b opacity-100">
                  <SelectValue placeholder="IIT Bombay - Tier 1" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                    Tier 1 - IITs/IIMs/Premium
                  </div>
                  {COLLEGES.tier1.map((college) => (
                    <SelectItem key={college.name} value={college.name}>
                      {college.name}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 mt-2">
                    Tier 2 - NITs/Other Top
                  </div>
                  {COLLEGES.tier2.map((college) => (
                    <SelectItem key={college.name} value={college.name}>
                      {college.name}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 mt-2">
                    Tier 3 - Other Colleges
                  </div>
                  {COLLEGES.tier3.map((college) => (
                    <SelectItem key={college.name} value={college.name}>
                      {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5A5A5A] block">
                Current Role / Level
              </label>
              <Select
                value={formData.currentRole}
                onValueChange={(value) =>
                  onFormDataChange({ ...formData, currentRole: value })
                }
              >
                <SelectTrigger className="bg-[#F4F9F9] border-[#E5E5E5] w-[450px] h-[56px] rounded-xl px-4 text-base border-b opacity-100">
                  <SelectValue placeholder="SDE 1" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="senior">
                    Senior/Lead/Managerial
                  </SelectItem>
                  <SelectItem value="junior">Junior/Mid-Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Niche Skills and Interview Experience */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5A5A5A] block">
                Niche Skills
              </label>
              <Select
                value={formData.nicheSkills}
                onValueChange={(value) =>
                  onFormDataChange({ ...formData, nicheSkills: value })
                }
              >
                <SelectTrigger className="bg-[#F4F9F9] border-[#E5E5E5] w-[450px] h-[56px] rounded-xl px-4 text-base border-b opacity-100">
                  <SelectValue placeholder="AI/ML" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="niche">
                    Niche (AI/ML, Blockchain, Quant)
                  </SelectItem>
                  <SelectItem value="high-demand">
                    High Demand (Java, Python, Data Science)
                  </SelectItem>
                  <SelectItem value="none">General Skills</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5A5A5A] block">
                Interview Experience
              </label>
              <Select
                value={formData.interviewExperience}
                onValueChange={(value) =>
                  onFormDataChange({ ...formData, interviewExperience: value })
                }
              >
                <SelectTrigger className="bg-[#F4F9F9] border-[#E5E5E5] w-[450px] h-[56px] rounded-xl px-4 text-base border-b opacity-100">
                  <SelectValue placeholder="0-5" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tier1-2">
                    Active at Tier 1/2 Company
                  </SelectItem>
                  <SelectItem value="other">
                    Active at Other Company
                  </SelectItem>
                  <SelectItem value="none">Not an Interviewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Mentor Rating and Calculate Button */}
          <div className="grid grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5A5A5A] block">
                Mentor Rating
              </label>
              <Select
                value={formData.mentorRating}
                onValueChange={(value) =>
                  onFormDataChange({ ...formData, mentorRating: value })
                }
              >
                <SelectTrigger className="bg-[#F4F9F9] border-[#E5E5E5] w-[450px] h-[56px] rounded-xl px-4 text-base border-b opacity-100">
                  <SelectValue placeholder="3.5" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No ratings yet</SelectItem>
                  <SelectItem value="3.5">3.5 - 3.79</SelectItem>
                  <SelectItem value="3.8">3.8 - 3.99</SelectItem>
                  <SelectItem value="4.0">4.0 - 4.49</SelectItem>
                  <SelectItem value="4.5">4.5 - 4.79</SelectItem>
                  <SelectItem value="4.8">4.8 - 5.0</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Button
                onClick={onCalculate}
                className="w-full bg-[#16A3A3] hover:bg-[#148989] h-14 text-base font-medium rounded-full text-white"
                disabled={!isFormValid()}
              >
                Calculate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorMultiplierForm;