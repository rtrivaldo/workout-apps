import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(fullName: string) {
  if (!fullName) return '';

  return fullName
    .trim()
    .split(/\s+/) // split by any whitespace
    .map(word => word[0].toUpperCase())
    .join('');
}
