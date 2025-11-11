import prisma from "@/lib/prisma";
import { PrismaClient, Prisma } from "@prisma/client";

export type AddFoodPayload = {
  name: string;
  calories: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  serving?: string;
};

export type FoodListOptions = {
  search?: string;
  source?: "all" | "catalog" | "personal";
  take?: number;
  skip?: number;
};

export default class FoodService {
  constructor(private readonly db: PrismaClient = prisma) {}

  private buildWhere(userId: number, options: FoodListOptions = {}) {
    const where: Prisma.FoodWhereInput = {};

    if (options.source === "catalog") {
      where.createdBy = null;
    } else if (options.source === "personal") {
      where.createdBy = userId;
    } else {
      where.OR = [{ createdBy: null }, { createdBy: userId }];
    }

    if (options.search) {
      where.name = {
        contains: options.search,
      };
    }

    return where;
  }

  async getAllFoods(userId: number, options: FoodListOptions = {}) {
    return this.db.food.findMany({
      where: this.buildWhere(userId, options),
      orderBy: [{ createdBy: "asc" }, { name: "asc" }],
      skip: options.skip,
      take: options.take,
    });
  }

  async countFoods(userId: number, options: FoodListOptions = {}) {
    return this.db.food.count({
      where: this.buildWhere(userId, options),
    });
  }

  async addCustomFood(userId: number, payload: AddFoodPayload) {
    return this.db.food.create({
      data: {
        name: payload.name,
        calories: payload.calories,
        protein: payload.protein ?? 0,
        fat: payload.fat ?? 0,
        carbs: payload.carbs ?? 0,
        serving: payload.serving ?? "1 serving",
        createdBy: userId,
      },
    });
  }

  async updateFood(userId: number, foodId: number, payload: AddFoodPayload) {
    const food = await this.db.food.findUnique({ where: { id: foodId } });

    if (!food || food.createdBy !== userId) {
      throw new Error("You can only update your personal foods.");
    }

    return this.db.food.update({
      where: { id: foodId },
      data: {
        name: payload.name,
        calories: payload.calories,
        protein: payload.protein ?? 0,
        fat: payload.fat ?? 0,
        carbs: payload.carbs ?? 0,
        serving: payload.serving ?? "1 serving",
      },
    });
  }

  async deleteFood(userId: number, foodId: number) {
    const food = await this.db.food.findUnique({ where: { id: foodId } });

    if (!food || food.createdBy !== userId) {
      throw new Error("You can only delete your personal foods.");
    }

    await this.db.food.delete({ where: { id: foodId } });
  }

  async getFoodById(id: number) {
    return this.db.food.findUnique({ where: { id } });
  }

  async getFoodsByIds(ids: number[]) {
    return this.db.food.findMany({
      where: { id: { in: ids } },
    });
  }
}
