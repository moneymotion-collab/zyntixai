import type { PostPerformanceMetrics } from "@/lib/marketing/analytics/update-post-performance"

function deriveSeed(postId: string): number {
  let seed = 0
  for (let i = 0; i < postId.length; i++) {
    seed = (seed * 31 + postId.charCodeAt(i)) >>> 0
  }
  return seed
}

function nextSeed(seed: number): number {
  return (seed * 1664525 + 1013904223) >>> 0
}

function randomInRange(seed: number, min: number, max: number): [number, number] {
  const next = nextSeed(seed)
  return [min + (next % (max - min + 1)), next]
}

export function mockMetricsForPost(postId: string): PostPerformanceMetrics {
  let seed = deriveSeed(postId)

  let value: number
  ;[value, seed] = randomInRange(seed, 300, 15000)
  const views = value

  ;[value, seed] = randomInRange(seed, 10, 900)
  const likes = value

  ;[value, seed] = randomInRange(seed, 0, 120)
  const comments = value

  ;[value, seed] = randomInRange(seed, 0, 150)
  const shares = value

  ;[value] = randomInRange(seed, 0, 300)
  const saves = value

  return { views, likes, comments, shares, saves }
}
