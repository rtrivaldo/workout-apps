import { requireCompleteProfile } from '@/actions/auth/profile';
import DietService from '@/actions/diet/DietService';
import HistoryTable from '@/components/diet/HistoryTable';
import BackNavigationButton from '@/components/BackNavigationButton';

const dietService = new DietService();

export default async function DietHistoryPage() {
  const user = await requireCompleteProfile();

  const logs = await dietService.getHistory(user.id, 30);

  return (
    <div className='mt-6 p-6 md:p-10 bg-[#F4F6F6] rounded-2xl space-y-6'>
      <div>
        <BackNavigationButton className='mb-1' fallbackHref='/diet-plan' label='Back to Diet Plan' />
        <h2 className='text-2xl font-semibold'>History</h2>
        <p className='text-sm text-[#A9A9A9]'>
          Review past meals and calorie summaries.
        </p>
      </div>

      <HistoryTable logs={logs} />
    </div>
  );
}
