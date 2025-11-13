import prisma from "@/lib/prisma";
import { DailyLog, PrismaClient } from "@prisma/client";

export type WeightTrendLog = Pick<DailyLog, "id" | "date" | "currentWeight">;

export default class ProgressService {
  constructor(private readonly db: PrismaClient = prisma) {}

  private normalizeDate(date?: Date | string) {
    const base = date ? new Date(date) : new Date();
    return new Date(
      Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate())
    );
  }

  async addWeightLog(userId: number, weight: number, date?: Date | string) {
    const loggedAt = this.normalizeDate(date);

    await this.db.dailyLog.upsert({
      where: { userId_date: { userId, date: loggedAt } },
      update: { currentWeight: weight },
      create: {
        userId,
        date: loggedAt,
        currentWeight: weight,
      },
    });

    await this.db.user.update({
      where: { id: userId },
      data: { bodyWeight: weight },
    });
  }
}
