import { ActivityLevel, FitnessGoal, Gender } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(fullName: string) {
  if (!fullName) return "";

  return fullName
    .trim()
    .split(/\s+/) // split by any whitespace
    .map((word) => word[0].toUpperCase())
    .join("");
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
  gender?: Gender | null,
  activityLevel?: ActivityLevel | null
) {
  let bmr;
  if (gender === "MALE") {
    bmr = 10 * weight + 6.25 * heightCm - 5 * age + 5;
  } else if (gender === "FEMALE") {
    bmr = 10 * weight + 6.25 * heightCm - 5 * age - 161;
  } else {
    return null;
  }

  const activityFactors: Partial<Record<ActivityLevel, number>> = {
    NOT_VERY_ACTIVE: 1.2,
    LIGHTLY_ACTIVE: 1.375,
    ACTIVE: 1.55,
    VERY_ACTIVE: 1.725,
  };

  const factor = activityLevel ? activityFactors[activityLevel] : undefined;
  if (!factor) return null;

  const dailyCalories = bmr * factor;
  return Math.round(dailyCalories);
}

const MIN_GOAL_CALORIES = 1000;
const MAX_GOAL_CALORIES = 6000;

export function calculateGoalCalorieTarget(
  tdee: number | null | undefined,
  fitnessGoal?: FitnessGoal | null
) {
  if (!tdee || !fitnessGoal) return null;

  let adjustment = 0;
  switch (fitnessGoal) {
    case "LOSE_WEIGHT":
      adjustment = -500;
      break;
    case "GAIN_WEIGHT":
      adjustment = 300;
      break;
    default:
      adjustment = 0;
  }

  const raw = tdee + adjustment;
  const clamped = Math.min(MAX_GOAL_CALORIES, Math.max(MIN_GOAL_CALORIES, raw));

  return Math.round(clamped);
}

export function getCurrentDateTimeLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
