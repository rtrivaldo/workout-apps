'use client';

import { deleteMealAction } from '@/actions/diet/diet.actions';
import type { Food, Meal, MealFood } from '@prisma/client';
import { Trash2 } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import EditMealDialog from './EditMealDialog';
import type { FoodOption } from './AddMealDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const mealOrder = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const;

export type MealWithFoods = Meal & {
  mealFoods: (MealFood & { food: Food | null })[];
};

type MealListProps = {
  meals: MealWithFoods[];
  foods: FoodOption[];
};

export default function MealList({ meals, foods }: MealListProps) {
  if (!meals.length) {
    return (
      <div className='bg-white rounded-xl p-6 text-center text-neutral-500'>
        No meals added today. Use the &quot;Add Meal&quot; button to start tracking.
      </div>
    );
  }

  const grouped = mealOrder.map(type => ({
    type,
    entries: meals.filter(meal => meal.type === type),
  }));

  return (
    <div className='space-y-4'>
      {grouped.map(group => (
        <div key={group.type} className='bg-white rounded-xl p-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>{group.type}</h3>
            <span className='text-sm text-neutral-500'>
              {group.entries.reduce(
                (sum, meal) =>
                  sum +
                  meal.mealFoods.reduce((foodSum, item) => foodSum + item.totalCal, 0),
                0
              )}{' '}
              kcal
            </span>
          </div>

          {!group.entries.length && (
            <p className='mt-2 text-sm text-neutral-500'>
              No {group.type.toLowerCase()} logged.
            </p>
          )}

          <div className='mt-3 space-y-3'>
            {group.entries.map(entry => {
              const canEdit = entry.mealFoods.every(item => Boolean(item.foodId));
              const editDisabled = !canEdit || !foods.length;
              const editButton = (
                <EditMealDialog meal={entry} foods={foods} disabled={editDisabled} />
              );
              const editButtonWithFallback = editDisabled ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>{editButton}</TooltipTrigger>
                    <TooltipContent>
                      {canEdit
                        ? 'Add foods to your library before editing this meal.'
                        : 'Foods for this meal were removed, so it cannot be edited.'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                editButton
              );

              return (
                <div
                  key={entry.id}
                  className='border rounded-lg p-3 flex flex-col space-y-2'
                >
                  <div className='flex items-center justify-between'>
                    <div className='text-xs text-neutral-500'>
                      Logged at{' '}
                      {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className='flex items-center gap-2'>
                      {editButtonWithFallback}
                      <DeleteMealButton mealId={entry.id} />
                    </div>
                  </div>
                  {entry.mealFoods.map(item => {
                    const foodName = item.food?.name ?? item.foodNameSnapshot;
                    const serving = item.food?.serving ?? item.servingSnapshot;
                    const protein = item.food?.protein ?? item.proteinSnapshot;
                    const carbs = item.food?.carbs ?? item.carbsSnapshot;
                    const fat = item.food?.fat ?? item.fatSnapshot;

                    return (
                      <div
                        key={item.id}
                        className='flex items-center justify-between text-sm text-neutral-600'
                      >
                        <div>
                          <p className='font-medium text-neutral-800'>
                            {foodName}{' '}
                            <span className='text-xs text-neutral-500'>
                              ({item.portion} × {serving})
                            </span>
                          </p>
                          <p className='text-xs'>
                            P {protein}g • C {carbs}g • F {fat}g
                          </p>
                        </div>
                        <span className='font-semibold'>
                          {item.totalCal.toFixed(0)} kcal
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function DeleteMealButton({ mealId }: { mealId: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm('Delete this meal? This action cannot be undone.')) return;

    startTransition(async () => {
      const result = await deleteMealAction({ mealId });
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Button
      variant='ghost'
      size='icon'
      className='text-red-500'
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className='h-4 w-4' />
    </Button>
  );
}
