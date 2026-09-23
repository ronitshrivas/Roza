import { LeafMark } from './Navbar'

export default function Footer() {
  return (
    <footer className="bg-deep-blue text-white">
      <div className="mx-auto max-w-site px-5 py-16 lg:px-10">
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="flex items-center gap-2 text-lg font-semibold">
            <LeafMark className="h-5 w-5 text-fresh-green" />
            Grow With <span className="font-display italic text-fresh-green">Roja</span>
          </span>
          <p className="max-w-md text-sm leading-relaxed text-white/70">
            Life &amp; mindset coaching for thoughtful people — NLP, EFT, Ho'oponopono and deep belief work, online via Zoom.
          </p>
          <p className="text-sm text-white/60">@GrowWithRoja</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-site px-5 py-5 text-center text-xs text-white/50 lg:px-10">
          © {new Date().getFullYear()} Grow With Roja · Crafted by BatoBuzz Technologies
        </p>
      </div>
    </footer>
  )
}
