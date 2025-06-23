import { useTimezoneStore } from '@/stores/timezone-store'

/**
 * Formats a date/time string to the user's selected timezone
 * @param dateInput - Date string, Date object, or timestamp
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string in user's timezone
 */
export const formatDateInTimezone = (
  dateInput: string | Date | number,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const date = new Date(dateInput)
  const timezone = useTimezoneStore.getState().timezone
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  }
  
  return new Intl.DateTimeFormat('en-US', {
    ...defaultOptions,
    timeZone: timezone
  }).format(date)
}

/**
 * Formats a time string to the user's selected timezone (time only)
 * @param dateInput - Date string, Date object, or timestamp
 * @returns Formatted time string in user's timezone
 */
export const formatTimeInTimezone = (dateInput: string | Date | number): string => {
  return formatDateInTimezone(dateInput, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formats a date to the user's selected timezone (date only)
 * @param dateInput - Date string, Date object, or timestamp
 * @returns Formatted date string in user's timezone
 */
export const formatDateOnlyInTimezone = (dateInput: string | Date | number): string => {
  return formatDateInTimezone(dateInput, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Formats a datetime range in the user's timezone
 * @param startDate - Start date/time
 * @param endDate - End date/time
 * @returns Formatted date range string
 */
export const formatDateRangeInTimezone = (
  startDate: string | Date | number,
  endDate: string | Date | number
): string => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const timezone = useTimezoneStore.getState().timezone
  
  // If same day, show: "Dec 25, 2024 • 10:00 AM - 11:00 AM PST"
  if (start.toDateString() === end.toDateString()) {
    const dateStr = formatDateOnlyInTimezone(start)
    const startTime = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone
    }).format(start)
    const endTime = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone
    }).format(end)
    
    return `${dateStr} • ${startTime} - ${endTime}`
  }
  
  // Different days: "Dec 25, 2024 10:00 AM - Dec 26, 2024 11:00 AM PST"
  const startStr = formatDateInTimezone(start, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  const endStr = formatDateInTimezone(end, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  
  return `${startStr} - ${endStr}`
}

/**
 * Gets the current user's timezone
 * @returns Current timezone string
 */
export const getCurrentTimezone = (): string => {
  return useTimezoneStore.getState().timezone
}

/**
 * Hook to use timezone formatting functions with reactive updates
 */
export const useTimezoneFormatter = () => {
  const timezone = useTimezoneStore(state => state.timezone)
  
  return {
    timezone,
    formatDate: formatDateInTimezone,
    formatTime: formatTimeInTimezone,
    formatDateOnly: formatDateOnlyInTimezone,
    formatDateRange: formatDateRangeInTimezone
  }
}
