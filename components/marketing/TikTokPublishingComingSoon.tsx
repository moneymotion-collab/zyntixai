type TikTokPublishingComingSoonProps = {
  className?: string
}

export default function TikTokPublishingComingSoon({
  className = "",
}: TikTokPublishingComingSoonProps) {
  return (
    <p
      className={`inline-flex items-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-900 ${className}`.trim()}
    >
      TikTok publishing coming soon
    </p>
  )
}
