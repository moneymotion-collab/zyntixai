export default function Card({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`
        bg-card
        border border-zinc-800
        rounded-2xl
        p-8
        ${className}
      `}
    >
      {children}
    </div>
  )
}