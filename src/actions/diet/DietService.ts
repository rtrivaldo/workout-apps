import prisma from "@/lib/prisma";
import {
  calculateDailyCalories,
  calculateGoalCalorieTarget,
} from "@/lib/utils";
import { ActivityLevel, MealType, PrismaClient, User } from "@prisma/client";
import FoodService from "./FoodService";

export type MealItemInput = {
  foodId: number;
  portion: number;
};

type AddMealInput = {
  type: MealType;
  items: MealItemInput[];
  date?: Date | string;
};

export default class DietService {
  private readonly foodService: FoodService;

  constructor(
    private readonly db: PrismaClient = prisma,
    foodService?: FoodService
  ) {
    this.foodService = foodService ?? new FoodService(this.db);
  }

  private normalizeDate(date?: Date | string) {
    const base = date ? new Date(date) : new Date();
    return new Date(
      Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate())
    );
  }

  private async getUser(userId: number) {
    const user = await this.db.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  private calculateTdee(user: User) {
    if (!user.gender || !user.activityLevel) {
      return null;
    }

    return calculateDailyCalories(
      user.bodyWeight,
      user.height,
      user.age,
      user.gender,
      user.activityLevel as ActivityLevel
    );
  }

  private calculateGoalCalories(user: User, tdee: number | null) {
    const baseline = tdee ?? user.lastCalculatedTdee;
    return calculateGoalCalorieTarget(baseline ?? null, user.fitnessGoal);
  }

  private async ensureDailyLog(userId: number, date: Date) {
    let log = await this.db.dailyLog.findUnique({
      where: { userId_date: { userId, date } },
      include: {
        meals: {
          include: {
            mealFoods: {
              include: {
                food: true,
              },
            },
          },
        },
      },
    });

    if (log) return log;

    const user = await this.getUser(userId);
    const dailyNeedCalories = this.calculateTdee(user);
    const computedGoalCalories = this.calculateGoalCalories(
      user,
      dailyNeedCalories
    );
    const goalCalories = computedGoalCalories ?? user.lastGoalCalories ?? null;

    log = await this.db.dailyLog.create({
      data: {
        userId,
        date,
        dailyNeedCalories: dailyNeedCalories ?? user.lastCalculatedTdee,
        goalCalorieTarget: goalCalories,
        targetWeight: user.targetWeight,
        currentWeight: user.bodyWeight ?? null,
      },
      include: {
        meals: {
          include: {
            mealFoods: {
              include: { food: true },
            },
          },
        },
      },
    });

    if (dailyNeedCalories || computedGoalCalories) {
      const userUpdateData: {
        lastCalculatedTdee?: number;
        lastGoalCalories?: number;
      } = {};
      if (dailyNeedCalories) {
        userUpdateData.lastCalculatedTdee = dailyNeedCalories;
      }
      if (computedGoalCalories) {
        userUpdateData.lastGoalCalories = computedGoalCalories;
      }

      await this.db.user.update({
        where: { id: userId },
        data: userUpdateData,
      });
    }

    return log;
  }

  async getDailyLog(userId: number, date?: Date | string) {
    const normalizedDate = this.normalizeDate(date);
    const log = await this.db.dailyLog.findUnique({
      where: { userId_date: { userId, date: normalizedDate } },
      include: {
        meals: {
          orderBy: { createdAt: "asc" },
          include: {
            mealFoods: {
              include: { food: true },
            },
          },
        },
      },
    });

    if (log) return log;
    return this.ensureDailyLog(userId, normalizedDate);
  }

  async getHistory(userId: number, limit = 30) {
    return this.db.dailyLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: limit,
      include: {
        meals: {
          include: {
            mealFoods: {
              include: { food: true },
            },
          },
        },
      },
    });
  }

  async addMeal(userId: number, input: AddMealInput) {
    if (!input.items.length) {
      throw new Error("Meal items cannot be empty");
    }

    const normalizedDate = this.normalizeDate(input.date);
    const log = await this.ensureDailyLog(userId, normalizedDate);
    const foodIds = input.items.map((item) => item.foodId);

    const foods = await this.foodService.getFoodsByIds(foodIds);

    if (foods.length !== foodIds.length) {
      throw new Error("Invalid food reference");
    }

    const mealFoodsData = input.items.map((item) => {
      const food = foods.find((f) => f.id === item.foodId)!;
      const totalCal = food.calories * item.portion;
      return {
        foodId: item.foodId,
        portion: item.portion,
        totalCal,
        caloriesSnapshot: food.calories,
        proteinSnapshot: food.protein,
        fatSnapshot: food.fat,
        carbsSnapshot: food.carbs,
        servingSnapshot: food.serving,
        foodNameSnapshot: food.name,
      };
    });

    await this.db.meal.create({
      data: {
        dailyLogId: log.id,
        type: input.type,
        mealFoods: {
          create: mealFoodsData,
        },
      },
    });

    await this.recalculateCalories(userId, normalizedDate);
    return this.getDailyLog(userId, normalizedDate);
  }

  async recalculateCalories(userId: number, date?: Date | string) {
    const normalizedDate = this.normalizeDate(date);
    const log = await this.db.dailyLog.findUnique({
      where: { userId_date: { userId, date: normalizedDate } },
      include: {
        meals: {
          include: {
            mealFoods: true,
          },
        },
      },
    });

    if (!log) return null;

    const caloriesIn = log.meals.reduce((acc, meal) => {
      const mealTotal = meal.mealFoods.reduce(
        (sum, item) => sum + item.totalCal,
        0
      );
      return acc + mealTotal;
    }, 0);

    const netCalories = caloriesIn - log.caloriesOut;

    return this.db.dailyLog.update({
      where: { id: log.id },
      data: {
        caloriesIn,
        netCalories,
        lastRecalculatedAt: new Date(),
      },
      include: {
        meals: {
          include: { mealFoods: { include: { food: true } } },
        },
      },
    });
  }

  async updateGoal(
    userId: number,
    input: {
      targetWeight?: number | null;
      manualCalorieTarget?: number | null;
      fitnessGoal?: User["fitnessGoal"];
    }
  ) {
    const user = await this.getUser(userId);
    const dailyTdee = this.calculateTdee(user);
    const computedGoalCalories = calculateGoalCalorieTarget(
      dailyTdee ?? user.lastCalculatedTdee ?? null,
      input.fitnessGoal ?? user.fitnessGoal
    );
    const goalCalories = computedGoalCalories ?? user.lastGoalCalories ?? null;

    const updatedUser = await this.db.user.update({
      where: { id: userId },
      data: {
        targetWeight: input.targetWeight ?? user.targetWeight,
        fitnessGoal: input.fitnessGoal ?? user.fitnessGoal,
        lastCalculatedTdee: dailyTdee ?? user.lastCalculatedTdee,
        lastGoalCalories: goalCalories,
      },
    });

    const today = this.normalizeDate();
    const manualTarget =
      input.manualCalorieTarget !== undefined
        ? input.manualCalorieTarget
        : null;
    const targetWeightValue = input.targetWeight ?? user.targetWeight ?? null;

    if (manualTarget !== null || targetWeightValue !== null) {
      await this.db.dailyLog.upsert({
        where: { userId_date: { userId, date: today } },
        update: {
          manualCalorieTarget: manualTarget ?? undefined,
          goalCalorieTarget: goalCalories ?? undefined,
          targetWeight: targetWeightValue ?? undefined,
        },
        create: {
          userId,
          date: today,
          manualCalorieTarget: manualTarget,
          goalCalorieTarget: goalCalories ?? undefined,
          targetWeight: targetWeightValue,
          dailyNeedCalories: dailyTdee ?? user.lastCalculatedTdee,
        },
      });
    }

    return updatedUser;
  }
}
