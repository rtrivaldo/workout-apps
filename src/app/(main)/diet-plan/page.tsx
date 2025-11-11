import getUserData from '@/actions/auth/profile';
import DietService from '@/actions/diet/DietService';
import FoodService from '@/actions/diet/FoodService';
import AddMealDialog from '@/components/diet/AddMealDialog';
import CalorieSummaryCard from '@/components/diet/CalorieSummaryCard';
import FoodLibraryTable from '@/components/diet/FoodLibraryTable';
import MealList from '@/components/diet/MealList';
import BackNavigationButton from '@/components/BackNavigationButton';

const dietService = new DietService();
const foodService = new FoodService();

export default async function DietPlanPage() {
  const user = await getUserData();
  if (!user) return null;

  const [dailyLog, foods] = await Promise.all([
    dietService.getDailyLog(user.id),
    foodService.getAllFoods(user.id),
  ]);
  const previewFoods = foods.slice(0, 10);

  return (
    <div className='mt-6 p-6 md:p-10 bg-[#F4F6F6] rounded-2xl space-y-6'>
      <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
        <div>
          <BackNavigationButton className='mb-1' fallbackHref='/' label='Back to Dashboard' />
          <h2 className='text-2xl font-semibold'>Diet Plan</h2>
          <p className='text-sm text-[#A9A9A9]'>
            Track your meals, calories, and progress.
          </p>
        </div>
        <AddMealDialog foods={foods} />
      </div>

      <CalorieSummaryCard log={dailyLog} />

      <div className='grid gap-6 lg:grid-cols-[1.5fr_1fr]'>
        <MealList meals={dailyLog.meals} />
        <FoodLibraryTable foods={previewFoods} manageHref='/diet-plan/foods' />
      </div>
    </div>
  );
}
