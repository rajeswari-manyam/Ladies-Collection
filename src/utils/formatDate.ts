export function formatDate(value: string | Date, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...opts,
  }).format(typeof value === 'string' ? new Date(value) : value)
}

export function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(typeof value === 'string' ? new Date(value) : value)
}

export function timeAgo(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const units: [number, string][] = [
    [60, 'second'],
    [3600, 'minute'],
    [86400, 'hour'],
    [2592000, 'day'],
    [31536000, 'month'],
  ]
  let unit = units[0]
  for (const next of units) {
    if (seconds < next[0] * 60) break
    unit = next
  }
  const count = Math.floor(seconds / unit[0])
  return `${count} ${unit[1]}${count === 1 ? '' : 's'} ago`
}