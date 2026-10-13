import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

const scenes = [
  {
    src: 'https://videos.pexels.com/video-files/35747368/15152875_1920_1080_30fps.mp4',
    poster: 'https://images.pexels.com/videos/35747368/pexels-photo-35747368.jpeg?auto=compress&dpr=1&h=1200&w=2000',
    alt: 'Ancient Bekal Fort in Kerala',
  },
  {
    src: 'https://videos.pexels.com/video-files/5659509/5659509-hd_1920_1080_30fps.mp4',
    poster: 'https://images.pexels.com/videos/5659509/pexels-photo-5659509.jpeg?auto=compress&dpr=1&h=1200&w=2000',
    alt: 'Ocean waves rolling onto a beach',
  },
  {
    src: 'https://videos.pexels.com/video-files/35850446/15202819_1920_1080_30fps.mp4',
    poster: 'https://images.pexels.com/videos/35850446/pexels-photo-35850446.jpeg?auto=compress&dpr=1&h=1200&w=2000',
    alt: 'Himalayan mountain peak at sunset',
  },
]

/** Muted, looping travel footage with a local, reduced-motion-safe fallback. */
export function CinematicBackdrop() {
  const reducedMotion = useReducedMotion()
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([null, null])
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0)
  const [sceneIndexes, setSceneIndexes] = useState<[number, number]>([0, 1])

  useEffect(() => {
    if (reducedMotion) return
    videoRefs.current[0]?.play().catch(() => undefined)
  }, [reducedMotion])

  const advanceScene = useCallback(() => {
    const nextSlot = (1 - activeSlot) as 0 | 1
    const nextIndex = sceneIndexes[nextSlot]
    const nextVideo = videoRefs.current[nextSlot]
    if (!nextVideo) return
    nextVideo.currentTime = 0
    nextVideo.play().then(() => {
      setActiveSlot(nextSlot)
      // Keep the ended frame in place until the new clip is fully visible.
      window.setTimeout(() => {
        setSceneIndexes((current) => {
          const updated: [number, number] = [...current]
          updated[activeSlot] = (nextIndex + 1) % scenes.length
          return updated
        })
      }, 1000)
    }).catch(() => undefined)
  }, [activeSlot, sceneIndexes])

  return <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-[#07101c]">
    <img src={scenes[0].poster} alt="" className="absolute inset-0 size-full object-cover" />
    {!reducedMotion && ([0, 1] as const).map((slot) => {
      const item = scenes[sceneIndexes[slot]]
      const active = slot === activeSlot
      return <video key={slot} ref={(element) => { videoRefs.current[slot] = element }} src={item.src} aria-label={item.alt} className={`absolute inset-0 size-full object-cover object-center brightness-[1.32] contrast-[1.04] saturate-[1.16] transition-opacity duration-1000 ease-in-out ${active ? 'opacity-100' : 'opacity-0'}`} autoPlay={active} muted playsInline preload="auto" poster={item.poster} onEnded={active ? advanceScene : undefined} />
    })}
    <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/55 via-[#030712]/20 to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/45 via-transparent to-[#030712]/5" />
  </div>
}
