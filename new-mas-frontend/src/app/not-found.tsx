"use client"

import React from 'react'
import ConditionalNavBar from '@/components/ConditionalNavBar'
import Footer from '@/components/Footer'
import { SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

type Props = {}

const NotFound = (props: Props) => {
  return (
    <>
      <ConditionalNavBar />
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-white via-[#f9fafb] to-[#eef4f5]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-lg rounded-2xl p-10 max-w-lg w-full border border-gray-100"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 120 }}
            className="flex justify-center mb-6"
          >
            <SearchX size={64} className="text-[#0F919F]" strokeWidth={1.5} />
          </motion.div>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-lg text-gray-600 mb-6">
            Oops! The page you’re looking for doesn’t exist or has been moved.
          </p>

          <Button
            asChild
            className="bg-[#0F919F] hover:bg-[#0B7A82] text-white rounded-full px-6 py-2 text-base transition-all duration-300"
          >
            <a href="/">Go Back Home</a>
          </Button>
        </motion.div>

        <motion.div
          className="mt-10 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>Let’s get you back on track 🚀</p>
        </motion.div>
      </div>
      <Footer />
    </>
  )
}

export default NotFound