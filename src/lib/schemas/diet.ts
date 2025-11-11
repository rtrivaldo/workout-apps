import { z } from "zod";

export const mealTypeOptions = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
] as const;

export const addFoodSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" }),
  calories: z.coerce
    .number({ message: "Calories must be a number" })
    .positive({ message: "Calories must be greater than 0" }),
  protein: z.coerce
    .number({ message: "Protein must be a number" })
    .min(0)
    .optional()
    .default(0),
  fat: z.coerce
    .number({ message: "Fat must be a number" })
    .min(0)
    .optional()
    .default(0),
  carbs: z.coerce
    .number({ message: "Carbs must be a number" })
    .min(0)
    .optional()
    .default(0),
  serving: z.string().min(1).default("1 serving"),
});

export const addMealSchema = z.object({
  mealType: z.enum(mealTypeOptions),
  date: z.string().optional(),
  items: z
    .array(
      z.object({
        foodId: z.coerce
          .number({ message: "Food is required" })
          .int()
          .positive(),
        portion: z.coerce
          .number({ message: "Portion must be a number" })
          .positive({ message: "Portion must be greater than 0" }),
      })
    )
    .min(1, { message: "At least one food item is required" }),
});

const optionalNumber = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) =>
      value === "" || value === null || value === undefined ? undefined : value,
    schema.optional()
  );

export const updateDietGoalSchema = z.object({
  targetWeight: optionalNumber(
    z.coerce
      .number({ message: "Target weight must be a number" })
      .positive({ message: "Target weight must be greater than 0" })
  ),
  manualCalorieTarget: optionalNumber(
    z.coerce
      .number({ message: "Manual calorie target must be a number" })
      .min(800, { message: "Calorie target is too low" })
      .max(6000, { message: "Calorie target is too high" })
  ),
  fitnessGoal: z
    .enum(["LOSE_WEIGHT", "GAIN_WEIGHT", "MAINTAIN_WEIGHT"])
    .optional(),
});

export const logWeightSchema = z.object({
  weight: z.coerce
    .number({ message: "Weight must be a number" })
    .min(20)
    .max(400),
  date: z.string().optional(),
});

export const updateFoodSchema = addFoodSchema.extend({
  id: z.number({ message: "Food id is required" }).int().positive(),
});

export const deleteFoodSchema = z.object({
  id: z.number({ message: "Food id is required" }).int().positive(),
});
