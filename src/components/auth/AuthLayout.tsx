import { FoxMark } from '@/components/Logo'

export function AuthLayout({
  title,
  children,
  footer,
}: {
  title: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="absolute inset-0 gradient-hero h-72" />
      <div className="absolute inset-0 top-72 bg-ink" />

      {/* decorative series chips */}
      <div className="pointer-events-none absolute top-4 right-4 hidden lg:flex flex-col gap-2 text-right">
        {['Dragon Ball', 'Re:Zero', 'Attack on Titan', 'One Piece'].map((s) => (
          <span
            key={s}
            className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="relative mx-auto max-w-md px-4 py-12">
        <div className="overflow-hidden rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between bg-white px-6 py-4">
            <h1 className="text-lg font-black text-ink">{title}</h1>
            <FoxMark />
          </div>
          <div className="card-dark !rounded-none !border-0 p-6">{children}</div>
          {footer && <div className="bg-ink-card px-6 py-4 text-center text-sm">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
