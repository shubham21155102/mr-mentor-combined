import { JSX } from "react"
import { Inter,Roboto } from 'next/font/google'
import { Button } from "../ui/button"
import { ArrowUpRightIcon } from "lucide-react"
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
const inter = Inter({ subsets: ['latin'] })
const roboto = Roboto({ subsets: ['latin'] })
const text_1='Level up with guided mock interviews'
const text_2='Get personalized feedback from experts in Data Analytics and boost your confidence for real-world interviews.'
const HeroIntroSection= ():JSX.Element=>{
    const router = useRouter()
    const { userRole, isLoggedIn } = useUser()

    const handleDashboardClick = () => {
        if (!isLoggedIn) {
            router.push('/login')
        } else if (userRole === 'expert') {
            router.push('/expert-dashboard')
        } else {
            router.push('/student-profile')
        }
    }

    return(
        <div className='flex flex-col items-start justify-start space-y-6 mt-30 mx-auto ml-15'>
        <div className={`text-white ${inter.className}`} style={{fontSize:'64px',fontWeight:600,lineHeight:'72px',letterSpacing:'-1.28px',textShadow:'0 0 9.5px rgba(24, 0, 129, 0.25)',maxWidth:'700px'}}>
            {text_1}
        </div>
        <div className={`text-white ${inter.className}`} style={{fontSize:'24px',fontWeight:500,lineHeight:'normal',letterSpacing:'-0.48px',maxWidth:'480px'}}>
            {text_2}
        </div>
        <Button variant={"outline"} className={`text-white rounded-[30px] ${roboto.className} bg-[#1A97A4] border-none cursor-pointer hover:bg-[#1A97A4] active:scale-95 transition-all duration-150 ease-in-out px-6 py-2 flex items-center`} style={{boxShadow:'0px 4px 4px rgba(0, 0, 0, 0.25)'}} onClick={handleDashboardClick}>
            <div style={{fontSize:'16px',fontWeight:500,lineHeight:'24px'}} className='flex items-center space-x-4'>
                Go To Dashboard <ArrowUpRightIcon className="w-10 h-10 ml-4" />
            </div>
        </Button>
    </div>
    )
}
export default HeroIntroSection