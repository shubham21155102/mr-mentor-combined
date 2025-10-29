import React from "react";
import { Card, CardContent } from "../ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowUpRightIcon } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";

type TestimonialData = {
  name: string;
  badges: string[];
};

type TestimonialCardProps = {
  card: TestimonialData;
  index: number;
};

const TestimonialCard = ({ card, index }: TestimonialCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="w-64 md:w-72 lg:w-80 flex-shrink-0"
    >
      <Card
        key={`testimonial-${index}-${card.name}`}
        className="h-[300px] md:h-[330px] rounded-2xl overflow-hidden relative bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg"
      >
        <CardContent className="p-0 relative w-full h-full">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("/mentor_image.svg")` }}
          />

          {/* Overlay with glass effect */}
          <div className="absolute inset-0 bg-black/40 " />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-4 space-y-3">
            {/* Floating Icon */}
            <ArrowUpRightIcon className="absolute top-3 right-3 w-9 h-9 p-2 rounded-full bg-[#1A97A4] text-white shadow-md" />

            <div>
              <h3 className="text-lg md:text-xl font-semibold text-white drop-shadow">
                {card.name}
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {card.badges.map((badge, i) => (
                  <span
                    key={`badge-${i}-${badge}`}
                    className="px-3 py-1 text-xs md:text-sm rounded-full bg-gradient-to-r from-[#1A97A4] to-[#3BC8D3] text-white shadow-sm"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

type TestimonialCarouselProps = {
  testimonials: TestimonialData[];
};

const TestimonialCarousel = ({ testimonials }: TestimonialCarouselProps) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 relative">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[Autoplay({ delay: 4000, stopOnInteraction: true })]}
        className="w-full"
      >
        <CarouselContent className="-ml-3 md:-ml-6">
          {testimonials.map((testimonial, index) => (
            <CarouselItem
              key={`testimonial-${index}-${testimonial.name}`}
              className="pl-3 md:pl-6 basis-auto"
            >
              <TestimonialCard card={testimonial} index={index} />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Arrows */}
        <CarouselPrevious className="absolute -left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md hover:bg-gray-100" />
        <CarouselNext className="absolute -right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md hover:bg-gray-100" />
      </Carousel>
    </div>
  );
};

export default TestimonialCarousel;