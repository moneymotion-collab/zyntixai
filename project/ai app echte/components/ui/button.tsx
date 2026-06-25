export default function Button({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <button
      className="
      bg-primary
      hover:bg-lime-300
      text-black
      font-medium
      px-5
      py-3
      rounded-xl
      transition-all
      duration-300
      "
    >
      {children}
    </button>
  )
}