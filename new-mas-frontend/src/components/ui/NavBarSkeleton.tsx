import React from 'react';
import Image from 'next/image';

const NavBarSkeleton = () => {
  return (
    <div className='flex justify-between p-4 bg-[#0B1B2A] rounded-4xl w-[92%] mx-auto top-0 sticky'>
      <div className='flex items-center'>
        <Image src="/mr-mentor-logo.svg" alt="Logo" width={120} height={50} className='h-6 w-full' />
      </div>
      <div className="hidden md:flex items-center space-x-8">
        <div className="animate-pulse bg-gray-700 h-6 w-24 rounded"></div>
        <div className="animate-pulse bg-gray-700 h-6 w-24 rounded"></div>
        <div className="animate-pulse bg-gray-700 h-6 w-24 rounded"></div>
      </div>
      <div className="animate-pulse bg-gray-700 h-10 w-20 rounded-full"></div>
    </div>
  );
};

export default NavBarSkeleton;