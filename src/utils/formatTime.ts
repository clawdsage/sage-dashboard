/**
 * Format a date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`
  if (diffWeek < 4) return `${diffWeek} week${diffWeek === 1 ? '' : 's'} ago`
  if (diffMonth < 12) return `${diffMonth} month${diffMonth === 1 ? '' : 's'} ago`
  return `${diffYear} year${diffYear === 1 ? '' : 's'} ago`
}

/**
 * Format a date to a readable string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Get start of day for date filtering
 */
export const getStartOfDay = (date: Date = new Date()): Date => {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start
}

/**
 * Get start of week for date filtering
 */
export const getStartOfWeek = (date: Date = new Date()): Date => {
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  return start
}

/**
 * Get start of month for date filtering
 */
export const getStartOfMonth = (date: Date = new Date()): Date => {
  const start = new Date(date)
  start.setDate(1)
  start.setHours(0, 0, 0, 0)
  return start
}