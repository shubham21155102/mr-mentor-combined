"use client"
import React from 'react'
import { Button } from './ui/button'
import Image from 'next/image'
import { Inter,Roboto } from 'next/font/google'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
const inter = Inter({ subsets: ['latin'] })
const roboto = Roboto({ subsets: ['latin'] })
const NavBar = () => {
  const router = useRouter()
  return (
    <div className='flex justify-between p-4 bg-[#0B1B2A] rounded-4xl w-[92%] mx-auto top-0 sticky'>
                <div className='flex items-center gap-3 pl-4'>
                    <div className='flex items-center py-2 cursor-pointer' onClick={() => router.push('/')}>
                        <div className='h-[22px] w-[18px] relative'>
                            <Image
                                src="/f9bdc36fc903462c714dd636877cc51424a5769a.png"
                                alt="MR Mentor Logo"
                                width={18}
                                height={22}
                                className='object-cover'
                            />
                        </div>
                    </div>
                    <p className={`font-bold text-[22px] leading-[28px] text-white tracking-[-0.48px] ${inter.className}`}>
                        Mr. Mentor
                    </p>
                </div>
                <div className={`text-white ${inter.className} space-x-8 flex items-center`} style={{fontSize:'16px',fontWeight:500,letterSpacing:'-0.32px',textTransform:'uppercase'}}>
                    <Link href={'/'}>How It Works</Link>
                    <Link href={'/about'}>About Us</Link>
                    <Link href={'/contact'}>Contact Us</Link>
                </div>
                <Button variant={"outline"} className={`text-white rounded-[30px] ${roboto.className} bg-[#1A97A4] border-none cursor-pointer hover:bg-[#1A97A4] active:scale-95 transition-all duration-150 ease-in-out px-6 py-2 flex items-center`} onClick={()=>router.push('/login')}>
                    <div style={{fontSize:'16px',fontWeight:500,lineHeight:'24px'}} >
                        Sign In
                    </div>
                </Button>
    </div>
  )
}

export default NavBar