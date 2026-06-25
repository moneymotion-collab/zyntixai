import type {
  GenerateSubtitlesOptions,
  SubtitlePhrase,
  SubtitleTrack,
  SubtitleWord,
} from "@/lib/subtitles/types"

const DEFAULT_WPM = 150
const DEFAULT_MAX_WORDS_PER_PHRASE = 4
const DEFAULT_BOOKEND_SECONDS = 4

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function tokenizeVoiceover(voiceover: string): string[] {
  return voiceover
    .trim()
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)
}

function wordWeight(word: string): number {
  const letters = word.replace(/[^a-zA-Z0-9]/g, "").length
  return Math.max(1, letters)
}

function resolveTotalDuration(
  voiceover: string,
  wordCount: number,
  options: GenerateSubtitlesOptions,
): number {
  if (
    typeof options.durationSeconds === "number" &&
    Number.isFinite(options.durationSeconds) &&
    options.durationSeconds > 0
  ) {
    return options.durationSeconds
  }

  const wpm = options.wordsPerMinute ?? DEFAULT_WPM
  const speechEstimate = (wordCount / wpm) * 60

  if (options.sceneDurations?.length) {
    const sceneTotal = options.sceneDurations.reduce(
      (sum, duration) => sum + (Number.isFinite(duration) ? duration : 0),
      0,
    )
    const bookends = options.bookendSeconds ?? DEFAULT_BOOKEND_SECONDS
    const videoEstimate = sceneTotal + bookends
    return Math.max(speechEstimate, videoEstimate)
  }

  return speechEstimate
}

function assignWordTimings(
  tokens: string[],
  totalDuration: number,
): SubtitleWord[] {
  if (tokens.length === 0) return []

  const weights = tokens.map(wordWeight)
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  let cursor = 0

  return tokens.map((text, index) => {
    const slice = (weights[index] / totalWeight) * totalDuration
    const start = cursor
    const end = index === tokens.length - 1 ? totalDuration : cursor + slice
    cursor = end

    return { text, start, end }
  })
}

function buildPhrase(words: SubtitleWord[]): SubtitlePhrase {
  return {
    text: words.map((word) => word.text).join(" "),
    words,
    start: words[0]?.start ?? 0,
    end: words[words.length - 1]?.end ?? 0,
  }
}

function groupIntoPhrases(
  words: SubtitleWord[],
  maxWordsPerPhrase: number,
): SubtitlePhrase[] {
  const phrases: SubtitlePhrase[] = []
  let chunk: SubtitleWord[] = []

  for (const word of words) {
    chunk.push(word)

    const endsSentence = /[.!?]$/.test(word.text)
    const atMax = chunk.length >= maxWordsPerPhrase

    if (atMax || endsSentence) {
      phrases.push(buildPhrase(chunk))
      chunk = []
    }
  }

  if (chunk.length > 0) {
    phrases.push(buildPhrase(chunk))
  }

  return phrases
}

export function generateSubtitlesFromVoiceover(
  voiceover: string,
  options: GenerateSubtitlesOptions = {},
): SubtitleTrack {
  const trimmed = voiceover.trim()
  const tokens = tokenizeVoiceover(trimmed)
  const wordCount = countWords(trimmed)
  const totalDuration = resolveTotalDuration(trimmed, wordCount, options)
  const words = assignWordTimings(tokens, totalDuration)
  const maxWordsPerPhrase =
    options.maxWordsPerPhrase ?? DEFAULT_MAX_WORDS_PER_PHRASE
  const phrases = groupIntoPhrases(words, maxWordsPerPhrase)
  const wordsPerMinute =
    totalDuration > 0 ? (wordCount / totalDuration) * 60 : DEFAULT_WPM

  return {
    phrases,
    totalDuration,
    wordsPerMinute: Math.round(wordsPerMinute),
  }
}

export function getActivePhrase(
  track: SubtitleTrack,
  currentTimeSeconds: number,
): SubtitlePhrase | null {
  return (
    track.phrases.find(
      (phrase) =>
        currentTimeSeconds >= phrase.start && currentTimeSeconds < phrase.end,
    ) ?? null
  )
}

export function getActiveWord(
  phrase: SubtitlePhrase,
  currentTimeSeconds: number,
): SubtitleWord | null {
  return (
    phrase.words.find(
      (word) =>
        currentTimeSeconds >= word.start && currentTimeSeconds < word.end,
    ) ?? phrase.words[phrase.words.length - 1] ?? null
  )
}
