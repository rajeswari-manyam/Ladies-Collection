export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function pick<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => (item && typeof item === 'object' ? structuredClone(item) : item)) as T
  }
  if (value && typeof value === 'object') {
    return structuredClone(value) as T
  }
  return value
}

export function pickOrdered<T extends { createdAt: string }>(value: T[]) {
  return pick(value).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}