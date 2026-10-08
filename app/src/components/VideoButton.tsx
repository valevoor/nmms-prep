import { useEffect, useRef, useState } from 'react'
import { useT } from '../lib/i18n'

/**
 * A ▶ button, labelled with the video's title, that opens a YouTube video in a large dialog. The player is only added while the dialog
 * is open, so nothing is loaded from the network until the button is tapped, and closing it stops the video.
 * Offline, the dialog says the video needs the internet instead of showing a broken frame.
 */
export function VideoButton({ youtube, title, tall }: { youtube: string; title: string; tall?: boolean }) {
  const t = useT()
  const dialog = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  const show = () => {
    setOnline(navigator.onLine)
    setOpen(true)
    dialog.current?.showModal()
  }

  const hide = () => {
    setOpen(false)
    dialog.current?.close()
  }

  return (
    <>
      <button className="btn" onClick={show}>
        ▶ {title}
      </button>
      <dialog
        ref={dialog}
        className={`video-dialog${tall ? ' tall' : ''}`}
        aria-label={title}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === dialog.current && hide()}
      >
        <div className="video-head">
          <span className="video-title">{title}</span>
          <button className="btn" onClick={hide} autoFocus>
            {t.learn.closeVideo}
          </button>
        </div>
        <div className="video-frame">
          {open &&
            (online ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtube}?rel=0&autoplay=1`}
                title={title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <p className="video-offline">{t.learn.videoOffline}</p>
            ))}
        </div>
      </dialog>
    </>
  )
}
