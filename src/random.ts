export function randomString (max = 20, min = 20): string {
  const length = min + (((max - min) * Math.random()) | 0)
  return [...Array(length)].map(() => Math.random().toString(36)[2]).join('')
}

export function sleep (ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
