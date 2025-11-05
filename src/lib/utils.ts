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

export function calculateBMI(weight: number, height: number) {
  if (height <= 0) return 0;

  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  return bmi.toFixed(2);
}
