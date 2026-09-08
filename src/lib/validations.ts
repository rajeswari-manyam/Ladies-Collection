export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function isValidMobile(value: string) {
  return /^\d{10}$/.test(value.trim().replace(/\s/g, ''))
}

export function isValidPassword(value: string, min = 6) {
  return value.length >= min
}