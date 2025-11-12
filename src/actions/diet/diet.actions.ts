"use server";

import { getSession } from "@/lib/auth";
import {
  addFoodSchema,
  addMealSchema,
  updateFoodSchema,
  deleteFoodSchema,
  dailyCheckInSchema,
} from "@/lib/schemas/diet";
import { revalidatePath } from "next/cache";
import z from "zod";
import DietService from "./DietService";
import FoodService from "./FoodService";
import ProgressService from "./ProgressService";
import { MealType } from "@prisma/client";

const dietService = new DietService();
const foodService = new FoodService();
const progressService = new ProgressService();

async function getUserId() {
  const session = await getSession();

  if (!session?.id) {
    throw new Error("Unauthorized");
  }

  return Number(session.id);
}

export async function addMealAction(input: z.infer<typeof addMealSchema>) {
  try {
    const userId = await getUserId();
    const parsed = addMealSchema.parse(input);

    await dietService.addMeal(userId, {
      type: parsed.mealType as MealType,
      items: parsed.items,
      date: parsed.date,
    });

    revalidatePath("/diet-plan");
    revalidatePath("/diet-plan/insights");
    return { success: true, status: 200, message: "Meal logged successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        status: 400,
        message: "Invalid meal input",
        errors: error.flatten().fieldErrors,
      };
    }
    console.error("[addMealAction]", error);
    return { success: false, status: 500, message: "Failed to log meal" };
  }
}

export async function addFoodAction(input: z.infer<typeof addFoodSchema>) {
  try {
    const userId = await getUserId();
    const parsed = addFoodSchema.parse(input);

    await foodService.addCustomFood(userId, parsed);
    revalidatePath("/diet-plan");
    revalidatePath("/diet-plan/foods");
    revalidatePath("/diet-plan/insights");

    return { success: true, status: 201, message: "Food added successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        status: 400,
        message: "Invalid food input",
        errors: error.flatten().fieldErrors,
      };
    }

    console.error("[addFoodAction]", error);
    return { success: false, status: 500, message: "Failed to add food" };
  }
}

export async function updateFoodAction(
  input: z.infer<typeof updateFoodSchema>
) {
  try {
    const userId = await getUserId();
    const parsed = updateFoodSchema.parse(input);

    await foodService.updateFood(userId, parsed.id, parsed);
    revalidatePath("/diet-plan");
    revalidatePath("/diet-plan/foods");
    revalidatePath("/diet-plan/insights");

    return { success: true, status: 200, message: "Food updated successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        status: 400,
        message: "Invalid food input",
        errors: error.flatten().fieldErrors,
      };
    }

    console.error("[updateFoodAction]", error);
    return { success: false, status: 500, message: "Failed to update food" };
  }
}

export async function deleteFoodAction(
  input: z.infer<typeof deleteFoodSchema>
) {
  try {
    const userId = await getUserId();
    const parsed = deleteFoodSchema.parse(input);

    await foodService.deleteFood(userId, parsed.id);
    revalidatePath("/diet-plan");
    revalidatePath("/diet-plan/foods");
    revalidatePath("/diet-plan/insights");

    return { success: true, status: 200, message: "Food deleted successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        status: 400,
        message: "Invalid food id",
        errors: error.flatten().fieldErrors,
      };
    }

    console.error("[deleteFoodAction]", error);
    return { success: false, status: 500, message: "Failed to delete food" };
  }
}

export async function dailyCheckInAction(
  input: z.infer<typeof dailyCheckInSchema>
) {
  try {
    const userId = await getUserId();
    const parsed = dailyCheckInSchema.parse(input);

    const goalPayload: {
      targetWeight?: number | null;
      manualCalorieTarget?: number | null;
      fitnessGoal?: z.infer<typeof dailyCheckInSchema>["fitnessGoal"];
    } = {};

    if (parsed.targetWeight !== undefined) {
      goalPayload.targetWeight = parsed.targetWeight;
    }
    if (parsed.manualCalorieTarget !== undefined) {
      goalPayload.manualCalorieTarget = parsed.manualCalorieTarget;
    }
    if (parsed.fitnessGoal !== undefined) {
      goalPayload.fitnessGoal = parsed.fitnessGoal;
    }

    let didUpdateGoal = false;
    if (
      goalPayload.targetWeight !== undefined ||
      goalPayload.manualCalorieTarget !== undefined ||
      goalPayload.fitnessGoal !== undefined
    ) {
      await dietService.updateGoal(userId, goalPayload);
      didUpdateGoal = true;
    }

    await progressService.addWeightLog(userId, parsed.weight);
    await dietService.recalculateCalories(userId);

    revalidatePath("/diet-plan");
    revalidatePath("/diet-plan/insights");

    return {
      success: true,
      status: 200,
      message: "Daily check-in saved",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        status: 400,
        message: "Invalid check-in input",
        errors: error.flatten().fieldErrors,
      };
    }

    console.error("[dailyCheckInAction]", error);
    return {
      success: false,
      status: 500,
      message: "Failed to save daily check-in",
    };
  }
}
