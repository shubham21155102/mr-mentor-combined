import Image from "next/image"
import React,{ useEffect, useRef, useState } from "react"
const FALLBACK_IMAGE = '/mentor_image.svg'
function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className,
}: {
  src?: string
  alt?: string
  width: number
  height: number
  className?: string
}) {
  const [currentSrc, setCurrentSrc] = useState<string>(src || FALLBACK_IMAGE)
  const attemptsRef = useRef<number>(0)
  const retryTimeoutRef = useRef<number | null>(null)
  const MAX_RETRIES = 3
  const RETRY_DELAY = 2000 // ms

  useEffect(() => {
    // reset attempts when src changes
    attemptsRef.current = 0
    setCurrentSrc(src || FALLBACK_IMAGE)

    // try to proactively load the provided src (use an offscreen Image)
    if (src) {
      tryLoad(src)
    }

    return () => {
      // cleanup any pending retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  function tryLoad(url?: string) {
    if (!url) return
    // avoid running in non-browser env
    if (typeof window === 'undefined') return

    const img = new window.Image()
    img.onload = () => {
      attemptsRef.current = 0
      setCurrentSrc(url)
    }
    img.onerror = () => {
      attemptsRef.current += 1
      if (attemptsRef.current <= MAX_RETRIES) {
        // exponential backoff-ish retry
        const delay = RETRY_DELAY * attemptsRef.current
        retryTimeoutRef.current = window.setTimeout(() => tryLoad(url), delay)
      } else {
        // give up and use fallback
        setCurrentSrc(FALLBACK_IMAGE)
      }
    }
    // start loading (bust cache slightly on retries)
    img.src = url
  }

  return (
    <Image
      src={currentSrc}
      alt={alt || 'mentor'}
      width={width}
      height={height}
      className={className}
      onError={() => {
        // immediately show fallback and start retry attempts for original src
        setCurrentSrc(FALLBACK_IMAGE)
        if (src) tryLoad(src)
      }}
    />
  )
}



export default ImageWithFallback