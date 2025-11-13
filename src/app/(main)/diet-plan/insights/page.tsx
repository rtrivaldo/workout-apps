import { requireCompleteProfile } from '@/actions/auth/profile';
import DietService from '@/actions/diet/DietService';
import DailyCheckInDialog from '@/components/diet/DailyCheckInDialog';
import CalorieTrendChart from '@/components/diet/insights/CalorieTrendChart';
import WeightTrendChart from '@/components/diet/insights/WeightTrendChart';
import BackNavigationButton from '@/components/BackNavigationButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CalorieStatus,
  determineCalorieStatus,
  getStatusLabel,
  getStatusTone,
  resolveCalorieTarget,
} from '@/lib/diet-insights';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const dietService = new DietService();
const RANGE_OPTIONS = [7, 14, 30] as const;
const DEFAULT_RANGE = 14;
const HISTORY_PAGE_SIZE = 7;

type SearchParams = {
  range?: string;
  start?: string;
  end?: string;
  status?: string;
  page?: string;
};

const CALORIE_FILTERS: CalorieStatus[] = ['DEFICIT', 'SURPLUS', 'ON_TARGET'];

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(base: Date, amount: number) {
  const copy = new Date(base);
  copy.setUTCDate(copy.getUTCDate() + amount);
  return startOfDay(copy);
}

function parseDateInput(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : startOfDay(parsed);
}

function formatDateInput(value: Date) {
  return value.toISOString().split('T')[0];
}

function formatDateDisplay(value: Date) {
  return value.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function buildSearchString(
  base: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>
) {
  const search = new URLSearchParams();
  Object.entries({ ...base, ...overrides }).forEach(([key, val]) => {
    if (!val) return;
    search.set(key, val);
  });
  const query = search.toString();
  return query ? `/diet-plan/insights?${query}` : '/diet-plan/insights';
}

export default async function DietInsightsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireCompleteProfile();
  const params = await searchParams;

  const rangeParam = Number(params.range);
  const selectedRange = RANGE_OPTIONS.find(option => option === rangeParam) ?? DEFAULT_RANGE;

  const today = startOfDay(new Date());
  const chartStart = addDays(today, -1 * (selectedRange - 1));

  const defaultHistoryStart = addDays(today, -29);
  let historyStart = parseDateInput(params.start) ?? defaultHistoryStart;
  let historyEnd = parseDateInput(params.end) ?? today;
  if (historyEnd < historyStart) {
    const temp = historyStart;
    historyStart = historyEnd;
    historyEnd = temp;
  }

  const statusParam = params.status ?? '';
  const statusFilter = CALORIE_FILTERS.includes(statusParam as CalorieStatus)
    ? (statusParam as CalorieStatus)
    : undefined;

  const currentPage = Math.max(1, Number(params.page) || 1);

  const [dailyLog, chartLogsRaw, historyLogsRaw] = await Promise.all([
    dietService.getDailyLog(user.id),
    dietService.getDailyLogs(user.id, {
      startDate: chartStart,
      endDate: today,
      order: 'asc',
    }),
    dietService.getDailyLogs(user.id, {
      startDate: historyStart,
      endDate: historyEnd,
      order: 'desc',
    }),
  ]);

  const chartLogs = chartLogsRaw.map(log => {
    const date = new Date(log.date);
    const label = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    const tooltipDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const status = determineCalorieStatus(log);
    return {
      label,
      tooltipDate,
      caloriesIn: log.caloriesIn,
      caloriesOut: log.caloriesOut ?? 0,
      netCalories: log.netCalories,
      status,
      weight: log.currentWeight ?? null,
    };
  });

  const historyAnnotated = historyLogsRaw.map(log => ({
    log,
    status: determineCalorieStatus(log),
    target: resolveCalorieTarget(log),
  }));

  const filteredHistory = historyAnnotated.filter(entry =>
    statusFilter ? entry.status === statusFilter : true
  );

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / HISTORY_PAGE_SIZE));
  const paginationPages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const safePage = Math.min(currentPage, totalPages);
  const paginatedHistory = filteredHistory.slice(
    (safePage - 1) * HISTORY_PAGE_SIZE,
    safePage * HISTORY_PAGE_SIZE
  );

  const latestLog = historyLogsRaw[0] ?? dailyLog;
  const latestTarget = resolveCalorieTarget(latestLog);
  const latestStatus = determineCalorieStatus(latestLog);
  const latestWeight = latestLog.currentWeight ?? user.bodyWeight ?? null;

  const previousWeight =
    chartLogs.length > 1 ? chartLogs[chartLogs.length - 2].weight ?? null : null;
  const weightDelta =
    latestWeight !== null && previousWeight !== null
      ? Number((latestWeight - previousWeight).toFixed(1))
      : null;

  const targetLabel = latestLog.manualCalorieTarget
    ? 'Manual Target'
    : latestLog.goalCalorieTarget
      ? 'Auto Goal Target'
      : 'Baseline Target';
  const statusBadge = getStatusTone(latestStatus);

  const searchBase = {
    range: String(selectedRange),
    start: formatDateInput(historyStart),
    end: formatDateInput(historyEnd),
    status: statusFilter,
    page: String(safePage),
  };

  const detailQuery = new URLSearchParams();
  detailQuery.set('range', searchBase.range);
  detailQuery.set('start', searchBase.start);
  detailQuery.set('end', searchBase.end);
  detailQuery.set('page', searchBase.page);
  if (statusFilter) detailQuery.set('status', statusFilter);
  const detailQueryString = detailQuery.toString();

  const historyRangeLabel = `${formatDateDisplay(historyStart)} - ${formatDateDisplay(historyEnd)}`;

  const recommendedCalories =
    dailyLog.goalCalorieTarget ?? dailyLog.dailyNeedCalories ?? null;

  return (
    <div className='mt-6 p-6 md:p-10 bg-[#F4F6F6] rounded-2xl space-y-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div className='space-y-1'>
          <BackNavigationButton
            className='mb-1'
            fallbackHref='/diet-plan'
            label='Back to Diet Plan'
          />
          <h2 className='text-2xl font-semibold'>Diet Insights</h2>
          <p className='text-sm text-[#A9A9A9]'>
            Monitor your weight trend, calorie balance, and daily history in one place.
          </p>
        </div>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
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
          <Button asChild variant='outline'>
            <Link href='/diet-plan/foods'>Manage Food Library</Link>
          </Button>
        </div>
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <div className='bg-white rounded-xl p-4 flex flex-col gap-2 shadow-sm border border-neutral-100'>
          <p className='text-xs tracking-wide uppercase text-neutral-500'>Latest Weight</p>
          <div className='flex items-end justify-between'>
            <p className='text-3xl font-semibold'>
              {latestWeight !== null ? `${latestWeight.toFixed(1)} kg` : '—'}
            </p>
            {weightDelta !== null && (
              <span
                className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full',
                  weightDelta > 0
                    ? 'text-red-600 bg-red-100'
                    : weightDelta < 0
                      ? 'text-green-600 bg-green-100'
                      : 'text-neutral-600 bg-neutral-200'
                )}
              >
                {weightDelta > 0 ? '+' : ''}
                {weightDelta} kg vs previous log
              </span>
            )}
          </div>
          <p className='text-xs text-neutral-500'>
            Snapshot captured on{' '}
            {new Date(latestLog.date).toLocaleDateString('en-US', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>

        <div className='bg-white rounded-xl p-4 flex flex-col gap-2 shadow-sm border border-neutral-100'>
          <div className='flex items-center justify-between'>
            <p className='text-xs tracking-wide uppercase text-neutral-500'>{targetLabel}</p>
            <span
              className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', statusBadge)}
            >
              {getStatusLabel(latestStatus)}
            </span>
          </div>
          <p className='text-3xl font-semibold'>
            {latestTarget ? `${latestTarget.toFixed(0)} kcal` : 'Target not set yet'}
          </p>
          <p className='text-xs text-neutral-500'>
            Net for the day: {latestLog.netCalories.toFixed(0)} kcal (
            {latestTarget
              ? `${(latestLog.netCalories - latestTarget > 0 ? '+' : '').concat(
                (latestLog.netCalories - latestTarget).toFixed(0)
              )} vs target`
              : 'set a target to see the status'}
            )
          </p>
        </div>

        <div className='bg-white rounded-xl p-4 flex flex-col gap-2 shadow-sm border border-neutral-100'>
          <p className='text-xs tracking-wide uppercase text-neutral-500'>Remaining Calories</p>
          <p className='text-3xl font-semibold'>
            {latestTarget
              ? `${Math.max(0, latestTarget - latestLog.netCalories).toFixed(0)} kcal`
              : '—'}
          </p>
          <p className='text-xs text-neutral-500'>
            {latestTarget
              ? latestLog.netCalories > latestTarget
                ? 'You exceeded today’s target.'
                : 'You still have room before reaching your target.'
              : 'Set a calorie target to track remaining allowance.'}
          </p>
        </div>
      </div>

      <div className='space-y-3'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h3 className='text-lg font-semibold'>Weight & Calorie Trends</h3>
            <p className='text-sm text-neutral-500'>
              Track the last {selectedRange} days to compare calories in and out.
            </p>
          </div>
          <form className='flex items-center gap-2' action='/diet-plan/insights'>
            <input type='hidden' name='start' value={formatDateInput(historyStart)} />
            <input type='hidden' name='end' value={formatDateInput(historyEnd)} />
            {statusFilter && <input type='hidden' name='status' value={statusFilter} />}
            <input type='hidden' name='page' value='1' />
            {RANGE_OPTIONS.map(option => (
              <button
                key={option}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-full border transition',
                  option === selectedRange
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-neutral-200 text-neutral-600 hover:text-neutral-900'
                )}
                type='submit'
                name='range'
                value={option}
              >
                {option} days
              </button>
            ))}
          </form>
        </div>

        <div className='grid gap-4 lg:grid-cols-2'>
          <div className='bg-white rounded-xl p-4 border border-neutral-100 shadow-sm space-y-2'>
            <div className='flex items-center justify-between'>
              <p className='font-semibold'>Body Weight</p>
            </div>
            <WeightTrendChart
              data={chartLogs.map(item => ({
                label: item.label,
                weight: item.weight,
                tooltipDate: item.tooltipDate,
              }))}
            />
          </div>
          <div className='bg-white rounded-xl p-4 border border-neutral-100 shadow-sm space-y-2'>
            <div className='flex items-center justify-between'>
              <p className='font-semibold'>Calories In / Out / Net</p>
            </div>
            <CalorieTrendChart
              data={chartLogs.map(item => ({
                label: item.label,
                caloriesIn: item.caloriesIn,
                caloriesOut: item.caloriesOut,
                netCalories: item.netCalories,
                tooltipDate: item.tooltipDate,
                status: item.status,
              }))}
            />
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
          <div>
            <h3 className='text-lg font-semibold'>Daily History</h3>
            <p className='text-sm text-neutral-500'>
              Filter by date range or calorie status, then inspect each log for meal details.
            </p>
          </div>
        </div>

        <form
          action='/diet-plan/insights'
          className='grid gap-4 rounded-xl bg-white p-4 md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] border border-neutral-100 shadow-sm'
        >
          <input type='hidden' name='range' value={selectedRange} />
          <input type='hidden' name='page' value='1' />
          <div className='space-y-1'>
            <label className='text-sm font-medium text-neutral-700'>Start Date</label>
            <Input type='date' name='start' defaultValue={formatDateInput(historyStart)} />
          </div>
          <div className='space-y-1'>
            <label className='text-sm font-medium text-neutral-700'>End Date</label>
            <Input type='date' name='end' defaultValue={formatDateInput(historyEnd)} />
          </div>
          <div className='space-y-1'>
            <label className='text-sm font-medium text-neutral-700'>Calorie Status</label>
            <select
              name='status'
              defaultValue={statusFilter ?? ''}
              className='w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm'
            >
              <option value=''>All statuses</option>
              {CALORIE_FILTERS.map(filter => (
                <option key={filter} value={filter}>
                  {getStatusLabel(filter)}
                </option>
              ))}
            </select>
          </div>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-end'>
            <Button type='submit' size='sm' className='w-full sm:w-auto px-4'>
              Apply
            </Button>
            <Button asChild variant='outline' size='sm' className='w-full sm:w-auto px-4'>
              <Link href='/diet-plan/insights'>Reset</Link>
            </Button>
          </div>
        </form>

        <div className='bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[780px] text-sm'>
              <thead className='bg-neutral-50 text-neutral-500'>
                <tr>
                  <th className='py-3 px-4 text-left'>Date</th>
                  <th className='py-3 px-4 text-left'>Calories In</th>
                  <th className='py-3 px-4 text-left'>Calories Out</th>
                  <th className='py-3 px-4 text-left'>Net</th>
                  <th className='py-3 px-4 text-left'>Target</th>
                  <th className='py-3 px-4 text-left'>Status</th>
                  <th className='py-3 px-4 text-left'>Weight</th>
                  <th className='py-3 px-4 text-left'>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.map(({ log, status, target }) => (
                  <tr key={log.id} className='border-t border-neutral-100'>
                    <td className='py-3 px-4 font-medium text-neutral-900'>
                      {formatDateDisplay(new Date(log.date))}
                    </td>
                    <td className='py-3 px-4'>{log.caloriesIn.toFixed(0)} kcal</td>
                    <td className='py-3 px-4'>{(log.caloriesOut ?? 0).toFixed(0)} kcal</td>
                    <td className='py-3 px-4'>
                      {log.netCalories.toFixed(0)} kcal{' '}
                      {target && (
                        <span
                          className={cn(
                            'ml-2 text-xs font-medium',
                            log.netCalories - target > 0 ? 'text-red-600' : 'text-green-600'
                          )}
                        >
                          ({log.netCalories - target > 0 ? '+' : ''}
                          {(log.netCalories - target).toFixed(0)})
                        </span>
                      )}
                    </td>
                    <td className='py-3 px-4'>
                      {target ? `${target.toFixed(0)} kcal` : '—'}
                    </td>
                    <td className='py-3 px-4'>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-semibold inline-flex',
                          getStatusTone(status)
                        )}
                      >
                        {getStatusLabel(status)}
                      </span>
                    </td>
                    <td className='py-3 px-4'>
                      {log.currentWeight ? `${log.currentWeight.toFixed(1)} kg` : '—'}
                    </td>
                    <td className='py-3 px-4'>
                      <Link
                        href={`/diet-plan/insights/log/${log.id}${detailQueryString ? `?${detailQueryString}` : ''}`}
                        className='text-sm font-semibold text-green-600 hover:underline'
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
                {!paginatedHistory.length && (
                  <tr>
                    <td colSpan={8} className='py-6 text-center text-neutral-500'>
                      No logs match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className='flex flex-col gap-3 border-t border-neutral-100 px-4 py-4 text-sm md:flex-row md:items-center md:justify-between'>
            <p className='text-neutral-500'>
              Page {safePage} of {totalPages}
            </p>
            <div className='flex flex-wrap items-center gap-2'>
              <Button
                asChild
                variant='outline'
                size='sm'
                disabled={safePage === 1}
              >
                <Link
                  href={buildSearchString(searchBase, {
                    page: safePage > 1 ? String(safePage - 1) : undefined,
                  })}
                >
                  Previous
                </Link>
              </Button>
              {paginationPages.map(pageNumber =>
                pageNumber === safePage ? (
                  <Button key={`page-${pageNumber}`} size='sm' disabled>
                    {pageNumber}
                  </Button>
                ) : (
                  <Button key={`page-${pageNumber}`} asChild variant='outline' size='sm'>
                    <Link
                      href={buildSearchString(searchBase, {
                        page: String(pageNumber),
                      })}
                    >
                      {pageNumber}
                    </Link>
                  </Button>
                )
              )}
              <Button
                asChild
                variant='outline'
                size='sm'
                disabled={safePage === totalPages}
              >
                <Link
                  href={buildSearchString(searchBase, {
                    page: safePage < totalPages ? String(safePage + 1) : undefined,
                  })}
                >
                  Next
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
