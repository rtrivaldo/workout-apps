import { ActivityLevel, Gender } from '@prisma/client';
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

export function calculateDailyCalories(
  weight: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel
) {
  let bmr;
  if (gender === 'MALE') {
    bmr = 10 * weight + 6.25 * heightCm - 5 * age + 5;
  } else if (gender === 'FEMALE') {
    bmr = 10 * weight + 6.25 * heightCm - 5 * age - 161;
  } else {
    return 'Invalid gender';
  }

  const activityFactors = {
    NOT_VERY_ACTIVE: 1.2,
    LIGHTLY_ACTIVE: 1.375,
    ACTIVE: 1.55,
    VERY_ACTIVE: 1.725,
  };

  const factor = activityFactors[activityLevel];
  if (!factor) return 'Invalid activity level';

  const dailyCalories = bmr * factor;
  return Math.round(dailyCalories);
}

export function getCurrentDateTimeLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
