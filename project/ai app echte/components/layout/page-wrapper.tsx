export default function PageWrapper({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="p-8 text-white">

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {title}
        </h1>

        <p className="text-zinc-400 mt-2">
          {description}
        </p>
      </div>

      {children}

    </div>
  )
}