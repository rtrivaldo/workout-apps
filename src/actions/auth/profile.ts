"use server";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/schemas/update-profile-schema";
import { redirect } from "next/navigation";
import { calculateDailyCalories } from "@/lib/utils";
import { ProfileFieldKey, getProfileStatus } from "@/lib/profile";
import { User } from "@prisma/client";

export type UserWithProfileStatus =
  | (User & {
      profileComplete: boolean;
      missingProfileFields: ProfileFieldKey[];
    })
  | null;

/**
 * Fetches the authenticated user and augments the record with profile
 * completeness information for downstream guards/UI.
 */
export default async function getUserData(): Promise<UserWithProfileStatus> {
  const session = await getSession();

  if (!session?.id) {
    redirect("/login");
  }

  const res = await prisma.user.findUnique({
    where: {
      id: Number(session.id),
    },
  });

  if (!res) {
    return null;
  }

  const status = getProfileStatus(res);

  return {
    ...res,
    profileComplete: status.isComplete,
    missingProfileFields: status.missingFields,
  };
}

/**
 * Applies profile updates, recalculates TDEE, and keeps today's daily log
 * snapshot in sync with the latest user inputs.
 */
export async function updateUserData(formData: FormData, userId: number) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = updateProfileSchema.safeParse(rawData);

    if (!parsed.success) {
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    const {
      name,
      age,
      gender,
      bodyWeight,
      height,
      fitnessGoal,
      activityLevel,
      targetWeight,
    } = parsed.data;

    const existingUser = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!existingUser) {
      return {
        success: false,
        status: 409,
        message: "Account does not exist",
      };
    }

    const normalizedTargetWeight =
      fitnessGoal === "MAINTAIN_WEIGHT" ? bodyWeight : targetWeight ?? null;

    const calculatedTdee =
      calculateDailyCalories(bodyWeight, height, age, gender, activityLevel) ??
      existingUser.lastCalculatedTdee;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        age,
        gender: gender || null,
        bodyWeight,
        height,
        fitnessGoal,
        activityLevel: activityLevel || null,
        targetWeight: normalizedTargetWeight,
        lastCalculatedTdee: calculatedTdee ?? null,
      },
    });

    const today = new Date();
    const normalizedDate = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );

    // Ensure today's daily log mirrors the newly-updated profile snapshot.
    await prisma.dailyLog.upsert({
      where: { userId_date: { userId: user.id, date: normalizedDate } },
      update: {
        dailyNeedCalories: calculatedTdee ?? undefined,
        currentWeight: bodyWeight,
        targetWeight: normalizedTargetWeight ?? undefined,
      },
      create: {
        userId: user.id,
        date: normalizedDate,
        dailyNeedCalories: calculatedTdee ?? undefined,
        currentWeight: bodyWeight,
        targetWeight: normalizedTargetWeight ?? undefined,
      },
    });

    return { success: true, status: 201, message: "Update successful" };
  } catch (error) {
    console.error(error);
    return { success: false, status: 500, message: "Internal server error" };
  }
}

/**
 * Helper for pages that require a fully completed profile; redirects to the
 * profile completion screen when mandatory fields are missing.
 */
export async function requireCompleteProfile() {
  const user = await getUserData();

  if (!user) {
    redirect("/login");
  }

  if (!user.profileComplete) {
    redirect("/profile?complete-profile=1");
  }

  return user;
}
