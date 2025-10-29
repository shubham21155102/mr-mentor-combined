"use client"
import React, { useState, useEffect } from 'react'
import NavBar from './NavBar'
import LoggedInNavBar from './LoggedInNavBar'
import { useUser } from '@/contexts/UserContext'
import NavBarSkeleton from './ui/NavBarSkeleton'

const ConditionalNavBar = () => {
  const { isLoggedIn, isLoading } = useUser()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Show loading state until the component is mounted and the user status is confirmed
  if (!isMounted || isLoading) {
    return <NavBarSkeleton />
  }

  // Show LoggedInNavBar if user is logged in, otherwise show regular NavBar
  return isLoggedIn ? <div className='pt-8'>
    <LoggedInNavBar />
  </div>:<div className='pt-8'>
    <NavBar />
  </div>
}

export default ConditionalNavBar