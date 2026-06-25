type AuthLoadingStateProps = {
  message?: string
}

export default function AuthLoadingState({
  message = "Loading…",
}: AuthLoadingStateProps) {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-[#050816] p-6 text-gray-400">
      <div className="text-center">
        <div
          className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"
          aria-hidden
        />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  )
}
