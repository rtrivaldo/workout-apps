import { FitnessGoal, User } from "@prisma/client";

export type ProfileFields = Pick<
  User,
  | "age"
  | "gender"
  | "bodyWeight"
  | "height"
  | "fitnessGoal"
  | "activityLevel"
  | "targetWeight"
>;

export type ProfileFieldKey = keyof ProfileFields;

const friendlyFieldLabels: Record<ProfileFieldKey, string> = {
  age: "Age",
  gender: "Gender",
  bodyWeight: "Body weight",
  height: "Height",
  fitnessGoal: "Fitness goal",
  activityLevel: "Activity level",
  targetWeight: "Target weight",
};

type ProfileStatus = {
  missingFields: ProfileFieldKey[];
  isComplete: boolean;
};

const requiresTargetWeight = (goal: FitnessGoal) =>
  goal === "LOSE_WEIGHT" || goal === "GAIN_WEIGHT";

/**
 * Evaluates whether a user profile already contains all fitness fields
 * required for personalized workout and diet features. Missing fields are
 * returned so callers can surface actionable prompts.
 */
export function getProfileStatus(user: ProfileFields): ProfileStatus {
  const missingFields: ProfileFieldKey[] = [];

  if (!user.age) missingFields.push("age");
  if (!user.gender) missingFields.push("gender");
  if (!user.bodyWeight) missingFields.push("bodyWeight");
  if (!user.height) missingFields.push("height");
  if (!user.fitnessGoal) missingFields.push("fitnessGoal");
  if (!user.activityLevel) missingFields.push("activityLevel");

  if (user.fitnessGoal && requiresTargetWeight(user.fitnessGoal)) {
    if (!user.targetWeight) {
      missingFields.push("targetWeight");
    }
  }

  return {
    missingFields,
    isComplete: missingFields.length === 0,
  };
}

export function getFriendlyProfileFieldName(field: ProfileFieldKey) {
  return friendlyFieldLabels[field] ?? field;
}
