import { useEffect, useRef, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react'
import type { GalleryImage } from '../../../data/destinationDetails'
import { TravelImage } from '../../common/TravelImage'

export function DestinationGallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState<number | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const isOpen = active !== null
  useEffect(() => {
    if (!isOpen) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null)
      if (event.key === 'ArrowRight') setActive((current) => current === null ? null : (current + 1) % images.length)
      if (event.key === 'ArrowLeft') setActive((current) => current === null ? null : (current - 1 + images.length) % images.length)
      if (event.key === 'Tab' && dialogRef.current) {
        const controls = Array.from(dialogRef.current.querySelectorAll<HTMLButtonElement>('button:not([disabled])'))
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = previousOverflow; previousFocus?.focus() }
  }, [isOpen, images.length])
  return <>
    <div className="grid auto-rows-[130px] grid-cols-2 gap-3 sm:auto-rows-[180px] sm:grid-cols-4"><button type="button" onClick={()=>setActive(0)} aria-label={`View image: ${images[0].alt}`} className="group relative row-span-2 overflow-hidden rounded-2xl text-left focus-visible:outline-offset-4 sm:col-span-2 sm:row-span-2"><TravelImage src={images[0].src} alt={images[0].alt} className="absolute inset-0 size-full" imageClassName="transition-transform duration-500 group-hover:scale-105" /><span className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" /><span className="absolute bottom-4 left-4 inline-flex items-center gap-2 text-xs font-medium text-white"><Images size={15}/>View gallery</span></button>{images.slice(1,5).map((item,index)=><button key={`${item.src}-${index}`} type="button" onClick={()=>setActive(index+1)} aria-label={`View image: ${item.alt}`} className="group relative overflow-hidden rounded-2xl focus-visible:outline-offset-4"><TravelImage src={item.src} alt={item.alt} className="absolute inset-0 size-full" imageClassName="transition-transform duration-500 group-hover:scale-105"/><span className="absolute inset-0 bg-black/10 transition group-hover:bg-transparent"/></button>)}</div>
    {active !== null && <div ref={dialogRef} className="fixed inset-0 z-[80] flex items-center justify-center bg-[#030712]/95 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Destination photo viewer" onMouseDown={(event)=>{if(event.target===event.currentTarget)setActive(null)}}><button ref={closeRef} type="button" onClick={()=>setActive(null)} aria-label="Close image viewer" className="absolute right-4 top-4 grid size-11 place-items-center rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/20"><X size={20}/></button><button type="button" onClick={()=>setActive((active-1+images.length)%images.length)} aria-label="Previous image" className="absolute left-3 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-8"><ChevronLeft/></button><figure className="w-full max-w-5xl"><TravelImage src={images[active].src} alt={images[active].alt} className="mx-auto h-[65vh] max-h-[760px] w-full rounded-xl sm:h-[75vh]" loading="eager"/><figcaption className="mt-3 text-center text-sm text-slate-300">{images[active].alt} · {active+1} of {images.length}</figcaption></figure><button type="button" onClick={()=>setActive((active+1)%images.length)} aria-label="Next image" className="absolute right-3 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-8"><ChevronRight/></button></div>}
  </>
}
