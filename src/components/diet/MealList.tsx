import { Food, Meal, MealFood } from "@prisma/client";

const mealOrder = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"] as const;

type MealWithFoods = Meal & {
  mealFoods: (MealFood & { food: Food | null })[];
};

export default function MealList({ meals }: { meals: MealWithFoods[] }) {
  if (!meals.length) {
    return (
      <div className="bg-white rounded-xl p-6 text-center text-neutral-500">
        No meals added today. Use the "Add Meal" button to start tracking.
      </div>
    );
  }

  const grouped = mealOrder.map((type) => ({
    type,
    entries: meals.filter((meal) => meal.type === type),
  }));

  return (
    <div className="space-y-4">
      {grouped.map((group) => (
        <div key={group.type} className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{group.type}</h3>
            <span className="text-sm text-neutral-500">
              {group.entries.reduce(
                (sum, meal) =>
                  sum +
                  meal.mealFoods.reduce(
                    (foodSum, item) => foodSum + item.totalCal,
                    0
                  ),
                0
              )}{" "}
              kcal
            </span>
          </div>

          {!group.entries.length && (
            <p className="mt-2 text-sm text-neutral-500">
              No {group.type.toLowerCase()} logged.
            </p>
          )}

          <div className="mt-3 space-y-3">
            {group.entries.map((entry) => (
              <div
                key={entry.id}
                className="border rounded-lg p-3 flex flex-col space-y-2"
              >
                {entry.mealFoods.map((item) => {
                  const foodName = item.food?.name ?? item.foodNameSnapshot;
                  const serving = item.food?.serving ?? item.servingSnapshot;
                  const protein = item.food?.protein ?? item.proteinSnapshot;
                  const carbs = item.food?.carbs ?? item.carbsSnapshot;
                  const fat = item.food?.fat ?? item.fatSnapshot;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm text-neutral-600"
                    >
                      <div>
                        <p className="font-medium text-neutral-800">
                          {foodName}{" "}
                          <span className="text-xs text-neutral-500">
                            ({item.portion} × {serving})
                          </span>
                        </p>
                        <p className="text-xs">
                          P {protein}g • C {carbs}g • F {fat}g
                        </p>
                      </div>
                      <span className="font-semibold">
                        {item.totalCal.toFixed(0)} kcal
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
