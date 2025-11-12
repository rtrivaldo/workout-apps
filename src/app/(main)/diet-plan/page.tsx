import { requireCompleteProfile } from '@/actions/auth/profile';
import DietService from '@/actions/diet/DietService';
import FoodService from '@/actions/diet/FoodService';
import AddMealDialog from '@/components/diet/AddMealDialog';
import CalorieSummaryCard from '@/components/diet/CalorieSummaryCard';
import FoodLibraryTable from '@/components/diet/FoodLibraryTable';
import MealList from '@/components/diet/MealList';
import DailyCheckInDialog from '@/components/diet/DailyCheckInDialog';
import BackNavigationButton from '@/components/BackNavigationButton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const dietService = new DietService();
const foodService = new FoodService();

export default async function DietPlanPage() {
  const user = await requireCompleteProfile();

  const [dailyLog, foods] = await Promise.all([
    dietService.getDailyLog(user.id),
    foodService.getAllFoods(user.id, { take: 10 }),
  ]);
  const recommendedCalories =
    dailyLog.goalCalorieTarget ?? dailyLog.dailyNeedCalories ?? null;

  return (
    <div className='mt-6 p-6 md:p-10 bg-[#F4F6F6] rounded-2xl space-y-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div className='space-y-1'>
          <BackNavigationButton className='mb-1' fallbackHref='/' label='Back to Dashboard' />
          <h2 className='text-2xl font-semibold'>Diet Plan</h2>
          <p className='text-sm text-[#A9A9A9]'>
            Track meals, check in daily, and review your insights.
          </p>
        </div>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
          <div className='flex gap-2'>
            <DailyCheckInDialog
              defaultValues={{
                weight: dailyLog.currentWeight ?? user.bodyWeight,
                targetWeight: user.targetWeight ?? undefined,
                manualCalorieTarget: dailyLog.manualCalorieTarget ?? undefined,
                fitnessGoal: user.fitnessGoal,
              }}
              recommendedCalories={recommendedCalories}
              currentWeight={dailyLog.currentWeight ?? user.bodyWeight ?? undefined}
            />
            <Button asChild variant='ghost'>
              <Link href='/diet-plan/insights'>View Insights</Link>
            </Button>
          </div>
          <AddMealDialog foods={foods} />
        </div>
      </div>

      <CalorieSummaryCard log={dailyLog} />

      <div className='grid gap-6 lg:grid-cols-[1.5fr_1fr]'>
        <MealList meals={dailyLog.meals} />
        <FoodLibraryTable foods={foods} manageHref='/diet-plan/foods' />
      </div>
    </div>
  );
}
