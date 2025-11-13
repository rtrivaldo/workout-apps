import { DailyLog } from "@prisma/client";

export type CalorieStatus = "DEFICIT" | "SURPLUS" | "ON_TARGET" | "NO_TARGET";

export function resolveCalorieTarget(log: DailyLog) {
  return (
    log.manualCalorieTarget ??
    log.goalCalorieTarget ??
    log.dailyNeedCalories ??
    null
  );
}

export function determineCalorieStatus(log: DailyLog): CalorieStatus {
  const target = resolveCalorieTarget(log);
  if (!target) return "NO_TARGET";

  const delta = log.netCalories - target;
  if (Math.abs(delta) < 1) return "ON_TARGET";
  return delta > 0 ? "SURPLUS" : "DEFICIT";
}

export function getStatusLabel(status: CalorieStatus) {
  switch (status) {
    case "DEFICIT":
      return "Deficit";
    case "SURPLUS":
      return "Surplus";
    case "ON_TARGET":
      return "On Target";
    default:
      return "No Target";
  }
}

export function getStatusTone(status: CalorieStatus) {
  switch (status) {
    case "DEFICIT":
      return "text-green-700 bg-green-100";
    case "SURPLUS":
      return "text-red-700 bg-red-100";
    case "ON_TARGET":
      return "text-amber-700 bg-amber-100";
    default:
      return "text-neutral-600 bg-neutral-200";
  }
}
