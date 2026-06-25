export type SubtitleWord = {
  text: string
  /** Start time in seconds */
  start: number
  /** End time in seconds */
  end: number
}

export type SubtitlePhrase = {
  text: string
  words: SubtitleWord[]
  start: number
  end: number
}

export type SubtitleTrack = {
  phrases: SubtitlePhrase[]
  totalDuration: number
  wordsPerMinute: number
}

export type GenerateSubtitlesOptions = {
  /** Total spoken duration in seconds */
  durationSeconds?: number
  /** Used when duration is not provided (default 150) */
  wordsPerMinute?: number
  /** Max words shown per caption phrase — TikTok/Reels style (default 4) */
  maxWordsPerPhrase?: number
  /** Scene durations used to estimate total video length */
  sceneDurations?: number[]
  /** Extra seconds for hook + CTA bookends when using scene durations */
  bookendSeconds?: number
}
