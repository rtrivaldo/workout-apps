import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultFoods = [
  {
    name: "Brown Rice (cooked)",
    calories: 216,
    protein: 5,
    carbs: 45,
    fat: 2,
    serving: "1 cup (195g)",
  },
  {
    name: "Chicken Breast (grilled)",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    serving: "100g",
  },
  {
    name: "Boiled Egg",
    calories: 78,
    protein: 6,
    carbs: 1,
    fat: 5,
    serving: "1 egg",
  },
  {
    name: "Banana",
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.3,
    serving: "1 medium fruit",
  },
  {
    name: "Oatmeal",
    calories: 150,
    protein: 5,
    carbs: 27,
    fat: 3,
    serving: "1/2 cup dry",
  },
  {
    name: "Greek Yogurt (plain)",
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 0.7,
    serving: "170g",
  },
];

async function main() {
  for (const food of defaultFoods) {
    const exists = await prisma.food.findFirst({
      where: {
        name: food.name,
        createdBy: null,
      },
    });

    if (!exists) {
      await prisma.food.create({
        data: {
          ...food,
          createdBy: null,
        },
      });
    }
  }
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
