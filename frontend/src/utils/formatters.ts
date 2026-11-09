/**
 * Formats a number into Indian Rupee currency format (e.g., ₹1,25,000.00)
 */
export const formatCurrency = (amount: number | undefined | null, currency: string = 'INR'): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0.00';
  }

  const prefix = currency === 'INR' ? '₹' : `${currency} `;

  const parts = Math.abs(amount).toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Indian currency numbering formatting: last 3 digits, then every 2 digits
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  const sign = amount < 0 ? '-' : '';
  return `${sign}${prefix}${formattedInteger}.${decimalPart}`;
};

/**
 * Compact currency for charts or badges (e.g. ₹1.2L or ₹50k)
 */
export const formatCompactCurrency = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return `₹${amount.toFixed(0)}`;
};

/**
 * Formats date into readable string e.g. "04 Nov 2025"
 */
export const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

/**
 * Format relative date or input date (YYYY-MM-DD)
 */
export const formatInputDate = (dateString?: string | Date): string => {
  const date = dateString ? new Date(dateString) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a percentage
 */
export const formatPercentage = (percent: number): string => {
  return `${Math.round(percent)}%`;
};

