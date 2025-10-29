import Footer from '@/components/Footer'
import NavBar from '@/components/NavBar'
import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import Image from 'next/image'

type Props = {}

const PrivacyPolicy = (props: Props) => {
  return (
    <div className="min-h-screen bg-[#eefdff]">
      <NavBar />
      
      {/* Breadcrumb */}
      <div className="w-full px-4 md:px-[248px] py-6">
        <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
          <div className="flex items-center space-x-2">
            <Link 
              href="/" 
              className="text-neutral-500 hover:text-neutral-700 transition-colors flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-neutral-400" />
            <span className="text-[#212121] font-medium">Privacy Policy</span>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-[248px] pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-[36px] font-semibold text-[#212121] mb-4">Privacy Policy</h1>
          <div className="w-full h-px bg-black/30"></div>
        </div>

        {/* Last Updated Badge */}
        <div className="flex justify-end mb-8">
          <div className="bg-[rgba(12,132,145,0.25)] px-4 md:px-6 py-2 rounded-[30px] shadow-[0px_0px_34px_0px_rgba(0,0,0,0.15)]">
            <span className="text-xs md:text-[14px] text-black tracking-[-0.28px]">
              Last updated: November, 2023
            </span>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8 md:space-y-12">
            {/* Main Title */}
            <div>
              <h2 className="text-2xl md:text-[40px] font-normal text-black leading-normal tracking-[0.5px] mb-6">
                My Analytics School<br />
                Privacy Policy
              </h2>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px]">
                At My Analytics School, we are fully dedicated to safeguarding data and respecting your privacy. Recognizing the significance of data privacy for every individual, we want to ensure a transparent and secure experience for you when you visit our platforms, including the domain and subdomain of (myanalyticsschool.com). By using our platforms, you explicitly consent to our practices outlined in this Privacy Policy.
              </p>
            </div>

            {/* Collection of Personal Information */}
            <div>
              <h3 className="text-xl md:text-[40px] font-normal text-black leading-normal tracking-[0.5px] mb-6">
                Collection of Personal Information
              </h3>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px] mb-6">
                This Privacy Policy is an integral part of our overall Terms of Use. In our commitment to providing a secure, efficient, and tailored experience, we collect and store your personal information to enhance our services. This enables us to offer features that cater to your needs, ensuring a safer and more convenient website experience.
              </p>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px]">
                It's essential to understand that data collection serves specific necessary purposes. While you can explore our website anonymously, providing personal information makes you identifiable to us. We indicate mandatory and optional fields, giving you the freedom to choose what information to share. You always have the option to refrain from providing information by opting not to use specific services or features on the website.
              </p>
            </div>

            {/* Use of Personal Information */}
            <div>
              <h3 className="text-xl md:text-[40px] font-normal text-black leading-normal tracking-[0.5px] mb-6">
                Use of Personal Information
              </h3>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px] mb-6">
                In our pursuit of optimizing website performance and upholding trust and security, we utilize data collection devices, including 'cookies,' on designated pages. These compact files stored on your hard drive aid us in analyzing webpage flow, evaluating promotional effectiveness, and reinforcing trust and safety. 'Session cookies' are commonly employed, and automatically deleted from your hard drive once your session concludes.
              </p>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px] mb-6">
                While the option to decline our cookies is available, it's important to note that doing so may restrict access to specific features, potentially necessitating more frequent password re-entry during a session. Additionally, certain website pages may host 'cookies' or analogous devices placed by third parties, beyond our direct control.
              </p>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px] mb-6">
                In the course of a purchase on our website, we capture information about your buying behaviour. Engaging in transactions with us involves the collection of additional details, excluding billing or payment information. When you register for a free account, we gather personally identifiable information such as your email address, name, phone number, and more. Although select sections of our website are accessible without registration, certain activities, like placing an order, necessitate registration.
              </p>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px]">
                Your contact information may be utilized to send you offers tailored to your past orders and interests. Rest assured, we are committed to safeguarding your privacy and providing you with a seamless and secure online experience. We offer the option to opt out of such marketing communications.
              </p>
            </div>

            {/* Google Calendar API Integration */}
            <div>
              <h3 className="text-xl md:text-[40px] font-normal text-black leading-normal tracking-[0.5px] mb-6">
                Google Calendar API Integration
              </h3>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px] mb-4">
                To enable smooth integration with Google Calendar, you can grant My Analytics School access to your Google Calendar. Google Calendar will request the following permissions:
              </p>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px] mb-2 font-medium">Read Calendar Events</p>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px] mb-4">
                We will schedule calls only when you are available on your Calendar. This permission will not be utilized for any other purpose.
              </p>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px] mb-2 font-medium">Add Calendar Events</p>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px] mb-4">
                Whenever a booking is made, it will seamlessly be added to your Google Calendar. This feature ensures a hassle-free experience, automatically syncing bookings with your Google Calendar.
              </p>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px] mb-2 font-medium">Edit Calendar Events</p>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px] mb-4">
                To update your Google Calendar when the time of booking is changed. Any modifications in the booking schedule will be automatically reflected in your Google Calendar.
              </p>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px] mb-2 font-medium">Delete Calendar Events</p>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px]">
                To remove cancelled bookings from your Google Calendar. In the event of a booking cancellation, it will be promptly deleted from your Google Calendar.
                <br />
                Apart from the specified uses mentioned above, we will not employ Google Calendar APIs for any other purposes. For additional terms related to Google API, please refer to Google API Services User Data Policy.
              </p>
            </div>

            {/* Sharing Your Personal Information */}
            <div>
              <h3 className="text-xl md:text-[40px] font-normal text-black leading-normal tracking-[0.5px] mb-6">
                Sharing Your Personal Information
              </h3>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px] mb-6">
                In certain cases, we may be required to disclose personal information by law or in good faith belief that such disclosure is necessary to respond to legal processes, including subpoenas and court orders, or to protect the rights, property, or safety of our users and the public. In the event of a merger, acquisition, or business reorganization involving us or our assets, we may share or sell some or all of your personal information with the other business entity. The new entity will be required to adhere to this privacy policy concerning your personal information.
              </p>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px]">
                Please be aware that our website contains links to other websites that may collect personally identifiable information about you. We are not responsible for the privacy practices or content of these linked websites.
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8 md:space-y-12">
            {/* Image */}
            <div className="h-[300px] md:h-[427px] w-full rounded-xl overflow-hidden">
              <Image
                src="/mentor_image.svg"
                alt="Privacy Policy"
                width={737}
                height={427}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Additional Content */}
            <div>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px] mb-6">
                When exploring our platforms, we may automatically track certain information based on your behaviour on our website. This data helps us conduct internal research on our users, demographics, interests, and behaviour, aiding in better understanding, protecting, and serving our users. This information is analyzed in an aggregated, non-identifiable form, including details such as the URL you came from, the one you went to, your computer's browser information, IP address, time zone, and certain cookies installed on your device. We employ various technologies to collect Device Information, including 'Cookies' and 'Log files'.
              </p>
            </div>

            <div>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px] mb-6">
                Your personal information serves various purposes, including resolving disputes, troubleshooting issues, ensuring a safe service, collecting payments, assessing consumer interest in our offerings, informing you about online and offline offers, customizing your experience, detecting and preventing errors, fraud, and other unlawful activities, enforcing our terms and conditions, and fulfilling purposes disclosed at the time of data collection.
              </p>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px]">
                To enhance our product and service offerings, we collect and analyze demographic and profile data related to user activity on our website. We use your IP address to identify and resolve server problems and administer the website. Your IP address also aids in gathering broad demographic information. We may occasionally request that you participate in optional online surveys, which may require contact and demographic information. This data helps us personalize your website experience and provide content aligned with your preferences. We may share personal information with our corporate entities and affiliates to prevent identity theft, fraud, and other potentially illegal activities, correlate related or multiple accounts to prevent service abuse, and facilitate joint or co-branded services as requested. Such sharing will only occur if you explicitly opt-in for marketing purposes.
              </p>
            </div>

            {/* Data Retention */}
            <div>
              <h3 className="text-xl md:text-[40px] font-normal text-black leading-normal tracking-[0.5px] mb-6">
                Data Retention
              </h3>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px]">
                When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.
              </p>
            </div>

            {/* Changes */}
            <div>
              <h3 className="text-xl md:text-[40px] font-normal text-black leading-normal tracking-[0.5px] mb-6">
                Changes
              </h3>
              <p className="text-base md:text-[20px] text-black leading-6 tracking-[0.5px]">
                We may update this privacy policy from time to time to reflect changes to our practices or for other operational, legal, or regulatory reasons.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default PrivacyPolicy