/**
 * Utility functions for date and age calculations
 */

/**
 * Calculate age from birthdate
 * @param birthdate - ISO date string (YYYY-MM-DD)
 * @returns age in years
 */
export function calculateAge(birthdate: string | Date): number {
  const birth = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return Math.max(0, age); // Ensure no negative ages
}

/**
 * Format date for display
 * @param date - ISO date string or Date object
 * @param format - 'short' | 'long' | 'numeric'
 * @returns formatted date string
 */
export function formatDate(date: string | Date, format: 'short' | 'long' | 'numeric' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    numeric: { month: '2-digit', day: '2-digit', year: 'numeric' }
  };
  
  const options = optionsMap[format];
  
  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Convert date to input format (YYYY-MM-DD)
 * @param date - Date object or ISO string
 * @returns string in YYYY-MM-DD format
 */
export function toInputDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return dateObj.toISOString().split('T')[0];
}

/**
 * Get age display string with birthdate
 * @param birthdate - ISO date string
 * @returns string like "15 years old (born Mar 15, 2008)"
 */
export function getAgeDisplay(birthdate: string): string {
  const age = calculateAge(birthdate);
  const formattedDate = formatDate(birthdate, 'short');
  return `${age} years old (born ${formattedDate})`;
}

/**
 * Calculate years with team from start date
 * @param startDate - ISO date string (YYYY-MM-DD) when person joined team
 * @returns years with team as number
 */
export function calculateYearsWithTeam(startDate: string | Date): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const today = new Date();
  
  let years = today.getFullYear() - start.getFullYear();
  const monthDiff = today.getMonth() - start.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < start.getDate())) {
    years--;
  }
  
  return Math.max(0, years); // Ensure no negative years
}

/**
 * Get years with team display string
 * @param startDate - ISO date string when person joined team
 * @returns string like "3 years with team" or "1st year" for new members
 */
export function getYearsWithTeamDisplay(startDate: string): string {
  const years = calculateYearsWithTeam(startDate);
  
  if (years === 0) {
    return '1st year';
  } else if (years === 1) {
    return '2nd year';
  } else if (years === 2) {
    return '3rd year';
  } else {
    return `${years + 1}th year`;
  }
}

/**
 * Get tenure display for detailed view
 * @param startDate - ISO date string when person joined team
 * @returns string like "3 years with team (since Sep 2021)"
 */
export function getTenureDisplay(startDate: string): string {
  const years = calculateYearsWithTeam(startDate);
  const formattedDate = formatDate(startDate, 'short');
  
  if (years === 0) {
    return `1st year (since ${formattedDate})`;
  } else if (years === 1) {
    return `2 years with team (since ${formattedDate})`;
  } else {
    return `${years + 1} years with team (since ${formattedDate})`;
  }
}