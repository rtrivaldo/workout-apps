import prisma from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";

export default class ProgressService {
  constructor(private readonly db: PrismaClient = prisma) {}

  private normalizeDate(date?: Date | string) {
    const base = date ? new Date(date) : new Date();
    return new Date(
      Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate())
    );
  }

  async getWeightProgress(userId: number, rangeInDays = 14) {
    const today = this.normalizeDate();
    const fromDate = new Date(today);
    fromDate.setUTCDate(today.getUTCDate() - rangeInDays);

    return this.db.weightLog.findMany({
      where: {
        userId,
        loggedAt: {
          gte: fromDate,
        },
      },
      orderBy: { loggedAt: "asc" },
    });
  }

  async getCalorieTrend(userId: number, rangeInDays = 14) {
    const today = this.normalizeDate();
    const fromDate = new Date(today);
    fromDate.setUTCDate(today.getUTCDate() - rangeInDays);

    return this.db.dailyLog.findMany({
      where: {
        userId,
        date: {
          gte: fromDate,
        },
      },
      orderBy: { date: "asc" },
    });
  }

  async addWeightLog(userId: number, weight: number, date?: Date | string) {
    const loggedAt = this.normalizeDate(date);

    await this.db.weightLog.upsert({
      where: {
        userId_loggedAt: {
          userId,
          loggedAt,
        },
      },
      update: { weight },
      create: {
        userId,
        weight,
        loggedAt,
      },
    });

    await this.db.dailyLog.upsert({
      where: { userId_date: { userId, date: loggedAt } },
      update: { currentWeight: weight },
      create: {
        userId,
        date: loggedAt,
        currentWeight: weight,
      },
    });
  }
}
