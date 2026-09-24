'use client'

import { useEffect, useState } from 'react'

const WHATSAPP_NUMBER = '61481515641' // Australia, no leading 0
const DEFAULT_MESSAGE =
  "Hi Roja, I'd love to know more about your coaching sessions."

interface WhatsAppButtonProps {
  message?: string
}

export default function WhatsAppButton({
  message = DEFAULT_MESSAGE,
}: WhatsAppButtonProps) {
  const [mounted, setMounted] = useState(false)

  // Small entrance delay so it doesn't fight with the hero animation on load.
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 900)
    return () => clearTimeout(timer)
  }, [])

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Roja on WhatsApp"
      className={`whatsapp-fab fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.45)] transition-all duration-300 ease-soft-out hover:scale-110 hover:bg-[#1ebe57] hover:shadow-[0_14px_40px_rgba(37,211,102,0.6)] active:scale-95 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16 ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
    >
      {/* Soft pulse ring */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366] opacity-70"
        style={{ animation: 'whatsapp-pulse 2.4s ease-out infinite' }}
      />

      {/* WhatsApp glyph — inline SVG so no extra dependency */}
      <svg
        viewBox="0 0 32 32"
        className="relative z-10 h-7 w-7 sm:h-8 sm:w-8"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.192-.516 2.35-1.375.03-.14.03-.28.03-.43 0-.516-.13-.618-.462-.79-.397-.213-1.762-.883-1.99-.883zM16.05 4C9.943 4 5.005 8.968 5.005 15.09c0 2.104.593 4.146 1.703 5.91L5 27.005l6.164-1.665a11.006 11.006 0 0 0 4.886 1.152h.004c6.107 0 11.088-4.968 11.088-11.09 0-2.973-1.187-5.755-3.28-7.848a10.98 10.98 0 0 0-7.812-3.24zm0 20.15h-.005a9.184 9.184 0 0 1-4.667-1.278l-.335-.2-3.443.9.92-3.383-.22-.35a9.032 9.032 0 0 1-1.416-4.882c0-5.017 4.072-9.09 9.174-9.09 2.454 0 4.72.95 6.428 2.66a9.06 9.06 0 0 1 2.66 6.43c0 5.02-4.072 9.093-9.096 9.093z" />
      </svg>

      {/* Tooltip label — hidden on very small screens */}
      <span className="pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-deep-blue px-4 py-2 text-[13px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 sm:block">
        Chat on WhatsApp
      </span>

      <style jsx>{`
        @keyframes whatsapp-pulse {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          70% {
            transform: scale(1.6);
            opacity: 0;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .whatsapp-fab {
            transition: none !important;
          }
          .whatsapp-fab span[aria-hidden] {
            animation: none !important;
          }
        }
      `}</style>
    </a>
  )
}
