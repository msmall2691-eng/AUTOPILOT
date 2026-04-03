import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

/**
 * Merge Tailwind CSS classes with conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Format a numeric amount as USD currency.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Format a date as a human-readable string (e.g. "Jan 15, 2026").
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM d, yyyy')
}

/**
 * Format a phone number string into (XXX) XXX-XXXX.
 * Strips all non-digit characters, handles 10- and 11-digit (1-prefixed) numbers.
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')

  // Handle 11-digit numbers starting with country code 1
  const normalized = digits.length === 11 && digits.startsWith('1')
    ? digits.slice(1)
    : digits

  if (normalized.length !== 10) {
    return phone // Return original if we can't format it
  }

  return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`
}

/**
 * Generate a unique tracking number for jobs/work orders.
 * Format: WO-YYYYMMDD-XXXXX (random 5-char alphanumeric suffix).
 */
export function generateTrackingNumber(): string {
  const now = new Date()
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No ambiguous chars (0/O, 1/I)
  let suffix = ''
  for (let i = 0; i < 5; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return `WO-${datePart}-${suffix}`
}

/**
 * Get initials from a first and last name.
 */
export function getInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0).toUpperCase()
  const last = lastName.trim().charAt(0).toUpperCase()
  return `${first}${last}`
}

/**
 * Return Tailwind color classes for a given job or invoice status.
 */
export function getStatusColor(status: string): string {
  const normalized = status.toLowerCase().replace(/[_\s]/g, '-')

  const statusColors: Record<string, string> = {
    // Job statuses
    'pending':      'bg-yellow-100 text-yellow-800',
    'scheduled':    'bg-blue-100 text-blue-800',
    'in-progress':  'bg-indigo-100 text-indigo-800',
    'on-hold':      'bg-orange-100 text-orange-800',
    'completed':    'bg-green-100 text-green-800',
    'cancelled':    'bg-red-100 text-red-800',

    // Invoice statuses
    'draft':        'bg-gray-100 text-gray-800',
    'sent':         'bg-blue-100 text-blue-800',
    'paid':         'bg-green-100 text-green-800',
    'overdue':      'bg-red-100 text-red-800',
    'partial':      'bg-amber-100 text-amber-800',
    'void':         'bg-gray-100 text-gray-500',

    // Lead / customer statuses
    'new':          'bg-purple-100 text-purple-800',
    'active':       'bg-green-100 text-green-800',
    'inactive':     'bg-gray-100 text-gray-600',
    'converted':    'bg-teal-100 text-teal-800',

    // Estimate statuses
    'approved':     'bg-green-100 text-green-800',
    'declined':     'bg-red-100 text-red-800',
    'expired':      'bg-gray-100 text-gray-500',
  }

  return statusColors[normalized] || 'bg-gray-100 text-gray-800'
}

/**
 * Calculate tax amount from a subtotal and tax rate (as a percentage, e.g. 8.25).
 * Returns the tax amount rounded to 2 decimal places.
 */
export function calculateTax(subtotal: number, rate: number): number {
  return Math.round(subtotal * (rate / 100) * 100) / 100
}
