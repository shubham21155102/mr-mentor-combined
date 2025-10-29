import Image from 'next/image'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse">
        <Image
          src="/mr-mentor-logo.svg"
          alt="Loading..."
          width={150}
          height={150}
          priority
        />
      </div>
    </div>
  )
}